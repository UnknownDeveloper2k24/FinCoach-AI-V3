'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface IncomeData {
  month: string;
  actual: number;
  predicted: number;
}

interface IncomeChartProps {
  data: IncomeData[];
  title?: string;
}

export function IncomeChart({ data, title = 'Income Trend' }: IncomeChartProps) {
  return (
    <div className="w-full h-96 bg-white rounded-lg p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
          <Legend />
          <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="Actual" />
          <Line type="monotone" dataKey="predicted" stroke="#f59e0b" name="Predicted" strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
