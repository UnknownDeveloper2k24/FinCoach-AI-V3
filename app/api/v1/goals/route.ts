import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/goals - Get all goals for a user
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
    
    // Get goals with milestones
    const goals = await prisma.financialGoal.findMany({
      where: { userId },
      include: {
        milestones: {
          orderBy: { targetDate: 'asc' },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { targetDate: 'asc' },
      ],
    });
    
    // Calculate progress percentage for each goal
    const goalsWithProgress = goals.map(goal => ({
      ...goal,
      progress: Number(goal.targetAmount) > 0 
        ? Math.min(100, Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100)) 
        : 0,
      daysRemaining: goal.targetDate 
        ? Math.max(0, Math.round((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
        : null,
    }));
    
    return NextResponse.json({ goals: goalsWithProgress }, { status: 200 });
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
    const { 
      userId, 
      name, 
      description, 
      category,
      targetAmount, 
      targetDate, 
      priority,
      milestones,
      color,
      icon,
    } = body;
    
    // Validate required fields
    if (!userId || !name || !targetAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, targetAmount' },
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
    
    // Create goal with milestones in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create goal
      const goal = await tx.financialGoal.create({
        data: {
          userId,
          name,
          description,
          category: category || 'Other',
          targetAmount,
          currentAmount: 0,
          targetDate: targetDate ? new Date(targetDate) : null,
          priority: priority || 0,
          color: color || "#3B82F6", // Default blue color
          icon,
          status: 'active',
        },
      });
      
      // Create milestones if provided
      let createdMilestones = [];
      
      if (milestones && milestones.length > 0) {
        const milestonesData = milestones.map((milestone: any) => ({
          goalId: goal.id,
          name: milestone.name,
          targetAmount: milestone.targetAmount,
          targetDate: milestone.targetDate ? new Date(milestone.targetDate) : null,
          description: milestone.description,
        }));
        
        createdMilestones = await Promise.all(
          milestonesData.map((data: any) => 
            tx.goalMilestone.create({ data })
          )
        );
      }
      
      return {
        goal,
        milestones: createdMilestones,
      };
    });
    
    // Calculate progress percentage
    const progress = Number(result.goal.targetAmount) > 0 
      ? Math.min(100, Math.round((Number(result.goal.currentAmount) / Number(result.goal.targetAmount)) * 100)) 
      : 0;
    
    // Calculate days remaining
    const daysRemaining = result.goal.targetDate 
      ? Math.max(0, Math.round((new Date(result.goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : null;
    
    // Format response
    const response = {
      goal: {
        ...result.goal,
        progress,
        daysRemaining,
        milestones: result.milestones,
      },
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}

// POST /api/v1/goals/analyze - Analyze goal feasibility
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'analyze') {
    try {
      const body = await req.json();
      const { 
        userId, 
        goalId,
        targetAmount,
        targetDate,
        monthlyContribution,
      } = body;
      
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
          profile: true,
          cashflowAnalysis: true,
        },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Get goal if goalId is provided
      let goal = null;
      
      if (goalId) {
        goal = await prisma.financialGoal.findUnique({
          where: { id: goalId },
        });
        
        if (!goal) {
          return NextResponse.json(
            { error: 'Goal not found' },
            { status: 404 }
          );
        }
      }
      
      // Use provided values or goal values
      const amount = targetAmount || (goal ? goal.targetAmount : 0);
      const date = targetDate ? new Date(targetDate) : (goal && goal.targetDate ? new Date(goal.targetDate) : null);
      const currentAmount = goal ? goal.currentAmount : 0;
      
      // Calculate remaining amount
      const remainingAmount = Math.max(0, Number(amount) - Number(currentAmount));
      
      // Calculate months until target date
      const now = new Date();
      const monthsRemaining = date 
        ? Math.max(0, (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth()))
        : 0;
      
      // Calculate required monthly contribution
      const requiredMonthlyContribution = monthsRemaining > 0 
        ? remainingAmount / monthsRemaining 
        : remainingAmount;
      
      // Get user's financial data
      const monthlyIncome = user.profile?.monthlyIncome || 0;
      const dailyBurnRate = user.cashflowAnalysis?.dailyBurnRate || 0;
      const monthlyExpenses = dailyBurnRate * 30;
      const monthlySavingsPotential = Math.max(0, Number(monthlyIncome) - monthlyExpenses);
      
      // Calculate feasibility
      let feasibility = 0;
      let feasibilityStatus = 'impossible';
      let suggestedMonthlyContribution = 0;
      let suggestedTimeframe = 0;
      
      if (monthlySavingsPotential > 0) {
        // If user provided monthly contribution, calculate feasibility based on that
        if (monthlyContribution) {
          const providedContribution = Number(monthlyContribution);
          
          // Calculate months needed with provided contribution
          const monthsNeeded = providedContribution > 0 
            ? Math.ceil(remainingAmount / providedContribution) 
            : 999;
          
          // Calculate feasibility as a percentage of savings potential
          feasibility = Math.min(100, Math.round((providedContribution / monthlySavingsPotential) * 100));
          
          // Determine feasibility status
          if (feasibility <= 30) {
            feasibilityStatus = 'easy';
          } else if (feasibility <= 70) {
            feasibilityStatus = 'moderate';
          } else if (feasibility <= 100) {
            feasibilityStatus = 'challenging';
          } else {
            feasibilityStatus = 'impossible';
          }
          
          // Suggested timeframe with this contribution
          suggestedTimeframe = monthsNeeded;
        } else {
          // Calculate feasibility based on required monthly contribution
          feasibility = Math.min(100, Math.round((requiredMonthlyContribution / monthlySavingsPotential) * 100));
          
          // Determine feasibility status
          if (feasibility <= 30) {
            feasibilityStatus = 'easy';
          } else if (feasibility <= 70) {
            feasibilityStatus = 'moderate';
          } else if (feasibility <= 100) {
            feasibilityStatus = 'challenging';
          } else {
            feasibilityStatus = 'impossible';
          }
          
          // Suggested monthly contribution (capped at savings potential)
          suggestedMonthlyContribution = Math.min(requiredMonthlyContribution, monthlySavingsPotential);
          
          // If required contribution exceeds savings potential, suggest longer timeframe
          if (requiredMonthlyContribution > monthlySavingsPotential) {
            suggestedTimeframe = Math.ceil(remainingAmount / monthlySavingsPotential);
          } else {
            suggestedTimeframe = monthsRemaining;
          }
        }
      }
      
      // Format response
      const response = {
        analysis: {
          targetAmount: amount,
          currentAmount,
          remainingAmount,
          targetDate: date,
          monthsRemaining,
          requiredMonthlyContribution,
          userMonthlyIncome: monthlyIncome,
          userMonthlyExpenses: monthlyExpenses,
          userSavingsPotential: monthlySavingsPotential,
          feasibility,
          feasibilityStatus,
          suggestedMonthlyContribution,
          suggestedTimeframe,
        },
      };
      
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Error analyzing goal feasibility:', error);
      return NextResponse.json(
        { error: 'Failed to analyze goal feasibility' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'analyze'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}

// POST /api/v1/goals/contribute - Contribute to a goal
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'contribute') {
    try {
      const body = await req.json();
      const { goalId, amount, source } = body;
      
      if (!goalId || !amount) {
        return NextResponse.json(
          { error: 'Missing required fields: goalId, amount' },
          { status: 400 }
        );
      }
      
      // Check if goal exists
      const goal = await prisma.financialGoal.findUnique({
        where: { id: goalId },
        include: {
          milestones: true,
        },
      });
      
      if (!goal) {
        return NextResponse.json(
          { error: 'Goal not found' },
          { status: 404 }
        );
      }
      
      // Update goal in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update goal amount
        const updatedGoal = await tx.financialGoal.update({
          where: { id: goalId },
          data: {
            currentAmount: {
              increment: amount,
            },
            lastContributionDate: new Date(),
          },
        });
        
        // Create contribution record
        const contribution = await tx.goalContribution.create({
          data: {
            goalId,
            amount,
            source: source || 'manual',
          },
        });
        
        // Check if any milestones are reached
        const updatedMilestones = [];
        
        for (const milestone of goal.milestones) {
          if (!milestone.isCompleted && Number(updatedGoal.currentAmount) >= Number(milestone.targetAmount)) {
            const updatedMilestone = await tx.goalMilestone.update({
              where: { id: milestone.id },
              data: {
                isCompleted: true,
                completedDate: new Date(),
              },
            });
            
            updatedMilestones.push(updatedMilestone);
          }
        }
        
        // Check if goal is completed
        let completedGoal = null;
        
        if (Number(updatedGoal.currentAmount) >= Number(updatedGoal.targetAmount) && updatedGoal.status !== 'completed') {
          completedGoal = await tx.financialGoal.update({
            where: { id: goalId },
            data: {
              status: 'completed',
              completedDate: new Date(),
            },
          });
        }
        
        return {
          goal: completedGoal || updatedGoal,
          contribution,
          reachedMilestones: updatedMilestones,
        };
      });
      
      // Calculate progress percentage
      const progress = Number(result.goal.targetAmount) > 0 
        ? Math.min(100, Math.round((Number(result.goal.currentAmount) / Number(result.goal.targetAmount)) * 100)) 
        : 0;
      
      // Calculate days remaining
      const daysRemaining = result.goal.targetDate 
        ? Math.max(0, Math.round((new Date(result.goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
        : null;
      
      // Format response
      const response = {
        goal: {
          ...result.goal,
          progress,
          daysRemaining,
        },
        contribution: result.contribution,
        reachedMilestones: result.reachedMilestones,
        isCompleted: result.goal.status === 'completed',
      };
      
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Error contributing to goal:', error);
      return NextResponse.json(
        { error: 'Failed to contribute to goal' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'contribute'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}
