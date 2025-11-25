import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/sms - Get SMS records for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const isParsed = req.nextUrl.searchParams.get('isParsed');
    
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
    
    // Add isParsed filter if provided
    if (isParsed !== null) {
      query.isParsed = isParsed === 'true';
    }
    
    // Get SMS records
    const smsRecords = await prisma.sMSRecord.findMany({
      where: query,
      orderBy: { receivedAt: 'desc' },
      include: {
        account: {
          select: {
            accountName: true,
            accountType: true,
          },
        },
        transaction: true,
      },
    });
    
    return NextResponse.json({ smsRecords }, { status: 200 });
  } catch (error) {
    console.error('Error fetching SMS records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMS records' },
      { status: 500 }
    );
  }
}

// POST /api/v1/sms - Create a new SMS record and parse it
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, accountId, smsText, sender } = body;
    
    // Validate required fields
    if (!userId || !accountId || !smsText) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, accountId, smsText' },
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
    
    // Check if account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });
    
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    // Parse SMS
    const parsedData = parseSMS(smsText, sender);
    
    // Create SMS record
    const smsRecord = await prisma.sMSRecord.create({
      data: {
        userId,
        accountId,
        smsText,
        sender,
        amount: parsedData.amount || 0,
        merchant: parsedData.merchant,
        transactionType: parsedData.transactionType,
        category: parsedData.category,
        isParsed: parsedData.isParsed,
        parseConfidence: parsedData.parseConfidence,
        receivedAt: new Date(),
      },
    });
    
    // If successfully parsed as a transaction, create transaction record
    let transaction = null;
    
    if (parsedData.isParsed && parsedData.transactionType) {
      // Determine transaction type
      const type = parsedData.transactionType === 'credit' ? 'income' : 'expense';
      
      // Create transaction
      transaction = await prisma.transaction.create({
        data: {
          userId,
          accountId,
          amount: parsedData.amount || 0,
          type,
          category: parsedData.category || 'Uncategorized',
          merchant: parsedData.merchant,
          description: `SMS: ${parsedData.description || smsText.substring(0, 50)}...`,
          transactionDate: new Date(),
          parsedFromSMS: true,
          smsRecordId: smsRecord.id,
        },
      });
      
      // Update account balance
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: type === 'income' ? parsedData.amount : -parsedData.amount,
          },
          lastSMSParsed: new Date(),
        },
      });
      
      // If this is income and amount > 0, trigger jar allocation
      if (type === 'income' && parsedData.amount > 0) {
        await allocateToJars(userId, parsedData.amount, 'sms_income');
      }
    }
    
    // Update SMS record with transaction ID if created
    if (transaction) {
      await prisma.sMSRecord.update({
        where: { id: smsRecord.id },
        data: {
          isParsed: true,
        },
      });
    }
    
    return NextResponse.json(
      { 
        smsRecord, 
        transaction,
        parsed: parsedData,
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing SMS:', error);
    return NextResponse.json(
      { error: 'Failed to process SMS' },
      { status: 500 }
    );
  }
}

// POST /api/v1/sms/parse - Parse existing SMS records
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action === 'parse') {
    try {
      const body = await req.json();
      const { userId, smsIds } = body;
      
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
      
      // Build query for SMS records
      const query: any = { userId, isParsed: false };
      
      // If specific SMS IDs are provided, use them
      if (smsIds && smsIds.length > 0) {
        query.id = { in: smsIds };
      }
      
      // Get unparsed SMS records
      const smsRecords = await prisma.sMSRecord.findMany({
        where: query,
        include: {
          account: true,
        },
      });
      
      if (smsRecords.length === 0) {
        return NextResponse.json(
          { message: 'No unparsed SMS records found' },
          { status: 200 }
        );
      }
      
      // Process each SMS record
      const results = [];
      
      for (const sms of smsRecords) {
        // Parse SMS
        const parsedData = parseSMS(sms.smsText, sms.sender);
        
        // If successfully parsed as a transaction, create transaction record
        let transaction = null;
        
        if (parsedData.isParsed && parsedData.transactionType) {
          // Determine transaction type
          const type = parsedData.transactionType === 'credit' ? 'income' : 'expense';
          
          // Create transaction
          transaction = await prisma.transaction.create({
            data: {
              userId,
              accountId: sms.accountId,
              amount: parsedData.amount || 0,
              type,
              category: parsedData.category || 'Uncategorized',
              merchant: parsedData.merchant,
              description: `SMS: ${parsedData.description || sms.smsText.substring(0, 50)}...`,
              transactionDate: new Date(),
              parsedFromSMS: true,
              smsRecordId: sms.id,
            },
          });
          
          // Update account balance
          await prisma.account.update({
            where: { id: sms.accountId },
            data: {
              balance: {
                increment: type === 'income' ? parsedData.amount : -parsedData.amount,
              },
              lastSMSParsed: new Date(),
            },
          });
          
          // If this is income and amount > 0, trigger jar allocation
          if (type === 'income' && parsedData.amount > 0) {
            await allocateToJars(userId, parsedData.amount, 'sms_income');
          }
        }
        
        // Update SMS record
        await prisma.sMSRecord.update({
          where: { id: sms.id },
          data: {
            amount: parsedData.amount || 0,
            merchant: parsedData.merchant,
            transactionType: parsedData.transactionType,
            category: parsedData.category,
            isParsed: parsedData.isParsed,
            parseConfidence: parsedData.parseConfidence,
          },
        });
        
        results.push({
          smsId: sms.id,
          parsed: parsedData,
          transaction,
        });
      }
      
      return NextResponse.json({ results }, { status: 200 });
    } catch (error) {
      console.error('Error parsing SMS records:', error);
      return NextResponse.json(
        { error: 'Failed to parse SMS records' },
        { status: 500 }
      );
    }
  }
  
  // If action is not 'parse'
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}

