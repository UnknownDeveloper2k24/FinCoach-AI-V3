import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/spending - Get spending patterns for a user
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
    
    // Get spending patterns
    const spendingPatterns = await prisma.spendingPattern.findMany({
      where: { userId },
      orderBy: { averageAmount: 'desc' },
    });
    
    // Format response with CRED-like structure
    const response = {
      patterns: spendingPatterns.map(pattern => ({
        id: pattern.id,
        category: pattern.category,
        frequency: pattern.frequency,
        averageAmount: pattern.averageAmount,
        peakDay: pattern.peakDay,
        peakDayAmount: pattern.peakDayAmount,
        hasAnomalies: pattern.hasAnomalies,
        anomalyDescription: pattern.anomalyDescription,
        isRecurringSubscription: pattern.isRecurringSubscription,
        subscriptionName: pattern.subscriptionName,
        subscriptionCost: pattern.subscriptionCost,
        lastAnalyzed: pattern.lastAnalyzed,
      })),
      summary: {
        topCategories: spendingPatterns
          .slice(0, 3)
          .map(p => ({ category: p.category, amount: p.averageAmount })),
        subscriptionsTotal: spendingPatterns
          .filter(p => p.isRecurringSubscription)
          .reduce((sum, p) => sum + Number(p.subscriptionCost || 0), 0),
        anomaliesCount: spendingPatterns.filter(p => p.hasAnomalies).length,
      },
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching spending patterns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spending patterns' },
      { status: 500 }
    );
  }
}

// POST /api/v1/spending/analyze - Analyze spending patterns
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
    
    // Get transactions for the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        transactionDate: {
          gte: ninetyDaysAgo,
        },
      },
      orderBy: { transactionDate: 'desc' },
    });
    
    if (transactions.length === 0) {
      return NextResponse.json(
        { message: 'No transactions found for analysis' },
        { status: 200 }
      );
    }
    
    // Group transactions by category
    const categorizedTransactions: Record<string, any[]> = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category;
      
      if (!categorizedTransactions[category]) {
        categorizedTransactions[category] = [];
      }
      
      categorizedTransactions[category].push(transaction);
    });
    
    // Analyze each category
    const now = new Date();
    const patternResults = [];
    
    for (const [category, categoryTransactions] of Object.entries(categorizedTransactions)) {
      // Skip categories with less than 2 transactions
      if (categoryTransactions.length < 2) continue;
      
      // Calculate average amount
      const totalAmount = categoryTransactions.reduce(
        (sum, tx) => sum + Number(tx.amount),
        0
      );
      const averageAmount = totalAmount / categoryTransactions.length;
      
      // Determine frequency
      const frequency = determineFrequency(categoryTransactions);
      
      // Analyze peak spending day
      const daySpending = analyzeSpendingByDay(categoryTransactions);
      const peakDay = Object.entries(daySpending)
        .sort((a, b) => b[1].total - a[1].total)
        [0];
      
      // Detect anomalies
      const anomalies = detectAnomalies(categoryTransactions, averageAmount);
      const hasAnomalies = anomalies.length > 0;
      const anomalyDescription = hasAnomalies
        ? `Found ${anomalies.length} unusual transactions, highest: ${anomalies[0].amount}`
        : null;
      
      // Detect recurring subscriptions
      const subscriptionInfo = detectSubscription(categoryTransactions);
      
      // Create or update spending pattern
      const spendingPattern = await prisma.spendingPattern.upsert({
        where: {
          userId_category: {
            userId,
            category,
          },
        },
        update: {
          frequency,
          averageAmount,
          peakDay: peakDay ? peakDay[0] : null,
          peakDayAmount: peakDay ? peakDay[1].total : null,
          hasAnomalies,
          anomalyDescription,
          isRecurringSubscription: subscriptionInfo.isSubscription,
          subscriptionName: subscriptionInfo.name,
          subscriptionCost: subscriptionInfo.cost,
          lastAnalyzed: now,
          updatedAt: now,
        },
        create: {
          userId,
          category,
          frequency,
          averageAmount,
          peakDay: peakDay ? peakDay[0] : null,
          peakDayAmount: peakDay ? peakDay[1].total : null,
          hasAnomalies,
          anomalyDescription,
          isRecurringSubscription: subscriptionInfo.isSubscription,
          subscriptionName: subscriptionInfo.name,
          subscriptionCost: subscriptionInfo.cost,
          lastAnalyzed: now,
          createdAt: now,
          updatedAt: now,
        },
      });
      
      patternResults.push(spendingPattern);
    }
    
    // Format response with CRED-like structure
    const response = {
      patterns: patternResults.map(pattern => ({
        id: pattern.id,
        category: pattern.category,
        frequency: pattern.frequency,
        averageAmount: pattern.averageAmount,
        peakDay: pattern.peakDay,
        peakDayAmount: pattern.peakDayAmount,
        hasAnomalies: pattern.hasAnomalies,
        anomalyDescription: pattern.anomalyDescription,
        isRecurringSubscription: pattern.isRecurringSubscription,
        subscriptionName: pattern.subscriptionName,
        subscriptionCost: pattern.subscriptionCost,
        lastAnalyzed: pattern.lastAnalyzed,
      })),
      summary: {
        topCategories: patternResults
          .sort((a, b) => Number(b.averageAmount) - Number(a.averageAmount))
          .slice(0, 3)
          .map(p => ({ category: p.category, amount: p.averageAmount })),
        subscriptionsTotal: patternResults
          .filter(p => p.isRecurringSubscription)
          .reduce((sum, p) => sum + Number(p.subscriptionCost || 0), 0),
        anomaliesCount: patternResults.filter(p => p.hasAnomalies).length,
      },
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error analyzing spending patterns:', error);
    return NextResponse.json(
      { error: 'Failed to analyze spending patterns' },
      { status: 500 }
    );
  }
}

