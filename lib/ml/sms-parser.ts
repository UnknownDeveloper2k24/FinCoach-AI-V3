/**
 * SMS Parsing Engine
 * Intelligent extraction and categorization of bank/UPI transactions
 * Based on FinPilot SOP: SMS Parsing Agent
 */

interface ParsedTransaction {
  amount: number;
  type: 'debit' | 'credit';
  merchant: string;
  category: string;
  confidence: number;
  timestamp: Date;
  rawText: string;
}

export class SMSParser {
  // 12-category rule engine from SOP
  private static readonly CATEGORIES = {
    food: ['food', 'restaurant', 'cafe', 'pizza', 'burger', 'swiggy', 'zomato', 'dominos', 'mcdonalds', 'starbucks', 'coffee'],
    transport: ['uber', 'ola', 'taxi', 'fuel', 'petrol', 'diesel', 'parking', 'metro', 'bus', 'train', 'flight'],
    utilities: ['electricity', 'water', 'gas', 'internet', 'mobile', 'phone', 'broadband', 'wifi'],
    shopping: ['amazon', 'flipkart', 'mall', 'store', 'shop', 'retail', 'clothing', 'apparel', 'shoes'],
    entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'gaming', 'game', 'music', 'concert', 'ticket'],
    health: ['hospital', 'doctor', 'pharmacy', 'medical', 'health', 'clinic', 'medicine', 'dental'],
    subscriptions: ['subscription', 'premium', 'membership', 'plan', 'monthly', 'yearly'],
    transfer: ['transfer', 'sent', 'payment', 'upi', 'imps', 'neft'],
    rent: ['rent', 'landlord', 'property', 'housing'],
    insurance: ['insurance', 'premium', 'policy'],
    investment: ['investment', 'mutual', 'stock', 'share', 'trading'],
    other: [],
  };

  /**
   * Extract amount from SMS text
   */
  private static extractAmount(text: string): number | null {
    // Match patterns like: Rs. 500, ₹500, Rs 500, INR 500
    const patterns = [
      /[₹Rs\.]*\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:Rs|₹|INR)/gi,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = match[0].replace(/[₹Rs\s.]/g, '').replace(/,/g, '');
        return parseFloat(amount);
      }
    }

    return null;
  }

  /**
   * Determine transaction type (debit/credit)
   */
  private static determineType(text: string): 'debit' | 'credit' {
    const debitKeywords = ['debited', 'spent', 'paid', 'charged', 'withdrawn', 'transfer out', 'sent'];
    const creditKeywords = ['credited', 'received', 'deposited', 'transfer in', 'refund'];

    const lowerText = text.toLowerCase();

    for (const keyword of debitKeywords) {
      if (lowerText.includes(keyword)) return 'debit';
    }

    for (const keyword of creditKeywords) {
      if (lowerText.includes(keyword)) return 'credit';
    }

    // Default to debit if amount is present
    return 'debit';
  }

  /**
   * Extract merchant name
   */
  private static extractMerchant(text: string): string {
    // Common patterns for merchant names
    const patterns = [
      /at\s+([A-Za-z\s]+?)(?:\s+on|\s+for|$)/i,
      /to\s+([A-Za-z\s]+?)(?:\s+on|\s+for|$)/i,
      /from\s+([A-Za-z\s]+?)(?:\s+on|\s+for|$)/i,
      /([A-Z][A-Za-z\s]+?)\s+(?:debited|credited|charged)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return 'Unknown Merchant';
  }

  /**
   * Categorize transaction using 12-category rule engine
   */
  private static categorizeTransaction(merchant: string, text: string): { category: string; confidence: number } {
    const lowerMerchant = merchant.toLowerCase();
    const lowerText = text.toLowerCase();
    const searchText = `${lowerMerchant} ${lowerText}`;

    let bestMatch = { category: 'other', confidence: 0 };

    for (const [category, keywords] of Object.entries(this.CATEGORIES)) {
      if (keywords.length === 0) continue;

      let matches = 0;
      for (const keyword of keywords) {
        if (searchText.includes(keyword)) {
          matches++;
        }
      }

      if (matches > 0) {
        const confidence = Math.min(100, (matches / keywords.length) * 100);
        if (confidence > bestMatch.confidence) {
          bestMatch = { category, confidence: Math.round(confidence) };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Parse single SMS message
   */
  static parseSMS(smsText: string): ParsedTransaction | null {
    // Extract amount
    const amount = this.extractAmount(smsText);
    if (!amount) return null;

    // Determine type
    const type = this.determineType(smsText);

    // Extract merchant
    const merchant = this.extractMerchant(smsText);

    // Categorize
    const { category, confidence } = this.categorizeTransaction(merchant, smsText);

    return {
      amount,
      type,
      merchant,
      category,
      confidence,
      timestamp: new Date(),
      rawText: smsText,
    };
  }

  /**
   * Batch parse multiple SMS messages
   */
  static parseBatch(smsMessages: string[]): ParsedTransaction[] {
    return smsMessages
      .map(sms => this.parseSMS(sms))
      .filter((tx): tx is ParsedTransaction => tx !== null);
  }

  /**
   * Detect recurring transactions (subscriptions)
   */
  static detectRecurring(transactions: ParsedTransaction[]): ParsedTransaction[] {
    const merchantCounts = new Map<string, number>();

    transactions.forEach(tx => {
      merchantCounts.set(tx.merchant, (merchantCounts.get(tx.merchant) || 0) + 1);
    });

    // Transactions from same merchant appearing 3+ times are likely recurring
    return transactions.filter(tx => (merchantCounts.get(tx.merchant) || 0) >= 3);
  }

  /**
   * Validate parsed transaction
   */
  static validate(transaction: ParsedTransaction): boolean {
    // Amount should be reasonable (between ₹1 and ₹10,00,000)
    if (transaction.amount < 1 || transaction.amount > 1000000) return false;

    // Merchant should not be empty
    if (!transaction.merchant || transaction.merchant === 'Unknown Merchant') return false;

    // Confidence should be reasonable
    if (transaction.confidence < 20) return false;

    return true;
  }

  /**
   * Enrich transaction with additional metadata
   */
  static enrich(transaction: ParsedTransaction): ParsedTransaction & { tags: string[] } {
    const tags: string[] = [];

    // Add tags based on category and amount
    if (transaction.category === 'subscriptions') tags.push('recurring');
    if (transaction.amount > 5000) tags.push('large-expense');
    if (transaction.amount < 100) tags.push('small-expense');
    if (transaction.type === 'credit') tags.push('income');

    return { ...transaction, tags };
  }
}