// Helper function to parse SMS
function parseSMS(smsText: string, sender?: string | null) {
  // Default result
  const result = {
    isParsed: false,
    parseConfidence: 0,
    amount: 0,
    transactionType: null as string | null,
    merchant: null as string | null,
    category: null as string | null,
    description: null as string | null,
  };
  
  // Normalize SMS text
  const text = smsText.toLowerCase();
  
  // Check if this is a transaction SMS
  const isTransactionSMS = 
    (text.includes('debit') || text.includes('credit') || text.includes('spent') || 
     text.includes('paid') || text.includes('received') || text.includes('deposited') ||
     text.includes('withdrawn') || text.includes('transferred') || text.includes('purchase')) &&
    (text.includes('rs.') || text.includes('rs ') || text.includes('inr') || 
     text.includes('amount') || text.match(/\d+\.\d{2}/));
  
  if (!isTransactionSMS) {
    return result;
  }
  
  // Extract amount
  const amountRegex = /(?:rs\.?|inr)\s*([0-9,]+\.?\d*)/i;
  const amountMatch = text.match(amountRegex);
  
  if (amountMatch && amountMatch[1]) {
    // Remove commas and convert to number
    result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    result.isParsed = true;
    result.parseConfidence = 60; // Base confidence
  } else {
    // Try alternative amount pattern
    const altAmountRegex = /([0-9,]+\.?\d*)\s*(?:rs\.?|inr)/i;
    const altAmountMatch = text.match(altAmountRegex);
    
    if (altAmountMatch && altAmountMatch[1]) {
      result.amount = parseFloat(altAmountMatch[1].replace(/,/g, ''));
      result.isParsed = true;
      result.parseConfidence = 50; // Lower confidence for alternative pattern
    }
  }
  
  // Determine transaction type
  if (
    text.includes('credit') || 
    text.includes('received') || 
    text.includes('deposited') ||
    text.includes('credited')
  ) {
    result.transactionType = 'credit';
    result.parseConfidence += 10;
  } else if (
    text.includes('debit') || 
    text.includes('spent') || 
    text.includes('paid') || 
    text.includes('withdrawn') ||
    text.includes('debited') ||
    text.includes('purchase')
  ) {
    result.transactionType = 'debit';
    result.parseConfidence += 10;
  }
  
  // Extract merchant
  // Look for common patterns in transaction SMS
  const merchantPatterns = [
    /(?:at|to|from)\s+([A-Za-z0-9\s]{3,}?)(?:\s+on|\s+for|\s+via|\s+using|$)/i,
    /(?:purchase at|payment to|paid to)\s+([A-Za-z0-9\s]{3,}?)(?:\s+on|\s+for|\s+via|\s+using|$)/i,
  ];
  
  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.merchant = match[1].trim();
      result.parseConfidence += 10;
      break;
    }
  }
  
  // Categorize transaction
  result.category = categorizeTransaction(text, result.merchant, result.transactionType);
  if (result.category) {
    result.parseConfidence += 10;
  }
  
  // Extract description
  const descriptionPatterns = [
    /info:\s*([^.]*)/i,
    /for\s+([^.]*)/i,
    /ref\s*(?:no)?:\s*([A-Za-z0-9\s]{3,})/i,
  ];
  
  for (const pattern of descriptionPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.description = match[1].trim();
      break;
    }
  }
  
  // If no description found, use first part of SMS
  if (!result.description) {
    result.description = smsText.substring(0, 50);
  }
  
  return result;
}

