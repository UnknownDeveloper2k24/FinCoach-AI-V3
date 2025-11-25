"use client"

import { useState } from "react"
import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { InsightCard } from "@/components/ui/insight-card"
import { StatPill } from "@/components/ui/stat-pill"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Zap,
  Target,
  PieChart,
  ArrowRight,
  Sparkles,
  Calendar,
  BarChart3,
  RefreshCw,
  Utensils,
  ShoppingBag,
  Fuel,
  Film,
  Smartphone,
} from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, BarChart } from "recharts"

// Income prediction data
const incomePredictionData = [
  { date: "Jan 8", actual: 4200 },
  { date: "Jan 9", actual: 5100 },
  { date: "Jan 10", actual: 3800 },
  { date: "Jan 11", actual: 6200 },
  { date: "Jan 12", actual: 4500 },
  { date: "Jan 13", actual: 5800 },
  { date: "Jan 14", actual: 4900 },
  { date: "Jan 15", predicted: 5200, confidence: 0.82 },
  { date: "Jan 16", predicted: 4800, confidence: 0.78 },
  { date: "Jan 17", predicted: 5500, confidence: 0.75 },
  { date: "Jan 18", predicted: 6100, confidence: 0.72 },
  { date: "Jan 19", predicted: 4200, confidence: 0.7 },
  { date: "Jan 20", predicted: 5900, confidence: 0.68 },
  { date: "Jan 21", predicted: 5400, confidence: 0.65 },
]

// Expense prediction data
const expensePredictionData = [
  { category: "Food & Dining", predicted: 4500, actual: 4200, variance: 7 },
  { category: "Transport", predicted: 2200, actual: 2100, variance: 5 },
  { category: "Shopping", predicted: 3000, actual: 3500, variance: -17 },
  { category: "Bills", predicted: 1800, actual: 1800, variance: 0 },
  { category: "Entertainment", predicted: 1500, actual: 1800, variance: -20 },
]

// Spending patterns data
const spendingPatternsData = [
  { day: "Mon", amount: 420, avgAmount: 380, frequency: 2.1 },
  { day: "Tue", amount: 350, avgAmount: 400, frequency: 1.8 },
  { day: "Wed", amount: 580, avgAmount: 420, frequency: 2.4 },
  { day: "Thu", amount: 390, avgAmount: 410, frequency: 2.0 },
  { day: "Fri", amount: 720, avgAmount: 500, frequency: 3.2 },
  { day: "Sat", amount: 950, avgAmount: 650, frequency: 4.1 },
  { day: "Sun", amount: 680, avgAmount: 520, frequency: 2.8 },
]

// Category patterns
const categoryPatterns = [
  {
    name: "Food & Dining",
    amount: 4200,
    frequency: "4.2x/week",
    peakDay: "Saturday",
    trend: "increasing",
    color: "#22c55e",
    icon: Utensils,
  },
  {
    name: "Transport",
    amount: 2100,
    frequency: "2.1x/week",
    peakDay: "Monday",
    trend: "stable",
    color: "#06b6d4",
    icon: Fuel,
  },
  {
    name: "Shopping",
    amount: 3500,
    frequency: "1.5x/week",
    peakDay: "Sunday",
    trend: "increasing",
    color: "#f59e0b",
    icon: ShoppingBag,
  },
  {
    name: "Entertainment",
    amount: 1800,
    frequency: "2.3x/week",
    peakDay: "Friday",
    trend: "stable",
    color: "#8b5cf6",
    icon: Film,
  },
  {
    name: "Subscriptions",
    amount: 1400,
    frequency: "Fixed",
    peakDay: "-",
    trend: "stable",
    color: "#ec4899",
    icon: Smartphone,
  },
]

// Anomalies
const anomalies = [
  {
    id: 1,
    description: "Swiggy ₹2,400",
    reason: "3.5x higher than average",
    date: "Jan 12",
    category: "Food & Dining",
  },
  { id: 2, description: "Amazon ₹8,500", reason: "Unusual weekend purchase", date: "Jan 14", category: "Shopping" },
]

