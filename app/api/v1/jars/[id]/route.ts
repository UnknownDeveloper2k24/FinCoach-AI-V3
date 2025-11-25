import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/jars/[id] - Get a specific jar
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const jar = await prisma.jar.findUnique({
      where: { id },
      include: {
        allocations: {
          orderBy: { allocationDate: 'desc' },
          take: 10, // Get the 10 most recent allocations
        },
      },
    });
    
    if (!jar) {
      return NextResponse.json(
        { error: 'Jar not found' },
        { status: 404 }
      );
    }
    
    // Calculate progress percentage
    const progress = Number(jar.targetAmount) > 0 
      ? Math.min(100, Math.round((Number(jar.currentAmount) / Number(jar.targetAmount)) * 100)) 
      : 0;
    
    // Calculate shortfall
    const shortfall = Math.max(0, Number(jar.targetAmount) - Number(jar.currentAmount));
    
    // Calculate days until due
    const daysUntilDue = jar.dueDate 
      ? Math.max(0, Math.round((new Date(jar.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : null;
    
    // Calculate daily amount needed to reach target by due date
    const dailyAmountNeeded = daysUntilDue && daysUntilDue > 0
      ? shortfall / daysUntilDue
      : null;
    
    // Format response
    const response = {
      jar: {
        ...jar,
        progress,
        shortfall,
        daysUntilDue,
        dailyAmountNeeded,
      },
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`Error fetching jar ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch jar' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/jars/[id] - Update a jar
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { 
      name, 
      description, 
      color, 
      icon,
      targetAmount, 
      currentAmount,
      allocationPercentage, 
      priority, 
      isEssential, 
      autoAllocate, 
      dueDate 
    } = body;
    
    // Check if jar exists
    const existingJar = await prisma.jar.findUnique({
      where: { id },
    });
    
    if (!existingJar) {
      return NextResponse.json(
        { error: 'Jar not found' },
        { status: 404 }
      );
    }
    
    // Update jar
    const updatedJar = await prisma.jar.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        color: color !== undefined ? color : undefined,
        icon: icon !== undefined ? icon : undefined,
        targetAmount: targetAmount !== undefined ? targetAmount : undefined,
        currentAmount: currentAmount !== undefined ? currentAmount : undefined,
        allocationPercentage: allocationPercentage !== undefined ? allocationPercentage : undefined,
        priority: priority !== undefined ? priority : undefined,
        isEssential: isEssential !== undefined ? isEssential : undefined,
        autoAllocate: autoAllocate !== undefined ? autoAllocate : undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
      },
    });
    
    // Calculate progress percentage
    const progress = Number(updatedJar.targetAmount) > 0 
      ? Math.min(100, Math.round((Number(updatedJar.currentAmount) / Number(updatedJar.targetAmount)) * 100)) 
      : 0;
    
    // Calculate shortfall
    const shortfall = Math.max(0, Number(updatedJar.targetAmount) - Number(updatedJar.currentAmount));
    
    // Format response
    const response = {
      jar: {
        ...updatedJar,
        progress,
        shortfall,
      },
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`Error updating jar ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update jar' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/jars/[id] - Delete a jar
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if jar exists
    const existingJar = await prisma.jar.findUnique({
      where: { id },
    });
    
    if (!existingJar) {
      return NextResponse.json(
        { error: 'Jar not found' },
        { status: 404 }
      );
    }
    
    // Delete jar (cascade will handle allocations)
    await prisma.jar.delete({
      where: { id },
    });
    
    return NextResponse.json(
      { message: 'Jar deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting jar ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete jar' },
      { status: 500 }
    );
  }
}

// POST /api/v1/jars/[id]/allocate - Allocate funds to a specific jar
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { amount, reason } = body;
    
    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }
    
    // Check if jar exists
    const existingJar = await prisma.jar.findUnique({
      where: { id },
    });
    
    if (!existingJar) {
      return NextResponse.json(
        { error: 'Jar not found' },
        { status: 404 }
      );
    }
    
    // Perform allocation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update jar amount
      const updatedJar = await tx.jar.update({
        where: { id },
        data: {
          currentAmount: {
            increment: amount,
          },
        },
      });
      
      // Create allocation record
      const allocation = await tx.jarAllocation.create({
        data: {
          jarId: id,
          amount,
          reason: reason || 'manual',
        },
      });
      
      return {
        jar: updatedJar,
        allocation,
      };
    });
    
    // Calculate progress percentage
    const progress = Number(result.jar.targetAmount) > 0 
      ? Math.min(100, Math.round((Number(result.jar.currentAmount) / Number(result.jar.targetAmount)) * 100)) 
      : 0;
    
    // Calculate shortfall
    const shortfall = Math.max(0, Number(result.jar.targetAmount) - Number(result.jar.currentAmount));
    
    // Format response
    const response = {
      jar: {
        ...result.jar,
        progress,
        shortfall,
      },
      allocation: result.allocation,
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`Error allocating to jar ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to allocate to jar' },
      { status: 500 }
    );
  }
}
