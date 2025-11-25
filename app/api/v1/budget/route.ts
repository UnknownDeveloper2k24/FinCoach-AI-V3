import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/budget - Get budget for a user
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
    
    // Get budget categories
    const budgetCategories = await prisma.budgetCategory.findMany({
      where: { userId },
      orderBy: [
        { isEssential: 'desc' },
        { name: 'asc' },
      ],
    });
    
    // Get spending patterns for comparison
    const spendingPatterns = await prisma.spendingPattern.findMany({
      where: { userId },
    });
    
    // Calculate budget utilization
    const budgetWithUtilization = await Promise.all(
      budgetCategories.map(async (category) => {
        // Get transactions for this month in this category
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const transactions = await prisma.transaction.findMany({
          where: {
            userId,
            category: category.name,
            type: 'expense',
            transactionDate: {
              gte: startOfMonth,
            },
          },
        });
        
        // Calculate spent amount
        const spentAmount = transactions.reduce(
          (sum, tx) => sum + Number(tx.amount),
          0
        );
        
        // Find matching spending pattern
        const pattern = spendingPatterns.find(p => p.category === category.name);
        
        return {
          ...category,
          spent: spentAmount,
          remaining: Math.max(0, Number(category.limit) - spentAmount),
          percentUsed: Number(category.limit) > 0 
            ? Math.min(100, Math.round((spentAmount / Number(category.limit)) * 100)) 
            : 0,
          averageSpending: pattern?.averageAmount || 0,
        };
      })
    );
    
    // Calculate totals
    const totalBudget = budgetCategories.reduce(
      (sum, category) => sum + Number(category.limit),
      0
    );
    
    const totalSpent = budgetWithUtilization.reduce(
      (sum, category) => sum + Number(category.spent),
      0
    );
    
    // Format response with CRED-like structure
    const response = {
      budget: {
        categories: budgetWithUtilization,
        summary: {
          totalBudget,
          totalSpent,
          remaining: Math.max(0, totalBudget - totalSpent),
          percentUsed: totalBudget > 0 
            ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) 
            : 0,
        },
      },
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

// POST /api/v1/budget/category - Create a new budget category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId, 
      name, 
      limit, 
      isEssential, 
      color, 
      icon,
      description 
    } = body;
    
    // Validate required fields
    if (!userId || !name || !limit) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, limit' },
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
    
    // Check if category already exists
    const existingCategory = await prisma.budgetCategory.findFirst({
      where: {
        userId,
        name,
      },
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Budget category already exists' },
        { status: 400 }
      );
    }
    
    // Create budget category
    const budgetCategory = await prisma.budgetCategory.create({
      data: {
        userId,
        name,
        limit,
        isEssential: isEssential || false,
        color: color || "#3B82F6", // Default blue color
        icon,
        description,
      },
    });
    
    return NextResponse.json({ category: budgetCategory }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget category:', error);
    return NextResponse.json(
      { error: 'Failed to create budget category' },
      { status: 500 }
    );
  }
}

