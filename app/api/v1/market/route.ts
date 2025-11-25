import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/market/forecasts - Get market forecasts for a user's assets
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const assetId = req.nextUrl.searchParams.get('assetId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Build query
    const query: any = { userId };
    
    // Add assetId filter if provided
    if (assetId) {
      query.assetId = assetId;
    }
    
    // Get forecasts
    const forecasts = await prisma.marketForecast.findMany({
      where: query,
      include: {
        asset: {
          select: {
            name: true,
            ticker: true,
            assetType: true,
            currentPrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ forecasts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching market forecasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market forecasts' },
      { status: 500 }
    );
  }
}

// POST /api/v1/market/generate - Generate market forecasts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, assetIds } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Build query for assets
    const query: any = { userId };
    
    // If specific asset IDs are provided, use them
    if (assetIds && assetIds.length > 0) {
      query.id = { in: assetIds };
    }
    
    // Get assets with price history
    const assets = await prisma.asset.findMany({
      where: query,
      include: {
        priceHistory: {
          orderBy: { timestamp: 'desc' },
          take: 30, // Get the 30 most recent price points for analysis
        },
      },
    });
    
    if (assets.length === 0) {
      return NextResponse.json(
        { message: 'No assets found for forecasting' },
        { status: 200 }
      );
    }
    
    // Generate forecasts for each asset
    const generatedForecasts = [];
    
    for (const asset of assets) {
      // Generate forecasts using price history
      const forecasts = generateForecasts(asset);
      
      // Create or update forecast in database
      const forecast = await prisma.marketForecast.upsert({
        where: {
          userId_assetId: {
            userId,
            assetId: asset.id,
          },
        },
        update: {
          forecast1Day: forecasts.day1.forecast,
          lower1Day: forecasts.day1.lower,
          upper1Day: forecasts.day1.upper,
          confidence1Day: forecasts.day1.confidence,
          
          forecast7Day: forecasts.day7.forecast,
          lower7Day: forecasts.day7.lower,
          upper7Day: forecasts.day7.upper,
          confidence7Day: forecasts.day7.confidence,
          
          forecast30Day: forecasts.day30.forecast,
          lower30Day: forecasts.day30.lower,
          upper30Day: forecasts.day30.upper,
          confidence30Day: forecasts.day30.confidence,
          
          trend: forecasts.trend,
          volatility: forecasts.volatility,
          lastUpdated: new Date(),
        },
        create: {
          userId,
          assetId: asset.id,
          forecast1Day: forecasts.day1.forecast,
          lower1Day: forecasts.day1.lower,
          upper1Day: forecasts.day1.upper,
          confidence1Day: forecasts.day1.confidence,
          
          forecast7Day: forecasts.day7.forecast,
          lower7Day: forecasts.day7.lower,
          upper7Day: forecasts.day7.upper,
          confidence7Day: forecasts.day7.confidence,
          
          forecast30Day: forecasts.day30.forecast,
          lower30Day: forecasts.day30.lower,
          upper30Day: forecasts.day30.upper,
          confidence30Day: forecasts.day30.confidence,
          
          trend: forecasts.trend,
          volatility: forecasts.volatility,
          lastUpdated: new Date(),
        },
      });
      
      generatedForecasts.push({
        ...forecast,
        asset: {
          id: asset.id,
          name: asset.name,
          ticker: asset.ticker,
          assetType: asset.assetType,
          currentPrice: asset.currentPrice,
        },
      });
    }
    
    return NextResponse.json({ forecasts: generatedForecasts }, { status: 200 });
  } catch (error) {
    console.error('Error generating market forecasts:', error);
    return NextResponse.json(
      { error: 'Failed to generate market forecasts' },
      { status: 500 }
    );
  }
}

// Helper function to generate forecasts
function generateForecasts(asset: any) {
  // Get current price
  const currentPrice = Number(asset.currentPrice);
  
  // Get price history
  const priceHistory = asset.priceHistory.map((ph: any) => Number(ph.price));
  
  // Calculate volatility (standard deviation of daily returns)
  const volatility = calculateVolatility(priceHistory);
  
  // Determine trend
  const trend = determineTrend(priceHistory);
  
  // Generate 1-day forecast
  const day1 = generateForecastForPeriod(currentPrice, volatility, trend, 1, asset.assetType);
  
  // Generate 7-day forecast
  const day7 = generateForecastForPeriod(currentPrice, volatility, trend, 7, asset.assetType);
  
  // Generate 30-day forecast
  const day30 = generateForecastForPeriod(currentPrice, volatility, trend, 30, asset.assetType);
  
  return {
    day1,
    day7,
    day30,
    trend,
    volatility,
  };
}

// Helper function to calculate volatility
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0.01; // Default low volatility if not enough data
  
  // Calculate daily returns
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i-1] - prices[i]) / prices[i];
    returns.push(dailyReturn);
  }
  
  // Calculate mean return
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  
  // Calculate variance
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
  
  // Standard deviation (volatility)
  return Math.sqrt(variance);
}

