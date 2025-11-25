import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AlertEngine, CashflowAnalyzer, SpendingAnalyzer, IncomePredictor } from '@/lib/ml';

// GET /api/v1/alerts - Get alerts for a user
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
      include: {
        accounts: true,
        transactions: { orderBy: { date: 'desc' }, take: 100 },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate current balance
    const currentBalance = user.accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Convert transactions
    const transactions = user.transactions.map(t => ({
      date: t.date,
      amount: t.amount,
      type: t.type as 'income' | 'expense',
      category: t.category,
    }));

    // Analyze cashflow
    const cashflowAnalysis = CashflowAnalyzer.analyze(currentBalance, transactions, [], 7);

    // Analyze spending
    const spendingAnalysis = SpendingAnalyzer.analyze(transactions, 30);

    // Predict income
    const incomeTransactions = transactions
      .filter(t => t.type === 'income')
      .map(t => ({
        date: t.date,
        amount: t.amount,
        source: t.category,
        recurring: true,
      }));

    const incomePatterns = IncomePredictor.analyzePatterns(incomeTransactions);
    const incomeForecast = IncomePredictor.forecast(incomePatterns, 30);

    // Generate alerts using AlertEngine
    const alerts = AlertEngine.generateAllAlerts(
      currentBalance,
      cashflowAnalysis.dailyBurnRate,
      cashflowAnalysis.runoutDays,
      0, // rentAmount
      30, // daysUntilRent
      spendingAnalysis.averageDailySpend,
      currentBalance / 30, // dailyLimit
      0, // daysOverLimit
      incomeForecast.predictedAmount,
      incomeForecast.predictedAmount * 0.9,
      30
    );

    // Sort by priority
    const sortedAlerts = alerts.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return NextResponse.json({
      alerts: sortedAlerts.map(alert => ({
        id: alert.id,
        type: alert.type,
        priority: alert.priority,
        title: alert.title,
        description: alert.description,
        actions: alert.actions,
        impact: alert.impact,
        confidence: alert.confidence,
        createdAt: alert.createdAt,
        expiresAt: alert.expiresAt,
        read: alert.read,
      })),
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.priority === 'critical').length,
        high: alerts.filter(a => a.priority === 'high').length,
        medium: alerts.filter(a => a.priority === 'medium').length,
        low: alerts.filter(a => a.priority === 'low').length,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}
