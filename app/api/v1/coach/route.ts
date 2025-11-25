import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/coach/insights - Get financial insights for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const category = req.nextUrl.searchParams.get('category');
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
    
    // Add category filter if provided
    if (category) {
      query.category = category;
    }
    
    // Get insights
    const insights = await prisma.financialInsight.findMany({
      where: query,
      orderBy: [
        { impactScore: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit ? parseInt(limit) : undefined,
    });
    
    return NextResponse.json({ insights }, { status: 200 });
  } catch (error) {
    console.error('Error fetching financial insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial insights' },
      { status: 500 }
    );
  }
}

// POST /api/v1/coach/insights - Generate financial insights
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
      include: {
        profile: true,
        accounts: true,
        cashflowAnalysis: true,
        jars: true,
        financialGoals: true,
        spendingPatterns: true,
        budgetCategories: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get recent transactions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { transactionDate: 'desc' },
    });
    
    // Generate insights
    const generatedInsights = [];
    
    // 1. Cashflow Insights
    if (user.cashflowAnalysis) {
      const cashflow = user.cashflowAnalysis;
      
      if (cashflow.runoutDays < 30) {
        // Cash runout insight
        const cashRunoutInsight = await prisma.financialInsight.create({
          data: {
            userId,
            title: 'Cash Runout Risk',
            message: `At your current spending rate, your cash may run out in ${cashflow.runoutDays} days. Consider reducing non-essential expenses.`,
            category: 'cashflow',
            confidenceScore: 85,
            impactScore: 90,
            source: 'cashflow_analysis',
          },
        });
        
        generatedInsights.push(cashRunoutInsight);
      }
      
      if (cashflow.trend === 'declining') {
        // Declining cashflow insight
        const decliningCashflowInsight = await prisma.financialInsight.create({
          data: {
            userId,
            title: 'Declining Cashflow',
            message: 'Your cashflow trend is declining. Review your recent spending to identify areas for reduction.',
            category: 'cashflow',
            confidenceScore: 75,
            impactScore: 80,
            source: 'cashflow_analysis',
          },
        });
        
        generatedInsights.push(decliningCashflowInsight);
      }
    }
    
    // 2. Spending Pattern Insights
    if (user.spendingPatterns.length > 0) {
      // Top spending category insight
      const topSpendingCategory = user.spendingPatterns
        .sort((a, b) => Number(b.averageAmount) - Number(a.averageAmount))[0];
      
      if (topSpendingCategory) {
        const topCategoryInsight = await prisma.financialInsight.create({
          data: {
            userId,
            title: 'Top Spending Category',
            message: `Your highest spending is in ${topSpendingCategory.category} (₹${Number(topSpendingCategory.averageAmount).toFixed(2)}/month). Consider if this aligns with your priorities.`,
            category: 'spending',
            confidenceScore: 90,
            impactScore: 70,
            source: 'spending_analysis',
          },
        });
        
        generatedInsights.push(topCategoryInsight);
      }
      
      // Subscription insight
      const subscriptions = user.spendingPatterns.filter(p => p.isRecurringSubscription);
      const totalSubscriptionCost = subscriptions.reduce(
        (sum, sub) => sum + Number(sub.subscriptionCost || 0),
        0
      );
      
      if (subscriptions.length > 0 && user.profile?.monthlyIncome) {
        const subscriptionPercentage = (totalSubscriptionCost / Number(user.profile.monthlyIncome)) * 100;
        
        if (subscriptionPercentage > 10) {
          const subscriptionInsight = await prisma.financialInsight.create({
            data: {
              userId,
              title: 'High Subscription Costs',
              message: `Your subscriptions total ₹${totalSubscriptionCost.toFixed(2)}/month (${Math.round(subscriptionPercentage)}% of income). Review for unused services.`,
              category: 'spending',
              confidenceScore: 85,
              impactScore: 75,
              source: 'spending_analysis',
            },
          });
          
          generatedInsights.push(subscriptionInsight);
        }
      }
    }
    
    // 3. Jar System Insights
    if (user.jars.length > 0) {
      // Essential jar shortfall insight
      const essentialJarsWithShortfall = user.jars
        .filter(jar => 
          jar.isEssential && 
          Number(jar.currentAmount) < Number(jar.targetAmount)
        );
      
      if (essentialJarsWithShortfall.length > 0) {
        const totalShortfall = essentialJarsWithShortfall.reduce(
          (sum, jar) => sum + (Number(jar.targetAmount) - Number(jar.currentAmount)),
          0
        );
        
        const jarShortfallInsight = await prisma.financialInsight.create({
          data: {
            userId,
            title: 'Essential Jar Shortfalls',
            message: `Your essential jars are short by ₹${totalShortfall.toFixed(2)}. Prioritize filling these to avoid financial stress.`,
            category: 'jars',
            confidenceScore: 90,
            impactScore: 85,
            source: 'jar_analysis',
          },
        });
        
        generatedInsights.push(jarShortfallInsight);
      }
    }
    
    // 4. Goal Planning Insights
    if (user.financialGoals.length > 0) {
      // Off-track goals insight
      const activeGoals = user.financialGoals.filter(goal => goal.status === 'active');
      
      const offTrackGoals = activeGoals.filter(goal => {
        if (!goal.targetDate) return false;
        
        const now = new Date();
        const targetDate = new Date(goal.targetDate);
        const totalDays = (targetDate.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        const daysElapsed = (now.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        
        // Calculate expected progress based on time elapsed
        const expectedProgress = (daysElapsed / totalDays) * 100;
        const actualProgress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
        
        // If actual progress is significantly behind expected progress
        return actualProgress < (expectedProgress * 0.7);
      });
      
      if (offTrackGoals.length > 0) {
        const goalInsight = await prisma.financialInsight.create({
          data: {
            userId,
            title: 'Goals Off Track',
            message: `${offTrackGoals.length} of your financial goals are behind schedule. Consider increasing contributions or adjusting timelines.`,
            category: 'goals',
            confidenceScore: 80,
            impactScore: 75,
            source: 'goal_analysis',
          },
        });
        
        generatedInsights.push(goalInsight);
      }
    }
    
    // 5. Budget Insights
    if (user.budgetCategories.length > 0) {
      // Over budget categories insight
      const overBudgetCategories = await Promise.all(
        user.budgetCategories.map(async (category) => {
          // Get transactions for this month in this category
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          
          const categoryTransactions = transactions.filter(tx => 
            tx.category === category.name && 
            new Date(tx.transactionDate) >= startOfMonth
          );
          
          // Calculate spent amount
          const spentAmount = categoryTransactions.reduce(
            (sum, tx) => sum + Number(tx.amount),
            0
          );
          
          return {
            ...category,
            spent: spentAmount,
            overBudget: spentAmount > Number(category.limit),
            overageAmount: Math.max(0, spentAmount - Number(category.limit)),
          };
        })
      );
      
      const categoriesOverBudget = overBudgetCategories.filter(cat => cat.overBudget);
      
      if (categoriesOverBudget.length > 0) {
        const budgetInsight = await prisma.financialInsight.create({
          data: {
            userId,
            title: 'Budget Categories Exceeded',
            message: `You've exceeded your budget in ${categoriesOverBudget.length} categories. Adjust spending or revise limits if needed.`,
            category: 'budget',
            confidenceScore: 95,
            impactScore: 80,
            source: 'budget_analysis',
          },
        });
        
        generatedInsights.push(budgetInsight);
      }
    }
    
    // 6. Savings Rate Insight
    if (user.profile?.monthlyIncome) {
      const monthlyIncome = Number(user.profile.monthlyIncome);
      const monthlyExpenses = transactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
      
      const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
      
      if (savingsRate < 20) {
        const savingsInsight = await prisma.financialInsight.create({
          data: {
            userId,
            title: 'Low Savings Rate',
            message: `Your current savings rate is ${Math.max(0, Math.round(savingsRate))}%. Aim for at least 20% to build financial security.`,
            category: 'savings',
            confidenceScore: 85,
            impactScore: 85,
            source: 'income_expense_analysis',
          },
        });
        
        generatedInsights.push(savingsInsight);
      }
    }
    
    return NextResponse.json({ insights: generatedInsights }, { status: 200 });
  } catch (error) {
    console.error('Error generating financial insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate financial insights' },
      { status: 500 }
    );
  }
}

