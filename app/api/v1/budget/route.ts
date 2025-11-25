import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BudgetOptimizer } from '@/lib/ml';

// GET /api/v1/budget - Get budget optimization
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
        transactions: { orderBy: { date: 'desc' }, take: 100 },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get transactions from last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = user.transactions.filter(t => t.date >= thirtyDaysAgo);

    // Build category spending map
    const categorySpending = new Map<string, number>();
    recentTransactions.forEach(t => {
      if (t.type === 'expense') {
        categorySpending.set(
          t.category,
          (categorySpending.get(t.category) || 0) + t.amount
        );
      }
    });

    // Get user's monthly income (from preferences or estimate)
    const monthlyIncome = 100000; // TODO: Get from user preferences

    // Optimize budget using ML engine
    const optimization = BudgetOptimizer.optimize(categorySpending, monthlyIncome);

    // Get insights
    const insights = BudgetOptimizer.getInsights(optimization);

    return NextResponse.json({
      monthlyIncome,
      current: {
        needs: optimization.currentAllocation.needs,
        wants: optimization.currentAllocation.wants,
        savings: optimization.currentAllocation.savings,
        total: optimization.currentAllocation.needs + optimization.currentAllocation.wants + optimization.currentAllocation.savings,
      },
      recommended: {
        needs: optimization.recommendedAllocation.needs,
        wants: optimization.recommendedAllocation.wants,
        savings: optimization.recommendedAllocation.savings,
        total: monthlyIncome,
      },
      recommendations: optimization.categoryRecommendations.map(r => ({
        category: r.category,
        current: r.current,
        recommended: r.recommended,
        savings: r.savings,
        priority: r.priority,
      })),
      totalPotentialSavings: optimization.totalPotentialSavings,
      insights,
      confidence: optimization.confidence,
    }, { status: 200 });
  } catch (error) {
    console.error('Error optimizing budget:', error);
    return NextResponse.json(
      { error: 'Failed to optimize budget' },
      { status: 500 }
    );
  }
}
