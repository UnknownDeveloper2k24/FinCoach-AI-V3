import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoalPlanner } from '@/lib/ml';

// GET /api/v1/goals - Get goals with feasibility analysis
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
      include: { goals: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // TODO: Get from user preferences
    const monthlyIncome = 100000;
    const monthlyExpenses = 50000;

    // Analyze each goal
    const goalsWithAnalysis = user.goals.map(goal => {
      const feasibility = GoalPlanner.analyzeFeasibility(
        {
          id: goal.id,
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: goal.deadline,
          category: goal.category,
          priority: goal.priority,
        },
        monthlyIncome,
        monthlyExpenses
      );

      const recommendations = GoalPlanner.getRecommendations(feasibility);
      const priorityScore = GoalPlanner.calculatePriorityScore(
        {
          id: goal.id,
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: goal.deadline,
          category: goal.category,
          priority: goal.priority,
        },
        feasibility
      );

      return {
        id: goal.id,
        name: goal.name,
        category: goal.category,
        target: goal.targetAmount,
        current: goal.currentAmount,
        progress: (goal.currentAmount / goal.targetAmount) * 100,
        deadline: goal.deadline,
        feasibility: {
          isFeasible: feasibility.isFeasible,
          requiredMonthlySavings: feasibility.requiredMonthlySavings,
          requiredDailySavings: feasibility.requiredDailySavings,
          daysRemaining: feasibility.daysRemaining,
          monthsRemaining: feasibility.monthsRemaining,
          confidence: feasibility.confidence,
        },
        milestones: feasibility.milestones.map(m => ({
          name: m.name,
          target: m.targetAmount,
          date: m.targetDate,
          completed: m.completed,
        })),
        riskFactors: feasibility.riskFactors,
        recommendations,
        priorityScore,
      };
    });

    // Get overall insights
    const feasibilities = goalsWithAnalysis.map(g => ({
      goal: {
        id: g.id,
        name: g.name,
        targetAmount: g.target,
        currentAmount: g.current,
        deadline: g.deadline,
        category: g.category,
        priority: 1,
      },
      isFeasible: g.feasibility.isFeasible,
      requiredMonthlySavings: g.feasibility.requiredMonthlySavings,
      requiredDailySavings: g.feasibility.requiredDailySavings,
      daysRemaining: g.feasibility.daysRemaining,
      monthsRemaining: g.feasibility.monthsRemaining,
      progressPercentage: g.progress,
      milestones: g.milestones,
      riskFactors: g.riskFactors,
      confidence: g.feasibility.confidence,
    }));

    const insights = GoalPlanner.getInsights(feasibilities);

    return NextResponse.json({
      goals: goalsWithAnalysis,
      insights,
      summary: {
        totalGoals: goalsWithAnalysis.length,
        feasibleGoals: goalsWithAnalysis.filter(g => g.feasibility.isFeasible).length,
        totalMonthlyRequired: goalsWithAnalysis.reduce((sum, g) => sum + g.feasibility.requiredMonthlySavings, 0),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST /api/v1/goals - Create a new goal
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, category, targetAmount, deadline, priority } = body;

    if (!userId || !name || !targetAmount || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Create goal
    const goal = await prisma.goal.create({
      data: {
        userId,
        name,
        category: category || 'other',
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        deadline: new Date(deadline),
        priority: priority || 5,
      },
    });

    return NextResponse.json({
      id: goal.id,
      name: goal.name,
      category: goal.category,
      target: goal.targetAmount,
      current: goal.currentAmount,
      deadline: goal.deadline,
      priority: goal.priority,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
