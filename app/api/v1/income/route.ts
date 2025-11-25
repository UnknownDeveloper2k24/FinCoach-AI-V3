import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IncomePredictor } from '@/lib/ml';

// GET /api/v1/income - Get all income records and forecasts for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    
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
    
    // Generate forecasts for 7d, 30d, 90d
    const forecast7d = IncomePredictor.forecast(patterns, 7);
    const forecast30d = IncomePredictor.forecast(patterns, 30);
    const forecast90d = IncomePredictor.forecast(patterns, 90);
    
    // Detect income dips
    const dips = IncomePredictor.detectDips(patterns);
    
    return NextResponse.json({
      incomeRecords: incomeRecords.map(r => ({
        id: r.id,
        amount: Number(r.amount),
        source: r.source,
        date: r.incomeDate,
        recurring: r.isRecurring,
      })),
      patterns: patterns.map(p => ({
        source: p.lastOccurrence ? `${p.frequency} from ${p.lastOccurrence}` : 'Unknown',
        frequency: p.frequency,
        averageAmount: p.averageAmount,
        confidence: p.confidence,
        nextExpected: p.nextExpected,
      })),
      forecasts: {
        '7d': {
          predicted: forecast7d.predictedAmount,
          lower: forecast7d.lowerBound,
          upper: forecast7d.upperBound,
          confidence: forecast7d.confidence,
          trend: forecast7d.trend,
        },
        '30d': {
          predicted: forecast30d.predictedAmount,
          lower: forecast30d.lowerBound,
          upper: forecast30d.upperBound,
          confidence: forecast30d.confidence,
          trend: forecast30d.trend,
        },
        '90d': {
          predicted: forecast90d.predictedAmount,
          lower: forecast90d.lowerBound,
          upper: forecast90d.upperBound,
          confidence: forecast90d.confidence,
          trend: forecast90d.trend,
        },
      },
      alerts: dips,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching income records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income records' },
      { status: 500 }
    );
  }
}

// POST /api/v1/income - Create a new income record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, source, incomeDate, isRecurring, frequency, nextExpectedDate } = body;
    
    // Validate required fields
    if (!userId || !amount || !source || !incomeDate) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount, source, incomeDate' },
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
    
    // Create income record
    const incomeRecord = await prisma.incomeRecord.create({
      data: {
        userId,
        amount: parseFloat(amount),
        source,
        incomeDate: new Date(incomeDate),
        isRecurring: isRecurring || false,
        frequency,
        nextExpectedDate: nextExpectedDate ? new Date(nextExpectedDate) : undefined,
      },
    });
    
    // Trigger forecast update
    await updateIncomeForecast(userId);
    
    return NextResponse.json({
      id: incomeRecord.id,
      amount: Number(incomeRecord.amount),
      source: incomeRecord.source,
      date: incomeRecord.incomeDate,
      recurring: incomeRecord.isRecurring,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating income record:', error);
    return NextResponse.json(
      { error: 'Failed to create income record' },
      { status: 500 }
    );
  }
}

// Helper function to update income forecast using ML
async function updateIncomeForecast(userId: string) {
  try {
    // Get all income records for the user
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
    
    // Generate forecasts
    const forecast7d = IncomePredictor.forecast(patterns, 7);
    const forecast30d = IncomePredictor.forecast(patterns, 30);
    const forecast90d = IncomePredictor.forecast(patterns, 90);
    
    // Detect dips
    const dips = IncomePredictor.detectDips(patterns);
    
    const now = new Date();
    
    // Update or create forecast
    await prisma.incomeForecast.upsert({
      where: { userId },
      update: {
        forecast7Day: forecast7d.predictedAmount,
        forecast30Day: forecast30d.predictedAmount,
        forecast90Day: forecast90d.predictedAmount,
        confidence7Day: forecast7d.confidence,
        confidence30Day: forecast30d.confidence,
        confidence90Day: forecast90d.confidence,
        lower7Day: forecast7d.lowerBound,
        upper7Day: forecast7d.upperBound,
        lower30Day: forecast30d.lowerBound,
        upper30Day: forecast30d.upperBound,
        lower90Day: forecast90d.lowerBound,
        upper90Day: forecast90d.upperBound,
        trend: forecast30d.trend,
        incomeDips: dips.length > 0,
        lastUpdated: now,
        updatedAt: now,
      },
      create: {
        userId,
        forecast7Day: forecast7d.predictedAmount,
        forecast30Day: forecast30d.predictedAmount,
        forecast90Day: forecast90d.predictedAmount,
        confidence7Day: forecast7d.confidence,
        confidence30Day: forecast30d.confidence,
        confidence90Day: forecast90d.confidence,
        lower7Day: forecast7d.lowerBound,
        upper7Day: forecast7d.upperBound,
        lower30Day: forecast30d.lowerBound,
        upper30Day: forecast30d.upperBound,
        lower90Day: forecast90d.lowerBound,
        upper90Day: forecast90d.upperBound,
        trend: forecast30d.trend,
        incomeDips: dips.length > 0,
        lastUpdated: now,
        updatedAt: now,
      },
    });
  } catch (error) {
    console.error('Error updating income forecast:', error);
  }
}
