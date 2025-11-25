/**
 * AI Coach Engine
 * Financial reasoning and personalized advice
 * Based on FinPilot SOP: AI Coach Agent
 */

interface FinancialContext {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  runoutDays: number;
  savingsRate: number;
  debtAmount: number;
  goals: { name: string; progress: number }[];
}

interface CoachAdvice {
  title: string;
  insight: string;
  reasoning: string;
  actions: string[];
  impact: string;
  tone: 'urgent' | 'encouraging' | 'neutral' | 'celebratory';
}

export class AICoach {
  /**
   * Generate personalized financial advice
   */
  static generateAdvice(context: FinancialContext): CoachAdvice[] {
    const advice: CoachAdvice[] = [];

    // Critical: Low runway
    if (context.runoutDays < 14) {
      advice.push({
        title: 'Immediate Action Needed',
        insight: `You have ${context.runoutDays} days of runway left.`,
        reasoning: 'At your current burn rate, you\'ll run out of money soon. This requires immediate attention.',
        actions: [
          'Pause all non-essential spending',
          'Accelerate income collection',
          'Review upcoming obligations',
        ],
        impact: `Prevents financial crisis in ${context.runoutDays} days`,
        tone: 'urgent',
      });
    }

    // High: Negative savings rate
    if (context.savingsRate < 0) {
      advice.push({
        title: 'Spending Exceeds Income',
        insight: `You're spending ₹${Math.abs(Math.round(context.monthlyIncome - context.monthlyExpenses))}/month more than you earn.`,
        reasoning: 'This is unsustainable. You\'re depleting savings or accumulating debt.',
        actions: [
          'Cut discretionary spending by 20%',
          'Review subscriptions and recurring charges',
          'Explore additional income sources',
        ],
        impact: 'Prevents long-term financial stress',
        tone: 'urgent',
      });
    }

    // Medium: Low savings rate
    if (context.savingsRate > 0 && context.savingsRate < 0.1) {
      advice.push({
        title: 'Increase Your Savings Rate',
        insight: `You're saving only ${Math.round(context.savingsRate * 100)}% of your income.`,
        reasoning: 'Financial experts recommend saving 20% of income. You\'re well below that.',
        actions: [
          'Identify 3 areas to cut spending',
          'Automate savings transfers',
          'Track spending by category',
        ],
        impact: `Could save ₹${Math.round(context.monthlyIncome * 0.1)}/month with 10% increase`,
        tone: 'neutral',
      });
    }

    // Positive: Good savings rate
    if (context.savingsRate >= 0.2) {
      advice.push({
        title: 'Excellent Savings Discipline',
        insight: `You're saving ${Math.round(context.savingsRate * 100)}% of your income.`,
        reasoning: 'You\'re ahead of most people. This puts you in a strong financial position.',
        actions: [
          'Invest your savings for growth',
          'Build emergency fund to 6 months',
          'Plan for long-term goals',
        ],
        impact: 'Building wealth and financial security',
        tone: 'celebratory',
      });
    }

    // Debt management
    if (context.debtAmount > 0) {
      const debtToIncomeRatio = context.debtAmount / (context.monthlyIncome * 12);
      if (debtToIncomeRatio > 0.5) {
        advice.push({
          title: 'High Debt Burden',
          insight: `Your debt is ${Math.round(debtToIncomeRatio * 100)}% of annual income.`,
          reasoning: 'High debt limits your financial flexibility and increases stress.',
          actions: [
            'Create debt payoff plan',
            'Prioritize high-interest debt',
            'Negotiate lower interest rates',
          ],
          impact: `Could be debt-free in ${Math.round(context.debtAmount / (context.monthlyIncome * 0.2))} months`,
          tone: 'urgent',
        });
      }
    }

    // Goal progress
    const completedGoals = context.goals.filter(g => g.progress >= 100).length;
    if (completedGoals > 0) {
      advice.push({
        title: 'Goal Achievement',
        insight: `You've completed ${completedGoals} financial goal(s).`,
        reasoning: 'Completing goals builds momentum and confidence in your financial journey.',
        actions: [
          'Celebrate your progress',
          'Set new goals',
          'Share your success',
        ],
        impact: 'Reinforces positive financial habits',
        tone: 'celebratory',
      });
    }

    return advice;
  }