// Helper function to categorize transactions
function categorizeTransaction(text: string, merchant: string | null, transactionType: string | null): string | null {
  // Default to null
  let category = null;
  
  // Convert to lowercase for easier matching
  const lowerText = text.toLowerCase();
  const lowerMerchant = merchant ? merchant.toLowerCase() : '';
  
  // Category patterns
  const categoryPatterns = [
    { category: 'Food & Dining', patterns: ['restaurant', 'cafe', 'food', 'swiggy', 'zomato', 'uber eats', 'pizza', 'burger', 'dining'] },
    { category: 'Groceries', patterns: ['grocery', 'supermarket', 'market', 'bigbasket', 'grofers', 'dmart', 'reliance fresh', 'vegetables'] },
    { category: 'Transportation', patterns: ['uber', 'ola', 'cab', 'taxi', 'auto', 'metro', 'bus', 'train', 'railway', 'irctc', 'petrol', 'fuel'] },
    { category: 'Shopping', patterns: ['amazon', 'flipkart', 'myntra', 'ajio', 'mall', 'retail', 'store', 'shop', 'purchase'] },
    { category: 'Entertainment', patterns: ['movie', 'cinema', 'theatre', 'netflix', 'amazon prime', 'hotstar', 'subscription', 'entertainment'] },
    { category: 'Bills & Utilities', patterns: ['bill', 'utility', 'electricity', 'water', 'gas', 'internet', 'broadband', 'wifi', 'mobile', 'phone', 'recharge'] },
    { category: 'Rent', patterns: ['rent', 'housing', 'accommodation', 'lease'] },
    { category: 'Health & Medical', patterns: ['hospital', 'clinic', 'doctor', 'medical', 'medicine', 'pharmacy', 'health', 'healthcare'] },
    { category: 'Education', patterns: ['school', 'college', 'university', 'course', 'class', 'tuition', 'education', 'learning', 'books'] },
    { category: 'Personal Care', patterns: ['salon', 'spa', 'haircut', 'beauty', 'grooming', 'personal care'] },
    { category: 'Travel', patterns: ['hotel', 'flight', 'booking', 'travel', 'trip', 'vacation', 'holiday', 'makemytrip', 'goibibo', 'oyo'] },
    { category: 'Salary', patterns: ['salary', 'income', 'wage', 'payroll', 'stipend'] },
  ];
  
  // Check for income categories if transaction type is credit
  if (transactionType === 'credit') {
    if (lowerText.includes('salary') || lowerText.includes('sal') || lowerText.includes('payroll')) {
      return 'Salary';
    }
    if (lowerText.includes('interest') || lowerText.includes('dividend')) {
      return 'Investment Income';
    }
    if (lowerText.includes('refund')) {
      return 'Refund';
    }
    // Default income category
    return 'Income';
  }
  
  // Check text against category patterns
  for (const { category: cat, patterns } of categoryPatterns) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern) || (lowerMerchant && lowerMerchant.includes(pattern))) {
        category = cat;
        break;
      }
    }
    if (category) break;
  }
  
  // Default to 'Miscellaneous' if no category matched
  return category || 'Miscellaneous';
}

// Helper function to allocate to jars
async function allocateToJars(userId: string, amount: number, source: string) {
  try {
    // Get auto-allocate jars
    const jars = await prisma.jar.findMany({
      where: {
        userId,
        autoAllocate: true,
      },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' },
      ],
    });
    
    if (jars.length === 0) {
      return; // No jars to allocate to
    }
    
    // Calculate total allocation percentage
    const totalAllocationPercentage = jars.reduce(
      (sum, jar) => sum + Number(jar.allocationPercentage),
      0
    );
    
    // If total allocation is 0%, distribute evenly
    let allocations = [];
    
    if (totalAllocationPercentage === 0) {
      const evenPercentage = 100 / jars.length;
      
      allocations = jars.map(jar => ({
        jarId: jar.id,
        amount: amount * (evenPercentage / 100),
        percentage: evenPercentage,
      }));
    } else {
      // Normalize percentages if they don't add up to 100%
      const normalizationFactor = 100 / totalAllocationPercentage;
      
      allocations = jars.map(jar => {
        const normalizedPercentage = Number(jar.allocationPercentage) * normalizationFactor;
        return {
          jarId: jar.id,
          amount: amount * (normalizedPercentage / 100),
          percentage: normalizedPercentage,
        };
      });
    }
    
    // Perform allocations in a transaction
    await prisma.$transaction(async (tx) => {
      for (const allocation of allocations) {
        // Update jar amount
        await tx.jar.update({
          where: { id: allocation.jarId },
          data: {
            currentAmount: {
              increment: allocation.amount,
            },
          },
        });
        
        // Create allocation record
        await tx.jarAllocation.create({
          data: {
            jarId: allocation.jarId,
            amount: allocation.amount,
            reason: source,
          },
        });
      }
    });
    
    return allocations;
  } catch (error) {
    console.error('Error allocating to jars:', error);
    return null;
  }
}
