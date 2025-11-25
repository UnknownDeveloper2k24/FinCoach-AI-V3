import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/assets - Get all assets for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const type = req.nextUrl.searchParams.get('type');
    
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
    
    // Add type filter if provided
    if (type) {
      query.assetType = type;
    }
    
    // Get assets with price history
    const assets = await prisma.asset.findMany({
      where: query,
      include: {
        priceHistory: {
          orderBy: { timestamp: 'desc' },
          take: 30, // Get only the 30 most recent price points
        },
      },
      orderBy: [
        { assetType: 'asc' },
        { name: 'asc' },
      ],
    });
    
    // Calculate total portfolio value
    const totalValue = assets.reduce(
      (sum, asset) => sum + Number(asset.currentValue),
      0
    );
    
    // Group assets by type
    const assetsByType: Record<string, any[]> = {};
    
    assets.forEach(asset => {
      const type = asset.assetType;
      
      if (!assetsByType[type]) {
        assetsByType[type] = [];
      }
      
      assetsByType[type].push(asset);
    });
    
    // Calculate type totals
    const typeTotals = Object.entries(assetsByType).map(([type, assets]) => {
      const total = assets.reduce(
        (sum, asset) => sum + Number(asset.currentValue),
        0
      );
      
      return {
        type,
        total,
        percentage: totalValue > 0 ? (total / totalValue) * 100 : 0,
      };
    });
    
    // Format response with CRED-like structure
    const response = {
      portfolio: {
        assets,
        totalValue,
        typeTotals,
        assetCount: assets.length,
      },
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

// POST /api/v1/assets - Create a new asset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId, 
      name, 
      assetType, 
      ticker,
      quantity,
      purchasePrice,
      purchaseDate,
      currentPrice,
      notes,
    } = body;
    
    // Validate required fields
    if (!userId || !name || !assetType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, assetType' },
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
    
    // Calculate current value
    const currentValue = (quantity || 0) * (currentPrice || 0);
    
    // Calculate profit/loss
    const profitLoss = currentValue - ((quantity || 0) * (purchasePrice || 0));
    const profitLossPercentage = purchasePrice && purchasePrice > 0
      ? (profitLoss / ((quantity || 0) * (purchasePrice || 0))) * 100
      : 0;
    
    // Create asset
    const asset = await prisma.asset.create({
      data: {
        userId,
        name,
        assetType,
        ticker,
        quantity: quantity || 0,
        purchasePrice: purchasePrice || 0,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        currentPrice: currentPrice || 0,
        currentValue,
        profitLoss,
        profitLossPercentage,
        lastUpdated: new Date(),
        notes,
      },
    });
    
    // Create initial price history entry
    if (currentPrice) {
      await prisma.assetPriceHistory.create({
        data: {
          assetId: asset.id,
          price: currentPrice,
          timestamp: new Date(),
        },
      });
    }
    
    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}