  /**
   * Generate contextual tips
   */
  static generateTips(context: FinancialContext): string[] {
    const tips: string[] = [];

    // Time-based tips
    const now = new Date();
    const dayOfMonth = now.getDate();

    if (dayOfMonth === 1) {
      tips.push('🎯 Start the month by reviewing your budget and goals');
    } else if (dayOfMonth === 15) {
      tips.push('📊 Mid-month check: Are you on track with your spending?');
    } else if (dayOfMonth >= 25) {
      tips.push('💰 Month-end: Review spending and plan for next month');
    }

    // Spending-based tips
    if (context.monthlyExpenses > context.monthlyIncome * 0.8) {
      tips.push('💡 Your expenses are high. Look for areas to optimize.');
    }

    // Savings-based tips
    if (context.savingsRate > 0.15) {
      tips.push('🚀 Your savings rate is strong. Consider investing for growth.');
    }

    // Balance-based tips
    if (context.balance < context.monthlyExpenses) {
      tips.push('⚠️ Your balance is less than monthly expenses. Build an emergency fund.');
    }

    return tips;
  }

  /**
   * Analyze financial health
   */
  static analyzeHealth(context: FinancialContext): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
  } {
    let score = 50; // Base score

    // Runway (max 20 points)
    if (context.runoutDays > 180) score += 20;
    else if (context.runoutDays > 90) score += 15;
    else if (context.runoutDays > 30) score += 10;
    else if (context.runoutDays > 14) score += 5;

    // Savings rate (max 20 points)
    if (context.savingsRate >= 0.2) score += 20;
    else if (context.savingsRate >= 0.15) score += 15;
    else if (context.savingsRate >= 0.1) score += 10;
    else if (context.savingsRate >= 0.05) score += 5;

    // Debt (max 20 points)
    const debtToIncome = context.debtAmount / (context.monthlyIncome * 12);
    if (debtToIncome === 0) score += 20;
    else if (debtToIncome < 0.2) score += 15;
    else if (debtToIncome < 0.5) score += 10;
    else if (debtToIncome < 1) score += 5;

    // Goals (max 20 points)
    const goalProgress = context.goals.reduce((sum, g) => sum + g.progress, 0) / Math.max(1, context.goals.length);
    if (goalProgress >= 0.75) score += 20;
    else if (goalProgress >= 0.5) score += 15;
    else if (goalProgress >= 0.25) score += 10;
    else if (goalProgress > 0) score += 5;

    // Balance (max 20 points)
    const balanceToExpenses = context.balance / context.monthlyExpenses;
    if (balanceToExpenses >= 6) score += 20;
    else if (balanceToExpenses >= 3) score += 15;
    else if (balanceToExpenses >= 1) score += 10;
    else if (balanceToExpenses >= 0.5) score += 5;

    score = Math.min(100, score);

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    let summary: string;

    if (score >= 90) {
      grade = 'A';
      summary = 'Excellent financial health. You\'re in great shape!';
    } else if (score >= 80) {
      grade = 'B';
      summary = 'Good financial health. Keep up the good work.';
    } else if (score >= 70) {
      grade = 'C';
      summary = 'Fair financial health. Some areas need improvement.';
    } else if (score >= 60) {
      grade = 'D';
      summary = 'Poor financial health. Significant improvements needed.';
    } else {
      grade = 'F';
      summary = 'Critical financial situation. Immediate action required.';
    }

    return { score: Math.round(score), grade, summary };
  }

  /**
   * Get personalized action plan
   */
  static getActionPlan(context: FinancialContext): {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  } {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    // Immediate actions
    if (context.runoutDays < 30) {
      immediate.push('Reduce spending to extend runway');
      immediate.push('Accelerate income collection');
    }

    if (context.savingsRate < 0) {
      immediate.push('Cut discretionary spending');
      immediate.push('Review and cancel unused subscriptions');
    }

    // Short-term actions (1-3 months)
    if (context.balance < context.monthlyExpenses * 3) {
      shortTerm.push('Build emergency fund to 3 months of expenses');
    }

    if (context.debtAmount > 0) {
      shortTerm.push('Create debt payoff plan');
    }

    shortTerm.push('Optimize spending by category');
    shortTerm.push('Automate savings transfers');

    // Long-term actions (3+ months)
    if (context.savingsRate > 0.1) {
      longTerm.push('Invest savings for long-term growth');
    }

    longTerm.push('Build wealth and financial security');
    longTerm.push('Plan for major life goals');
    longTerm.push('Review and adjust financial plan annually');

    return { immediate, shortTerm, longTerm };
  }
}
