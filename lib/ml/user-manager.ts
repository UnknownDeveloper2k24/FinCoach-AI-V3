/**
 * User Management Agent
 * Profile management and preference handling
 * Based on FinPilot SOP: User Management Agent
 */

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserPreferences {
  userId: string;
  currency: string;
  language: string;
  timezone: string;
  notificationFrequency: 'realtime' | 'daily' | 'weekly' | 'never';
  alertThresholds: {
    lowBalance: number;
    highSpending: number;
    rentDue: number;
  };
  budgetPreferences: {
    needs: number; // percentage
    wants: number;
    savings: number;
  };
  theme: 'light' | 'dark' | 'auto';
  privacyLevel: 'public' | 'private' | 'friends';
}

interface UserFinancialProfile {
  userId: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  debtAmount: number;
  emergencyFundTarget: number;
}

export class UserManager {
  /**
   * Create user profile
   */
  static createProfile(
    email: string,
    name: string,
    phone?: string
  ): UserProfile {
    return {
      id: `user_${Date.now()}`,
      email,
      name,
      phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Get default preferences
   */
  static getDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      currency: 'INR',
      language: 'en',
      timezone: 'Asia/Kolkata',
      notificationFrequency: 'daily',
      alertThresholds: {
        lowBalance: 5000,
        highSpending: 10000,
        rentDue: 7, // days
      },
      budgetPreferences: {
        needs: 50,
        wants: 30,
        savings: 20,
      },
      theme: 'auto',
      privacyLevel: 'private',
    };
  }

  /**
   * Update user preferences
   */
  static updatePreferences(
    preferences: UserPreferences,
    updates: Partial<UserPreferences>
  ): UserPreferences {
    return { ...preferences, ...updates };
  }

  /**
   * Validate alert thresholds
   */
  static validateThresholds(thresholds: {
    lowBalance: number;
    highSpending: number;
    rentDue: number;
  }): boolean {
    if (thresholds.lowBalance < 0) return false;
    if (thresholds.highSpending < 0) return false;
    if (thresholds.rentDue < 1 || thresholds.rentDue > 30) return false;
    return true;
  }

  /**
   * Create financial profile
   */
  static createFinancialProfile(
    userId: string,
    monthlyIncome: number,
    monthlyExpenses: number,
    riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
  ): UserFinancialProfile {
    return {
      userId,
      monthlyIncome,
      monthlyExpenses,
      riskTolerance,
      investmentGoals: [],
      debtAmount: 0,
      emergencyFundTarget: monthlyExpenses * 6,
    };
  }

  /**
   * Update financial profile
   */
  static updateFinancialProfile(
    profile: UserFinancialProfile,
    updates: Partial<UserFinancialProfile>
  ): UserFinancialProfile {
    return { ...profile, ...updates };
  }

  /**
   * Calculate financial health score
   */
  static calculateHealthScore(profile: UserFinancialProfile): number {
    let score = 50;

    // Income vs expenses
    const savingsRate = (profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome;
    if (savingsRate >= 0.2) score += 20;
    else if (savingsRate >= 0.1) score += 10;
    else if (savingsRate < 0) score -= 20;

    // Debt level
    const debtToIncome = profile.debtAmount / (profile.monthlyIncome * 12);
    if (debtToIncome === 0) score += 15;
    else if (debtToIncome < 0.2) score += 10;
    else if (debtToIncome > 1) score -= 15;

    // Emergency fund
    const emergencyFundProgress = profile.emergencyFundTarget > 0 ? 1 : 0;
    if (emergencyFundProgress > 0) score += 15;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get personalized recommendations
   */
  static getRecommendations(profile: UserFinancialProfile): string[] {
    const recommendations: string[] = [];

    const savingsRate = (profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome;

    // Income recommendations
    if (savingsRate < 0) {
      recommendations.push('Your expenses exceed income. Reduce spending immediately.');
    } else if (savingsRate < 0.1) {
      recommendations.push('Increase your savings rate to at least 10% of income.');
    } else if (savingsRate >= 0.2) {
      recommendations.push('Excellent savings rate! Consider investing for long-term growth.');
    }

    // Debt recommendations
    if (profile.debtAmount > 0) {
      const debtToIncome = profile.debtAmount / (profile.monthlyIncome * 12);
      if (debtToIncome > 0.5) {
        recommendations.push('Your debt is high. Prioritize debt repayment.');
      } else {
        recommendations.push('Create a debt payoff plan to become debt-free.');
      }
    }

    // Emergency fund recommendations
    if (profile.emergencyFundTarget === 0) {
      recommendations.push('Build an emergency fund of 6 months expenses.');
    }

    // Investment recommendations
    if (profile.investmentGoals.length === 0 && savingsRate > 0.1) {
      recommendations.push('Set investment goals to grow your wealth.');
    }

    return recommendations;
  }

  /**
   * Validate user data
   */
  static validateProfile(profile: UserProfile): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!profile.email || !profile.email.includes('@')) {
      errors.push('Invalid email address');
    }

    if (!profile.name || profile.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (profile.phone && profile.phone.length < 10) {
      errors.push('Invalid phone number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get user summary
   */
  static getUserSummary(
    profile: UserProfile,
    financialProfile: UserFinancialProfile,
    preferences: UserPreferences
  ): {
    name: string;
    email: string;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    healthScore: number;
    currency: string;
  } {
    const savingsRate = (financialProfile.monthlyIncome - financialProfile.monthlyExpenses) / financialProfile.monthlyIncome;
    const healthScore = this.calculateHealthScore(financialProfile);

    return {
      name: profile.name,
      email: profile.email,
      monthlyIncome: financialProfile.monthlyIncome,
      monthlyExpenses: financialProfile.monthlyExpenses,
      savingsRate: Math.round(savingsRate * 100) / 100,
      healthScore,
      currency: preferences.currency,
    };
  }

  /**
   * Export user data
   */
  static exportUserData(
    profile: UserProfile,
    financialProfile: UserFinancialProfile,
    preferences: UserPreferences
  ): string {
    const data = {
      profile,
      financialProfile,
      preferences,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Delete user account (anonymize data)
   */
  static anonymizeAccount(profile: UserProfile): UserProfile {
    return {
      ...profile,
      email: 'deleted@finpilot.local',
      name: 'Deleted User',
      phone: undefined,
      updatedAt: new Date(),
    };
  }
}