// POST /api/v1/coach/advice - Get personalized financial advice
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'advice') {
    try {
      const body = await req.json();
      const { userId, query } = body;
      
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
          profile: true,
          cashflowAnalysis: true,
          spendingPatterns: true,
        },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Generate advice based on query and user data
      let advice = '';
      let category = 'general';
      let confidenceScore = 70;
      
      // Process query to determine advice category
      const lowerQuery = query ? query.toLowerCase() : '';
      
      if (lowerQuery.includes('save') || lowerQuery.includes('saving')) {
        category = 'savings';
        
        // Get savings potential from cashflow
        if (user.cashflowAnalysis && user.profile?.monthlyIncome) {
          const monthlyIncome = Number(user.profile.monthlyIncome);
          const dailyBurnRate = Number(user.cashflowAnalysis.dailyBurnRate);
          const monthlyExpenses = dailyBurnRate * 30;
          const savingsPotential = monthlyIncome - monthlyExpenses;
          
          if (savingsPotential > 0) {
            advice = `Based on your cashflow, you can save approximately ₹${savingsPotential.toFixed(2)} per month. Start with an emergency fund, then focus on your goals.`;
            confidenceScore = 85;
          } else {
            advice = `Your expenses currently exceed your income. Focus on reducing expenses in your top spending categories before establishing a savings plan.`;
            confidenceScore = 80;
          }
        } else {
          advice = `Start by saving 20% of your income. Create an emergency fund with 3-6 months of expenses before other savings goals.`;
        }
      } else if (lowerQuery.includes('budget') || lowerQuery.includes('spending')) {
        category = 'budget';
        
        // Get top spending categories
        if (user.spendingPatterns && user.spendingPatterns.length > 0) {
          const topCategories = user.spendingPatterns
            .sort((a, b) => Number(b.averageAmount) - Number(a.averageAmount))
            .slice(0, 3);
          
          const categoryList = topCategories
            .map(cat => `${cat.category} (₹${Number(cat.averageAmount).toFixed(2)}/month)`)
            .join(', ');
          
          advice = `Your top spending categories are ${categoryList}. Consider using the 50/30/20 rule: 50% on needs, 30% on wants, and 20% on savings.`;
          confidenceScore = 90;
        } else {
          advice = `Create a budget using the 50/30/20 rule: 50% on needs, 30% on wants, and 20% on savings. Track expenses to identify areas for improvement.`;
        }
      } else if (lowerQuery.includes('debt') || lowerQuery.includes('loan')) {
        category = 'debt';
        advice = `Prioritize high-interest debt first. Aim to keep total debt payments below 36% of your income. Consider the avalanche method for faster payoff.`;
      } else if (lowerQuery.includes('invest') || lowerQuery.includes('investment')) {
        category = 'investment';
        advice = `Start investing only after building an emergency fund. Consider low-cost index funds for long-term growth. Diversify across asset classes based on your risk tolerance.`;
      } else if (lowerQuery.includes('emergency') || lowerQuery.includes('fund')) {
        category = 'emergency';
        advice = `Aim for 3-6 months of essential expenses in your emergency fund. Keep it in a liquid, easily accessible account separate from your daily spending.`;
      } else if (lowerQuery.includes('income') || lowerQuery.includes('earn')) {
        category = 'income';
        advice = `Diversify your income sources to increase financial stability. Consider skills you can monetize or passive income opportunities aligned with your expertise.`;
      } else {
        // General financial advice
        advice = `Focus on the fundamentals: build an emergency fund, eliminate high-interest debt, save 20% of income, and invest for long-term goals.`;
      }
      
      // Create advice record
      const adviceRecord = await prisma.financialAdvice.create({
        data: {
          userId,
          query: query || 'General advice',
          advice,
          category,
          confidenceScore,
        },
      });
      
      return NextResponse.json({ advice: adviceRecord }, { status: 200 });
    } catch (error) {
      console.error('Error generating financial advice:', error);
      return NextResponse.json(
        { error: 'Failed to generate financial advice' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'advice'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}
