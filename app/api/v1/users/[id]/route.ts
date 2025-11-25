import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserManager, CashflowAnalyzer, SpendingAnalyzer, IncomePredictor } from '@/lib/ml';

// GET /api/v1/users/[id] - Get user profile with health score
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        transactions: { orderBy: { date: 'desc' }, take: 100 },
        goals: true,
        jars: true,
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

    // Calculate financial health
    const monthlyIncome = incomeForecast.predictedAmount;
    const monthlyExpenses = spendingAnalysis.totalSpent;
    const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;

    // Get health score using UserManager
    const healthScore = UserManager.calculateHealthScore({
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

    // Get recommendations
    const recommendations = UserManager.getRecommendations({
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      financialHealth: {
        score: healthScore.score,
        grade: healthScore.grade,
        summary: healthScore.summary,
      },
      financials: {
        balance: currentBalance,
        monthlyIncome,
        monthlyExpenses,
        savingsRate: savingsRate * 100,
        runoutDays: cashflowAnalysis.runoutDays,
      },
      recommendations,
      stats: {
        totalTransactions: user.transactions.length,
        totalGoals: user.goals.length,
        totalJars: user.jars.length,
        totalAssets: 0,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/users/[id] - Update user profile
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await req.json();
    const { name, preferences } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || user.name,
        preferences: preferences || user.preferences,
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      preferences: updatedUser.preferences,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/users/[id] - Delete user (with anonymization option)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const { anonymize } = await req.json().catch(() => ({}));

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (anonymize) {
      // Anonymize user data using UserManager
      const anonymized = UserManager.anonymizeData(userId);
      
      // Update user with anonymized data
      await prisma.user.update({
        where: { id: userId },
        data: {
          email: anonymized.email,
          name: anonymized.name,
          preferences: {},
        },
      });

      return NextResponse.json(
        { message: 'User data anonymized successfully' },
        { status: 200 }
      );
    } else {
      // Delete user completely
      await prisma.user.delete({
        where: { id: userId },
      });

      return NextResponse.json(
        { message: 'User deleted successfully' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
