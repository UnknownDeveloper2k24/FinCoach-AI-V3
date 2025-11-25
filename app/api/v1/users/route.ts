import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/users - Get all users (admin only in production)
export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });
    
    return NextResponse.json({ users }, { status: 200 });
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
    const { email, name, phone } = body;
    
    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create new user with profile
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        profile: {
          create: {
            // Default profile values
            monthlyIncome: 0,
            riskTolerance: 'moderate',
            currency: 'INR',
            timezone: 'Asia/Calcutta',
          },
        },
      },
      include: {
        profile: true,
      },
    });
    
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
