/**
 * Goal Planning Engine
 * Feasibility analysis and milestone tracking
 * Based on FinPilot SOP: Goal Planning Agent
 */

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  priority: number;
}

interface GoalFeasibility {
  goal: Goal;
  isFeasible: boolean;
  requiredMonthlySavings: number;
  requiredDailySavings: number;
  daysRemaining: number;
  monthsRemaining: number;
  progressPercentage: number;
  milestones: Milestone[];
  riskFactors: string[];
  confidence: number;
}

interface Milestone {
  name: string;
  targetAmount: number;
  targetDate: Date;
  completed: boolean;
}

export class GoalPlanner {
  /**
   * Analyze goal feasibility
   */
  static analyzeFeasibility(
    goal: Goal,
    monthlyIncome: number,
    monthlyExpenses: number
  ): GoalFeasibility {
    const now = new Date();
    const daysRemaining = Math.round((goal.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const monthsRemaining = Math.max(1, Math.round(daysRemaining / 30));

    const shortfall = goal.targetAmount - goal.currentAmount;
    const requiredMonthlySavings = shortfall / monthsRemaining;
    const requiredDailySavings = shortfall / daysRemaining;

    const availableMonthlySavings = monthlyIncome - monthlyExpenses;
    const isFeasible = availableMonthlySavings >= requiredMonthlySavings;

    const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;

    // Generate milestones
    const milestones = this.generateMilestones(goal, monthsRemaining);

    // Identify risk factors
    const riskFactors: string[] = [];
    if (!isFeasible) {
      riskFactors.push(`Need ₹${Math.round(requiredMonthlySavings - availableMonthlySavings)}/month more`);
    }
    if (daysRemaining < 30) {
      riskFactors.push('Deadline is very close');
    }
    if (progressPercentage < 25) {
      riskFactors.push('Low progress towards goal');
    }

    // Calculate confidence
    let confidence = 80;
    if (!isFeasible) confidence -= 30;
    if (daysRemaining < 30) confidence -= 20;
    if (progressPercentage < 25) confidence -= 15;
    confidence = Math.max(10, confidence);

    return {
      goal,
      isFeasible,
      requiredMonthlySavings: Math.round(requiredMonthlySavings),
      requiredDailySavings: Math.round(requiredDailySavings),
      daysRemaining,
      monthsRemaining,
      progressPercentage: Math.round(progressPercentage),
      milestones,
      riskFactors,
      confidence,
    };
  }

  /**
   * Generate milestones for a goal
   */
  private static generateMilestones(goal: Goal, monthsRemaining: number): Milestone[] {
    const milestones: Milestone[] = [];
    const now = new Date();

    // Create quarterly milestones
    const milestonesCount = Math.min(4, Math.ceil(monthsRemaining / 3));
    const amountPerMilestone = goal.targetAmount / milestonesCount;

    for (let i = 1; i <= milestonesCount; i++) {
      const targetDate = new Date(now);
      targetDate.setMonth(targetDate.getMonth() + Math.round((monthsRemaining / milestonesCount) * i));

      const targetAmount = amountPerMilestone * i;
      const completed = goal.currentAmount >= targetAmount;

      milestones.push({
        name: `Milestone ${i}: ₹${Math.round(targetAmount)}`,
        targetAmount: Math.round(targetAmount),
        targetDate,
        completed,
      });
    }

    return milestones;
  }

  /**
   * Get goal recommendations
   */
  static getRecommendations(feasibility: GoalFeasibility): string[] {
    const recommendations: string[] = [];

    if (!feasibility.isFeasible) {
      recommendations.push(`Increase monthly savings by ₹${Math.round(feasibility.requiredMonthlySavings * 1.2)}`);
      recommendations.push('Extend deadline or reduce target amount');
      recommendations.push('Look for additional income sources');
    } else {
      recommendations.push(`Save ₹${feasibility.requiredDailySavings}/day to stay on track`);
    }

    if (feasibility.progressPercentage < 50) {
      recommendations.push('Accelerate savings to catch up');
    } else if (feasibility.progressPercentage > 75) {
      recommendations.push('You\'re on track! Keep up the momentum');
    }

    if (feasibility.daysRemaining < 30) {
      recommendations.push('Deadline approaching - prioritize this goal');
    }

    return recommendations;
  }

  /**
   * Calculate goal priority score
   */
  static calculatePriorityScore(
    goal: Goal,
    feasibility: GoalFeasibility
  ): number {
    let score = goal.priority * 10; // Base score from priority

    // Adjust based on deadline urgency
    if (feasibility.daysRemaining < 30) score += 30;
    else if (feasibility.daysRemaining < 90) score += 20;
    else if (feasibility.daysRemaining < 180) score += 10;

    // Adjust based on feasibility
    if (feasibility.isFeasible) score += 15;
    else score -= 20;

    // Adjust based on progress
    if (feasibility.progressPercentage > 75) score += 10;
    else if (feasibility.progressPercentage < 25) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Rank goals by priority
   */
  static rankGoals(
    goals: Goal[],
    monthlyIncome: number,
    monthlyExpenses: number
  ): { goal: Goal; feasibility: GoalFeasibility; priorityScore: number }[] {
    const ranked = goals.map(goal => {
      const feasibility = this.analyzeFeasibility(goal, monthlyIncome, monthlyExpenses);
      const priorityScore = this.calculatePriorityScore(goal, feasibility);

      return { goal, feasibility, priorityScore };
    });

    return ranked.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  /**
   * Get goal insights
   */
  static getInsights(feasibilities: GoalFeasibility[]): string[] {
    const insights: string[] = [];

    const feasibleGoals = feasibilities.filter(f => f.isFeasible);
    const infeasibleGoals = feasibilities.filter(f => !f.isFeasible);

    if (feasibleGoals.length > 0) {
      insights.push(`✅ ${feasibleGoals.length} goal(s) are achievable`);
    }

    if (infeasibleGoals.length > 0) {
      insights.push(`⚠️ ${infeasibleGoals.length} goal(s) need adjustment`);
    }

    const totalRequired = feasibilities.reduce((sum, f) => sum + f.requiredMonthlySavings, 0);
    if (totalRequired > 0) {
      insights.push(`💰 Total monthly savings needed: ₹${Math.round(totalRequired)}`);
    }

    const urgentGoals = feasibilities.filter(f => f.daysRemaining < 30);
    if (urgentGoals.length > 0) {
      insights.push(`⏰ ${urgentGoals.length} goal(s) have urgent deadlines`);
    }

    return insights;
  }
}
