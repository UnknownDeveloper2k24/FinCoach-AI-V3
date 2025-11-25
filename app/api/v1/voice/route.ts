import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/v1/voice/query - Process voice query
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, query } = body;
    
    if (!userId || !query) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, query' },
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
        assets: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Process query to determine intent
    const intent = determineIntent(query);
    
    // Generate response based on intent
    const response = await generateResponse(intent, query, user);
    
    // Log voice interaction
    await prisma.voiceInteraction.create({
      data: {
        userId,
        query,
        intent,
        response: response.text,
        timestamp: new Date(),
      },
    });
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error processing voice query:', error);
    return NextResponse.json(
      { error: 'Failed to process voice query' },
      { status: 500 }
    );
  }
}

// Helper function to determine intent from query
function determineIntent(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Check for balance/account related queries
  if (
    lowerQuery.includes('balance') || 
    lowerQuery.includes('account') || 
    lowerQuery.includes('money') ||
    lowerQuery.includes('how much') ||
    lowerQuery.includes('available')
  ) {
    return 'balance';
  }
  
  // Check for spending related queries
  if (
    lowerQuery.includes('spend') || 
    lowerQuery.includes('spent') || 
    lowerQuery.includes('spending') ||
    lowerQuery.includes('expense') ||
    lowerQuery.includes('transaction')
  ) {
    return 'spending';
  }
  
  // Check for cashflow related queries
  if (
    lowerQuery.includes('cashflow') || 
    lowerQuery.includes('cash flow') || 
    lowerQuery.includes('burn rate') ||
    lowerQuery.includes('run out') ||
    lowerQuery.includes('safe to spend')
  ) {
    return 'cashflow';
  }
  
  // Check for jar related queries
  if (
    lowerQuery.includes('jar') || 
    lowerQuery.includes('allocation') || 
    lowerQuery.includes('allocate')
  ) {
    return 'jars';
  }
  
  // Check for goal related queries
  if (
    lowerQuery.includes('goal') || 
    lowerQuery.includes('target') || 
    lowerQuery.includes('saving for')
  ) {
    return 'goals';
  }
  
  // Check for budget related queries
  if (
    lowerQuery.includes('budget') || 
    lowerQuery.includes('limit') || 
    lowerQuery.includes('category')
  ) {
    return 'budget';
  }
  
  // Check for investment/asset related queries
  if (
    lowerQuery.includes('invest') || 
    lowerQuery.includes('portfolio') || 
    lowerQuery.includes('stock') ||
    lowerQuery.includes('asset') ||
    lowerQuery.includes('market')
  ) {
    return 'investments';
  }
  
  // Check for advice related queries
  if (
    lowerQuery.includes('advice') || 
    lowerQuery.includes('suggest') || 
    lowerQuery.includes('recommend') ||
    lowerQuery.includes('should i') ||
    lowerQuery.includes('help me')
  ) {
    return 'advice';
  }
  
  // Default to general intent
  return 'general';
}

// Helper function to generate response based on intent
async function generateResponse(intent: string, query: string, user: any): Promise<{ text: string, data?: any }> {
  switch (intent) {
    case 'balance':
      return generateBalanceResponse(user);
    
    case 'spending':
      return generateSpendingResponse(user, query);
    
    case 'cashflow':
      return generateCashflowResponse(user);
    
    case 'jars':
      return generateJarsResponse(user, query);
    
    case 'goals':
      return generateGoalsResponse(user, query);
    
    case 'budget':
      return generateBudgetResponse(user, query);
    
    case 'investments':
      return generateInvestmentsResponse(user, query);
    
    case 'advice':
      return generateAdviceResponse(user, query);
    
    case 'general':
    default:
      return {
        text: "I can help with your finances. Ask about your balance, spending, cashflow, jars, goals, budget, or investments.",
      };
  }
}

