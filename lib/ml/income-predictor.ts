/**
 * Income Prediction Engine
 * Implements ML-based income forecasting with confidence scoring
 * Based on FinPilot SOP: Income Prediction Agent
 */

interface IncomeData {
  date: Date;
  amount: number;
  source: string;
  recurring: boolean;
}

interface IncomePattern {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual' | 'irregular';
  averageAmount: number;
  variance: number;
  lastOccurrence: Date;
  nextExpected: Date;
  confidence: number;
}

interface IncomeForecast {
  period: '7d' | '30d' | '90d';
  predictedAmount: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  patterns: IncomePattern[];
  anomalies: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

export class IncomePredictor {
  /**
   * Analyze income patterns from historical data
   */
  static analyzePatterns(incomeHistory: IncomeData[]): IncomePattern[] {
    if (incomeHistory.length === 0) return [];

    // Group by source
    const bySource = new Map<string, IncomeData[]>();
    incomeHistory.forEach(income => {
      if (!bySource.has(income.source)) {
        bySource.set(income.source, []);
      }
      bySource.get(income.source)!.push(income);
    });

    const patterns: IncomePattern[] = [];

    bySource.forEach((sourceData, source) => {
      // Sort by date
      sourceData.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate intervals between transactions
      const intervals: number[] = [];
      for (let i = 1; i < sourceData.length; i++) {
        const interval = (sourceData[i].date.getTime() - sourceData[i - 1].date.getTime()) / (1000 * 60 * 60 * 24);
        intervals.push(interval);
      }

      // Determine frequency
      const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b) / intervals.length : 0;
      let frequency: IncomePattern['frequency'] = 'irregular';

      if (avgInterval > 0 && avgInterval <= 1.5) frequency = 'daily';
      else if (avgInterval > 1.5 && avgInterval <= 8) frequency = 'weekly';
      else if (avgInterval > 8 && avgInterval <= 15) frequency = 'biweekly';
      else if (avgInterval > 15 && avgInterval <= 35) frequency = 'monthly';
      else if (avgInterval > 35 && avgInterval <= 120) frequency = 'quarterly';
      else if (avgInterval > 120) frequency = 'annual';

      // Calculate amount statistics
      const amounts = sourceData.map(d => d.amount);
      const avgAmount = amounts.reduce((a, b) => a + b) / amounts.length;
      const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);

      // Calculate confidence based on consistency
      const coefficientOfVariation = stdDev / avgAmount;
      const confidence = Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));

      // Get last occurrence
      const lastOccurrence = sourceData[sourceData.length - 1].date;

      // Calculate next expected
      const nextExpected = new Date(lastOccurrence);
      if (frequency === 'daily') nextExpected.setDate(nextExpected.getDate() + 1);
      else if (frequency === 'weekly') nextExpected.setDate(nextExpected.getDate() + 7);
      else if (frequency === 'biweekly') nextExpected.setDate(nextExpected.getDate() + 14);
      else if (frequency === 'monthly') nextExpected.setMonth(nextExpected.getMonth() + 1);
      else if (frequency === 'quarterly') nextExpected.setMonth(nextExpected.getMonth() + 3);
      else if (frequency === 'annual') nextExpected.setFullYear(nextExpected.getFullYear() + 1);

      patterns.push({
        frequency,
        averageAmount: avgAmount,
        variance: stdDev,
        lastOccurrence,
        nextExpected,
        confidence: Math.round(confidence),
      });
    });

    return patterns;
  }

  /**
   * Forecast income for a given period
   */
  static forecast(patterns: IncomePattern[], days: 7 | 30 | 90): IncomeForecast {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + days);

    let totalPredicted = 0;
    let totalVariance = 0;
    const anomalies: string[] = [];

    patterns.forEach(pattern => {
      // Calculate how many times this pattern will occur in the forecast period
      let occurrences = 0;
      let variance = 0;

      if (pattern.frequency === 'daily') {
        occurrences = days;
        variance = pattern.variance * days;
      } else if (pattern.frequency === 'weekly') {
        occurrences = Math.floor(days / 7);
        variance = pattern.variance * occurrences;
      } else if (pattern.frequency === 'biweekly') {
        occurrences = Math.floor(days / 14);
        variance = pattern.variance * occurrences;
      } else if (pattern.frequency === 'monthly') {
        occurrences = Math.floor(days / 30);
        variance = pattern.variance * occurrences;
      } else if (pattern.frequency === 'quarterly') {
        occurrences = Math.floor(days / 90);
        variance = pattern.variance * occurrences;
      } else if (pattern.frequency === 'annual') {
        occurrences = Math.floor(days / 365);
        variance = pattern.variance * occurrences;
      }

      totalPredicted += pattern.averageAmount * occurrences;
      totalVariance += variance;

      // Detect anomalies
      if (pattern.confidence < 50) {
        anomalies.push(`Low confidence income from ${pattern.frequency} source`);
      }
    });

    // Calculate confidence interval (95% confidence = 1.96 * std dev)
    const stdDev = Math.sqrt(totalVariance);
    const marginOfError = 1.96 * stdDev;

    // Determine trend
    const recentPatterns = patterns.slice(-3);
    const avgRecent = recentPatterns.reduce((sum, p) => sum + p.averageAmount, 0) / Math.max(1, recentPatterns.length);
    const avgAll = patterns.reduce((sum, p) => sum + p.averageAmount, 0) / Math.max(1, patterns.length);
    
    let trend: IncomeForecast['trend'] = 'stable';
    if (avgRecent > avgAll * 1.1) trend = 'increasing';
    else if (avgRecent < avgAll * 0.9) trend = 'decreasing';

    return {
      period: `${days}d` as const,
      predictedAmount: Math.round(totalPredicted),
      lowerBound: Math.round(Math.max(0, totalPredicted - marginOfError)),
      upperBound: Math.round(totalPredicted + marginOfError),
      confidence: Math.round(patterns.reduce((sum, p) => sum + p.confidence, 0) / Math.max(1, patterns.length)),
      patterns,
      anomalies,
      trend,
    };
  }

  /**
   * Detect income dips
   */
  static detectDips(patterns: IncomePattern[], threshold: number = 0.2): string[] {
    const dips: string[] = [];

    patterns.forEach(pattern => {
      if (pattern.confidence < 50) {
        dips.push(`Uncertain income from ${pattern.frequency} source - may dip`);
      }

      // Check if next expected income is far away
      const now = new Date();
      const daysUntilNext = (pattern.nextExpected.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilNext > 30) {
        dips.push(`No income expected for ${Math.round(daysUntilNext)} days`);
      }
    });

    return dips;
  }
}
