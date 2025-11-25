import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserManager } from '@/lib/ml';

// GET /api/v1/users - Get all users (admin only)
export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      users,
      count: users.length,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/v1/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, preferences } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        preferences: preferences || {},
      },
    });

    // Initialize user profile using UserManager
    const profile = UserManager.initializeProfile({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      profile,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