// Helper function for balance responses
function generateBalanceResponse(user: any): { text: string, data?: any } {
  // Calculate total balance across all accounts
  const totalBalance = user.accounts.reduce(
    (sum: number, account: any) => sum + Number(account.balance),
    0
  );
  
  // Get primary account
  const primaryAccount = user.accounts.find((a: any) => a.isPrimary) || user.accounts[0];
  
  if (!primaryAccount) {
    return {
      text: "You don't have any accounts set up yet.",
    };
  }
  
  // Format response
  const response = {
    text: `Your total balance is ₹${totalBalance.toFixed(2)}. Your primary account has ₹${Number(primaryAccount.balance).toFixed(2)}.`,
    data: {
      totalBalance,
      accounts: user.accounts.map((account: any) => ({
        name: account.accountName,
        balance: account.balance,
      })),
    },
  };
  
  return response;
}

// Helper function for spending responses
function generateSpendingResponse(user: any, query: string): { text: string, data?: any } {
  const lowerQuery = query.toLowerCase();
  
  // Check if query is about a specific category
  let category = null;
  
  if (user.spendingPatterns && user.spendingPatterns.length > 0) {
    for (const pattern of user.spendingPatterns) {
      if (lowerQuery.includes(pattern.category.toLowerCase())) {
        category = pattern.category;
        break;
      }
    }
  }
  
  if (category) {
    // Get spending pattern for specific category
    const pattern = user.spendingPatterns.find((p: any) => p.category === category);
    
    if (pattern) {
      return {
        text: `You spend about ₹${Number(pattern.averageAmount).toFixed(2)} monthly on ${category}. ${pattern.frequency === 'monthly' ? 'This is a regular monthly expense.' : ''}`,
        data: {
          category,
          averageAmount: pattern.averageAmount,
          frequency: pattern.frequency,
        },
      };
    }
  }
  
  // Default to top spending categories
  if (user.spendingPatterns && user.spendingPatterns.length > 0) {
    const topCategories = [...user.spendingPatterns]
      .sort((a, b) => Number(b.averageAmount) - Number(a.averageAmount))
      .slice(0, 3);
    
    const categoryList = topCategories
      .map(cat => `${cat.category} (₹${Number(cat.averageAmount).toFixed(2)})`)
      .join(', ');
    
    return {
      text: `Your top spending categories are ${categoryList}.`,
      data: {
        topCategories: topCategories.map(cat => ({
          category: cat.category,
          amount: cat.averageAmount,
        })),
      },
    };
  }
  
  return {
    text: "I don't have enough spending data to analyze yet.",
  };
}

// Helper function for cashflow responses
function generateCashflowResponse(user: any): { text: string, data?: any } {
  if (!user.cashflowAnalysis) {
    return {
      text: "I don't have enough data to analyze your cashflow yet.",
    };
  }
  
  const cashflow = user.cashflowAnalysis;
  
  // Format response based on cashflow situation
  let responseText = '';
  
  if (cashflow.runoutDays < 14) {
    responseText = `Warning: at your current rate, you'll run out of cash in ${cashflow.runoutDays} days. Your safe-to-spend today is ₹${Number(cashflow.safeToSpendToday).toFixed(2)}.`;
  } else {
    responseText = `Your safe-to-spend today is ₹${Number(cashflow.safeToSpendToday).toFixed(2)}. Your daily burn rate is ₹${Number(cashflow.dailyBurnRate).toFixed(2)}.`;
  }
  
  return {
    text: responseText,
    data: {
      safeToSpendToday: cashflow.safeToSpendToday,
      dailyBurnRate: cashflow.dailyBurnRate,
      runoutDays: cashflow.runoutDays,
      trend: cashflow.trend,
    },
  };
}

