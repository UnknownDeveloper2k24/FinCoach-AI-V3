import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/v1/jars/[id] - Get a specific jar
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jarId = params.id;

    const jar = await prisma.jar.findUnique({
      where: { id: jarId },
    });

    if (!jar) {
      return NextResponse.json(
        { error: 'Jar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: jar.id,
      name: jar.name,
      target: jar.targetAmount,
      current: jar.currentAmount,
      progress: (jar.currentAmount / jar.targetAmount) * 100,
      category: jar.category,
      priority: jar.priority,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching jar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jar' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/jars/[id] - Update a jar
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jarId = params.id;
    const body = await req.json();
    const { name, targetAmount, currentAmount, category, priority } = body;

    const jar = await prisma.jar.findUnique({
      where: { id: jarId },
    });

    if (!jar) {
      return NextResponse.json(
        { error: 'Jar not found' },
        { status: 404 }
      );
    }

    const updatedJar = await prisma.jar.update({
      where: { id: jarId },
      data: {
        name: name || jar.name,
        targetAmount: targetAmount !== undefined ? parseFloat(targetAmount) : jar.targetAmount,
        currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : jar.currentAmount,
        category: category || jar.category,
        priority: priority !== undefined ? priority : jar.priority,
      },
    });

    return NextResponse.json({
      id: updatedJar.id,
      name: updatedJar.name,
      target: updatedJar.targetAmount,
      current: updatedJar.currentAmount,
      progress: (updatedJar.currentAmount / updatedJar.targetAmount) * 100,
      category: updatedJar.category,
      priority: updatedJar.priority,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating jar:', error);
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
    const jarId = params.id;

    const jar = await prisma.jar.findUnique({
      where: { id: jarId },
    });

    if (!jar) {
      return NextResponse.json(
        { error: 'Jar not found' },
        { status: 404 }
      );
    }

    await prisma.jar.delete({
      where: { id: jarId },
    });

    return NextResponse.json(
      { message: 'Jar deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting jar:', error);
    return NextResponse.json(
      { error: 'Failed to delete jar' },
      { status: 500 }
    );
  }
}
