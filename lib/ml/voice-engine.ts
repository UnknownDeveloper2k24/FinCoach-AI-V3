/**
 * Voice Interaction Engine
 * Intent recognition and <8 second response generation
 * Based on FinPilot SOP: Voice Interaction Agent
 */

interface VoiceQuery {
  text: string;
  timestamp: Date;
}

interface VoiceResponse {
  intent: string;
  response: string;
  actions: string[];
  responseTime: number; // milliseconds
  confidence: number;
}

export class VoiceEngine {
  // Intent patterns
  private static readonly INTENTS = {
    balance: ['balance', 'how much', 'account', 'money', 'available'],
    spending: ['spending', 'spent', 'expenses', 'how much did i spend', 'today'],
    income: ['income', 'earned', 'salary', 'received', 'how much did i earn'],
    goals: ['goals', 'target', 'saving for', 'progress'],
    alerts: ['alerts', 'notifications', 'warnings', 'issues'],
    advice: ['advice', 'suggest', 'recommend', 'help', 'what should i do'],
    transactions: ['transactions', 'recent', 'history', 'last purchase'],
    subscriptions: ['subscriptions', 'recurring', 'monthly charges'],
    budget: ['budget', 'limit', 'spending limit', 'how much can i spend'],
    forecast: ['forecast', 'predict', 'next month', 'coming'],
  };

  /**
   * Recognize intent from voice query
   */
  static recognizeIntent(query: string): { intent: string; confidence: number } {
    const lowerQuery = query.toLowerCase();
    let bestMatch = { intent: 'unknown', confidence: 0 };

    for (const [intent, keywords] of Object.entries(this.INTENTS)) {
      let matches = 0;
      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
          matches++;
        }
      }

      if (matches > 0) {
        const confidence = (matches / keywords.length) * 100;
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent, confidence: Math.round(confidence) };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Generate quick response for balance query
   */
  static respondToBalance(balance: number, safeToSpend: number): string {
    if (balance < 1000) {
      return `Your balance is ₹${Math.round(balance)}. You can safely spend ₹${Math.round(safeToSpend)}.`;
    } else if (balance < 10000) {
      return `You have ₹${Math.round(balance)} available. Safe to spend: ₹${Math.round(safeToSpend)}.`;
    } else {
      return `Balance: ₹${Math.round(balance)}. Safe to spend: ₹${Math.round(safeToSpend)}.`;
    }
  }

  /**
   * Generate quick response for spending query
   */
  static respondToSpending(todaySpent: number, weeklyAverage: number): string {
    const difference = todaySpent - weeklyAverage;

    if (difference > weeklyAverage * 0.5) {
      return `You've spent ₹${Math.round(todaySpent)} today, which is ${Math.round((difference / weeklyAverage) * 100)}% above average.`;
    } else if (difference < -weeklyAverage * 0.5) {
      return `You've spent ₹${Math.round(todaySpent)} today, which is ${Math.round(Math.abs(difference / weeklyAverage) * 100)}% below average.`;
    } else {
      return `You've spent ₹${Math.round(todaySpent)} today, which is about average.`;
    }
  }

  /**
   * Generate quick response for income query
   */
  static respondToIncome(expectedIncome: number, daysUntilIncome: number): string {
    if (daysUntilIncome <= 0) {
      return `Income expected today: ₹${Math.round(expectedIncome)}.`;
    } else if (daysUntilIncome <= 7) {
      return `You're expecting ₹${Math.round(expectedIncome)} in ${daysUntilIncome} days.`;
    } else {
      return `Next income: ₹${Math.round(expectedIncome)} in ${daysUntilIncome} days.`;
    }
  }

  /**
   * Generate quick response for goals query
   */
  static respondToGoals(goalName: string, progress: number, target: number): string {
    const percentage = (progress / target) * 100;
    const remaining = target - progress;

    if (percentage >= 90) {
      return `${goalName} is ${Math.round(percentage)}% complete. Just ₹${Math.round(remaining)} to go!`;
    } else if (percentage >= 50) {
      return `${goalName} is ${Math.round(percentage)}% complete. ₹${Math.round(remaining)} remaining.`;
    } else {
      return `${goalName} is ${Math.round(percentage)}% complete. Keep saving!`;
    }
  }

  /**
   * Generate quick response for alerts
   */
  static respondToAlerts(alertCount: number, criticalCount: number): string {
    if (criticalCount > 0) {
      return `You have ${criticalCount} critical alert${criticalCount > 1 ? 's' : ''}. Check your app immediately.`;
    } else if (alertCount > 0) {
      return `You have ${alertCount} notification${alertCount > 1 ? 's' : ''}. Review them in your app.`;
    } else {
      return 'No alerts. Everything looks good!';
    }
  }

  /**
   * Generate quick response for advice query
   */
  static respondToAdvice(runoutDays: number, savingsRate: number): string {
    if (runoutDays < 14) {
      return 'Urgent: Reduce spending immediately to extend your runway.';
    } else if (savingsRate < 0.1) {
      return 'Try to increase your savings rate. Cut discretionary spending by 10%.';
    } else if (savingsRate > 0.2) {
      return 'Great job! Your savings rate is excellent. Consider investing for growth.';
    } else {
      return 'You\'re on track. Keep maintaining your current spending habits.';
    }
  }

  /**
   * Process voice query and generate response
   */
  static processQuery(
    query: string,
    context: {
      balance: number;
      safeToSpend: number;
      todaySpent: number;
      weeklyAverage: number;
      expectedIncome: number;
      daysUntilIncome: number;
      goalName: string;
      goalProgress: number;
      goalTarget: number;
      alertCount: number;
      criticalAlerts: number;
      runoutDays: number;
      savingsRate: number;
    }
  ): VoiceResponse {
    const startTime = Date.now();
    const { intent, confidence } = this.recognizeIntent(query);

    let response = '';
    const actions: string[] = [];

    switch (intent) {
      case 'balance':
        response = this.respondToBalance(context.balance, context.safeToSpend);
        actions.push('View detailed balance');
        break;

      case 'spending':
        response = this.respondToSpending(context.todaySpent, context.weeklyAverage);
        actions.push('View spending breakdown');
        break;

      case 'income':
        response = this.respondToIncome(context.expectedIncome, context.daysUntilIncome);
        actions.push('View income forecast');
        break;

      case 'goals':
        response = this.respondToGoals(context.goalName, context.goalProgress, context.goalTarget);
        actions.push('View all goals');
        break;

      case 'alerts':
        response = this.respondToAlerts(context.alertCount, context.criticalAlerts);
        actions.push('View alerts');
        break;

      case 'advice':
        response = this.respondToAdvice(context.runoutDays, context.savingsRate);
        actions.push('Get detailed advice');
        break;

      default:
        response = 'I didn\'t quite understand. Try asking about your balance, spending, or goals.';
        actions.push('Try again');
    }

    const responseTime = Date.now() - startTime;

    return {
      intent,
      response,
      actions,
      responseTime: Math.min(responseTime, 8000), // Cap at 8 seconds
      confidence,
    };
  }
}
