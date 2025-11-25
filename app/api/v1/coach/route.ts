import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AICoach, CashflowAnalyzer, SpendingAnalyzer, IncomePredictor } from '@/lib/ml';

// GET /api/v1/coach - Get AI coach advice
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

    // Calculate savings rate
    const monthlyIncome = incomeForecast.predictedAmount;
    const monthlyExpenses = spendingAnalysis.totalSpent;
    const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;

    // Generate advice using AICoach
    const advice = AICoach.generateAdvice({
      balance: currentBalance,
      monthlyIncome,
      monthlyExpenses,
      runoutDays: cashflowAnalysis.runoutDays,
      savingsRate,
      debtAmount: 0,
      goals: user.goals.map(g => ({
        name: g.name,
        progress: (g.currentAmount / g.targetAmount) * 100,
      })),
    });

    // Get tips
    const tips = AICoach.generateTips({
      balance: currentBalance,
      monthlyIncome,
      monthlyExpenses,
      runoutDays: cashflowAnalysis.runoutDays,
      savingsRate,
      debtAmount: 0,
      goals: user.goals.map(g => ({
        name: g.name,
        progress: (g.currentAmount / g.targetAmount) * 100,
      })),
    });

    // Analyze financial health
    const health = AICoach.analyzeHealth({
      balance: currentBalance,
      monthlyIncome,
      monthlyExpenses,
      runoutDays: cashflowAnalysis.runoutDays,
      savingsRate,
      debtAmount: 0,
      goals: user.goals.map(g => ({
        name: g.name,
        progress: (g.currentAmount / g.targetAmount) * 100,
      })),
    });

    // Get action plan
    const actionPlan = AICoach.getActionPlan({
      balance: currentBalance,
      monthlyIncome,
      monthlyExpenses,
      runoutDays: cashflowAnalysis.runoutDays,
      savingsRate,
      debtAmount: 0,
      goals: user.goals.map(g => ({
        name: g.name,
        progress: (g.currentAmount / g.targetAmount) * 100,
      })),
    });

    return NextResponse.json({
      advice: advice.map(a => ({
        title: a.title,
        insight: a.insight,
        reasoning: a.reasoning,
        actions: a.actions,
        impact: a.impact,
        tone: a.tone,
      })),
      tips,
      health: {
        score: health.score,
        grade: health.grade,
        summary: health.summary,
      },
      actionPlan: {
        immediate: actionPlan.immediate,
        shortTerm: actionPlan.shortTerm,
        longTerm: actionPlan.longTerm,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating coach advice:', error);
    return NextResponse.json(
      { error: 'Failed to generate coach advice' },
      { status: 500 }
    );
  }
}
