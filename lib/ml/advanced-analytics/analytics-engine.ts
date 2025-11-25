/**
 * Advanced Analytics Engine
 * Provides deep financial insights and trend analysis
 */

export interface AnalyticsMetrics {
  spendingTrend: number; // percentage change
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  investmentReturn: number;
  portfolioVolatility: number;
  riskScore: number; // 0-100
  opportunityScore: number; // 0-100
}

export interface TrendAnalysis {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  forecast: number;
}

export class AdvancedAnalyticsEngine {
  analyzeSpendingTrends(transactions: any[]): TrendAnalysis[] {
    const trends: TrendAnalysis[] = [];
    
    // Group transactions by category
    const byCategory = this.groupByCategory(transactions);
    
    for (const [category, items] of Object.entries(byCategory)) {
      const current = items.reduce((sum, t) => sum + t.amount, 0);
      const previous = current * 0.9; // Mock previous value
      const change = current - previous;
      const changePercent = (change / previous) * 100;
      
      trends.push({
        metric: category,
        current,
        previous,
        change,
        changePercent,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        forecast: this.forecastValue(items),
      });
    }
    
    return trends;
  }

  calculateMetrics(
    income: number,
    expenses: number,
    savings: number,
    debt: number,
    assets: number,
    investments: number
  ): AnalyticsMetrics {
    const spendingTrend = ((expenses - expenses * 0.95) / (expenses * 0.95)) * 100;
    const savingsRate = (savings / income) * 100;
    const debtToIncomeRatio = debt / income;
    const emergencyFundMonths = savings / (expenses / 12);
    const investmentReturn = ((assets - investments) / investments) * 100;
    const portfolioVolatility = this.calculateVolatility(assets);
    const riskScore = this.calculateRiskScore(debtToIncomeRatio, portfolioVolatility);
    const opportunityScore = this.calculateOpportunityScore(savingsRate, investmentReturn);

    return {
      spendingTrend,
      savingsRate,
      debtToIncomeRatio,
      emergencyFundMonths,
      investmentReturn,
      portfolioVolatility,
      riskScore,
      opportunityScore,
    };
  }

  private groupByCategory(transactions: any[]): Record<string, any[]> {
    return transactions.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = [];
      acc[t.category].push(t);
      return acc;
    }, {});
  }

  private forecastValue(items: any[]): number {
    if (items.length === 0) return 0;
    const avg = items.reduce((sum, t) => sum + t.amount, 0) / items.length;
    return avg * 1.05; // 5% growth forecast
  }

  private calculateVolatility(assets: number): number {
    // Mock volatility calculation
    return Math.random() * 20; // 0-20% volatility
  }

  private calculateRiskScore(debtRatio: number, volatility: number): number {
    const debtScore = Math.min(debtRatio * 50, 50);
    const volatilityScore = volatility;
    return Math.min(debtScore + volatilityScore, 100);
  }

  private calculateOpportunityScore(savingsRate: number, investmentReturn: number): number {
    const savingsScore = Math.min(savingsRate * 2, 50);
    const investmentScore = Math.min(Math.max(investmentReturn, 0) / 2, 50);
    return savingsScore + investmentScore;
  }

  generateInsights(metrics: AnalyticsMetrics): string[] {
    const insights: string[] = [];

    if (metrics.savingsRate < 10) {
      insights.push('Your savings rate is below 10%. Consider increasing your savings.');
    }

    if (metrics.debtToIncomeRatio > 0.5) {
      insights.push('Your debt-to-income ratio is high. Focus on debt reduction.');
    }

    if (metrics.emergencyFundMonths < 3) {
      insights.push('Build your emergency fund to cover at least 3-6 months of expenses.');
    }

    if (metrics.riskScore > 70) {
      insights.push('Your financial risk score is high. Consider diversifying your portfolio.');
    }

    if (metrics.opportunityScore > 70) {
      insights.push('You have good opportunities for investment and wealth building.');
    }

    return insights;
  }
}

export const advancedAnalyticsEngine = new AdvancedAnalyticsEngine();