// Helper function for jars responses
function generateJarsResponse(user: any, query: string): { text: string, data?: any } {
  if (!user.jars || user.jars.length === 0) {
    return {
      text: "You don't have any jars set up yet.",
    };
  }
  
  const lowerQuery = query.toLowerCase();
  
  // Check if query is about a specific jar
  let specificJar = null;
  
  for (const jar of user.jars) {
    if (lowerQuery.includes(jar.name.toLowerCase())) {
      specificJar = jar;
      break;
    }
  }
  
  if (specificJar) {
    // Calculate progress percentage
    const progress = Number(specificJar.targetAmount) > 0 
      ? Math.min(100, Math.round((Number(specificJar.currentAmount) / Number(specificJar.targetAmount)) * 100)) 
      : 0;
    
    // Calculate shortfall
    const shortfall = Math.max(0, Number(specificJar.targetAmount) - Number(specificJar.currentAmount));
    
    return {
      text: `Your ${specificJar.name} jar has ₹${Number(specificJar.currentAmount).toFixed(2)} of ₹${Number(specificJar.targetAmount).toFixed(2)} (${progress}% filled).`,
      data: {
        jar: {
          name: specificJar.name,
          currentAmount: specificJar.currentAmount,
          targetAmount: specificJar.targetAmount,
          progress,
          shortfall,
        },
      },
    };
  }
  
  // Default to essential jars with shortfalls
  const essentialJarsWithShortfall = user.jars
    .filter((jar: any) => 
      jar.isEssential && 
      Number(jar.currentAmount) < Number(jar.targetAmount)
    )
    .sort((a: any, b: any) => {
      const aShortfall = Number(a.targetAmount) - Number(a.currentAmount);
      const bShortfall = Number(b.targetAmount) - Number(b.currentAmount);
      return bShortfall - aShortfall;
    });
  
  if (essentialJarsWithShortfall.length > 0) {
    const topJar = essentialJarsWithShortfall[0];
    const shortfall = Number(topJar.targetAmount) - Number(topJar.currentAmount);
    
    return {
      text: `Your ${topJar.name} jar needs attention. It's short by ₹${shortfall.toFixed(2)}.`,
      data: {
        jar: {
          name: topJar.name,
          currentAmount: topJar.currentAmount,
          targetAmount: topJar.targetAmount,
          shortfall,
        },
      },
    };
  }
  
  // If no essential jars with shortfall, give overall jar status
  const totalJarAmount = user.jars.reduce(
    (sum: number, jar: any) => sum + Number(jar.currentAmount),
    0
  );
  
  return {
    text: `You have ${user.jars.length} jars with a total of ₹${totalJarAmount.toFixed(2)} allocated.`,
    data: {
      jarCount: user.jars.length,
      totalAmount: totalJarAmount,
    },
  };
}

