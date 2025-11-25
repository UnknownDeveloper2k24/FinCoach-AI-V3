/**
 * Multi-Currency Support
 * Handles currency conversion and formatting
 */

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD';

export interface CurrencyRate {
  from: Currency;
  to: Currency;
  rate: number;
  timestamp: Date;
}

// Mock exchange rates - replace with real API in production
const EXCHANGE_RATES: Record<Currency, Record<Currency, number>> = {
  INR: { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.8, AUD: 0.018, CAD: 0.017 },
  USD: { INR: 83.5, USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150, AUD: 1.5, CAD: 1.36 },
  EUR: { INR: 90.8, USD: 1.09, EUR: 1, GBP: 0.86, JPY: 163, AUD: 1.63, CAD: 1.48 },
  GBP: { INR: 105.5, USD: 1.27, EUR: 1.16, GBP: 1, JPY: 189, AUD: 1.89, CAD: 1.72 },
  JPY: { INR: 0.56, USD: 0.0067, EUR: 0.0061, GBP: 0.0053, JPY: 1, AUD: 0.01, CAD: 0.0091 },
  AUD: { INR: 55.5, USD: 0.67, EUR: 0.61, GBP: 0.53, JPY: 100, AUD: 1, CAD: 0.91 },
  CAD: { INR: 61, USD: 0.74, EUR: 0.68, GBP: 0.58, JPY: 110, AUD: 1.1, CAD: 1 },
};

export class CurrencyConverter {
  private rates: Map<string, CurrencyRate> = new Map();

  convert(amount: number, from: Currency, to: Currency): number {
    if (from === to) return amount;
    
    const rate = EXCHANGE_RATES[from]?.[to];
    if (!rate) {
      throw new Error(`Conversion rate not found for ${from} to ${to}`);
    }
    
    return amount * rate;
  }

  getRate(from: Currency, to: Currency): number {
    if (from === to) return 1;
    return EXCHANGE_RATES[from]?.[to] || 1;
  }

  formatCurrency(amount: number, currency: Currency): string {
    const currencySymbols: Record<Currency, string> = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
    };

    const locales: Record<Currency, string> = {
      INR: 'en-IN',
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      JPY: 'ja-JP',
      AUD: 'en-AU',
      CAD: 'en-CA',
    };

    return new Intl.NumberFormat(locales[currency], {
      style: 'currency',
      currency,
    }).format(amount);
  }

  getSupportedCurrencies(): Currency[] {
    return Object.keys(EXCHANGE_RATES) as Currency[];
  }
}

export const currencyConverter = new CurrencyConverter();