// Helper function to determine transaction frequency
function determineFrequency(transactions: any[]): string {
  // Sort transactions by date (oldest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
  );
  
  // If less than 3 transactions, can't determine pattern reliably
  if (sortedTransactions.length < 3) {
    return 'irregular';
  }
  
  // Calculate intervals between transactions in days
  const intervals = [];
  for (let i = 1; i < sortedTransactions.length; i++) {
    const prevDate = new Date(sortedTransactions[i - 1].transactionDate);
    const currDate = new Date(sortedTransactions[i].transactionDate);
    const daysDiff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    intervals.push(daysDiff);
  }
  
  // Calculate average interval
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  
  // Calculate standard deviation to measure consistency
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  
  // Coefficient of variation (normalized standard deviation)
  const cv = avgInterval > 0 ? stdDev / avgInterval : 999;
  
  // Determine frequency based on average interval and consistency
  if (cv > 0.5) {
    return 'irregular'; // High variability
  }
  
  if (avgInterval <= 2) {
    return 'daily';
  } else if (avgInterval <= 9) {
    return 'weekly';
  } else if (avgInterval <= 35) {
    return 'monthly';
  } else if (avgInterval <= 95) {
    return 'quarterly';
  } else {
    return 'yearly';
  }
}

// Helper function to analyze spending by day of week
function analyzeSpendingByDay(transactions: any[]): Record<string, { count: number, total: number }> {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Initialize day spending
  const daySpending: Record<string, { count: number, total: number }> = {};
  days.forEach(day => {
    daySpending[day] = { count: 0, total: 0 };
  });
  
  // Aggregate spending by day
  transactions.forEach(transaction => {
    const date = new Date(transaction.transactionDate);
    const day = days[date.getDay()];
    
    daySpending[day].count += 1;
    daySpending[day].total += Number(transaction.amount);
  });
  
  return daySpending;
}

// Helper function to detect anomalies
function detectAnomalies(transactions: any[], averageAmount: number): any[] {
  // Calculate standard deviation
  const amounts = transactions.map(tx => Number(tx.amount));
  const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - averageAmount, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  
  // Transactions more than 2 standard deviations from the mean are anomalies
  const threshold = averageAmount + (2 * stdDev);
  
  // Find and sort anomalies
  const anomalies = transactions
    .filter(tx => Number(tx.amount) > threshold)
    .sort((a, b) => Number(b.amount) - Number(a.amount));
  
  return anomalies;
}

