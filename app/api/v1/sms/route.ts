import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SMSParser } from '@/lib/ml';

// POST /api/v1/sms - Parse SMS and create transaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, smsText } = body;

    if (!userId || !smsText) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, smsText' },
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

    // Parse SMS using ML engine
    const parsed = SMSParser.parseSMS(smsText);

    if (!parsed) {
      return NextResponse.json(
        { error: 'Could not parse SMS - no amount found' },
        { status: 400 }
      );
    }

    // Validate parsed transaction
    if (!SMSParser.validate(parsed)) {
      return NextResponse.json(
        { error: 'Parsed transaction failed validation' },
        { status: 400 }
      );
    }

    // Enrich transaction with tags
    const enriched = SMSParser.enrich(parsed);

    // Create transaction in database
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        merchant: parsed.merchant,
        description: parsed.rawText,
        date: parsed.timestamp,
        confidence: parsed.confidence,
      },
    });

    return NextResponse.json({
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        merchant: transaction.merchant,
        date: transaction.date,
        confidence: transaction.confidence,
      },
      parsed: {
        merchant: parsed.merchant,
        category: parsed.category,
        confidence: parsed.confidence,
        tags: enriched.tags,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error parsing SMS:', error);
    return NextResponse.json(
      { error: 'Failed to parse SMS' },
      { status: 500 }
    );
  }
}

// GET /api/v1/sms - Get parsed transactions for a user
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

    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        category: t.category,
        merchant: t.merchant,
        date: t.date,
        confidence: t.confidence,
      })),
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
