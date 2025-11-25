/**
 * Alert Engine
 * Multi-priority intelligent alert generation
 * Based on FinPilot SOP: Alert Engine
 */

interface Alert {
  id: string;
  type: 'rent_risk' | 'overspending' | 'cash_runout' | 'goal_milestone' | 'income_dip' | 'spending_spike' | 'subscription' | 'opportunity';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actions: string[];
  impact: string;
  confidence: number;
  createdAt: Date;
  expiresAt: Date;
  read: boolean;
}

export class AlertEngine {
  /**
   * Generate rent risk alert
   */
  static generateRentRiskAlert(
    rentAmount: number,
    daysUntilDue: number,
    currentBalance: number,
    dailyBurnRate: number
  ): Alert | null {
    if (daysUntilDue > 30 || rentAmount <= 0) return null;

    const projectedBalance = currentBalance - (dailyBurnRate * daysUntilDue);
    const shortfall = Math.max(0, rentAmount - projectedBalance);

    if (shortfall === 0) return null;

    let priority: Alert['priority'] = 'low';
    if (daysUntilDue <= 3) priority = 'critical';
    else if (daysUntilDue <= 7) priority = 'high';
    else if (daysUntilDue <= 14) priority = 'medium';

    return {
      id: `rent_${Date.now()}`,
      type: 'rent_risk',
      priority,
      title: `Rent Shortfall: ₹${Math.round(shortfall)}`,
      description: `Your rent of ₹${Math.round(rentAmount)} is due in ${daysUntilDue} days. You'll be short by ₹${Math.round(shortfall)}.`,
      actions: [
        `Add ₹${Math.ceil(shortfall / daysUntilDue)}/day to Rent Jar`,
        'Reduce discretionary spending',
        'Accelerate income collection',
      ],
      impact: `Rent payment at risk in ${daysUntilDue} days`,
      confidence: 85,
      createdAt: new Date(),
      expiresAt: new Date(new Date().setDate(new Date().getDate() + daysUntilDue)),
      read: false,
    };
  }