// POST /api/v1/budget/optimize - Get budget optimization suggestions
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'optimize') {
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
        },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Get budget categories
      const budgetCategories = await prisma.budgetCategory.findMany({
        where: { userId },
      });
      
      // Get spending patterns
      const spendingPatterns = await prisma.spendingPattern.findMany({
        where: { userId },
      });
      
      // Get transactions for the last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'expense',
          transactionDate: {
            gte: ninetyDaysAgo,
          },
        },
      });
      
      // Group transactions by category
      const categorizedTransactions: Record<string, any[]> = {};
      
      transactions.forEach(transaction => {
        const category = transaction.category;
        
        if (!categorizedTransactions[category]) {
          categorizedTransactions[category] = [];
        }
        
        categorizedTransactions[category].push(transaction);
      });
      
      // Generate optimization suggestions
      const suggestions = [];
      
      // 1. Identify categories without budget limits
      const categoriesWithoutBudget = Object.keys(categorizedTransactions)
        .filter(category => !budgetCategories.some(bc => bc.name === category))
        .map(category => {
          const categoryTransactions = categorizedTransactions[category];
          const totalSpent = categoryTransactions.reduce(
            (sum, tx) => sum + Number(tx.amount),
            0
          );
          const avgMonthlySpend = totalSpent / 3; // 90 days = 3 months
          
          return {
            category,
            avgMonthlySpend,
            transactionCount: categoryTransactions.length,
          };
        })
        .filter(cat => cat.transactionCount >= 3) // Only suggest categories with at least 3 transactions
        .sort((a, b) => b.avgMonthlySpend - a.avgMonthlySpend);
      
      if (categoriesWithoutBudget.length > 0) {
        suggestions.push({
          type: 'missing_categories',
          title: 'Add Budget Categories',
          description: 'These categories have regular spending but no budget limits.',
          categories: categoriesWithoutBudget.slice(0, 5).map(cat => ({
            name: cat.category,
            suggestedLimit: Math.ceil(cat.avgMonthlySpend * 1.1), // 10% buffer
            avgSpend: cat.avgMonthlySpend,
          })),
        });
      }
      
      // 2. Identify categories with limits too high compared to actual spending
      const overbudgetedCategories = budgetCategories
        .map(category => {
          const pattern = spendingPatterns.find(p => p.category === category.name);
          const avgSpend = pattern?.averageAmount || 0;
          const limit = Number(category.limit);
          
          // If limit is more than 30% higher than average spending
          const percentOverbudgeted = avgSpend > 0 ? ((limit - avgSpend) / avgSpend) * 100 : 0;
          
          return {
            name: category.name,
            limit,
            avgSpend,
            percentOverbudgeted,
            potentialSavings: limit - avgSpend,
          };
        })
        .filter(cat => cat.percentOverbudgeted > 30 && cat.potentialSavings > 0)
        .sort((a, b) => b.potentialSavings - a.potentialSavings);
      
      if (overbudgetedCategories.length > 0) {
        suggestions.push({
          type: 'overbudgeted',
          title: 'Optimize Budget Limits',
          description: 'These categories have limits much higher than your actual spending.',
          categories: overbudgetedCategories.slice(0, 5).map(cat => ({
            name: cat.name,
            currentLimit: cat.limit,
            suggestedLimit: Math.ceil(cat.avgSpend * 1.1), // 10% buffer
            potentialSavings: Math.floor(cat.potentialSavings),
          })),
          totalPotentialSavings: Math.floor(
            overbudgetedCategories.reduce((sum, cat) => sum + cat.potentialSavings, 0)
          ),
        });
      }
      
      // 3. Identify categories consistently over budget
      const overSpentCategories = budgetCategories
        .map(category => {
          const categoryTransactions = categorizedTransactions[category.name] || [];
          
          // Skip categories with no transactions
          if (categoryTransactions.length === 0) {
            return null;
          }
          
          // Group by month
          const monthlySpending: Record<string, number> = {};
          
          categoryTransactions.forEach(tx => {
            const date = new Date(tx.transactionDate);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            if (!monthlySpending[monthKey]) {
              monthlySpending[monthKey] = 0;
            }
            
            monthlySpending[monthKey] += Number(tx.amount);
          });
          
          // Check how many months were over budget
          const monthsOverBudget = Object.values(monthlySpending)
            .filter(amount => amount > Number(category.limit))
            .length;
          
          const totalMonths = Object.keys(monthlySpending).length;
          const percentMonthsOverBudget = totalMonths > 0 ? (monthsOverBudget / totalMonths) * 100 : 0;
          
          // Calculate average overspend
          const avgMonthlySpend = Object.values(monthlySpending).reduce((sum, amount) => sum + amount, 0) / totalMonths;
          const avgOverspend = Math.max(0, avgMonthlySpend - Number(category.limit));
          
          return {
            name: category.name,
            limit: Number(category.limit),
            avgMonthlySpend,
            monthsOverBudget,
            totalMonths,
            percentMonthsOverBudget,
            avgOverspend,
          };
        })
        .filter(cat => cat && cat.percentMonthsOverBudget > 50 && cat.avgOverspend > 0)
        .sort((a, b) => b!.avgOverspend - a!.avgOverspend);
      
      if (overSpentCategories.length > 0) {
        suggestions.push({
          type: 'consistently_over_budget',
          title: 'Adjust Unrealistic Limits',
          description: 'These categories are consistently over budget and may need limit adjustments.',
          categories: overSpentCategories.slice(0, 5).map(cat => ({
            name: cat!.name,
            currentLimit: cat!.limit,
            suggestedLimit: Math.ceil(cat!.avgMonthlySpend * 1.05), // 5% buffer
            avgOverspend: Math.floor(cat!.avgOverspend),
            monthsOverBudget: `${cat!.monthsOverBudget}/${cat!.totalMonths}`,
          })),
        });
      }
      
      // 4. Suggest overall budget optimization based on income
      if (user.profile?.monthlyIncome) {
        const monthlyIncome = Number(user.profile.monthlyIncome);
        const totalBudget = budgetCategories.reduce(
          (sum, category) => sum + Number(category.limit),
          0
        );
        
        // Calculate recommended budget allocation based on 50/30/20 rule
        // 50% needs, 30% wants, 20% savings
        const recommendedNeeds = monthlyIncome * 0.5;
        const recommendedWants = monthlyIncome * 0.3;
        const recommendedSavings = monthlyIncome * 0.2;
        
        // Calculate current allocation
        const essentialCategories = budgetCategories.filter(cat => cat.isEssential);
        const nonEssentialCategories = budgetCategories.filter(cat => !cat.isEssential);
        
        const currentNeeds = essentialCategories.reduce(
          (sum, category) => sum + Number(category.limit),
          0
        );
        
        const currentWants = nonEssentialCategories.reduce(
          (sum, category) => sum + Number(category.limit),
          0
        );
        
        const currentSavings = Math.max(0, monthlyIncome - currentNeeds - currentWants);
        
        // Check if current allocation is significantly different from recommended
        const needsDeviation = Math.abs((currentNeeds - recommendedNeeds) / recommendedNeeds);
        const wantsDeviation = Math.abs((currentWants - recommendedWants) / recommendedWants);
        const savingsDeviation = Math.abs((currentSavings - recommendedSavings) / recommendedSavings);
        
        if (needsDeviation > 0.2 || wantsDeviation > 0.2 || savingsDeviation > 0.2) {
          suggestions.push({
            type: 'overall_allocation',
            title: 'Optimize Budget Allocation',
            description: 'Your budget allocation could be better balanced using the 50/30/20 rule.',
            current: {
              needs: {
                amount: currentNeeds,
                percent: Math.round((currentNeeds / monthlyIncome) * 100),
              },
              wants: {
                amount: currentWants,
                percent: Math.round((currentWants / monthlyIncome) * 100),
              },
              savings: {
                amount: currentSavings,
                percent: Math.round((currentSavings / monthlyIncome) * 100),
              },
            },
            recommended: {
              needs: {
                amount: recommendedNeeds,
                percent: 50,
              },
              wants: {
                amount: recommendedWants,
                percent: 30,
              },
              savings: {
                amount: recommendedSavings,
                percent: 20,
              },
            },
          });
        }
      }
      
      return NextResponse.json({ suggestions }, { status: 200 });
    } catch (error) {
      console.error('Error generating budget optimization suggestions:', error);
      return NextResponse.json(
        { error: 'Failed to generate budget optimization suggestions' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'optimize'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}
