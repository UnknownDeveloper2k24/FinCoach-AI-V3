/**
 * Budget Optimization Engine
 * Implements 50/30/20 rule and category optimization
 * Based on FinPilot SOP: Budget Optimization Agent
 */

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

interface BudgetOptimization {
  currentAllocation: {
    needs: number;
    wants: number;
    savings: number;
  };
  recommendedAllocation: {
    needs: number;
    wants: number;
    savings: number;
  };
  categoryRecommendations: {
    category: string;
    current: number;
    recommended: number;
    savings: number;
    priority: 'high' | 'medium' | 'low';
  }[];
  totalPotentialSavings: number;
  confidence: number;
}

export class BudgetOptimizer {
  /**
   * Categorize spending into needs, wants, savings
   */
  static categorizeSpending(categorySpending: Map<string, number>): {
    needs: number;
    wants: number;
    savings: number;
  } {
    const needsCategories = ['rent', 'utilities', 'food', 'transport', 'health', 'insurance'];
    const savingsCategories = ['investment', 'savings', 'emergency'];

    let needs = 0;
    let wants = 0;
    let savings = 0;

    categorySpending.forEach((amount, category) => {
      const lowerCategory = category.toLowerCase();

      if (needsCategories.some(n => lowerCategory.includes(n))) {
        needs += amount;
      } else if (savingsCategories.some(s => lowerCategory.includes(s))) {
        savings += amount;
      } else {
        wants += amount;
      }
    });

    return { needs, wants, savings };
  }

  /**
   * Apply 50/30/20 rule
   */
  static apply50_30_20Rule(totalIncome: number): {
    needs: number;
    wants: number;
    savings: number;
  } {
    return {
      needs: totalIncome * 0.5,
      wants: totalIncome * 0.3,
      savings: totalIncome * 0.2,
    };
  }

  /**
   * Identify optimization opportunities
   */
  static identifyOptimizations(
    categorySpending: Map<string, number>,
    totalIncome: number
  ): {
    category: string;
    current: number;
    recommended: number;
    savings: number;
    priority: 'high' | 'medium' | 'low';
  }[] {
    const recommendations: {
      category: string;
      current: number;
      recommended: number;
      savings: number;
      priority: 'high' | 'medium' | 'low';
    }[] = [];

    const { needs, wants, savings } = this.categorizeSpending(categorySpending);
    const total = needs + wants + savings;

    // Check if needs are too high
    if (needs > totalIncome * 0.55) {
      const needsCategories = ['rent', 'utilities', 'food', 'transport', 'health'];
      categorySpending.forEach((amount, category) => {
        if (needsCategories.some(n => category.toLowerCase().includes(n))) {
          const recommended = amount * 0.9; // Suggest 10% reduction
          const savings = amount - recommended;

          if (savings > 0) {
            recommendations.push({
              category,
              current: Math.round(amount),
              recommended: Math.round(recommended),
              savings: Math.round(savings),
              priority: 'high',
            });
          }
        }
      });
    }

    // Check if wants are too high
    if (wants > totalIncome * 0.35) {
      const wantsCategories = ['entertainment', 'shopping', 'dining', 'subscriptions'];
      categorySpending.forEach((amount, category) => {
        if (wantsCategories.some(w => category.toLowerCase().includes(w))) {
          const recommended = amount * 0.8; // Suggest 20% reduction
          const savings = amount - recommended;

          if (savings > 0) {
            recommendations.push({
              category,
              current: Math.round(amount),
              recommended: Math.round(recommended),
              savings: Math.round(savings),
              priority: 'medium',
            });
          }
        }
      });
    }

    // Check if savings are too low
    if (savings < totalIncome * 0.15) {
      recommendations.push({
        category: 'savings',
        current: Math.round(savings),
        recommended: Math.round(totalIncome * 0.2),
        savings: Math.round(totalIncome * 0.2 - savings),
        priority: 'high',
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Calculate daily spending limit
   */
  static calculateDailyLimit(
    monthlyIncome: number,
    safeToSpendPercentage: number = 0.8
  ): number {
    const monthlyBudget = monthlyIncome * safeToSpendPercentage;
    return Math.round(monthlyBudget / 30);
  }

  /**
   * Generate budget optimization report
   */
  static optimize(
    categorySpending: Map<string, number>,
    totalIncome: number
  ): BudgetOptimization {
    const current = this.categorizeSpending(categorySpending);
    const recommended = this.apply50_30_20Rule(totalIncome);
    const categoryRecommendations = this.identifyOptimizations(categorySpending, totalIncome);

    const totalPotentialSavings = categoryRecommendations.reduce((sum, r) => sum + r.savings, 0);

    return {
      currentAllocation: {
        needs: Math.round(current.needs),
        wants: Math.round(current.wants),
        savings: Math.round(current.savings),
      },
      recommendedAllocation: {
        needs: Math.round(recommended.needs),
        wants: Math.round(recommended.wants),
        savings: Math.round(recommended.savings),
      },
      categoryRecommendations,
      totalPotentialSavings: Math.round(totalPotentialSavings),
      confidence: 85,
    };
  }

  /**
   * Get budget insights
   */
  static getInsights(optimization: BudgetOptimization): string[] {
    const insights: string[] = [];

    const current = optimization.currentAllocation;
    const recommended = optimization.recommendedAllocation;

    // Needs analysis
    if (current.needs > recommended.needs * 1.1) {
      insights.push(`⚠️ Needs spending is ${Math.round((current.needs / recommended.needs - 1) * 100)}% above recommended`);
    }

    // Wants analysis
    if (current.wants > recommended.wants * 1.1) {
      insights.push(`💡 Wants spending is ${Math.round((current.wants / recommended.wants - 1) * 100)}% above recommended`);
    }

    // Savings analysis
    if (current.savings < recommended.savings * 0.9) {
      insights.push(`📊 Savings is ${Math.round((1 - current.savings / recommended.savings) * 100)}% below recommended`);
    }

    // Potential savings
    if (optimization.totalPotentialSavings > 0) {
      insights.push(`💰 Potential monthly savings: ₹${optimization.totalPotentialSavings}`);
    }

    return insights;
  }
}
