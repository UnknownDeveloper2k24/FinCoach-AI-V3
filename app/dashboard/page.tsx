'use client';

import React, { useState } from 'react';
import { useFinancialData } from '@/lib/hooks/useFinancialData';
import { DashboardCard } from '@/lib/components/DashboardCard';
import { AlertsList } from '@/lib/components/AlertsList';
import { formatCurrency, abbreviateNumber, getHealthScoreGrade } from '@/lib/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [userId] = useState('user-123'); // In real app, get from auth
  const { data, loading, error } = useFinancialData(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Financial Dashboard</h1>
          <p className="text-slate-600">Your intelligent financial overview</p>
        </div>

        {/* Alerts Section */}
        {data.alerts && data.alerts.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-4">Alerts</h2>
            <AlertsList alerts={data.alerts} />
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cashflow Card */}
              {data.cashflow && (
                <DashboardCard
                  title="Cashflow"
                  description="Current financial health"
                  value={formatCurrency(data.cashflow.balance)}
                  confidence={data.cashflow.confidence}
                  priority={data.cashflow.priority}
                  actions={[
                    {
                      label: 'View Details',
                      onClick: () => console.log('View cashflow details'),
                    },
                  ]}
                />
              )}

              {/* Budget Card */}
              {data.budget && (
                <DashboardCard
                  title="Budget Status"
                  description="Monthly budget utilization"
                  value={`${data.budget.utilization}%`}
                  confidence={data.budget.confidence}
                  priority={data.budget.priority}
                  actions={[
                    {
                      label: 'Optimize',
                      onClick: () => console.log('Optimize budget'),
                    },
                  ]}
                />
              )}

              {/* Health Score Card */}
              {data.coach && (
                <DashboardCard
                  title="Financial Health"
                  description="Overall financial score"
                  value={getHealthScoreGrade(data.coach.healthScore)}
                  confidence={data.coach.confidence}
                  priority={data.coach.priority}
                  actions={[
                    {
                      label: 'Get Advice',
                      onClick: () => console.log('Get coaching advice'),
                    },
                  ]}
                />
              )}
            </div>
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Income */}
              {data.income && (
                <DashboardCard
                  title="Current Income"
                  description="Monthly income"
                  value={formatCurrency(data.income.amount)}
                  confidence={data.income.confidence}
                  range={data.income.range}
                  actions={[
                    {
                      label: 'View History',
                      onClick: () => console.log('View income history'),
                    },
                  ]}
                />
              )}

              {/* Income Forecast */}
              {data.income && (
                <DashboardCard
                  title="30-Day Forecast"
                  description="Predicted income"
                  value={formatCurrency(data.income.forecast30)}
                  confidence={data.income.forecastConfidence}
                  range={data.income.forecastRange}
                  actions={[
                    {
                      label: 'View Forecast',
                      onClick: () => console.log('View income forecast'),
                    },
                  ]}
                />
              )}
            </div>
          </TabsContent>

          {/* Spending Tab */}
          <TabsContent value="spending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Spending */}
              {data.spending && (
                <DashboardCard
                  title="Monthly Spending"
                  description="Total expenses this month"
                  value={formatCurrency(data.spending.total)}
                  confidence={data.spending.confidence}
                  priority={data.spending.priority}
                  actions={[
                    {
                      label: 'Analyze',
                      onClick: () => console.log('Analyze spending'),
                    },
                  ]}
                />
              )}

              {/* Top Category */}
              {data.spending && (
                <DashboardCard
                  title="Top Category"
                  description={data.spending.topCategory}
                  value={formatCurrency(data.spending.topCategoryAmount)}
                  confidence={data.spending.confidence}
                  actions={[
                    {
                      label: 'Reduce',
                      onClick: () => console.log('Reduce spending'),
                    },
                  ]}
                />
              )}
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.goals && data.goals.map((goal: any) => (
                <DashboardCard
                  key={goal.id}
                  title={goal.name}
                  description={goal.description}
                  value={`${goal.progress}%`}
                  confidence={goal.confidence}
                  priority={goal.priority}
                  actions={[
                    {
                      label: 'Contribute',
                      onClick: () => console.log('Contribute to goal'),
                    },
                  ]}
                />
              ))}
            </div>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.assets && (
                <DashboardCard
                  title="Portfolio Value"
                  description="Total asset value"
                  value={formatCurrency(data.assets.totalValue)}
                  confidence={data.assets.confidence}
                  range={data.assets.range}
                  actions={[
                    {
                      label: 'Rebalance',
                      onClick: () => console.log('Rebalance portfolio'),
                    },
                  ]}
                />
              )}

              {data.assets && (
                <DashboardCard
                  title="Performance"
                  description="YTD returns"
                  value={`${data.assets.performance}%`}
                  confidence={data.assets.confidence}
                  priority={data.assets.performance > 0 ? 'high' : 'low'}
                  actions={[
                    {
                      label: 'View Details',
                      onClick: () => console.log('View asset details'),
                    },
                  ]}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
