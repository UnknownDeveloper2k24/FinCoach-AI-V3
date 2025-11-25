'use client';

import React, { createContext, useContext, useState } from 'react';
import { Currency, currencyConverter } from './currency-converter';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amount: number, from: Currency, to: Currency) => number;
  format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('INR');

  const convert = (amount: number, from: Currency, to: Currency) => {
    return currencyConverter.convert(amount, from, to);
  };

  const format = (amount: number) => {
    return currencyConverter.formatCurrency(amount, currency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