// POST /api/v1/assets/update-prices - Update asset prices
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'update-prices') {
    try {
      const body = await req.json();
      const { userId, assetIds } = body;
      
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
      
      // Build query for assets
      const query: any = { userId };
      
      // If specific asset IDs are provided, use them
      if (assetIds && assetIds.length > 0) {
        query.id = { in: assetIds };
      }
      
      // Get assets
      const assets = await prisma.asset.findMany({
        where: query,
      });
      
      if (assets.length === 0) {
        return NextResponse.json(
          { message: 'No assets found' },
          { status: 200 }
        );
      }
      
      // Update prices for each asset
      const updatedAssets = [];
      
      for (const asset of assets) {
        // In a real implementation, this would fetch prices from an external API
        // For this example, we'll simulate price changes
        const newPrice = simulateNewPrice(asset.currentPrice, asset.assetType);
        
        // Calculate new values
        const currentValue = Number(asset.quantity) * newPrice;
        const profitLoss = currentValue - (Number(asset.quantity) * Number(asset.purchasePrice));
        const profitLossPercentage = Number(asset.purchasePrice) > 0
          ? (profitLoss / (Number(asset.quantity) * Number(asset.purchasePrice))) * 100
          : 0;
        
        // Update asset
        const updatedAsset = await prisma.asset.update({
          where: { id: asset.id },
          data: {
            currentPrice: newPrice,
            currentValue,
            profitLoss,
            profitLossPercentage,
            lastUpdated: new Date(),
          },
        });
        
        // Create price history entry
        await prisma.assetPriceHistory.create({
          data: {
            assetId: asset.id,
            price: newPrice,
            timestamp: new Date(),
          },
        });
        
        updatedAssets.push(updatedAsset);
      }
      
      return NextResponse.json({ assets: updatedAssets }, { status: 200 });
    } catch (error) {
      console.error('Error updating asset prices:', error);
      return NextResponse.json(
        { error: 'Failed to update asset prices' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'update-prices'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}

// Helper function to simulate price changes
function simulateNewPrice(currentPrice: any, assetType: string): number {
  const price = Number(currentPrice);
  
  // Different volatility based on asset type
  let volatility = 0.01; // 1% default
  
  if (assetType === 'stock') {
    volatility = 0.02; // 2% for stocks
  } else if (assetType === 'crypto') {
    volatility = 0.05; // 5% for crypto
  } else if (assetType === 'mutual_fund') {
    volatility = 0.01; // 1% for mutual funds
  } else if (assetType === 'bond') {
    volatility = 0.005; // 0.5% for bonds
  }
  
  // Random price change within volatility range
  const changePercent = (Math.random() * 2 - 1) * volatility;
  const newPrice = price * (1 + changePercent);
  
  // Ensure price doesn't go below zero
  return Math.max(0.01, newPrice);
}

// POST /api/v1/assets/analyze - Analyze portfolio
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'analyze') {
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
      
      // Get assets
      const assets = await prisma.asset.findMany({
        where: { userId },
        include: {
          priceHistory: {
            orderBy: { timestamp: 'desc' },
            take: 30,
          },
        },
      });
      
      if (assets.length === 0) {
        return NextResponse.json(
          { message: 'No assets found for analysis' },
          { status: 200 }
        );
      }
      
      // Calculate total portfolio value
      const totalValue = assets.reduce(
        (sum, asset) => sum + Number(asset.currentValue),
        0
      );
      
      // Group assets by type
      const assetsByType: Record<string, any[]> = {};
      
      assets.forEach(asset => {
        const type = asset.assetType;
        
        if (!assetsByType[type]) {
          assetsByType[type] = [];
        }
        
        assetsByType[type].push(asset);
      });
      
      // Calculate allocation percentages
      const allocation = Object.entries(assetsByType).map(([type, assets]) => {
        const total = assets.reduce(
          (sum, asset) => sum + Number(asset.currentValue),
          0
        );
        
        return {
          type,
          total,
          percentage: totalValue > 0 ? (total / totalValue) * 100 : 0,
        };
      });
      
      // Calculate performance metrics
      const totalProfitLoss = assets.reduce(
        (sum, asset) => sum + Number(asset.profitLoss),
        0
      );
      
      const totalInvested = assets.reduce(
        (sum, asset) => sum + (Number(asset.quantity) * Number(asset.purchasePrice)),
        0
      );
      
      const overallReturn = totalInvested > 0
        ? (totalProfitLoss / totalInvested) * 100
        : 0;
      
      // Identify top performers and underperformers
      const topPerformers = [...assets]
        .sort((a, b) => Number(b.profitLossPercentage) - Number(a.profitLossPercentage))
        .slice(0, 3)
        .map(asset => ({
          id: asset.id,
          name: asset.name,
          type: asset.assetType,
          return: asset.profitLossPercentage,
          value: asset.currentValue,
        }));
      
      const underperformers = [...assets]
        .sort((a, b) => Number(a.profitLossPercentage) - Number(b.profitLossPercentage))
        .slice(0, 3)
        .map(asset => ({
          id: asset.id,
          name: asset.name,
          type: asset.assetType,
          return: asset.profitLossPercentage,
          value: asset.currentValue,
        }));
      
      // Check for overexposure
      const overexposedAssets = assets
        .filter(asset => (Number(asset.currentValue) / totalValue) > 0.2) // More than 20% in a single asset
        .map(asset => ({
          id: asset.id,
          name: asset.name,
          type: asset.assetType,
          percentage: (Number(asset.currentValue) / totalValue) * 100,
          value: asset.currentValue,
        }));
      
      // Check for overexposure to a single asset type
      const overexposedTypes = allocation
        .filter(type => type.percentage > 50) // More than 50% in a single type
        .map(type => ({
          type: type.type,
          percentage: type.percentage,
          value: type.total,
        }));
      
      // Calculate risk score (simplified)
      let riskScore = 50; // Default moderate risk
      
      // Adjust based on asset type allocation
      if (assetsByType['stock']) {
        const stockPercentage = (assetsByType['stock'].reduce(
          (sum, asset) => sum + Number(asset.currentValue),
          0
        ) / totalValue) * 100;
        
        riskScore += stockPercentage * 0.3; // Stocks increase risk
      }
      
      if (assetsByType['crypto']) {
        const cryptoPercentage = (assetsByType['crypto'].reduce(
          (sum, asset) => sum + Number(asset.currentValue),
          0
        ) / totalValue) * 100;
        
        riskScore += cryptoPercentage * 0.5; // Crypto increases risk significantly
      }
      
      if (assetsByType['bond']) {
        const bondPercentage = (assetsByType['bond'].reduce(
          (sum, asset) => sum + Number(asset.currentValue),
          0
        ) / totalValue) * 100;
        
        riskScore -= bondPercentage * 0.2; // Bonds decrease risk
      }
      
      // Adjust based on diversification
      riskScore -= Math.min(20, Object.keys(assetsByType).length * 5); // More asset types = lower risk
      riskScore += Math.min(30, overexposedAssets.length * 10); // Overexposure increases risk
      
      // Cap risk score between 0 and 100
      riskScore = Math.max(0, Math.min(100, riskScore));
      
      // Determine risk level
      let riskLevel = 'moderate';
      if (riskScore < 30) {
        riskLevel = 'low';
      } else if (riskScore > 70) {
        riskLevel = 'high';
      }
      
      // Format response
      const response = {
        analysis: {
          totalValue,
          totalInvested,
          totalProfitLoss,
          overallReturn,
          allocation,
          topPerformers,
          underperformers,
          overexposedAssets,
          overexposedTypes,
          risk: {
            score: riskScore,
            level: riskLevel,
          },
          assetCount: assets.length,
          lastUpdated: new Date(),
        },
      };
      
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
      return NextResponse.json(
        { error: 'Failed to analyze portfolio' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'analyze'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}