  /**
   * Generate overspending alert
   */
  static generateOverspendingAlert(
    dailySpend: number,
    dailyLimit: number,
    daysOverLimit: number
  ): Alert | null {
    if (dailySpend <= dailyLimit || daysOverLimit < 3) return null;

    const excessPerDay = dailySpend - dailyLimit;
    const monthlyExcess = excessPerDay * 30;

    return {
      id: `overspend_${Date.now()}`,
      type: 'overspending',
      priority: daysOverLimit >= 7 ? 'high' : 'medium',
      title: `Overspending Detected`,
      description: `You've been spending ₹${Math.round(excessPerDay)}/day above your limit for ${daysOverLimit} days.`,
      actions: [
        'Review recent transactions',
        'Adjust daily limit',
        'Pause subscriptions',
      ],
      impact: `₹${Math.round(monthlyExcess)}/month excess spending`,
      confidence: 90,
      createdAt: new Date(),
      expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)),
      read: false,
    };
  }

  /**
   * Generate cash runout alert
   */
  static generateCashRunoutAlert(
    runoutDays: number,
    currentBalance: number,
    dailyBurnRate: number
  ): Alert | null {
    if (runoutDays > 30 || runoutDays <= 0) return null;

    let priority: Alert['priority'] = 'low';
    if (runoutDays <= 7) priority = 'critical';
    else if (runoutDays <= 14) priority = 'high';
    else if (runoutDays <= 21) priority = 'medium';

    const dailyReductionNeeded = dailyBurnRate * 0.2; // 20% reduction

    return {
      id: `runout_${Date.now()}`,
      type: 'cash_runout',
      priority,
      title: `Cash Runout in ${runoutDays} Days`,
      description: `At current spending, you'll run out of money in ${runoutDays} days.`,
      actions: [
        `Reduce daily spending by ₹${Math.round(dailyReductionNeeded)}`,
        'Accelerate income',
        'Pause non-essential expenses',
      ],
      impact: `Zero balance projected in ${runoutDays} days`,
      confidence: 88,
      createdAt: new Date(),
      expiresAt: new Date(new Date().setDate(new Date().getDate() + runoutDays)),
      read: false,
    };
  }

  /**
   * Generate goal milestone alert
   */
  static generateGoalMilestoneAlert(
    goalName: string,
    progress: number,
    target: number,
    daysRemaining: number
  ): Alert | null {
    const percentage = (progress / target) * 100;

    if (percentage < 50) return null; // Only alert when 50%+ progress

    return {
      id: `goal_${Date.now()}`,
      type: 'goal_milestone',
      priority: percentage >= 90 ? 'high' : 'medium',
      title: `${goalName}: ${Math.round(percentage)}% Complete`,
      description: `You're ${Math.round(percentage)}% towards your goal of ₹${Math.round(target)}.`,
      actions: [
        'View goal details',
        'Increase monthly savings',
        'Celebrate progress',
      ],
      impact: `${Math.round(percentage)}% progress on ${goalName}`,
      confidence: 95,
      createdAt: new Date(),
      expiresAt: new Date(new Date().setDate(new Date().getDate() + daysRemaining)),
      read: false,
    };
  }

  /**
   * Generate income dip alert
   */
  static generateIncomeDipAlert(
    expectedIncome: number,
    projectedIncome: number,
    daysUntilExpected: number
  ): Alert | null {
    const dip = expectedIncome - projectedIncome;
    const dipPercentage = (dip / expectedIncome) * 100;

    if (dipPercentage < 20) return null; // Only alert for 20%+ dips

    return {
      id: `income_dip_${Date.now()}`,
      type: 'income_dip',
      priority: dipPercentage >= 50 ? 'high' : 'medium',
      title: `Income Dip Alert: -₹${Math.round(dip)}`,
      description: `Your income is projected to dip by ${Math.round(dipPercentage)}% in the next ${daysUntilExpected} days.`,
      actions: [
        'Review income sources',
        'Reduce spending',
        'Explore additional income',
      ],
      impact: `₹${Math.round(dip)} less income expected`,
      confidence: 75,
      createdAt: new Date(),
      expiresAt: new Date(new Date().setDate(new Date().getDate() + daysUntilExpected)),
      read: false,
    };
  }

  /**
   * Generate spending spike alert
   */
  static generateSpendingSpike Alert(
    currentDaySpend: number,
    averageDaySpend: number
  ): Alert | null {
    const spikePercentage = ((currentDaySpend - averageDaySpend) / averageDaySpend) * 100;

    if (spikePercentage < 50) return null; // Only alert for 50%+ spikes

    return {
      id: `spike_${Date.now()}`,
      type: 'spending_spike',
      priority: spikePercentage >= 100 ? 'high' : 'medium',
      title: `Spending Spike: +₹${Math.round(currentDaySpend - averageDaySpend)}`,
      description: `Today's spending is ${Math.round(spikePercentage)}% above your average.`,
      actions: [
        'Review today\'s transactions',
        'Check for unusual charges',
        'Adjust tomorrow\'s budget',
      ],
      impact: `₹${Math.round(currentDaySpend - averageDaySpend)} above average`,
      confidence: 85,
      createdAt: new Date(),
      expiresAt: new Date(new Date().setDate(new Date().getDate() + 1)),
      read: false,
    };
  }

  /**
   * Generate subscription alert
   */
  static generateSubscriptionAlert(
    subscriptionName: string,
    amount: number,
    frequency: string
  ): Alert | null {
    return {
      id: `sub_${Date.now()}`,
      type: 'subscription',
      priority: 'low',
      title: `Subscription: ${subscriptionName}`,
      description: `Your ${frequency} subscription to ${subscriptionName} costs ₹${Math.round(amount)}.`,
      actions: [
        'Review subscription',
        'Cancel if unused',
        'Downgrade plan',
      ],
      impact: `₹${Math.round(amount)} ${frequency} expense`,
      confidence: 90,
      createdAt: new Date(),
      expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)),
      read: false,
    };
  }

  /**
   * Generate opportunity alert
   */
  static generateOpportunityAlert(
    title: string,
    description: string,
    potentialSavings: number
  ): Alert {
    return {
      id: `opp_${Date.now()}`,
      type: 'opportunity',
      priority: 'low',
      title,
      description,
      actions: [
        'Learn more',
        'Take action',
      ],
      impact: `Potential savings: ₹${Math.round(potentialSavings)}`,
      confidence: 80,
      createdAt: new Date(),
      expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)),
      read: false,
    };
  }

  /**
   * Generate all relevant alerts for a user
   */
  static generateAllAlerts(
    currentBalance: number,
    dailyBurnRate: number,
    runoutDays: number,
    rentAmount: number,
    daysUntilRent: number,
    dailySpend: number,
    dailyLimit: number,
    daysOverLimit: number,
    expectedIncome: number,
    projectedIncome: number,
    daysUntilIncome: number
  ): Alert[] {
    const alerts: Alert[] = [];

    // Rent risk
    const rentAlert = this.generateRentRiskAlert(rentAmount, daysUntilRent, currentBalance, dailyBurnRate);
    if (rentAlert) alerts.push(rentAlert);

    // Overspending
    const overspendAlert = this.generateOverspendingAlert(dailySpend, dailyLimit, daysOverLimit);
    if (overspendAlert) alerts.push(overspendAlert);

    // Cash runout
    const runoutAlert = this.generateCashRunoutAlert(runoutDays, currentBalance, dailyBurnRate);
    if (runoutAlert) alerts.push(runoutAlert);

    // Income dip
    const incomeDipAlert = this.generateIncomeDipAlert(expectedIncome, projectedIncome, daysUntilIncome);
    if (incomeDipAlert) alerts.push(incomeDipAlert);

    return alerts;
  }
}