// Helper function to determine trend
function determineTrend(prices: number[]): string {
  if (prices.length < 5) return 'neutral'; // Not enough data
  
  // Use simple moving averages to determine trend
  const shortTermMA = prices.slice(0, 5).reduce((sum, price) => sum + price, 0) / 5;
  const longTermMA = prices.slice(0, 10).reduce((sum, price) => sum + price, 0) / Math.min(10, prices.length);
  
  // Calculate percent difference
  const percentDiff = ((shortTermMA - longTermMA) / longTermMA) * 100;
  
  if (percentDiff > 2) {
    return 'bullish';
  } else if (percentDiff < -2) {
    return 'bearish';
  } else {
    return 'neutral';
  }
}

// Helper function to generate forecast for a specific period
function generateForecastForPeriod(
  currentPrice: number, 
  volatility: number, 
  trend: string, 
  days: number,
  assetType: string
): { forecast: number, lower: number, upper: number, confidence: number } {
  // Base forecast on current price
  let forecast = currentPrice;
  
  // Adjust forecast based on trend
  const trendFactor = trend === 'bullish' ? 0.01 : (trend === 'bearish' ? -0.01 : 0);
  
  // Different assets have different volatility characteristics
  let volatilityMultiplier = 1;
  if (assetType === 'stock') {
    volatilityMultiplier = 1.2;
  } else if (assetType === 'crypto') {
    volatilityMultiplier = 2.5;
  } else if (assetType === 'bond') {
    volatilityMultiplier = 0.5;
  }
  
  // Apply trend and time scaling
  forecast = forecast * (1 + (trendFactor * days));
  
  // Calculate confidence based on volatility and days
  // Longer forecasts have lower confidence
  const confidenceReduction = Math.min(50, days * 1.5);
  const confidence = Math.max(30, 90 - confidenceReduction);
  
  // Calculate upper and lower bounds based on volatility
  // More volatile assets and longer timeframes have wider bounds
  const adjustedVolatility = volatility * volatilityMultiplier * Math.sqrt(days);
  const range = forecast * adjustedVolatility * 1.96; // 95% confidence interval
  
  const lower = Math.max(0, forecast - range);
  const upper = forecast + range;
  
  return {
    forecast,
    lower,
    upper,
    confidence,
  };
}

