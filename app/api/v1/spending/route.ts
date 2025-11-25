import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SpendingAnalyzer } from '@/lib/ml';

// GET /api/v1/spending - Analyze spending patterns
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

    // Get transactions for analysis
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: now },
      },
      orderBy: { date: 'desc' },
    });

    // Convert to format expected by SpendingAnalyzer
    const transactionData = transactions.map(t => ({
      date: t.date,
      amount: t.amount,
      category: t.category,
      merchant: t.merchant,
    }));

    // Analyze spending using ML engine
    const analysis = SpendingAnalyzer.analyze(transactionData, days);

    // Get insights
    const insights = SpendingAnalyzer.getInsights(analysis);

    return NextResponse.json({
      period: `${days}d`,
      summary: {
        totalSpent: analysis.totalSpent,
        averageDailySpend: analysis.averageDailySpend,
        transactionCount: transactionData.length,
      },
      patterns: analysis.patterns.map(p => ({
        merchant: p.merchant,
        category: p.category,
        frequency: p.frequency,
        averageAmount: p.averageAmount,
        totalAmount: p.totalAmount,
        transactionCount: p.transactionCount,
        isRecurring: p.isRecurring,
        isAnomaly: p.isAnomaly,
        anomalyScore: p.anomalyScore,
      })),
      anomalies: analysis.anomalies.map(a => ({
        merchant: a.merchant,
        category: a.category,
        averageAmount: a.averageAmount,
        anomalyScore: a.anomalyScore,
      })),
      subscriptions: analysis.subscriptions.map(s => ({
        merchant: s.merchant,
        category: s.category,
        frequency: s.frequency,
        averageAmount: s.averageAmount,
        nextExpected: s.nextExpected,
      })),
      peakDays: analysis.peakDays,
      categoryBreakdown: Array.from(analysis.categoryBreakdown.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / analysis.totalSpent) * 100,
      })),
      insights,
    }, { status: 200 });
  } catch (error) {
    console.error('Error analyzing spending:', error);
    return NextResponse.json(
      { error: 'Failed to analyze spending' },
      { status: 500 }
    );
  }
}
