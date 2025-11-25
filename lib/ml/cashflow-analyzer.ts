/**
 * Cashflow Analysis Engine
 * Implements intelligent cashflow prediction and safe-to-spend calculations
 * Based on FinPilot SOP: Cashflow Agent
 */

interface Transaction {
  date: Date;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

interface CashflowAnalysis {
  safeToSpendToday: number;
  dailyBurnRate: number;
  runoutDays: number;
  runoutDate: Date;
  trend: 'improving' | 'stable' | 'declining';
  microActions: MicroAction[];
  confidence: number;
}

interface MicroAction {
  type: 'critical' | 'optimization' | 'opportunity';
  title: string;
  description: string;
  impact: number; // Days of runway saved
  actions: string[];
}

export class CashflowAnalyzer {
  /**
   * Calculate daily burn rate from transaction history
   */
  static calculateBurnRate(transactions: Transaction[], days: number = 30): number {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const expenses = transactions.filter(
      t => t.type === 'expense' && t.date >= startDate && t.date <= now
    );

    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const dayCount = Math.max(1, Math.round((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    return totalExpenses / dayCount;
  }

  /**
   * Calculate safe-to-spend amount considering upcoming obligations
   */
  static calculateSafeToSpend(
    currentBalance: number,
    dailyBurnRate: number,
    upcomingObligations: { amount: number; daysUntilDue: number }[],
    safetyBufferDays: number = 7
  ): number {
    // Reserve for upcoming obligations
    let obligationReserve = 0;
    upcomingObligations.forEach(obligation => {
      if (obligation.daysUntilDue <= 30) {
        obligationReserve += obligation.amount;
      }
    });

    // Reserve for safety buffer
    const bufferReserve = dailyBurnRate * safetyBufferDays;

    // Safe to spend = balance - obligations - buffer
    return Math.max(0, currentBalance - obligationReserve - bufferReserve);
  }

  /**
   * Predict runout date
   */
  static predictRunout(
    currentBalance: number,
    dailyBurnRate: number
  ): { days: number; date: Date } {
    if (dailyBurnRate <= 0) {
      return { days: 999, date: new Date(new Date().setFullYear(new Date().getFullYear() + 10)) };
    }

    const days = Math.floor(currentBalance / dailyBurnRate);
    const date = new Date();
    date.setDate(date.getDate() + days);

    return { days, date };
  }

  /**
   * Analyze cashflow trend
   */
  static analyzeTrend(
    recentBurnRate: number,
    historicalBurnRate: number,
    threshold: number = 0.15
  ): 'improving' | 'stable' | 'declining' {
    const change = (recentBurnRate - historicalBurnRate) / historicalBurnRate;

    if (change > threshold) return 'declining';
    if (change < -threshold) return 'improving';
    return 'stable';
  }

  /**
   * Generate micro-actions for cashflow improvement
   */
  static generateMicroActions(
    currentBalance: number,
    dailyBurnRate: number,
    runoutDays: number,
    transactions: Transaction[],
    spendingByCategory: Map<string, number>
  ): MicroAction[] {
    const actions: MicroAction[] = [];

    // Critical action: Low runway
    if (runoutDays < 14) {
      const daysNeeded = 14 - runoutDays;
      const amountNeeded = dailyBurnRate * daysNeeded;

      actions.push({
        type: 'critical',
        title: 'Cash Runout Risk',
        description: `Running out in ${runoutDays} days. Need ₹${Math.round(amountNeeded)} more.`,
        impact: daysNeeded,
        actions: [
          'Pause non-essential subscriptions',
          'Delay discretionary purchases',
          'Accelerate income collection',
        ],
      });
    }

    // Optimization: Top spending categories
    const sortedCategories = Array.from(spendingByCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (sortedCategories.length > 0) {
      const potentialSavings = sortedCategories.reduce((sum, [_, amount]) => sum + amount * 0.1, 0);
      const savingsDays = potentialSavings / dailyBurnRate;

      actions.push({
        type: 'optimization',
        title: 'Spending Reduction',
        description: `Cut 10% from top categories to save ₹${Math.round(potentialSavings)}/month.`,
        impact: savingsDays,
        actions: sortedCategories.map(([cat, _]) => `Reduce ${cat} spending by 10%`),
      });
    }

    // Opportunity: Subscription audit
    const subscriptions = transactions.filter(
      t => t.type === 'expense' && t.category === 'subscriptions'
    );

    if (subscriptions.length > 0) {
      const monthlySubscriptions = subscriptions.reduce((sum, t) => sum + t.amount, 0);
      const subscriptionDays = monthlySubscriptions / dailyBurnRate;

      actions.push({
        type: 'opportunity',
        title: 'Subscription Audit',
        description: `Review ${subscriptions.length} subscriptions costing ₹${Math.round(monthlySubscriptions)}/month.`,
        impact: subscriptionDays,
        actions: [
          'Cancel unused subscriptions',
          'Downgrade premium plans',
          'Share family plans',
        ],
      });
    }

    return actions;
  }

  /**
   * Comprehensive cashflow analysis
   */
  static analyze(
    currentBalance: number,
    transactions: Transaction[],
    upcomingObligations: { amount: number; daysUntilDue: number }[] = [],
    safetyBufferDays: number = 7
  ): CashflowAnalysis {
    // Calculate burn rates
    const recentBurnRate = this.calculateBurnRate(transactions, 30);
    const historicalBurnRate = this.calculateBurnRate(transactions, 90);

    // Calculate safe to spend
    const safeToSpend = this.calculateSafeToSpend(
      currentBalance,
      recentBurnRate,
      upcomingObligations,
      safetyBufferDays
    );

    // Predict runout
    const runout = this.predictRunout(currentBalance, recentBurnRate);

    // Analyze trend
    const trend = this.analyzeTrend(recentBurnRate, historicalBurnRate);

    // Build spending by category
    const spendingByCategory = new Map<string, number>();
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        spendingByCategory.set(
          t.category,
          (spendingByCategory.get(t.category) || 0) + t.amount
        );
      });

    // Generate micro-actions
    const microActions = this.generateMicroActions(
      currentBalance,
      recentBurnRate,
      runout.days,
      transactions,
      spendingByCategory
    );

    // Calculate confidence (based on data recency and consistency)
    const confidence = Math.min(100, 50 + (transactions.length * 2));

    return {
      safeToSpendToday: Math.round(safeToSpend),
      dailyBurnRate: Math.round(recentBurnRate),
      runoutDays: runout.days,
      runoutDate: runout.date,
      trend,
      microActions,
      confidence: Math.round(confidence),
    };
  }
}