// POST /api/v1/market/strategy - Get investment strategy recommendations
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'strategy') {
    try {
      const body = await req.json();
      const { userId } = body;
      
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }
      
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Get assets with forecasts
      const assets = await prisma.asset.findMany({
        where: { userId },
        include: {
          marketForecast: true,
        },
      });
      
      if (assets.length === 0) {
        return NextResponse.json(
          { message: 'No assets found for strategy recommendations' },
          { status: 200 }
        );
      }
      
      // Calculate total portfolio value
      const totalValue = assets.reduce(
        (sum, asset) => sum + Number(asset.currentValue),
        0
      );
      
      // Group assets by type
      const assetsByType: Record<string, any[]> = {};
      
      assets.forEach(asset => {
        const type = asset.assetType;
        
        if (!assetsByType[type]) {
          assetsByType[type] = [];
        }
        
        assetsByType[type].push(asset);
      });
      
      // Calculate current allocation percentages
      const currentAllocation = Object.entries(assetsByType).map(([type, assets]) => {
        const total = assets.reduce(
          (sum, asset) => sum + Number(asset.currentValue),
          0
        );
        
        return {
          type,
          total,
          percentage: totalValue > 0 ? (total / totalValue) * 100 : 0,
        };
      });
      
      // Determine user's risk profile
      const riskTolerance = user.profile?.riskTolerance || 'moderate';
      
      // Define target allocation based on risk profile
      const targetAllocation: Record<string, number> = {};
      
      if (riskTolerance === 'conservative') {
        targetAllocation.stock = 30;
        targetAllocation.bond = 50;
        targetAllocation.mutual_fund = 15;
        targetAllocation.crypto = 0;
        targetAllocation.cash = 5;
        targetAllocation.real_estate = 0;
        targetAllocation.other = 0;
      } else if (riskTolerance === 'moderate') {
        targetAllocation.stock = 50;
        targetAllocation.bond = 30;
        targetAllocation.mutual_fund = 15;
        targetAllocation.crypto = 0;
        targetAllocation.cash = 5;
        targetAllocation.real_estate = 0;
        targetAllocation.other = 0;
      } else if (riskTolerance === 'aggressive') {
        targetAllocation.stock = 70;
        targetAllocation.bond = 10;
        targetAllocation.mutual_fund = 10;
        targetAllocation.crypto = 5;
        targetAllocation.cash = 5;
        targetAllocation.real_estate = 0;
        targetAllocation.other = 0;
      }
      
      // Generate rebalancing recommendations
      const rebalancingRecommendations = currentAllocation.map(allocation => {
        const target = targetAllocation[allocation.type] || 0;
        const difference = target - allocation.percentage;
        const action = difference > 5 ? 'buy' : (difference < -5 ? 'sell' : 'hold');
        
        return {
          assetType: allocation.type,
          currentAllocation: allocation.percentage,
          targetAllocation: target,
          difference,
          action,
          amountToAdjust: Math.abs(difference / 100 * totalValue),
        };
      });
      
      // Add missing asset types from target allocation
      Object.entries(targetAllocation).forEach(([type, target]) => {
        if (!currentAllocation.some(a => a.type === type) && target > 0) {
          rebalancingRecommendations.push({
            assetType: type,
            currentAllocation: 0,
            targetAllocation: target,
            difference: target,
            action: 'buy',
            amountToAdjust: target / 100 * totalValue,
          });
        }
      });
      
      // Sort by absolute difference (largest adjustments first)
      rebalancingRecommendations.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
      
      // Identify overexposed assets (more than 10% in a single asset)
      const overexposedAssets = assets
        .filter(asset => (Number(asset.currentValue) / totalValue) > 0.1)
        .map(asset => ({
          id: asset.id,
          name: asset.name,
          type: asset.assetType,
          currentAllocation: (Number(asset.currentValue) / totalValue) * 100,
          recommendedAction: 'reduce',
        }));
      
      // Identify assets with negative forecasts
      const assetsWithNegativeOutlook = assets
        .filter(asset => 
          asset.marketForecast && 
          (asset.marketForecast.trend === 'bearish' || 
           Number(asset.marketForecast.forecast30Day) < Number(asset.currentPrice))
        )
        .map(asset => ({
          id: asset.id,
          name: asset.name,
          type: asset.assetType,
          currentPrice: asset.currentPrice,
          forecast30Day: asset.marketForecast?.forecast30Day,
          trend: asset.marketForecast?.trend,
          recommendedAction: 'monitor',
        }));
      
      // Format response
      const response = {
        strategy: {
          riskProfile: riskTolerance,
          currentAllocation,
          targetAllocation: Object.entries(targetAllocation).map(([type, percentage]) => ({
            type,
            percentage,
          })),
          rebalancingRecommendations,
          overexposedAssets,
          assetsWithNegativeOutlook,
          lastUpdated: new Date(),
        },
      };
      
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Error generating investment strategy:', error);
      return NextResponse.json(
        { error: 'Failed to generate investment strategy' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'strategy'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}