// Optimization suggestions
const optimizations = [
  {
    id: 1,
    priority: "high",
    category: "Food & Dining",
    currentSpend: 6000,
    suggestedSpend: 4200,
    potentialSavings: 1800,
    action: "Reduce food delivery by 30%",
    impact: "Could save ₹1,800/month",
    icon: Utensils,
    color: "#22c55e",
  },
  {
    id: 2,
    priority: "medium",
    category: "Subscriptions",
    currentSpend: 2400,
    suggestedSpend: 1600,
    potentialSavings: 800,
    action: "Cancel unused Hotstar subscription",
    impact: "Could save ₹800/month",
    icon: Smartphone,
    color: "#ec4899",
  },
  {
    id: 3,
    priority: "medium",
    category: "Entertainment",
    currentSpend: 3200,
    suggestedSpend: 2400,
    potentialSavings: 800,
    action: "Reduce weekend outings to 2x/month",
    impact: "Could save ₹800/month",
    icon: Film,
    color: "#8b5cf6",
  },
]

// Categorization stats
const categorizationStats = {
  totalTransactions: 248,
  autoCategorized: 198,
  accuracy: 80,
  needsReview: 12,
  learningProgress: [
    { week: "W1", accuracy: 65 },
    { week: "W2", accuracy: 72 },
    { week: "W3", accuracy: 76 },
    { week: "W4", accuracy: 80 },
  ],
}

// Re-categorization suggestions
const recategorizationSuggestions = [
  { id: 1, transaction: "Flipkart ₹1,299", current: "Shopping", suggested: "Electronics", confidence: 0.88 },
  { id: 2, transaction: "Paytm ₹500", current: "Other", suggested: "Bills & Utilities", confidence: 0.92 },
  { id: 3, transaction: "Big Bazaar ₹2,100", current: "Shopping", suggested: "Groceries", confidence: 0.85 },
]

