import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/alerts - Get alerts for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const status = req.nextUrl.searchParams.get('status');
    const priority = req.nextUrl.searchParams.get('priority');
    const limit = req.nextUrl.searchParams.get('limit');
    
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
    
    // Build query
    const query: any = { userId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add priority filter if provided
    if (priority) {
      query.priority = priority;
    }
    
    // Get alerts
    const alerts = await prisma.alert.findMany({
      where: query,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit ? parseInt(limit) : undefined,
    });
    
    return NextResponse.json({ alerts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// POST /api/v1/alerts - Create a new alert
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId, 
      title, 
      message, 
      type, 
      priority, 
      source,
      actionUrl,
      actionText,
      expiresAt,
    } = body;
    
    // Validate required fields
    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, message, type' },
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
    
    // Create alert
    const alert = await prisma.alert.create({
      data: {
        userId,
        title,
        message,
        type,
        priority: priority || 'medium',
        source: source || 'system',
        actionUrl,
        actionText,
        status: 'unread',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    
    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

// POST /api/v1/alerts/generate - Generate alerts based on user data
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'generate') {
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
          accounts: true,
          cashflowAnalysis: true,
          jars: true,
          financialGoals: true,
          spendingPatterns: true,
        },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Generate alerts
      const generatedAlerts = [];
      
      // 1. Cash Runout Alert
      if (user.cashflowAnalysis && user.cashflowAnalysis.runoutDays < 14) {
        const runoutDate = user.cashflowAnalysis.runoutDate;
        const formattedDate = runoutDate ? new Date(runoutDate).toLocaleDateString() : 'soon';
        
        const cashRunoutAlert = await prisma.alert.create({
          data: {
            userId,
            title: 'Cash Runout Warning',
            message: `Based on your current spending, you may run out of cash by ${formattedDate}. Consider reducing expenses or adding funds.`,
            type: 'cashflow',
            priority: user.cashflowAnalysis.runoutDays < 7 ? 'high' : 'medium',
            source: 'cashflow_agent',
            actionUrl: '/money',
            actionText: 'View Cashflow',
            status: 'unread',
          },
        });
        
        generatedAlerts.push(cashRunoutAlert);
      }
      
      // 2. Jar Shortfall Alerts
      const now = new Date();
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const essentialJarsWithShortfall = user.jars
        .filter(jar => 
          jar.isEssential && 
          jar.dueDate && 
          new Date(jar.dueDate) <= sevenDaysFromNow &&
          Number(jar.currentAmount) < Number(jar.targetAmount)
        )
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
      
      for (const jar of essentialJarsWithShortfall) {
        const shortfall = Number(jar.targetAmount) - Number(jar.currentAmount);
        const dueDate = new Date(jar.dueDate!).toLocaleDateString();
        
        const jarShortfallAlert = await prisma.alert.create({
          data: {
            userId,
            title: `${jar.name} Jar Shortfall`,
            message: `Your ${jar.name} jar is short by ₹${shortfall.toFixed(2)} and is due on ${dueDate}.`,
            type: 'jar',
            priority: 'high',
            source: 'jar_agent',
            actionUrl: '/money/jars',
            actionText: 'View Jar',
            status: 'unread',
          },
        });
        
        generatedAlerts.push(jarShortfallAlert);
      }
      
      // 3. Goal Milestone Alerts
      const goals = await prisma.financialGoal.findMany({
        where: { 
          userId,
          status: 'active',
        },
        include: {
          milestones: {
            where: {
              isCompleted: false,
              targetDate: {
                lte: sevenDaysFromNow,
              },
            },
          },
        },
      });
      
      for (const goal of goals) {
        for (const milestone of goal.milestones) {
          const targetDate = new Date(milestone.targetDate!).toLocaleDateString();
          
          const goalMilestoneAlert = await prisma.alert.create({
            data: {
              userId,
              title: `Goal Milestone Approaching`,
              message: `Milestone "${milestone.name}" for your "${goal.name}" goal is due on ${targetDate}.`,
              type: 'goal',
              priority: 'medium',
              source: 'goal_agent',
              actionUrl: '/goals',
              actionText: 'View Goal',
              status: 'unread',
            },
          });
          
          generatedAlerts.push(goalMilestoneAlert);
        }
      }
      
      // 4. Spending Anomaly Alerts
      const spendingAnomalies = user.spendingPatterns.filter(pattern => pattern.hasAnomalies);
      
      if (spendingAnomalies.length > 0) {
        const topAnomaly = spendingAnomalies.sort((a, b) => 
          Number(b.peakDayAmount) - Number(a.peakDayAmount)
        )[0];
        
        const spendingAnomalyAlert = await prisma.alert.create({
          data: {
            userId,
            title: 'Unusual Spending Detected',
            message: `We've detected unusual spending in your ${topAnomaly.category} category. ${topAnomaly.anomalyDescription}`,
            type: 'spending',
            priority: 'medium',
            source: 'spending_agent',
            actionUrl: '/money/spending',
            actionText: 'View Spending',
            status: 'unread',
          },
        });
        
        generatedAlerts.push(spendingAnomalyAlert);
      }
      
      // 5. Low Balance Alerts
      const lowBalanceAccounts = user.accounts.filter(account => 
        Number(account.balance) < Number(account.lowBalanceThreshold)
      );
      
      for (const account of lowBalanceAccounts) {
        const lowBalanceAlert = await prisma.alert.create({
          data: {
            userId,
            title: 'Low Account Balance',
            message: `Your ${account.accountName} balance (₹${Number(account.balance).toFixed(2)}) is below your threshold of ₹${Number(account.lowBalanceThreshold).toFixed(2)}.`,
            type: 'account',
            priority: 'high',
            source: 'account_agent',
            actionUrl: '/money/accounts',
            actionText: 'View Account',
            status: 'unread',
          },
        });
        
        generatedAlerts.push(lowBalanceAlert);
      }
      
      return NextResponse.json({ alerts: generatedAlerts }, { status: 200 });
    } catch (error) {
      console.error('Error generating alerts:', error);
      return NextResponse.json(
        { error: 'Failed to generate alerts' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'generate'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}

// PATCH /api/v1/alerts/[id] - Update alert status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }
    
    // Check if alert exists
    const alert = await prisma.alert.findUnique({
      where: { id },
    });
    
    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }
    
    // Update alert status
    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: { status },
    });
    
    return NextResponse.json({ alert: updatedAlert }, { status: 200 });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/alerts/[id] - Delete an alert
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }
    
    // Check if alert exists
    const alert = await prisma.alert.findUnique({
      where: { id },
    });
    
    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }
    
    // Delete alert
    await prisma.alert.delete({
      where: { id },
    });
    
    return NextResponse.json(
      { message: 'Alert deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}
