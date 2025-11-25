/**
 * Market Forecasting Engine
 * Price predictions with confidence bands
 * Based on FinPilot SOP: Market Forecasting Agent
 */

interface PriceData {
  date: Date;
  price: number;
  volume?: number;
}

interface PriceForecast {
  asset: string;
  period: '1d' | '7d' | '30d';
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  volatility: number;
  recommendation: 'buy' | 'hold' | 'sell';
}

export class MarketForecaster {
  /**
   * Calculate simple moving average
   */
  private static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    const sum = prices.slice(-period).reduce((a, b) => a + b);
    return sum / period;
  }

  /**
   * Calculate exponential moving average
   */
  private static calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];

    const k = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }

    return ema;
  }

  /**
   * Calculate volatility (standard deviation)
   */
  private static calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    const mean = prices.reduce((a, b) => a + b) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    return (stdDev / mean) * 100; // Percentage volatility
  }

  /**
   * Detect trend
   */
  private static detectTrend(prices: number[]): 'bullish' | 'bearish' | 'neutral' {
    if (prices.length < 2) return 'neutral';

    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    const currentPrice = prices[prices.length - 1];

    if (currentPrice > sma20 && sma20 > sma50) return 'bullish';
    if (currentPrice < sma20 && sma20 < sma50) return 'bearish';
    return 'neutral';
  }

  /**
   * Forecast price for a given period
   */
  static forecastPrice(
    priceHistory: PriceData[],
    period: '1d' | '7d' | '30d'
  ): PriceForecast | null {
    if (priceHistory.length < 10) return null;

    const prices = priceHistory.map(p => p.price);
    const asset = 'Asset';

    // Calculate trend indicators
    const currentPrice = prices[prices.length - 1];
    const sma20 = this.calculateSMA(prices, 20);
    const ema12 = this.calculateEMA(prices, 12);
    const volatility = this.calculateVolatility(prices);
    const trend = this.detectTrend(prices);

    // Calculate price change
    const priceChange = ((currentPrice - prices[0]) / prices[0]) * 100;

    // Forecast based on trend and volatility
    let predictedPrice = currentPrice;
    let daysAhead = 1;

    if (period === '7d') daysAhead = 7;
    else if (period === '30d') daysAhead = 30;

    // Simple momentum-based forecast
    const dailyChange = priceChange / prices.length;
    const forecastChange = dailyChange * daysAhead;

    if (trend === 'bullish') {
      predictedPrice = currentPrice * (1 + (forecastChange / 100) * 1.2);
    } else if (trend === 'bearish') {
      predictedPrice = currentPrice * (1 + (forecastChange / 100) * 0.8);
    } else {
      predictedPrice = currentPrice * (1 + (forecastChange / 100));
    }

    // Calculate confidence bands (95% confidence interval)
    const marginOfError = (volatility / 100) * currentPrice * Math.sqrt(daysAhead);
    const lowerBound = Math.max(0, predictedPrice - marginOfError);
    const upperBound = predictedPrice + marginOfError;

    // Calculate confidence score
    let confidence = 50;
    if (prices.length > 100) confidence += 20;
    if (volatility < 5) confidence += 15;
    if (Math.abs(priceChange) < 10) confidence += 10;
    confidence = Math.min(100, confidence);

    // Generate recommendation
    let recommendation: 'buy' | 'hold' | 'sell' = 'hold';
    if (trend === 'bullish' && confidence > 70) recommendation = 'buy';
    else if (trend === 'bearish' && confidence > 70) recommendation = 'sell';

    return {
      asset,
      period,
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      lowerBound: Math.round(lowerBound * 100) / 100,
      upperBound: Math.round(upperBound * 100) / 100,
      confidence: Math.round(confidence),
      trend,
      volatility: Math.round(volatility * 100) / 100,
      recommendation,
    };
  }

  /**
   * Analyze price momentum
   */
  static analyzeMomentum(priceHistory: PriceData[]): {
    momentum: number;
    strength: 'strong' | 'moderate' | 'weak';
    direction: 'up' | 'down';
  } {
    if (priceHistory.length < 2) {
      return { momentum: 0, strength: 'weak', direction: 'up' };
    }

    const prices = priceHistory.map(p => p.price);
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2];

    const momentum = ((currentPrice - previousPrice) / previousPrice) * 100;
    const direction = momentum > 0 ? 'up' : 'down';

    let strength: 'strong' | 'moderate' | 'weak';
    if (Math.abs(momentum) > 2) strength = 'strong';
    else if (Math.abs(momentum) > 0.5) strength = 'moderate';
    else strength = 'weak';

    return { momentum, strength, direction };
  }

  /**
   * Detect support and resistance levels
   */
  static detectLevels(priceHistory: PriceData[]): {
    support: number;
    resistance: number;
  } {
    if (priceHistory.length < 10) {
      const price = priceHistory[priceHistory.length - 1].price;
      return { support: price * 0.95, resistance: price * 1.05 };
    }

    const prices = priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Support is near the minimum
    const support = minPrice + (maxPrice - minPrice) * 0.2;

    // Resistance is near the maximum
    const resistance = maxPrice - (maxPrice - minPrice) * 0.2;

    return { support, resistance };
  }

  /**
   * Generate trading signals
   */
  static generateSignals(priceHistory: PriceData[]): string[] {
    const signals: string[] = [];

    if (priceHistory.length < 20) return signals;

    const prices = priceHistory.map(p => p.price);
    const currentPrice = prices[prices.length - 1];
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    const { support, resistance } = this.detectLevels(priceHistory);

    // Golden cross signal
    if (sma20 > sma50 && prices[prices.length - 2] <= this.calculateSMA(prices.slice(0, -1), 50)) {
      signals.push('🟢 Golden Cross: Bullish signal detected');
    }

    // Death cross signal
    if (sma20 < sma50 && prices[prices.length - 2] >= this.calculateSMA(prices.slice(0, -1), 50)) {
      signals.push('🔴 Death Cross: Bearish signal detected');
    }

    // Support/Resistance signals
    if (currentPrice <= support * 1.02) {
      signals.push('📍 Near Support: Potential bounce opportunity');
    }

    if (currentPrice >= resistance * 0.98) {
      signals.push('📍 Near Resistance: Potential pullback expected');
    }

    return signals;
  }
}
