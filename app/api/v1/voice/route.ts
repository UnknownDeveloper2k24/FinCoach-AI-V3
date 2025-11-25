import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VoiceEngine, CashflowAnalyzer, SpendingAnalyzer, IncomePredictor } from '@/lib/ml';

// POST /api/v1/voice - Process voice query
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, query } = body;

    if (!userId || !query) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, query' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        transactions: { orderBy: { date: 'desc' }, take: 100 },
        goals: true,
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

    // Get primary goal
    const primaryGoal = user.goals[0];

    // Process query using VoiceEngine
    const response = VoiceEngine.processQuery(query, {
      balance: currentBalance,
      safeToSpend: cashflowAnalysis.safeToSpendToday,
      todaySpent: spendingAnalysis.averageDailySpend,
      weeklyAverage: spendingAnalysis.averageDailySpend * 7,
      expectedIncome: incomeForecast.predictedAmount,
      daysUntilIncome: 30,
      goalName: primaryGoal?.name || 'Financial Goal',
      goalProgress: primaryGoal ? primaryGoal.currentAmount : 0,
      goalTarget: primaryGoal ? primaryGoal.targetAmount : 1,
      alertCount: 0,
      criticalAlerts: 0,
      runoutDays: cashflowAnalysis.runoutDays,
      savingsRate: (incomeForecast.predictedAmount - spendingAnalysis.totalSpent) / incomeForecast.predictedAmount,
    });

    return NextResponse.json({
      intent: response.intent,
      response: response.response,
      actions: response.actions,
      responseTime: response.responseTime,
      confidence: response.confidence,
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing voice query:', error);
    return NextResponse.json(
      { error: 'Failed to process voice query' },
      { status: 500 }
    );
  }
}
