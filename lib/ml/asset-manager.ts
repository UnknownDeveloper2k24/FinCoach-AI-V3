/**
 * Asset Management Engine
 * Portfolio tracking with real-time analysis
 * Based on FinPilot SOP: Asset Management Agent
 */

interface Asset {
  id: string;
  name: string;
  type: 'stock' | 'mutual_fund' | 'crypto' | 'gold' | 'real_estate' | 'cash' | 'other';
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: Date;
  value: number;
}

interface Portfolio {
  userId: string;
  assets: Asset[];
  totalValue: number;
  totalInvested: number;
  totalGain: number;
  gainPercentage: number;
  allocation: Map<string, number>;
}

interface AssetAnalysis {
  asset: Asset;
  gain: number;
  gainPercentage: number;
  performance: 'excellent' | 'good' | 'neutral' | 'poor';
  recommendation: 'buy' | 'hold' | 'sell';
  riskLevel: 'low' | 'medium' | 'high';
}

export class AssetManager {
  /**
   * Add asset to portfolio
   */
  static addAsset(
    name: string,
    type: Asset['type'],
    quantity: number,
    purchasePrice: number,
    currentPrice: number
  ): Asset {
    return {
      id: `asset_${Date.now()}`,
      name,
      type,
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate: new Date(),
      value: quantity * currentPrice,
    };
  }

  /**
   * Update asset price
   */
  static updateAssetPrice(asset: Asset, newPrice: number): Asset {
    return {
      ...asset,
      currentPrice: newPrice,
      value: asset.quantity * newPrice,
    };
  }

  /**
   * Calculate asset gain
   */
  static calculateGain(asset: Asset): { gain: number; gainPercentage: number } {
    const totalInvested = asset.quantity * asset.purchasePrice;
    const currentValue = asset.value;
    const gain = currentValue - totalInvested;
    const gainPercentage = (gain / totalInvested) * 100;

    return {
      gain: Math.round(gain),
      gainPercentage: Math.round(gainPercentage * 100) / 100,
    };
  }

  /**
   * Analyze individual asset
   */
  static analyzeAsset(asset: Asset): AssetAnalysis {
    const { gain, gainPercentage } = this.calculateGain(asset);

    let performance: 'excellent' | 'good' | 'neutral' | 'poor';
    if (gainPercentage >= 20) performance = 'excellent';
    else if (gainPercentage >= 5) performance = 'good';
    else if (gainPercentage >= -5) performance = 'neutral';
    else performance = 'poor';

    let recommendation: 'buy' | 'hold' | 'sell' = 'hold';
    if (performance === 'excellent') recommendation = 'buy';
    else if (performance === 'poor') recommendation = 'sell';

    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (asset.type === 'cash' || asset.type === 'gold') riskLevel = 'low';
    else if (asset.type === 'crypto') riskLevel = 'high';
    else if (asset.type === 'stock') riskLevel = 'high';
    else if (asset.type === 'mutual_fund') riskLevel = 'medium';

    return {
      asset,
      gain,
      gainPercentage,
      performance,
      recommendation,
      riskLevel,
    };
  }

  /**
   * Build portfolio
   */
  static buildPortfolio(userId: string, assets: Asset[]): Portfolio {
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    const totalInvested = assets.reduce((sum, a) => sum + a.quantity * a.purchasePrice, 0);
    const totalGain = totalValue - totalInvested;
    const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    // Calculate allocation
    const allocation = new Map<string, number>();
    assets.forEach(asset => {
      const percentage = totalValue > 0 ? (asset.value / totalValue) * 100 : 0;
      allocation.set(asset.type, (allocation.get(asset.type) || 0) + percentage);
    });

    return {
      userId,
      assets,
      totalValue: Math.round(totalValue),
      totalInvested: Math.round(totalInvested),
      totalGain: Math.round(totalGain),
      gainPercentage: Math.round(gainPercentage * 100) / 100,
      allocation,
    };
  }

