import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketForecaster } from '@/lib/ml';

// GET /api/v1/market - Get market forecasts
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const symbol = req.nextUrl.searchParams.get('symbol') || 'NIFTY50';

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

    // Get market data (mock data for now)
    const priceHistory = [
      { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), price: 18000 },
      { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), price: 18500 },
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 19000 },
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), price: 19500 },
      { date: new Date(), price: 20000 },
    ];

    // Forecast using MarketForecaster
    const forecast = MarketForecaster.forecast(priceHistory, 30);
    const technicalAnalysis = MarketForecaster.technicalAnalysis(priceHistory);
    const signals = MarketForecaster.generateSignals(priceHistory);

    return NextResponse.json({
      symbol,
      current: priceHistory[priceHistory.length - 1].price,
      forecast: {
        predicted: forecast.predictedPrice,
        lower: forecast.lowerBound,
        upper: forecast.upperBound,
        confidence: forecast.confidence,
        days: 30,
      },
      technical: {
        sma20: technicalAnalysis.sma20,
        sma50: technicalAnalysis.sma50,
        ema12: technicalAnalysis.ema12,
        ema26: technicalAnalysis.ema26,
        volatility: technicalAnalysis.volatility,
        support: technicalAnalysis.support,
        resistance: technicalAnalysis.resistance,
      },
      signals: signals.map(s => ({
        type: s.type,
        strength: s.strength,
        description: s.description,
      })),
      trend: forecast.trend,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