// Predictions Tab Component
function PredictionsTab() {
  const weeklyPrediction = 37100
  const monthlyPrediction = 148400
  const confidence = 78

  return (
    <div className="space-y-6">
      {/* Income Forecast Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">7-Day Forecast</span>
          </div>
          <p className="text-2xl font-bold text-foreground">₹{weeklyPrediction.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-primary text-xs">+8% vs last week</span>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">30-Day Forecast</span>
          </div>
          <p className="text-2xl font-bold text-foreground">₹{monthlyPrediction.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-primary text-xs">Stable trend</span>
          </div>
        </div>
      </div>

      {/* Confidence Gauge */}
      <div className="bg-card rounded-2xl p-5 border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Prediction Confidence</span>
          </div>
          <span className="text-2xl font-bold text-primary">{confidence}%</span>
        </div>
        <Progress value={confidence} className="h-3 mb-2" />
        <p className="text-muted-foreground text-sm">
          Based on 90 days of transaction history. Confidence improves with more data.
        </p>
      </div>

      {/* Income Trend Chart */}
      <InsightCard
        title="Income Trend + Forecast"
        metric="Next 7 days predicted"
        insight="Strong earning pattern on weekdays. Weekend income varies."
      >
        <div className="h-48 mt-4 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incomePredictionData}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.75 0.15 160)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.75 0.15 160)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.12 200)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.7 0.12 200)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.65 0 0)", fontSize: 9 }}
                interval={1}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.16 0.005 270)",
                  border: "1px solid oklch(0.25 0.005 270)",
                  borderRadius: "12px",
                  color: "oklch(0.98 0 0)",
                }}
                formatter={(value: number, name: string) => [
                  `₹${value?.toLocaleString()}`,
                  name === "actual" ? "Actual" : "Predicted",
                ]}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="oklch(0.75 0.15 160)"
                strokeWidth={2}
                fill="url(#actualGrad)"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="oklch(0.7 0.12 200)"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="url(#predictedGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </InsightCard>

      {/* Expense Predictions */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          Expense Predictions vs Actual
        </h4>
        {expensePredictionData.map((item) => (
          <div key={item.category} className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-foreground font-medium">{item.category}</span>
              <span className={`text-sm font-medium ${item.variance >= 0 ? "text-primary" : "text-destructive"}`}>
                {item.variance >= 0 ? "+" : ""}
                {item.variance}%
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Predicted: </span>
                <span className="text-foreground">₹{item.predicted.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Actual: </span>
                <span className="text-foreground">₹{item.actual.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cash Runout Warning */}
      <div className="bg-destructive/10 rounded-2xl p-5 border border-destructive/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
          <div>
            <h4 className="font-semibold text-destructive mb-1">Cash Runout Risk</h4>
            <p className="text-muted-foreground text-sm mb-3">
              At current spending rate, balance may deplete in <strong className="text-foreground">11 days</strong>.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive">
                View Details
              </Button>
              <Button size="sm" variant="secondary">
                Reduce Spending
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Patterns Tab Component
function PatternsTab() {
  return (
    <div className="space-y-6">
      {/* Day of Week Spending */}
      <InsightCard
        title="Spending by Day"
        metric="Peak: Saturday"
        insight="Weekend spending is 45% higher than weekdays. Consider setting weekend limits."
      >
        <div className="h-40 mt-4 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendingPatternsData} barCategoryGap="20%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.16 0.005 270)",
                  border: "1px solid oklch(0.25 0.005 270)",
                  borderRadius: "12px",
                  color: "oklch(0.98 0 0)",
                }}
                formatter={(value: number, name: string) => [`₹${value}`, name === "amount" ? "This Week" : "Average"]}
              />
              <Bar dataKey="avgAmount" fill="oklch(0.25 0.005 270)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="amount" fill="oklch(0.75 0.15 160)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </InsightCard>

      {/* Category Patterns */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <PieChart className="w-4 h-4 text-muted-foreground" />
          Category Patterns
        </h4>
        {categoryPatterns.map((cat) => {
          const Icon = cat.icon
          return (
            <div key={cat.name} className="bg-card rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-foreground">{cat.name}</h5>
                    <span className="font-semibold text-foreground">₹{cat.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{cat.frequency}</span>
                    <span>Peak: {cat.peakDay}</span>
                    <span
                      className={`flex items-center gap-1 ${
                        cat.trend === "increasing" ? "text-destructive" : "text-primary"
                      }`}
                    >
                      {cat.trend === "increasing" ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {cat.trend}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Anomalies */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Unusual Transactions
        </h4>
        {anomalies.map((anomaly) => (
          <div key={anomaly.id} className="bg-warning/10 rounded-xl p-4 border border-warning/20">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-foreground">{anomaly.description}</span>
              <span className="text-muted-foreground text-xs">{anomaly.date}</span>
            </div>
            <p className="text-warning text-sm">{anomaly.reason}</p>
          </div>
        ))}
      </div>

      {/* Recurring Transactions */}
      <InsightCard
        title="Detected Subscriptions"
        metric="5 recurring"
        insight="₹2,400/month in subscriptions detected automatically."
        actions={[{ label: "View All" }, { label: "Manage" }]}
      >
        <div className="mt-4 space-y-2">
          <StatPill label="Netflix" value="₹649/mo" />
          <StatPill label="Spotify" value="₹119/mo" />
          <StatPill label="Hotstar" value="₹899/mo" />
        </div>
      </InsightCard>
    </div>
  )
}

// Optimizations Tab Component
function OptimizationsTab() {
  const totalPotentialSavings = optimizations.reduce((s, o) => s + o.potentialSavings, 0)
  const optimizedDailyLimit = 686

  return (
    <div className="space-y-6">
      {/* Total Potential Savings */}
      <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <div>
            <p className="text-muted-foreground text-sm">Potential Monthly Savings</p>
            <p className="text-3xl font-bold text-primary">₹{totalPotentialSavings.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Based on your spending patterns and income predictions.</p>
      </div>

      {/* Optimized Daily Limit */}
      <div className="bg-card rounded-2xl p-5 border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">ML-Optimized Daily Limit</span>
          </div>
          <span className="text-2xl font-bold text-primary">₹{optimizedDailyLimit}</span>
        </div>
        <p className="text-muted-foreground text-sm mb-3">
          Personalized to your income pattern and jar targets. Not a generic "save 20%".
        </p>
        <Button className="w-full">Apply This Limit</Button>
      </div>

      {/* Optimization Suggestions */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Prioritized Suggestions</h4>
        {optimizations.map((opt) => {
          const Icon = opt.icon
          return (
            <div key={opt.id} className="bg-card rounded-xl p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${opt.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: opt.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-foreground">{opt.category}</h5>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        opt.priority === "high" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
                      }`}
                    >
                      {opt.priority} priority
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{opt.action}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      ₹{opt.currentSpend.toLocaleString()} → ₹{opt.suggestedSpend.toLocaleString()}
                    </span>
                    <span className="text-primary font-medium">Save ₹{opt.potentialSavings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1">
                  Apply Suggestion
                </Button>
                <Button size="sm" variant="secondary">
                  Dismiss
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Budget Comparison */}
      <InsightCard
        title="Current vs Optimized Budget"
        metric="₹3,400 difference"
        insight="Following these suggestions could increase your savings rate by 25%."
      >
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Current Monthly Spend</span>
            <span className="text-foreground font-medium">₹18,600</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Optimized Spend</span>
            <span className="text-primary font-medium">₹15,200</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="text-foreground font-medium">Monthly Savings</span>
            <span className="text-primary font-bold">₹3,400</span>
          </div>
        </div>
      </InsightCard>
    </div>
  )
}

// Categories Tab Component
function CategoriesTab() {
  return (
    <div className="space-y-6">
      {/* Accuracy Overview */}
      <div className="bg-card rounded-2xl p-5 border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-muted-foreground text-sm">Auto-Categorization Accuracy</p>
            <p className="text-4xl font-bold text-primary">{categorizationStats.accuracy}%</p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-secondary/50 rounded-xl p-3">
            <p className="text-xl font-bold text-foreground">{categorizationStats.totalTransactions}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3">
            <p className="text-xl font-bold text-primary">{categorizationStats.autoCategorized}</p>
            <p className="text-xs text-muted-foreground">Auto-categorized</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3">
            <p className="text-xl font-bold text-warning">{categorizationStats.needsReview}</p>
            <p className="text-xs text-muted-foreground">Needs Review</p>
          </div>
        </div>
      </div>

      {/* Learning Progress */}
      <InsightCard
        title="Learning Progress"
        metric="Improving weekly"
        insight="Accuracy has improved 15% over the past 4 weeks as the model learns from your corrections."
      >
        <div className="h-32 mt-4 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={categorizationStats.learningProgress}>
              <defs>
                <linearGradient id="learningGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.75 0.15 160)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.75 0.15 160)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }}
              />
              <YAxis hide domain={[50, 100]} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.16 0.005 270)",
                  border: "1px solid oklch(0.25 0.005 270)",
                  borderRadius: "12px",
                  color: "oklch(0.98 0 0)",
                }}
                formatter={(value: number) => [`${value}%`, "Accuracy"]}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="oklch(0.75 0.15 160)"
                strokeWidth={2}
                fill="url(#learningGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </InsightCard>

      {/* Re-categorization Suggestions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            Suggested Re-categorizations
          </h4>
          <span className="text-xs text-muted-foreground">{recategorizationSuggestions.length} suggestions</span>
        </div>
        {recategorizationSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">{suggestion.transaction}</span>
              <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                {Math.round(suggestion.confidence * 100)}% confident
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm mb-3">
              <span className="text-muted-foreground">{suggestion.current}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-primary font-medium">{suggestion.suggested}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                Accept
              </Button>
              <Button size="sm" variant="secondary" className="flex-1">
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Distribution */}
      <InsightCard
        title="Category Distribution"
        metric="12 categories"
        insight="Most transactions fall into Food & Dining and Transport categories."
      >
        <div className="mt-4 space-y-2">
          {categoryPatterns.slice(0, 5).map((cat) => (
            <div key={cat.name} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-sm text-muted-foreground flex-1">{cat.name}</span>
              <span className="text-sm text-foreground font-medium">
                {Math.round((cat.amount / categoryPatterns.reduce((s, c) => s + c.amount, 0)) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </InsightCard>
    </div>
  )
}

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState("predictions")

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="AI Insights" />

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">AI-Powered Insights</h2>
              <p className="text-muted-foreground text-sm">Based on 90 days of data</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Our ML models analyze your transactions to predict income, detect patterns, and optimize your budget.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full bg-secondary h-auto p-1">
            <TabsTrigger value="predictions" className="text-xs py-2">
              Predictions
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-xs py-2">
              Patterns
            </TabsTrigger>
            <TabsTrigger value="optimizations" className="text-xs py-2">
              Optimize
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs py-2">
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="mt-6">
            <PredictionsTab />
          </TabsContent>

          <TabsContent value="patterns" className="mt-6">
            <PatternsTab />
          </TabsContent>

          <TabsContent value="optimizations" className="mt-6">
            <OptimizationsTab />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoriesTab />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  )
}
