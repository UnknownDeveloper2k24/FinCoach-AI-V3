import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CashflowAnalyzer } from '@/lib/ml';

// GET /api/v1/cashflow - Analyze cashflow
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

    // Convert transactions to format expected by CashflowAnalyzer
    const transactions = user.transactions.map(t => ({
      date: t.date,
      amount: t.amount,
      type: t.type as 'income' | 'expense',
      category: t.category,
    }));

    // Analyze cashflow using ML engine
    const analysis = CashflowAnalyzer.analyze(currentBalance, transactions, [], 7);

    return NextResponse.json({
      balance: {
        current: currentBalance,
        safeToSpend: analysis.safeToSpendToday,
      },
      burnRate: {
        daily: analysis.dailyBurnRate,
        monthly: analysis.dailyBurnRate * 30,
      },
      runway: {
        days: analysis.runoutDays,
        date: analysis.runoutDate,
      },
      trend: analysis.trend,
      confidence: analysis.confidence,
      microActions: analysis.microActions.map(action => ({
        type: action.type,
        title: action.title,
        description: action.description,
        impact: action.impact,
        actions: action.actions,
      })),
    }, { status: 200 });
  } catch (error) {
    console.error('Error analyzing cashflow:', error);
    return NextResponse.json(
      { error: 'Failed to analyze cashflow' },
      { status: 500 }
    );
  }
}
