import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/jars - Get all jars for a user
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
    
    // Get jars with allocations
    const jars = await prisma.jar.findMany({
      where: { userId },
      include: {
        allocations: {
          orderBy: { allocationDate: 'desc' },
          take: 5, // Get only the 5 most recent allocations
        },
      },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' },
      ],
    });
    
    // Calculate progress percentage for each jar
    const jarsWithProgress = jars.map(jar => ({
      ...jar,
      progress: Number(jar.targetAmount) > 0 
        ? Math.min(100, Math.round((Number(jar.currentAmount) / Number(jar.targetAmount)) * 100)) 
        : 0,
      shortfall: Math.max(0, Number(jar.targetAmount) - Number(jar.currentAmount)),
    }));
    
    return NextResponse.json({ jars: jarsWithProgress }, { status: 200 });
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
    const { 
      userId, 
      name, 
      description, 
      color, 
      icon,
      targetAmount, 
      allocationPercentage, 
      priority, 
      isEssential, 
      autoAllocate, 
      dueDate 
    } = body;
    
    // Validate required fields
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
        description,
        color: color || "#3B82F6", // Default blue color
        icon,
        targetAmount,
        allocationPercentage: allocationPercentage || 0,
        priority: priority || 0,
        isEssential: isEssential || false,
        autoAllocate: autoAllocate !== undefined ? autoAllocate : true,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });
    
    return NextResponse.json({ jar }, { status: 201 });
  } catch (error) {
    console.error('Error creating jar:', error);
    return NextResponse.json(
      { error: 'Failed to create jar' },
      { status: 500 }
    );
  }
}