// Helper function for goals responses
function generateGoalsResponse(user: any, query: string): { text: string, data?: any } {
  if (!user.financialGoals || user.financialGoals.length === 0) {
    return {
      text: "You don't have any financial goals set up yet.",
    };
  }
  
  const lowerQuery = query.toLowerCase();
  
  // Check if query is about a specific goal
  let specificGoal = null;
  
  for (const goal of user.financialGoals) {
    if (lowerQuery.includes(goal.name.toLowerCase())) {
      specificGoal = goal;
      break;
    }
  }
  
  if (specificGoal) {
    // Calculate progress percentage
    const progress = Number(specificGoal.targetAmount) > 0 
      ? Math.min(100, Math.round((Number(specificGoal.currentAmount) / Number(specificGoal.targetAmount)) * 100)) 
      : 0;
    
    // Format target date if exists
    let dateInfo = '';
    if (specificGoal.targetDate) {
      const targetDate = new Date(specificGoal.targetDate);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      dateInfo = ` You have ${daysRemaining} days remaining to reach this goal.`;
    }
    
    return {
      text: `Your ${specificGoal.name} goal is ${progress}% complete with ₹${Number(specificGoal.currentAmount).toFixed(2)} saved.${dateInfo}`,
      data: {
        goal: {
          name: specificGoal.name,
          currentAmount: specificGoal.currentAmount,
          targetAmount: specificGoal.targetAmount,
          progress,
          targetDate: specificGoal.targetDate,
        },
      },
    };
  }
  
  // Default to closest goal
  const activeGoals = user.financialGoals.filter((goal: any) => goal.status === 'active');
  
  if (activeGoals.length === 0) {
    return {
      text: "You don't have any active financial goals.",
    };
  }
  
  // Find goal with closest target date
  const now = new Date();
  let closestGoal = activeGoals[0];
  let closestDays = closestGoal.targetDate 
    ? Math.round((new Date(closestGoal.targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : Number.MAX_SAFE_INTEGER;
  
  for (const goal of activeGoals) {
    if (goal.targetDate) {
      const daysRemaining = Math.round((new Date(goal.targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0 && daysRemaining < closestDays) {
        closestGoal = goal;
        closestDays = daysRemaining;
      }
    }
  }
  
  // Calculate progress percentage
  const progress = Number(closestGoal.targetAmount) > 0 
    ? Math.min(100, Math.round((Number(closestGoal.currentAmount) / Number(closestGoal.targetAmount)) * 100)) 
    : 0;
  
  return {
    text: `Your closest goal is ${closestGoal.name} (${progress}% complete). You have ${closestDays} days remaining to reach it.`,
    data: {
      goal: {
        name: closestGoal.name,
        currentAmount: closestGoal.currentAmount,
        targetAmount: closestGoal.targetAmount,
        progress,
        daysRemaining: closestDays,
      },
    },
  };
}

// Helper function for budget responses
function generateBudgetResponse(user: any, query: string): { text: string, data?: any } {
  if (!user.budgetCategories || user.budgetCategories.length === 0) {
    return {
      text: "You don't have any budget categories set up yet.",
    };
  }
  
  const lowerQuery = query.toLowerCase();
  
  // Check if query is about a specific category
  let specificCategory = null;
  
  for (const category of user.budgetCategories) {
    if (lowerQuery.includes(category.name.toLowerCase())) {
      specificCategory = category;
      break;
    }
  }
  
  if (specificCategory) {
    // Get transactions for this month in this category
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Calculate spent amount (in a real implementation, this would query transactions)
    // For this example, we'll simulate it
    const spentAmount = Number(specificCategory.limit) * Math.random() * 0.8;
    const remaining = Math.max(0, Number(specificCategory.limit) - spentAmount);
    const percentUsed = Number(specificCategory.limit) > 0 
      ? Math.min(100, Math.round((spentAmount / Number(specificCategory.limit)) * 100)) 
      : 0;
    
    return {
      text: `You've spent ₹${spentAmount.toFixed(2)} of your ₹${Number(specificCategory.limit).toFixed(2)} ${specificCategory.name} budget (${percentUsed}%).`,
      data: {
        category: {
          name: specificCategory.name,
          limit: specificCategory.limit,
          spent: spentAmount,
          remaining,
          percentUsed,
        },
      },
    };
  }
  
  // Default to overall budget status
  const totalBudget = user.budgetCategories.reduce(
    (sum: number, category: any) => sum + Number(category.limit),
    0
  );
  
  // Simulate total spent (in a real implementation, this would query transactions)
  const totalSpent = totalBudget * Math.random() * 0.7;
  const percentUsed = totalBudget > 0 
    ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) 
    : 0;
  
  return {
    text: `You've spent ₹${totalSpent.toFixed(2)} of your ₹${totalBudget.toFixed(2)} total budget (${percentUsed}%).`,
    data: {
      budget: {
        total: totalBudget,
        spent: totalSpent,
        remaining: totalBudget - totalSpent,
        percentUsed,
      },
    },
  };
}

// Helper function for investments responses
function generateInvestmentsResponse(user: any, query: string): { text: string, data?: any } {
  if (!user.assets || user.assets.length === 0) {
    return {
      text: "You don't have any investments or assets tracked yet.",
    };
  }
  
  const lowerQuery = query.toLowerCase();
  
  // Check if query is about a specific asset
  let specificAsset = null;
  
  for (const asset of user.assets) {
    if (
      (asset.name && lowerQuery.includes(asset.name.toLowerCase())) ||
      (asset.ticker && lowerQuery.includes(asset.ticker.toLowerCase()))
    ) {
      specificAsset = asset;
      break;
    }
  }
  
  if (specificAsset) {
    // Calculate profit/loss percentage
    const profitLossPercentage = Number(specificAsset.profitLossPercentage).toFixed(2);
    const profitLossText = Number(specificAsset.profitLoss) >= 0 ? 'profit' : 'loss';
    
    return {
      text: `Your ${specificAsset.name} is worth ₹${Number(specificAsset.currentValue).toFixed(2)}, a ${profitLossText} of ${profitLossPercentage}%.`,
      data: {
        asset: {
          name: specificAsset.name,
          ticker: specificAsset.ticker,
          currentValue: specificAsset.currentValue,
          profitLoss: specificAsset.profitLoss,
          profitLossPercentage: specificAsset.profitLossPercentage,
        },
      },
    };
  }
  
  // Default to portfolio summary
  const totalValue = user.assets.reduce(
    (sum: number, asset: any) => sum + Number(asset.currentValue),
    0
  );
  
  const totalProfitLoss = user.assets.reduce(
    (sum: number, asset: any) => sum + Number(asset.profitLoss),
    0
  );
  
  const profitLossText = totalProfitLoss >= 0 ? 'profit' : 'loss';
  
  return {
    text: `Your portfolio is worth ₹${totalValue.toFixed(2)}, with a total ${profitLossText} of ₹${Math.abs(totalProfitLoss).toFixed(2)}.`,
    data: {
      portfolio: {
        totalValue,
        totalProfitLoss,
        assetCount: user.assets.length,
      },
    },
  };
}

// Helper function for advice responses
async function generateAdviceResponse(user: any, query: string): Promise<{ text: string, data?: any }> {
  // Create advice record
  const advice = await prisma.financialAdvice.create({
    data: {
      userId: user.id,
      query,
      advice: generateGenericAdvice(query, user),
      category: determineAdviceCategory(query),
      confidenceScore: 70,
    },
  });
  
  return {
    text: advice.advice,
    data: {
      advice: {
        id: advice.id,
        category: advice.category,
        confidenceScore: advice.confidenceScore,
      },
    },
  };
}

// Helper function to determine advice category
function determineAdviceCategory(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('save') || lowerQuery.includes('saving')) {
    return 'savings';
  } else if (lowerQuery.includes('budget') || lowerQuery.includes('spending')) {
    return 'budget';
  } else if (lowerQuery.includes('debt') || lowerQuery.includes('loan')) {
    return 'debt';
  } else if (lowerQuery.includes('invest') || lowerQuery.includes('investment')) {
    return 'investment';
  } else if (lowerQuery.includes('emergency') || lowerQuery.includes('fund')) {
    return 'emergency';
  } else if (lowerQuery.includes('income') || lowerQuery.includes('earn')) {
    return 'income';
  } else {
    return 'general';
  }
}

// Helper function to generate generic advice
function generateGenericAdvice(query: string, user: any): string {
  const category = determineAdviceCategory(query);
  
  switch (category) {
    case 'savings':
      return "Save 20% of your income. Start with an emergency fund, then focus on your goals.";
    
    case 'budget':
      return "Use the 50/30/20 rule: 50% on needs, 30% on wants, and 20% on savings.";
    
    case 'debt':
      return "Prioritize high-interest debt first. Keep total debt payments below 36% of income.";
    
    case 'investment':
      return "Start investing after building an emergency fund. Consider low-cost index funds.";
    
    case 'emergency':
      return "Aim for 3-6 months of essential expenses in your emergency fund.";
    
    case 'income':
      return "Diversify income sources for financial stability. Consider skills you can monetize.";
    
    case 'general':
    default:
      return "Focus on fundamentals: emergency fund, eliminate high-interest debt, save 20%, invest for goals.";
  }
}
