import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/users/[id] - Get a specific user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/users/[id] - Update a user
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, phone, profile } = body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user and profile in a transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user
      const user = await tx.user.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          phone: phone !== undefined ? phone : undefined,
        },
        include: { profile: true },
      });
      
      // Update profile if provided
      if (profile) {
        await tx.profile.update({
          where: { userId: id },
          data: {
            monthlyIncome: profile.monthlyIncome !== undefined ? profile.monthlyIncome : undefined,
            riskTolerance: profile.riskTolerance !== undefined ? profile.riskTolerance : undefined,
            currency: profile.currency !== undefined ? profile.currency : undefined,
            timezone: profile.timezone !== undefined ? profile.timezone : undefined,
            preferredLanguage: profile.preferredLanguage !== undefined ? profile.preferredLanguage : undefined,
            notificationsEnabled: profile.notificationsEnabled !== undefined ? profile.notificationsEnabled : undefined,
            voiceEnabled: profile.voiceEnabled !== undefined ? profile.voiceEnabled : undefined,
          },
        });
      }
      
      // Fetch updated user with profile
      return tx.user.findUnique({
        where: { id },
        include: { profile: true },
      });
    });
    
    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/users/[id] - Delete a user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });
    
    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