// Helper function to detect recurring subscriptions
function detectSubscription(transactions: any[]): { isSubscription: boolean, name: string | null, cost: number | null } {
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  );
  
  // Need at least 2 transactions to detect a pattern
  if (sortedTransactions.length < 2) {
    return { isSubscription: false, name: null, cost: null };
  }
  
  // Check for consistent merchant
  const merchants = new Set(sortedTransactions.map(tx => tx.merchant).filter(Boolean));
  const hasSingleMerchant = merchants.size === 1 && merchants.values().next().value;
  
  // Check for consistent amount
  const amounts = sortedTransactions.map(tx => Number(tx.amount));
  const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
  
  // Calculate standard deviation of amounts
  const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  
  // Coefficient of variation (normalized standard deviation)
  const cv = avgAmount > 0 ? stdDev / avgAmount : 999;
  
  // Check for consistent interval
  const intervals = [];
  for (let i = 1; i < sortedTransactions.length; i++) {
    const currDate = new Date(sortedTransactions[i].transactionDate);
    const prevDate = new Date(sortedTransactions[i - 1].transactionDate);
    const daysDiff = Math.abs(Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)));
    intervals.push(daysDiff);
  }
  
  // Calculate average interval
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  
  // Calculate standard deviation of intervals
  const intervalVariance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  const intervalStdDev = Math.sqrt(intervalVariance);
  
  // Coefficient of variation for intervals
  const intervalCv = avgInterval > 0 ? intervalStdDev / avgInterval : 999;
  
  // Criteria for subscription:
  // 1. Consistent amount (low CV)
  // 2. Consistent interval (low CV)
  // 3. Preferably same merchant
  const isSubscription = cv < 0.1 && intervalCv < 0.3;
  
  if (isSubscription) {
    const name = hasSingleMerchant 
      ? merchants.values().next().value 
      : `${sortedTransactions[0].category} Subscription`;
    
    return {
      isSubscription: true,
      name,
      cost: avgAmount,
    };
  }
  
  return { isSubscription: false, name: null, cost: null };
}

// POST /api/v1/spending/subscriptions - Get subscription insights
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'subscriptions') {
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
      
      // Get subscription patterns
      const subscriptions = await prisma.spendingPattern.findMany({
        where: {
          userId,
          isRecurringSubscription: true,
        },
        orderBy: { subscriptionCost: 'desc' },
      });
      
      // Calculate totals
      const monthlyTotal = subscriptions.reduce(
        (sum, sub) => sum + Number(sub.subscriptionCost || 0),
        0
      );
      
      const yearlyTotal = monthlyTotal * 12;
      
      // Format response
      const response = {
        subscriptions: subscriptions.map(sub => ({
          id: sub.id,
          name: sub.subscriptionName || 'Unknown Subscription',
          category: sub.category,
          cost: sub.subscriptionCost,
          frequency: sub.frequency,
        })),
        summary: {
          count: subscriptions.length,
          monthlyTotal,
          yearlyTotal,
          percentOfIncome: 0, // Will be calculated if profile exists
        },
      };
      
      // Calculate percentage of income if profile exists
      const profile = await prisma.profile.findUnique({
        where: { userId },
      });
      
      if (profile && profile.monthlyIncome) {
        response.summary.percentOfIncome = Math.round((monthlyTotal / Number(profile.monthlyIncome)) * 100);
      }
      
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Error fetching subscription insights:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription insights' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'subscriptions'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}

// POST /api/v1/spending/anomalies - Get spending anomalies
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'anomalies') {
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
      
      // Get patterns with anomalies
      const patternsWithAnomalies = await prisma.spendingPattern.findMany({
        where: {
          userId,
          hasAnomalies: true,
        },
      });
      
      // Get recent transactions for these categories
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const categories = patternsWithAnomalies.map(pattern => pattern.category);
      
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'expense',
          category: {
            in: categories,
          },
          transactionDate: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: { amount: 'desc' },
      });
      
      // Find anomalies in each category
      const anomalies = [];
      
      for (const pattern of patternsWithAnomalies) {
        const categoryTransactions = transactions.filter(tx => tx.category === pattern.category);
        
        // Skip if no transactions
        if (categoryTransactions.length === 0) continue;
        
        // Calculate average and standard deviation
        const amounts = categoryTransactions.map(tx => Number(tx.amount));
        const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
        
        const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);
        
        // Transactions more than 2 standard deviations from the mean are anomalies
        const threshold = avgAmount + (2 * stdDev);
        
        const categoryAnomalies = categoryTransactions
          .filter(tx => Number(tx.amount) > threshold)
          .map(tx => ({
            id: tx.id,
            category: tx.category,
            amount: tx.amount,
            merchant: tx.merchant,
            date: tx.transactionDate,
            percentAboveAverage: Math.round(((Number(tx.amount) - avgAmount) / avgAmount) * 100),
          }))
          .sort((a, b) => Number(b.amount) - Number(a.amount));
        
        anomalies.push(...categoryAnomalies);
      }
      
      // Sort all anomalies by amount (highest first)
      anomalies.sort((a, b) => Number(b.amount) - Number(a.amount));
      
      // Format response
      const response = {
        anomalies,
        summary: {
          count: anomalies.length,
          totalAmount: anomalies.reduce((sum, anomaly) => sum + Number(anomaly.amount), 0),
          topCategories: [...new Set(anomalies.map(a => a.category))].slice(0, 3),
        },
      };
      
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Error fetching spending anomalies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch spending anomalies' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'anomalies'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}