// POST /api/v1/jars/allocate - Allocate funds to jars
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'allocate') {
    try {
      const body = await req.json();
      const { userId, amount, source } = body;
      
      if (!userId || !amount) {
        return NextResponse.json(
          { error: 'Missing required fields: userId, amount' },
          { status: 400 }
        );
      }
      
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          jars: {
            orderBy: [
              { priority: 'desc' },
              { name: 'asc' },
            ],
          },
        },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Get auto-allocate jars
      const autoAllocateJars = user.jars.filter(jar => jar.autoAllocate);
      
      if (autoAllocateJars.length === 0) {
        return NextResponse.json(
          { error: 'No jars configured for auto-allocation' },
          { status: 400 }
        );
      }
      
      // Calculate total allocation percentage
      const totalAllocationPercentage = autoAllocateJars.reduce(
        (sum, jar) => sum + Number(jar.allocationPercentage),
        0
      );
      
      // If total allocation is 0%, distribute evenly
      let allocations = [];
      
      if (totalAllocationPercentage === 0) {
        const evenPercentage = 100 / autoAllocateJars.length;
        
        allocations = autoAllocateJars.map(jar => ({
          jarId: jar.id,
          amount: Number(amount) * (evenPercentage / 100),
          percentage: evenPercentage,
        }));
      } else {
        // Normalize percentages if they don't add up to 100%
        const normalizationFactor = 100 / totalAllocationPercentage;
        
        allocations = autoAllocateJars.map(jar => {
          const normalizedPercentage = Number(jar.allocationPercentage) * normalizationFactor;
          return {
            jarId: jar.id,
            amount: Number(amount) * (normalizedPercentage / 100),
            percentage: normalizedPercentage,
          };
        });
      }
      
      // Perform allocations in a transaction
      const results = await prisma.$transaction(async (tx) => {
        const allocationResults = [];
        
        for (const allocation of allocations) {
          // Update jar amount
          const updatedJar = await tx.jar.update({
            where: { id: allocation.jarId },
            data: {
              currentAmount: {
                increment: allocation.amount,
              },
            },
          });
          
          // Create allocation record
          const allocationRecord = await tx.jarAllocation.create({
            data: {
              jarId: allocation.jarId,
              amount: allocation.amount,
              reason: source || 'auto',
            },
          });
          
          allocationResults.push({
            jar: updatedJar,
            allocation: allocationRecord,
          });
        }
        
        return allocationResults;
      });
      
      return NextResponse.json({ allocations: results }, { status: 200 });
    } catch (error) {
      console.error('Error allocating to jars:', error);
      return NextResponse.json(
        { error: 'Failed to allocate to jars' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'allocate'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}

// POST /api/v1/jars/suggestions - Get jar allocation suggestions
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'suggestions') {
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
          jars: true,
          profile: true,
        },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Get cashflow analysis
      const cashflow = await prisma.cashflowAnalysis.findUnique({
        where: { userId },
      });
      
      // Calculate daily savings suggestion based on income and cashflow
      const monthlyIncome = user.profile?.monthlyIncome || 0;
      const dailyIncome = Number(monthlyIncome) / 30;
      const dailyBurnRate = cashflow?.dailyBurnRate || 0;
      
      // Calculate savings potential (income - expenses)
      const savingsPotential = Math.max(0, dailyIncome - Number(dailyBurnRate));
      
      // Get jars with shortfalls
      const jarsWithShortfalls = user.jars
        .map(jar => ({
          ...jar,
          shortfall: Math.max(0, Number(jar.targetAmount) - Number(jar.currentAmount)),
          daysUntilDue: jar.dueDate 
            ? Math.max(1, Math.round((new Date(jar.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
            : 30, // Default to 30 days if no due date
        }))
        .filter(jar => jar.shortfall > 0)
        .sort((a, b) => {
          // Sort by priority first
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          
          // Then by days until due (urgent first)
          if (a.daysUntilDue !== b.daysUntilDue) {
            return a.daysUntilDue - b.daysUntilDue;
          }
          
          // Then by shortfall amount (larger first)
          return Number(b.shortfall) - Number(a.shortfall);
        });
      
      // Generate suggestions
      const suggestions = [];
      
      // 1. Daily savings suggestion
      if (savingsPotential > 0) {
        suggestions.push({
          type: 'daily_saving',
          title: 'Recommended Daily Saving',
          amount: Math.min(savingsPotential, savingsPotential * 0.2), // Suggest 20% of potential
          description: 'This amount daily will help you reach your goals faster.',
        });
      }
      
      // 2. Jar-specific suggestions
      if (jarsWithShortfalls.length > 0) {
        // Focus on top 3 priority jars
        const topJars = jarsWithShortfalls.slice(0, 3);
        
        for (const jar of topJars) {
          const dailyNeeded = Number(jar.shortfall) / jar.daysUntilDue;
          
          suggestions.push({
            type: 'jar_specific',
            jarId: jar.id,
            jarName: jar.name,
            title: `${jar.name} Jar`,
            shortfall: jar.shortfall,
            daysUntilDue: jar.daysUntilDue,
            dailyNeeded,
            description: jar.dueDate 
              ? `Needs ₹${dailyNeeded.toFixed(2)} daily to reach target by ${new Date(jar.dueDate).toLocaleDateString()}.`
              : `Needs ₹${dailyNeeded.toFixed(2)} daily to reach target in 30 days.`,
          });
        }
      }
      
      // 3. Allocation percentage suggestions
      if (user.jars.length > 0) {
        const totalAllocationPercentage = user.jars.reduce(
          (sum, jar) => sum + Number(jar.allocationPercentage),
          0
        );
        
        if (totalAllocationPercentage !== 100) {
          // Suggest optimal allocation percentages
          const optimizedPercentages = optimizeAllocationPercentages(user.jars);
          
          suggestions.push({
            type: 'allocation_optimization',
            title: 'Optimize Allocation Percentages',
            description: 'Adjust your jar allocations to better meet your goals.',
            currentTotal: totalAllocationPercentage,
            suggestedPercentages: optimizedPercentages,
          });
        }
      }
      
      return NextResponse.json({ suggestions }, { status: 200 });
    } catch (error) {
      console.error('Error generating jar suggestions:', error);
      return NextResponse.json(
        { error: 'Failed to generate jar suggestions' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'suggestions'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}

// Helper function to optimize allocation percentages
function optimizeAllocationPercentages(jars: any[]) {
  // Calculate total target amount
  const totalTarget = jars.reduce(
    (sum, jar) => sum + Number(jar.targetAmount),
    0
  );
  
  if (totalTarget === 0) {
    // If no targets, distribute evenly
    const evenPercentage = 100 / jars.length;
    return jars.map(jar => ({
      jarId: jar.id,
      jarName: jar.name,
      currentPercentage: jar.allocationPercentage,
      suggestedPercentage: evenPercentage,
    }));
  }
  
  // Calculate percentages based on target amounts and priorities
  return jars.map(jar => {
    // Base percentage on proportion of total target
    let basePercentage = (Number(jar.targetAmount) / totalTarget) * 100;
    
    // Adjust by priority (higher priority gets more)
    const priorityFactor = 1 + (jar.priority * 0.1); // 10% boost per priority level
    let suggestedPercentage = basePercentage * priorityFactor;
    
    return {
      jarId: jar.id,
      jarName: jar.name,
      currentPercentage: jar.allocationPercentage,
      suggestedPercentage,
    };
  });
}
