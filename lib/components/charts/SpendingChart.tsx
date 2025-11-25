'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SpendingData {
  category: string;
  amount: number;
  budget: number;
}

interface SpendingChartProps {
  data: SpendingData[];
  title?: string;
}

export function SpendingChart({ data, title = 'Spending by Category' }: SpendingChartProps) {
  return (
    <div className="w-full h-96 bg-white rounded-lg p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
          <Legend />
          <Bar dataKey="amount" fill="#3b82f6" name="Spent" />
          <Bar dataKey="budget" fill="#10b981" name="Budget" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
