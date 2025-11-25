import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IncomePredictor } from '@/lib/ml';

// GET /api/v1/income/forecast - Get income forecast for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30');

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

    // Get income records
    const incomeRecords = await prisma.incomeRecord.findMany({
      where: { userId },
      orderBy: { incomeDate: 'desc' },
    });

    // Convert to format expected by IncomePredictor
    const incomeData = incomeRecords.map(record => ({
      date: new Date(record.incomeDate),
      amount: Number(record.amount),
      source: record.source,
      recurring: record.isRecurring || false,
    }));

    // Analyze patterns using ML engine
    const patterns = IncomePredictor.analyzePatterns(incomeData);

    // Generate forecast
    const forecast = IncomePredictor.forecast(patterns, days);

    // Detect dips
    const dips = IncomePredictor.detectDips(patterns);

    return NextResponse.json({
      forecast: {
        days,
        predicted: forecast.predictedAmount,
        lower: forecast.lowerBound,
        upper: forecast.upperBound,
        confidence: forecast.confidence,
        trend: forecast.trend,
      },
      patterns: patterns.map(p => ({
        source: p.lastOccurrence ? `${p.frequency} from ${p.lastOccurrence}` : 'Unknown',
        frequency: p.frequency,
        averageAmount: p.averageAmount,
        confidence: p.confidence,
        nextExpected: p.nextExpected,
      })),
      alerts: dips,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching income forecast:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income forecast' },
      { status: 500 }
    );
  }
}
