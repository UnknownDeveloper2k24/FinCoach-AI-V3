import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/income/forecast - Get income forecast for a user
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
    
    // Get income forecast
    const forecast = await prisma.incomeForecast.findUnique({
      where: { userId },
    });
    
    if (!forecast) {
      return NextResponse.json(
        { error: 'Income forecast not found for this user' },
        { status: 404 }
      );
    }
    
    // Format response with CRED-like structure
    const response = {
      forecast: {
        days7: {
          amount: forecast.forecast7Day,
          confidence: forecast.confidence7Day,
          range: {
            lower: forecast.lower7Day,
            upper: forecast.upper7Day,
          }
        },
        days30: {
          amount: forecast.forecast30Day,
          confidence: forecast.confidence30Day,
          range: {
            lower: forecast.lower30Day,
            upper: forecast.upper30Day,
          }
        },
        days90: {
          amount: forecast.forecast90Day,
          confidence: forecast.confidence90Day,
          range: {
            lower: forecast.lower90Day,
            upper: forecast.upper90Day,
          }
        },
        trend: forecast.trend,
        incomeDips: forecast.incomeDips,
        lastUpdated: forecast.lastUpdated,
      }
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching income forecast:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income forecast' },
      { status: 500 }
    );
  }
}

// POST /api/v1/income/forecast/refresh - Force refresh income forecast
export async function POST(req: NextRequest) {
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
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get all income records for the user
    const incomeRecords = await prisma.incomeRecord.findMany({
      where: { userId },
      orderBy: { incomeDate: 'desc' },
    });
    
    // Calculate forecasts based on historical data and recurring income
    const now = new Date();
    
    // Filter records from the last 90 days for analysis
    const recentRecords = incomeRecords.filter(record => {
      const recordDate = new Date(record.incomeDate);
      const daysDiff = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 90;
    });
    
    // Calculate recurring income
    const recurringIncome = incomeRecords
      .filter(record => record.isRecurring && record.nextExpectedDate)
      .reduce((acc, record) => {
        const nextDate = new Date(record.nextExpectedDate!);
        const daysDiff = (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        
        // Add to 7-day forecast
        if (daysDiff <= 7) acc.days7 += Number(record.amount);
        
        // Add to 30-day forecast
        if (daysDiff <= 30) acc.days30 += Number(record.amount);
        
        // Add to 90-day forecast
        if (daysDiff <= 90) acc.days90 += Number(record.amount);
        
        return acc;
      }, { days7: 0, days30: 0, days90: 0 });
    
    // Calculate non-recurring historical averages
    const historicalAverages = calculateHistoricalAverages(recentRecords);
    
    // Combine recurring and historical for final forecast
    const forecast7Day = recurringIncome.days7 + historicalAverages.days7;
    const forecast30Day = recurringIncome.days30 + historicalAverages.days30;
    const forecast90Day = recurringIncome.days90 + historicalAverages.days90;
    
    // Calculate confidence scores (simplified)
    const confidence7Day = calculateConfidence(recentRecords, 7);
    const confidence30Day = calculateConfidence(recentRecords, 30);
    const confidence90Day = calculateConfidence(recentRecords, 90);
    
    // Calculate upper and lower bounds (simplified)
    const variability = calculateVariability(recentRecords);
    
    const lower7Day = forecast7Day * (1 - variability * (1 - confidence7Day / 100));
    const upper7Day = forecast7Day * (1 + variability * (1 - confidence7Day / 100));
    
    const lower30Day = forecast30Day * (1 - variability * (1 - confidence30Day / 100));
    const upper30Day = forecast30Day * (1 + variability * (1 - confidence30Day / 100));
    
    const lower90Day = forecast90Day * (1 - variability * (1 - confidence90Day / 100));
    const upper90Day = forecast90Day * (1 + variability * (1 - confidence90Day / 100));
    
    // Detect trend
    const trend = detectTrend(recentRecords);
    
    // Detect income dips
    const incomeDips = detectIncomeDips(recentRecords);
    
    // Update or create forecast
    const updatedForecast = await prisma.incomeForecast.upsert({
      where: { userId },
      update: {
        forecast7Day,
        forecast30Day,
        forecast90Day,
        confidence7Day,
        confidence30Day,
        confidence90Day,
        lower7Day,
        upper7Day,
        lower30Day,
        upper30Day,
        lower90Day,
        upper90Day,
        trend,
        incomeDips,
        lastUpdated: now,
        updatedAt: now,
      },
      create: {
        userId,
        forecast7Day,
        forecast30Day,
        forecast90Day,
        confidence7Day,
        confidence30Day,
        confidence90Day,
        lower7Day,
        upper7Day,
        lower30Day,
        upper30Day,
        lower90Day,
        upper90Day,
        trend,
        incomeDips,
        lastUpdated: now,
        updatedAt: now,
      },
    });
    
    // Format response with CRED-like structure
    const response = {
      forecast: {
        days7: {
          amount: updatedForecast.forecast7Day,
          confidence: updatedForecast.confidence7Day,
          range: {
            lower: updatedForecast.lower7Day,
            upper: updatedForecast.upper7Day,
          }
        },
        days30: {
          amount: updatedForecast.forecast30Day,
          confidence: updatedForecast.confidence30Day,
          range: {
            lower: updatedForecast.lower30Day,
            upper: updatedForecast.upper30Day,
          }
        },
        days90: {
          amount: updatedForecast.forecast90Day,
          confidence: updatedForecast.confidence90Day,
          range: {
            lower: updatedForecast.lower90Day,
            upper: updatedForecast.upper90Day,
          }
        },
        trend: updatedForecast.trend,
        incomeDips: updatedForecast.incomeDips,
        lastUpdated: updatedForecast.lastUpdated,
      }
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error refreshing income forecast:', error);
    return NextResponse.json(
      { error: 'Failed to refresh income forecast' },
      { status: 500 }
    );
  }
}

// Helper function to calculate historical averages
function calculateHistoricalAverages(records: any[]) {
  // Simple implementation - can be enhanced with more sophisticated algorithms
  const totalIncome = records.reduce((sum, record) => sum + Number(record.amount), 0);
  const avgDailyIncome = records.length > 0 ? totalIncome / 90 : 0; // Assuming 90 days of data
  
  return {
    days7: avgDailyIncome * 7,
    days30: avgDailyIncome * 30,
    days90: avgDailyIncome * 90,
  };
}

// Helper function to calculate confidence score
function calculateConfidence(records: any[], days: number) {
  // Simple implementation - more data and consistent patterns increase confidence
  if (records.length === 0) return 30; // Base confidence
  
  const recurringCount = records.filter(r => r.isRecurring).length;
  const recurringRatio = recurringCount / records.length;
  
  // More recurring income = higher confidence
  const baseConfidence = 50 + (recurringRatio * 30);
  
  // Adjust based on forecast period (shorter = higher confidence)
  const periodAdjustment = days <= 7 ? 15 : days <= 30 ? 5 : 0;
  
  // Adjust based on data quantity
  const dataAdjustment = Math.min(records.length * 2, 15);
  
  return Math.min(Math.round(baseConfidence + periodAdjustment + dataAdjustment), 95);
}

// Helper function to calculate income variability
function calculateVariability(records: any[]) {
  if (records.length <= 1) return 0.2; // Default variability
  
  const amounts = records.map(r => Number(r.amount));
  const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
  
  // Calculate standard deviation
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  
  // Coefficient of variation (normalized standard deviation)
  const cv = mean > 0 ? stdDev / mean : 0.2;
  
  // Limit to reasonable range
  return Math.max(0.05, Math.min(cv, 0.5));
}

// Helper function to detect trend
function detectTrend(records: any[]) {
  if (records.length < 3) return 'stable';
  
  // Sort by date
  const sortedRecords = [...records].sort((a, b) => 
    new Date(a.incomeDate).getTime() - new Date(b.incomeDate).getTime()
  );
  
  // Split into three periods and calculate averages
  const third = Math.floor(sortedRecords.length / 3);
  
  const firstPeriod = sortedRecords.slice(0, third);
  const middlePeriod = sortedRecords.slice(third, third * 2);
  const lastPeriod = sortedRecords.slice(third * 2);
  
  const firstAvg = firstPeriod.reduce((sum, r) => sum + Number(r.amount), 0) / firstPeriod.length;
  const middleAvg = middlePeriod.reduce((sum, r) => sum + Number(r.amount), 0) / middlePeriod.length;
  const lastAvg = lastPeriod.reduce((sum, r) => sum + Number(r.amount), 0) / lastPeriod.length;
  
  // Calculate trend
  const threshold = 0.1; // 10% change threshold
  
  if (lastAvg > middleAvg * (1 + threshold) && middleAvg > firstAvg * (1 + threshold)) {
    return 'up';
  } else if (lastAvg < middleAvg * (1 - threshold) && middleAvg < firstAvg * (1 - threshold)) {
    return 'down';
  } else {
    return 'stable';
  }
}

// Helper function to detect income dips
function detectIncomeDips(records: any[]) {
  if (records.length < 3) return false;
  
  // Sort by date (newest first)
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.incomeDate).getTime() - new Date(a.incomeDate).getTime()
  );
  
  // Calculate average income
  const totalIncome = sortedRecords.reduce((sum, r) => sum + Number(r.amount), 0);
  const avgIncome = totalIncome / sortedRecords.length;
  
  // Check if any of the recent records show significant dips
  const significantDipThreshold = 0.3; // 30% below average
  
  // Check the most recent 3 records for dips
  const recentRecords = sortedRecords.slice(0, 3);
  
  return recentRecords.some(record => Number(record.amount) < avgIncome * (1 - significantDipThreshold));
}
