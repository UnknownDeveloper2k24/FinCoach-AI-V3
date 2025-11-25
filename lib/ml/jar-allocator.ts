/**
 * Jar System Allocation Engine
 * Intelligent money allocation across priority-based jars
 * Based on FinPilot SOP: Jar System Agent
 */

interface Jar {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  priority: number; // 1 = highest, 10 = lowest
  dueDate?: Date;
  isEssential: boolean;
  category: string;
}

interface AllocationResult {
  allocations: { jarId: string; amount: number }[];
  totalAllocated: number;
  shortfalls: { jarId: string; shortfall: number; daysUntilDue: number }[];
  dailySavingsSuggestion: number;
  confidence: number;
}

export class JarAllocator {
  /**
   * Calculate jar shortfalls
   */
  static calculateShortfalls(jars: Jar[]): { jarId: string; shortfall: number; daysUntilDue: number }[] {
    const now = new Date();
    const shortfalls: { jarId: string; shortfall: number; daysUntilDue: number }[] = [];

    jars.forEach(jar => {
      const shortfall = jar.targetAmount - jar.currentAmount;
      if (shortfall > 0) {
        const daysUntilDue = jar.dueDate
          ? Math.round((jar.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        shortfalls.push({
          jarId: jar.id,
          shortfall: Math.max(0, shortfall),
          daysUntilDue,
        });
      }
    });

    return shortfalls.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }

  /**
   * Auto-allocate available funds to jars
   */
  static autoAllocate(availableFunds: number, jars: Jar[]): AllocationResult {
    const allocations: { jarId: string; amount: number }[] = [];
    const shortfalls = this.calculateShortfalls(jars);
    let remainingFunds = availableFunds;

    // Phase 1: Allocate to critical shortfalls (due within 7 days)
    shortfalls.forEach(shortfall => {
      if (remainingFunds <= 0) return;

      const jar = jars.find(j => j.id === shortfall.jarId);
      if (!jar) return;

      if (shortfall.daysUntilDue <= 7 && jar.isEssential) {
        const allocation = Math.min(remainingFunds, shortfall.shortfall);
        allocations.push({ jarId: jar.id, amount: allocation });
        remainingFunds -= allocation;
      }
    });

    // Phase 2: Allocate to high-priority jars
    const sortedJars = [...jars].sort((a, b) => a.priority - b.priority);

    sortedJars.forEach(jar => {
      if (remainingFunds <= 0) return;

      const shortfall = jar.targetAmount - jar.currentAmount;
      if (shortfall > 0) {
        const allocation = Math.min(remainingFunds, shortfall);
        const existing = allocations.find(a => a.jarId === jar.id);

        if (existing) {
          existing.amount += allocation;
        } else {
          allocations.push({ jarId: jar.id, amount: allocation });
        }

        remainingFunds -= allocation;
      }
    });

    // Phase 3: Distribute remaining funds proportionally
    if (remainingFunds > 0) {
      const totalTarget = jars.reduce((sum, j) => sum + j.targetAmount, 0);
      jars.forEach(jar => {
        if (remainingFunds <= 0) return;

        const proportion = jar.targetAmount / totalTarget;
        const allocation = Math.min(remainingFunds, availableFunds * proportion * 0.1); // 10% of proportional share

        const existing = allocations.find(a => a.jarId === jar.id);
        if (existing) {
          existing.amount += allocation;
        } else {
          allocations.push({ jarId: jar.id, amount: allocation });
        }

        remainingFunds -= allocation;
      });
    }

    const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);

    // Calculate daily savings suggestion
    const criticalShortfalls = shortfalls.filter(s => s.daysUntilDue <= 30);
    const totalCriticalShortfall = criticalShortfalls.reduce((sum, s) => sum + s.shortfall, 0);
    const dailySavingsSuggestion = Math.ceil(totalCriticalShortfall / 30);

    return {
      allocations,
      totalAllocated: Math.round(totalAllocated),
      shortfalls,
      dailySavingsSuggestion,
      confidence: Math.min(100, 50 + (jars.length * 5)),
    };
  }

  /**
   * Detect jar shortfalls and generate alerts
   */
  static detectShortfalls(jars: Jar[]): { jar: Jar; shortfall: number; urgency: 'critical' | 'high' | 'medium' | 'low' }[] {
    const now = new Date();
    const alerts: { jar: Jar; shortfall: number; urgency: 'critical' | 'high' | 'medium' | 'low' }[] = [];

    jars.forEach(jar => {
      const shortfall = jar.targetAmount - jar.currentAmount;
      if (shortfall <= 0) return;

      let urgency: 'critical' | 'high' | 'medium' | 'low' = 'low';

      if (jar.dueDate) {
        const daysUntilDue = Math.round((jar.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue <= 3) urgency = 'critical';
        else if (daysUntilDue <= 7) urgency = 'high';
        else if (daysUntilDue <= 14) urgency = 'medium';
      }

      if (jar.isEssential && urgency === 'low') urgency = 'medium';

      alerts.push({ jar, shortfall, urgency });
    });

    return alerts.sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }

  /**
   * Calculate daily savings needed to meet jar targets
   */
  static calculateDailySavingsNeeded(jars: Jar[], days: number = 30): number {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + days);

    let totalNeeded = 0;

    jars.forEach(jar => {
      const shortfall = jar.targetAmount - jar.currentAmount;
      if (shortfall > 0) {
        if (!jar.dueDate || jar.dueDate > endDate) {
          // Spread over the period
          totalNeeded += shortfall / days;
        } else {
          // Spread until due date
          const daysUntilDue = Math.max(1, Math.round((jar.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          totalNeeded += shortfall / daysUntilDue;
        }
      }
    });

    return Math.ceil(totalNeeded);
  }

  /**
   * Get jar allocation recommendations
   */
  static getRecommendations(jars: Jar[], availableFunds: number): string[] {
    const recommendations: string[] = [];
    const shortfalls = this.calculateShortfalls(jars);
    const criticalShortfalls = shortfalls.filter(s => s.daysUntilDue <= 7);

    if (criticalShortfalls.length > 0) {
      const totalCritical = criticalShortfalls.reduce((sum, s) => sum + s.shortfall, 0);
      if (availableFunds < totalCritical) {
        recommendations.push(`⚠️ Critical: Need ₹${Math.round(totalCritical - availableFunds)} more for upcoming obligations`);
      }
    }

    // Check for over-allocation
    const totalTarget = jars.reduce((sum, j) => sum + j.targetAmount, 0);
    const totalCurrent = jars.reduce((sum, j) => sum + j.currentAmount, 0);

    if (totalCurrent > totalTarget * 1.2) {
      recommendations.push('💡 Consider reducing some jar targets or reallocating excess funds');
    }

    // Check for idle jars
    const idleJars = jars.filter(j => j.currentAmount === 0 && j.targetAmount > 0);
    if (idleJars.length > 0) {
      recommendations.push(`📌 ${idleJars.length} jar(s) need initial funding`);
    }

    return recommendations;
  }
}
