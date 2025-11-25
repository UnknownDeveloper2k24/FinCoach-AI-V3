"use client"

import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { InsightCard } from "@/components/ui/insight-card"
import { ShoppingBag, Coffee, Fuel, Film, Utensils, Smartphone, TrendingDown } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, Cell } from "recharts"

const weeklyData = [
  { day: "Mon", amount: 850, over: false },
  { day: "Tue", amount: 420, over: false },
  { day: "Wed", amount: 1200, over: true },
  { day: "Thu", amount: 380, over: false },
  { day: "Fri", amount: 920, over: false },
  { day: "Sat", amount: 1450, over: true },
  { day: "Sun", amount: 680, over: false },
]

const categories = [
  { name: "Food & Dining", amount: 4200, icon: Utensils, color: "#22c55e", percent: 32 },
  { name: "Transport", amount: 2100, icon: Fuel, color: "#06b6d4", percent: 16 },
  { name: "Shopping", amount: 3500, icon: ShoppingBag, color: "#f59e0b", percent: 27 },
  { name: "Entertainment", amount: 1800, icon: Film, color: "#8b5cf6", percent: 14 },
  { name: "Subscriptions", amount: 1400, icon: Smartphone, color: "#ec4899", percent: 11 },
]

const recentTransactions = [
  { name: "Swiggy", amount: 420, category: "Food", time: "2h ago", icon: Utensils },
  { name: "Amazon", amount: 1299, category: "Shopping", time: "5h ago", icon: ShoppingBag },
  { name: "Starbucks", amount: 380, category: "Food", time: "Yesterday", icon: Coffee },
  { name: "Uber", amount: 245, category: "Transport", time: "Yesterday", icon: Fuel },
  { name: "Netflix", amount: 649, category: "Subscription", time: "3 days ago", icon: Film },
]

export default function SpendingPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Spending" />

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* This Month Summary */}
        <div className="bg-card rounded-3xl p-6 border border-border/50">
          <p className="text-muted-foreground text-sm mb-1">Spent This Month</p>
          <h2 className="text-5xl font-semibold text-foreground tracking-tight">₹13,000</h2>
          <div className="flex items-center gap-2 mt-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">12% less than last month</span>
          </div>
        </div>

        {/* Weekly Chart */}
        <InsightCard
          title="This Week"
          metric="₹5,900"
          change="On track"
          changeType="positive"
          insight="Wed & Sat had spikes. Consider reducing weekend spending."
        >
          <div className="h-32 mt-4 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap="20%">
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.16 0.005 270)",
                    border: "1px solid oklch(0.25 0.005 270)",
                    borderRadius: "12px",
                    color: "oklch(0.98 0 0)",
                  }}
                  formatter={(value: number) => [`₹${value}`, "Spent"]}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.over ? "oklch(0.65 0.2 25)" : "oklch(0.75 0.15 160)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </InsightCard>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase px-1">By Category</h3>

          {categories.map((cat) => (
            <div key={cat.name} className="bg-card rounded-2xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{cat.name}</h4>
                    <p className="text-sm text-muted-foreground">{cat.percent}% of total</p>
                  </div>
                </div>
                <span className="font-semibold text-foreground">₹{cat.amount.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${cat.percent}%`, backgroundColor: cat.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Budget Optimization */}
        <InsightCard
          title="Budget Optimization"
          metric="Save ₹2,400/month"
          change="Suggested"
          changeType="neutral"
          insight="Reduce dining out frequency. Switch to annual subscriptions."
          actions={[{ label: "View savings plan" }, { label: "Set category limits" }]}
        />

        {/* Recent Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">Recent Transactions</h3>
            <button className="text-primary text-sm font-medium">View All</button>
          </div>

          {recentTransactions.map((tx, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 px-4 bg-card rounded-xl border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <tx.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{tx.name}</h4>
                  <p className="text-sm text-muted-foreground">{tx.time}</p>
                </div>
              </div>
              <span className="font-medium text-foreground">-₹{tx.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