  /**
   * Rebalance portfolio
   */
  static rebalancePortfolio(
    portfolio: Portfolio,
    targetAllocation: Map<string, number>
  ): { asset: Asset; action: 'buy' | 'sell'; amount: number }[] {
    const actions: { asset: Asset; action: 'buy' | 'sell'; amount: number }[] = [];

    portfolio.assets.forEach(asset => {
      const currentAllocation = (asset.value / portfolio.totalValue) * 100;
      const targetAllocationPercentage = targetAllocation.get(asset.type) || 0;
      const difference = targetAllocationPercentage - currentAllocation;

      if (Math.abs(difference) > 5) {
        // Rebalance if difference is more than 5%
        const amount = (portfolio.totalValue * difference) / 100;

        if (amount > 0) {
          actions.push({ asset, action: 'buy', amount: Math.round(amount) });
        } else {
          actions.push({ asset, action: 'sell', amount: Math.round(Math.abs(amount)) });
        }
      }
    });

    return actions;
  }

  /**
   * Get portfolio insights
   */
  static getInsights(portfolio: Portfolio): string[] {
    const insights: string[] = [];

    // Overall performance
    if (portfolio.gainPercentage > 20) {
      insights.push(`🚀 Excellent portfolio performance: +${portfolio.gainPercentage}%`);
    } else if (portfolio.gainPercentage > 5) {
      insights.push(`📈 Good portfolio performance: +${portfolio.gainPercentage}%`);
    } else if (portfolio.gainPercentage < -10) {
      insights.push(`📉 Portfolio is down ${Math.abs(portfolio.gainPercentage)}%. Consider rebalancing.`);
    }

    // Diversification
    if (portfolio.allocation.size < 3) {
      insights.push('⚠️ Low diversification. Consider adding more asset types.');
    } else if (portfolio.allocation.size >= 5) {
      insights.push('✅ Good diversification across asset types.');
    }

    // Top performer
    const topAsset = portfolio.assets.reduce((best, current) => {
      const bestGain = this.calculateGain(best).gainPercentage;
      const currentGain = this.calculateGain(current).gainPercentage;
      return currentGain > bestGain ? current : best;
    });

    if (topAsset) {
      const topGain = this.calculateGain(topAsset).gainPercentage;
      insights.push(`⭐ Top performer: ${topAsset.name} (+${topGain}%)`);
    }

    // Allocation insights
    portfolio.allocation.forEach((percentage, type) => {
      if (percentage > 50) {
        insights.push(`⚠️ ${type} is ${Math.round(percentage)}% of portfolio. Consider diversifying.`);
      }
    });

    return insights;
  }

  /**
   * Calculate portfolio risk
   */
  static calculateRisk(portfolio: Portfolio): {
    overallRisk: 'low' | 'medium' | 'high';
    riskScore: number;
  } {
    let riskScore = 0;
    let assetCount = 0;

    portfolio.assets.forEach(asset => {
      const analysis = this.analyzeAsset(asset);
      const riskValue = analysis.riskLevel === 'low' ? 1 : analysis.riskLevel === 'medium' ? 2 : 3;
      const weight = asset.value / portfolio.totalValue;
      riskScore += riskValue * weight;
      assetCount++;
    });

    let overallRisk: 'low' | 'medium' | 'high' = 'medium';
    if (riskScore < 1.5) overallRisk = 'low';
    else if (riskScore > 2.5) overallRisk = 'high';

    return {
      overallRisk,
      riskScore: Math.round(riskScore * 100) / 100,
    };
  }

  /**
   * Get rebalancing recommendations
   */
  static getRebalancingRecommendations(portfolio: Portfolio): string[] {
    const recommendations: string[] = [];

    // Check for concentration risk
    portfolio.allocation.forEach((percentage, type) => {
      if (percentage > 60) {
        recommendations.push(`Reduce ${type} allocation from ${Math.round(percentage)}% to 40-50%`);
      }
    });

    // Check for underweighted assets
    portfolio.allocation.forEach((percentage, type) => {
      if (percentage < 10 && portfolio.allocation.size > 3) {
        recommendations.push(`Consider increasing ${type} allocation`);
      }
    });

    // Check for poor performers
    portfolio.assets.forEach(asset => {
      const { gainPercentage } = this.calculateGain(asset);
      if (gainPercentage < -20) {
        recommendations.push(`Review ${asset.name} - down ${Math.abs(gainPercentage)}%`);
      }
    });

    return recommendations;
  }
}
