import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JarAllocator } from '@/lib/ml';

// GET /api/v1/jars - Get jars with allocation recommendations
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
      include: {
        jars: true,
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current balance
    const currentBalance = user.accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Convert jars to format expected by JarAllocator
    const jars = user.jars.map(jar => ({
      id: jar.id,
      name: jar.name,
      target: jar.targetAmount,
      current: jar.currentAmount,
      priority: jar.priority,
      category: jar.category,
    }));

    // Get allocation recommendations
    const allocation = JarAllocator.allocate(currentBalance, jars);

    // Get shortfalls
    const shortfalls = JarAllocator.detectShortfalls(jars);

    // Calculate daily savings
    const dailySavings = JarAllocator.calculateDailySavings(jars, 30);

    return NextResponse.json({
      balance: currentBalance,
      jars: jars.map(jar => ({
        id: jar.id,
        name: jar.name,
        target: jar.target,
        current: jar.current,
        progress: (jar.current / jar.target) * 100,
        priority: jar.priority,
        category: jar.category,
      })),
      allocation: {
        recommendations: allocation.recommendations.map(r => ({
          jarId: r.jarId,
          jarName: r.jarName,
          recommendedAmount: r.recommendedAmount,
          priority: r.priority,
          urgency: r.urgency,
        })),
        totalToAllocate: allocation.totalToAllocate,
        remainingBalance: allocation.remainingBalance,
      },
      shortfalls: shortfalls.map(s => ({
        jarId: s.jarId,
        jarName: s.jarName,
        shortfallAmount: s.shortfallAmount,
        urgency: s.urgency,
        daysToDeadline: s.daysToDeadline,
      })),
      dailySavings: {
        required: dailySavings.requiredDailySavings,
        current: dailySavings.currentDailySavings,
        gap: dailySavings.gap,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching jars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jars' },
      { status: 500 }
    );
  }
}

// POST /api/v1/jars - Create a new jar
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, targetAmount, category, priority } = body;

    if (!userId || !name || !targetAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, targetAmount' },
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

    // Create jar
    const jar = await prisma.jar.create({
      data: {
        userId,
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        category: category || 'other',
        priority: priority || 5,
      },
    });

    return NextResponse.json({
      id: jar.id,
      name: jar.name,
      target: jar.targetAmount,
      current: jar.currentAmount,
      category: jar.category,
      priority: jar.priority,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating jar:', error);
    return NextResponse.json(
      { error: 'Failed to create jar' },
      { status: 500 }
    );
  }
}
