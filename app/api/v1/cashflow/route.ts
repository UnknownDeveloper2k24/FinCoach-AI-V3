import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/cashflow - Get cashflow analysis for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get cashflow analysis
    const cashflow = await prisma.cashflowAnalysis.findUnique({
      where: { userId },
    });
    
    if (!cashflow) {
      return NextResponse.json(
        { error: 'Cashflow analysis not found for this user' },
        { status: 404 }
      );
    }
    
    // Format response with CRED-like structure
    const response = {
      cashflow: {
        safeToSpendToday: cashflow.safeToSpendToday,
        dailyBurnRate: cashflow.dailyBurnRate,
        runout: {
          days: cashflow.runoutDays,
          date: cashflow.runoutDate,
        },
        trend: cashflow.trend,
        lastUpdated: cashflow.lastUpdated,
      }
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching cashflow analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cashflow analysis' },
      { status: 500 }
    );
  }
}

// POST /api/v1/cashflow/refresh - Force refresh cashflow analysis
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get total available balance across all accounts
    const totalBalance = user.accounts.reduce(
      (sum, account) => sum + Number(account.balance),
      0
    );
    
    // Get recent transactions for burn rate calculation
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        transactionDate: {
          gte: thirtyDaysAgo,
        },
      },
    });
    
    // Calculate daily burn rate (average daily spending)
    const totalSpent = recentTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );
    
    const dayCount = Math.max(1, Math.round((now.getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyBurnRate = totalSpent / dayCount;
    
    // Calculate runout days
    const runoutDays = dailyBurnRate > 0 ? Math.floor(totalBalance / dailyBurnRate) : 999;
    
    // Calculate runout date
    const runoutDate = new Date(now);
    runoutDate.setDate(runoutDate.getDate() + runoutDays);
    
    // Get upcoming essential expenses (from jars marked as essential)
    const essentialJars = await prisma.jar.findMany({
      where: {
        userId,
        isEssential: true,
        dueDate: {
          gte: now,
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
    
    // Calculate safe-to-spend amount
    // Formula: Total balance - (upcoming essential expenses within 7 days) - (daily burn rate * safety buffer days)
    const safetyBufferDays = 3; // Buffer for unexpected expenses
    
    const upcomingEssentials = essentialJars
      .filter(jar => {
        const dueDate = new Date(jar.dueDate!);
        const daysToDue = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysToDue <= 7;
      })
      .reduce((sum, jar) => {
        const shortfall = Number(jar.targetAmount) - Number(jar.currentAmount);
        return sum + Math.max(0, shortfall);
      }, 0);
    
    const safeToSpendToday = Math.max(0, totalBalance - upcomingEssentials - (dailyBurnRate * safetyBufferDays));
    
    // Determine trend by comparing to previous burn rate
    // For simplicity, we'll compare to the average of the previous 30 days
    const sixtyDaysAgo = new Date(thirtyDaysAgo);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 30);
    
    const olderTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        transactionDate: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    });
    
    const olderTotalSpent = olderTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );
    
    const olderDayCount = Math.max(1, Math.round((thirtyDaysAgo.getTime() - sixtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24)));
    const olderDailyBurnRate = olderTotalSpent / olderDayCount;
    
    // Determine trend
    const trendThreshold = 0.1; // 10% change threshold
    let trend = 'stable';
    
    if (dailyBurnRate > olderDailyBurnRate * (1 + trendThreshold)) {
      trend = 'declining'; // Spending more = cashflow declining
    } else if (dailyBurnRate < olderDailyBurnRate * (1 - trendThreshold)) {
      trend = 'improving'; // Spending less = cashflow improving
    }
    
    // Update or create cashflow analysis
    const updatedCashflow = await prisma.cashflowAnalysis.upsert({
      where: { userId },
      update: {
        safeToSpendToday,
        dailyBurnRate,
        runoutDays,
        runoutDate,
        trend,
        lastUpdated: now,
        updatedAt: now,
      },
      create: {
        userId,
        safeToSpendToday,
        dailyBurnRate,
        runoutDays,
        runoutDate,
        trend,
        lastUpdated: now,
        updatedAt: now,
      },
    });
    
    // Format response with CRED-like structure
    const response = {
      cashflow: {
        safeToSpendToday: updatedCashflow.safeToSpendToday,
        dailyBurnRate: updatedCashflow.dailyBurnRate,
        runout: {
          days: updatedCashflow.runoutDays,
          date: updatedCashflow.runoutDate,
        },
        trend: updatedCashflow.trend,
        lastUpdated: updatedCashflow.lastUpdated,
      }
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error refreshing cashflow analysis:', error);
    return NextResponse.json(
      { error: 'Failed to refresh cashflow analysis' },
      { status: 500 }
    );
  }
}

// POST /api/v1/cashflow/micro-actions - Get micro-actions for improving cashflow
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  try {
    const body = await req.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get cashflow analysis
    const cashflow = await prisma.cashflowAnalysis.findUnique({
      where: { userId },
    });
    
    if (!cashflow) {
      return NextResponse.json(
        { error: 'Cashflow analysis not found for this user' },
        { status: 404 }
      );
    }
    
    // Get spending patterns
    const spendingPatterns = await prisma.spendingPattern.findMany({
      where: { userId },
      orderBy: { averageAmount: 'desc' },
    });
    
    // Get transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        transactionDate: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
      orderBy: { amount: 'desc' },
      take: 50,
    });
    
    // Generate micro-actions based on cashflow situation
    const microActions = [];
    
    // 1. If runout days are low, suggest immediate actions
    if (cashflow.runoutDays < 14) {
      microActions.push({
        type: 'critical',
        title: 'Cash Runout Risk',
        description: `You're projected to run out of money in ${cashflow.runoutDays} days. Consider these immediate actions.`,
        actions: [
          'Pause non-essential subscriptions',
          'Delay discretionary purchases',
          'Check for quick income opportunities',
        ],
      });
    }
    
    // 2. Identify top spending categories for reduction
    if (spendingPatterns.length > 0) {
      const topSpendingCategories = spendingPatterns
        .slice(0, 3)
        .map(pattern => ({
          category: pattern.category,
          averageAmount: pattern.averageAmount,
          potential: Number(pattern.averageAmount) * 0.1, // Suggest 10% reduction
        }));
      
      microActions.push({
        type: 'optimization',
        title: 'Spending Reduction Opportunities',
        description: 'Small reductions in these categories can improve your cashflow.',
        categories: topSpendingCategories,
      });
    }
    
    // 3. Identify recurring subscriptions that could be paused
    const subscriptions = spendingPatterns
      .filter(pattern => pattern.isRecurringSubscription)
      .map(sub => ({
        name: sub.subscriptionName || 'Subscription',
        amount: sub.subscriptionCost,
        category: sub.category,
      }));
    
    if (subscriptions.length > 0) {
      microActions.push({
        type: 'subscriptions',
        title: 'Subscription Management',
        description: 'Review these subscriptions to see if any can be paused or cancelled.',
        subscriptions,
      });
    }
    
    // 4. Suggest daily spending limit
    const dailyLimit = cashflow.safeToSpendToday / 7; // Weekly budget divided by 7
    
    microActions.push({
      type: 'daily_limit',
      title: 'Recommended Daily Limit',
      description: 'Stay within this daily limit to maintain your cashflow.',
      amount: dailyLimit,
    });
    
    // 5. Identify potential one-time savings from large transactions
    const largeTransactions = recentTransactions
      .filter(tx => Number(tx.amount) > Number(cashflow.dailyBurnRate) * 2) // Transactions > 2x daily burn rate
      .slice(0, 3);
    
    if (largeTransactions.length > 0) {
      microActions.push({
        type: 'large_expenses',
        title: 'Large Recent Expenses',
        description: 'These expenses significantly impacted your cashflow. Consider if similar expenses can be avoided in the near future.',
        transactions: largeTransactions.map(tx => ({
          amount: tx.amount,
          category: tx.category,
          date: tx.transactionDate,
          merchant: tx.merchant || 'Unknown',
        })),
      });
    }
    
    return NextResponse.json({ microActions }, { status: 200 });
  } catch (error) {
    console.error('Error generating cashflow micro-actions:', error);
    return NextResponse.json(
      { error: 'Failed to generate cashflow micro-actions' },
      { status: 500 }
    );
  }
}
