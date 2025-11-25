import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mock user retrieval - replace with real DB query
    return NextResponse.json({
      success: true,
      user: {
        id: 'user-123',
        email: 'user@example.com',
        name: 'User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com',
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
