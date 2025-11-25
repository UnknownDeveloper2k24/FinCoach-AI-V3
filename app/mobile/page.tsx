'use client';

import React, { useState } from 'react';
import { useFinancialData } from '@/lib/hooks/useFinancialData';
import { DashboardCard } from '@/lib/components/DashboardCard';
import { AlertsList } from '@/lib/components/AlertsList';
import { formatCurrency } from '@/lib/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Target, Settings, Home } from 'lucide-react';

export default function MobileApp() {
  const [userId] = useState('user-123');
  const { data, loading, error } = useFinancialData(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600 text-center">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-b-2xl">
        <h1 className="text-2xl font-bold">FinPilot</h1>
        <p className="text-blue-100 text-sm">Your Financial OS</p>
      </div>

      {/* Quick Stats */}
      <div className="p-4 space-y-3">
        {data?.cashflow && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <p className="text-gray-600 text-sm">Available Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.cashflow.balance)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Confidence: {data.cashflow.confidence}%
            </p>
          </div>
        )}

        {data?.spending && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
            <p className="text-gray-600 text-sm">This Month Spending</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.spending.total)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Top: {data.spending.topCategory}
            </p>
          </div>
        )}
      </div>

      {/* Alerts */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="px-4 py-2">
          <h2 className="font-semibold text-gray-900 mb-2">Alerts</h2>
          <AlertsList alerts={data.alerts.slice(0, 2)} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 py-4 space-y-2">
        <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-12 flex flex-col items-center justify-center">
            <Wallet className="h-5 w-5 mb-1" />
            <span className="text-xs">Add Income</span>
          </Button>
          <Button variant="outline" className="h-12 flex flex-col items-center justify-center">
            <TrendingUp className="h-5 w-5 mb-1" />
            <span className="text-xs">Invest</span>
          </Button>
          <Button variant="outline" className="h-12 flex flex-col items-center justify-center">
            <Target className="h-5 w-5 mb-1" />
            <span className="text-xs">Goals</span>
          </Button>
          <Button variant="outline" className="h-12 flex flex-col items-center justify-center">
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around max-w-sm mx-auto">
        <Button variant="ghost" size="sm" className="flex-1 flex flex-col items-center">
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 flex flex-col items-center">
          <TrendingUp className="h-5 w-5" />
          <span className="text-xs mt-1">Insights</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 flex flex-col items-center">
          <Wallet className="h-5 w-5" />
          <span className="text-xs mt-1">Wallet</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 flex flex-col items-center">
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Button>
      </div>
    </div>
  );
}
