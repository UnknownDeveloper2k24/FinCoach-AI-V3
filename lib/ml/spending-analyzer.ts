/**
 * Spending Pattern Analysis Engine
 * Detects frequency, anomalies, and recurring subscriptions
 * Based on FinPilot SOP: Spending Pattern Agent
 */

interface Transaction {
  date: Date;
  amount: number;
  category: string;
  merchant: string;
}

interface SpendingPattern {
  category: string;
  merchant: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual' | 'irregular';
  averageAmount: number;
  totalAmount: number;
  transactionCount: number;
  lastTransaction: Date;
  nextExpected: Date;
  variance: number;
  isRecurring: boolean;
  isAnomaly: boolean;
  anomalyScore: number;
}

interface SpendingAnalysis {
  patterns: SpendingPattern[];
  anomalies: SpendingPattern[];
  subscriptions: SpendingPattern[];
  peakDays: { day: string; totalSpent: number }[];
  categoryBreakdown: Map<string, number>;
  totalSpent: number;
  averageDailySpend: number;
}

export class SpendingAnalyzer {
  /**
   * Detect frequency of transactions
   */
  private static detectFrequency(dates: Date[]): SpendingPattern['frequency'] {
    if (dates.length < 2) return 'irregular';

    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const intervals: number[] = [];

    for (let i = 1; i < sortedDates.length; i++) {
      const interval = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(interval);
    }

    const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / avgInterval;

    // If variation is high, it's irregular
    if (coefficientOfVariation > 0.5) return 'irregular';

    if (avgInterval <= 1.5) return 'daily';
    if (avgInterval <= 8) return 'weekly';
    if (avgInterval <= 15) return 'biweekly';
    if (avgInterval <= 35) return 'monthly';
    if (avgInterval <= 120) return 'quarterly';
    return 'annual';
  }

  /**
   * Detect anomalies using statistical methods
   */
  private static detectAnomalies(amounts: number[]): { isAnomaly: boolean; score: number } {
    if (amounts.length < 3) return { isAnomaly: false, score: 0 };

    const mean = amounts.reduce((a, b) => a + b) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    // Z-score for the latest transaction
    const latestAmount = amounts[amounts.length - 1];
    const zScore = Math.abs((latestAmount - mean) / stdDev);

    // Anomaly if z-score > 2 (95% confidence)
    const isAnomaly = zScore > 2;
    const score = Math.min(100, zScore * 50);

    return { isAnomaly, score: Math.round(score) };
  }

  /**
   * Analyze spending patterns by merchant
   */
  static analyzeByMerchant(transactions: Transaction[]): SpendingPattern[] {
    const byMerchant = new Map<string, Transaction[]>();

    transactions.forEach(tx => {
      const key = `${tx.merchant}|${tx.category}`;
      if (!byMerchant.has(key)) {
        byMerchant.set(key, []);
      }
      byMerchant.get(key)!.push(tx);
    });

    const patterns: SpendingPattern[] = [];

    byMerchant.forEach((txs, key) => {
      const [merchant, category] = key.split('|');
      const amounts = txs.map(t => t.amount);
      const dates = txs.map(t => t.date);

      const avgAmount = amounts.reduce((a, b) => a + b) / amounts.length;
      const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);

      const frequency = this.detectFrequency(dates);
      const { isAnomaly, score } = this.detectAnomalies(amounts);

      // Determine if recurring (same merchant, consistent frequency)
      const isRecurring = frequency !== 'irregular' && txs.length >= 3;

      const lastTransaction = new Date(Math.max(...dates.map(d => d.getTime())));
      const nextExpected = new Date(lastTransaction);

      if (frequency === 'daily') nextExpected.setDate(nextExpected.getDate() + 1);
      else if (frequency === 'weekly') nextExpected.setDate(nextExpected.getDate() + 7);
      else if (frequency === 'biweekly') nextExpected.setDate(nextExpected.getDate() + 14);
      else if (frequency === 'monthly') nextExpected.setMonth(nextExpected.getMonth() + 1);
      else if (frequency === 'quarterly') nextExpected.setMonth(nextExpected.getMonth() + 3);
      else if (frequency === 'annual') nextExpected.setFullYear(nextExpected.getFullYear() + 1);

      patterns.push({
        category,
        merchant,
        frequency,
        averageAmount: Math.round(avgAmount),
        totalAmount: Math.round(amounts.reduce((a, b) => a + b)),
        transactionCount: txs.length,
        lastTransaction,
        nextExpected,
        variance: Math.round(stdDev),
        isRecurring,
        isAnomaly,
        anomalyScore: score,
      });
    });

    return patterns;
  }

  /**
   * Analyze spending by category
   */
  static analyzeByCategory(transactions: Transaction[]): Map<string, number> {
    const byCategory = new Map<string, number>();

    transactions.forEach(tx => {
      byCategory.set(tx.category, (byCategory.get(tx.category) || 0) + tx.amount);
    });

    return byCategory;
  }

  /**
   * Detect peak spending days
   */
  static detectPeakDays(transactions: Transaction[]): { day: string; totalSpent: number }[] {
    const byDay = new Map<string, number>();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    transactions.forEach(tx => {
      const dayName = dayNames[tx.date.getDay()];
      byDay.set(dayName, (byDay.get(dayName) || 0) + tx.amount);
    });

    return Array.from(byDay.entries())
      .map(([day, total]) => ({ day, totalSpent: Math.round(total) }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }

  /**
   * Comprehensive spending analysis
   */
  static analyze(transactions: Transaction[], days: number = 30): SpendingAnalysis {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const recentTransactions = transactions.filter(t => t.date >= startDate && t.date <= now);

    // Analyze patterns
    const patterns = this.analyzeByMerchant(recentTransactions);

    // Filter anomalies
    const anomalies = patterns.filter(p => p.isAnomaly);

    // Filter subscriptions
    const subscriptions = patterns.filter(p => p.isRecurring && p.frequency !== 'irregular');

    // Analyze by category
    const categoryBreakdown = this.analyzeByCategory(recentTransactions);

    // Detect peak days
    const peakDays = this.detectPeakDays(recentTransactions);

    // Calculate totals
    const totalSpent = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const dayCount = Math.max(1, Math.round((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const averageDailySpend = totalSpent / dayCount;

    return {
      patterns,
      anomalies,
      subscriptions,
      peakDays,
      categoryBreakdown,
      totalSpent: Math.round(totalSpent),
      averageDailySpend: Math.round(averageDailySpend),
    };
  }

  /**
   * Get spending insights
   */
  static getInsights(analysis: SpendingAnalysis): string[] {
    const insights: string[] = [];

    // Top spending category
    if (analysis.categoryBreakdown.size > 0) {
      const topCategory = Array.from(analysis.categoryBreakdown.entries()).sort((a, b) => b[1] - a[1])[0];
      insights.push(`Top spending: ${topCategory[0]} (₹${Math.round(topCategory[1])})`);
    }

    // Peak spending day
    if (analysis.peakDays.length > 0) {
      insights.push(`Peak spending day: ${analysis.peakDays[0].day} (₹${analysis.peakDays[0].totalSpent})`);
    }

    // Recurring subscriptions
    if (analysis.subscriptions.length > 0) {
      const monthlySubscriptions = analysis.subscriptions.reduce((sum, s) => sum + s.averageAmount, 0);
      insights.push(`Monthly subscriptions: ₹${Math.round(monthlySubscriptions)}`);
    }

    // Anomalies detected
    if (analysis.anomalies.length > 0) {
      insights.push(`${analysis.anomalies.length} unusual transactions detected`);
    }

    return insights;
  }
}
