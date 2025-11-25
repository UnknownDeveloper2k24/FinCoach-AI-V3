import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AssetManager } from '@/lib/ml';

// GET /api/v1/assets - Get asset portfolio analysis
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
      include: { assets: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Convert assets to format expected by AssetManager
    const assets = user.assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      quantity: asset.quantity,
      purchasePrice: asset.purchasePrice,
      currentPrice: asset.currentPrice,
      purchaseDate: asset.purchaseDate,
    }));

    // Analyze portfolio using AssetManager
    const analysis = AssetManager.analyzePortfolio(assets);
    const performance = AssetManager.evaluatePerformance(assets);
    const riskAssessment = AssetManager.assessRisk(assets);
    const rebalancing = AssetManager.getRebalancingAdvice(assets);
    const diversification = AssetManager.analyzeDiversification(assets);

    return NextResponse.json({
      portfolio: {
        totalValue: analysis.totalValue,
        totalInvested: analysis.totalInvested,
        totalGain: analysis.totalGain,
        gainPercentage: analysis.gainPercentage,
      },
      assets: assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        quantity: asset.quantity,
        currentValue: asset.quantity * asset.currentPrice,
        gain: (asset.currentPrice - asset.purchasePrice) * asset.quantity,
        gainPercentage: ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100,
      })),
      performance: {
        bestPerformer: performance.bestPerformer,
        worstPerformer: performance.worstPerformer,
        averageReturn: performance.averageReturn,
        volatility: performance.volatility,
      },
      risk: {
        level: riskAssessment.riskLevel,
        score: riskAssessment.riskScore,
        factors: riskAssessment.riskFactors,
      },
      rebalancing: {
        needed: rebalancing.needsRebalancing,
        recommendations: rebalancing.recommendations.map(r => ({
          asset: r.assetName,
          action: r.action,
          percentage: r.targetPercentage,
        })),
      },
      diversification: {
        score: diversification.diversificationScore,
        byType: diversification.byType.map(d => ({
          type: d.type,
          percentage: d.percentage,
          value: d.value,
        })),
        insights: diversification.insights,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error analyzing assets:', error);
    return NextResponse.json(
      { error: 'Failed to analyze assets' },
      { status: 500 }
    );
  }
}

// POST /api/v1/assets - Add a new asset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, type, quantity, purchasePrice, currentPrice, purchaseDate } = body;

    if (!userId || !name || !type || !quantity || !purchasePrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Create asset
    const asset = await prisma.asset.create({
      data: {
        userId,
        name,
        type,
        quantity: parseFloat(quantity),
        purchasePrice: parseFloat(purchasePrice),
        currentPrice: parseFloat(currentPrice || purchasePrice),
        purchaseDate: new Date(purchaseDate || new Date()),
      },
    });

    return NextResponse.json({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      quantity: asset.quantity,
      purchasePrice: asset.purchasePrice,
      currentPrice: asset.currentPrice,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}
