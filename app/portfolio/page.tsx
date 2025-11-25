"use client"

import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { InsightCard } from "@/components/ui/insight-card"
import { StatPill } from "@/components/ui/stat-pill"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip } from "recharts"

const portfolioData = [
  { date: "Jan", value: 58000 },
  { date: "Feb", value: 62000 },
  { date: "Mar", value: 59000 },
  { date: "Apr", value: 65000 },
  { date: "May", value: 63000 },
  { date: "Jun", value: 68450 },
]

const holdings = [
  { name: "TCS", ticker: "TCS.NS", value: 24500, shares: 7, change: 2.1, positive: true },
  { name: "HDFC Bank", ticker: "HDFCBANK.NS", value: 18200, shares: 12, change: -0.4, positive: false },
  { name: "Nifty 50 ETF", ticker: "NIFTYBEES", value: 15750, shares: 85, change: 1.2, positive: true },
  { name: "Reliance", ticker: "RELIANCE.NS", value: 10000, shares: 4, change: 0.8, positive: true },
]

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Portfolio" />

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Portfolio Value Hero */}
        <div className="bg-card rounded-3xl p-6 border border-border/50">
          <p className="text-muted-foreground text-sm mb-1">Total Value</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-semibold text-foreground tracking-tight">₹68,450</h2>
            <span className="text-primary text-lg font-medium mb-1">+2.3%</span>
          </div>
          <p className="text-muted-foreground text-sm mt-2">Past day</p>

          {/* Mini Chart */}
          <div className="h-24 mt-4 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="portfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.75 0.15 160)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.75 0.15 160)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.16 0.005 270)",
                    border: "1px solid oklch(0.25 0.005 270)",
                    borderRadius: "12px",
                    color: "oklch(0.98 0 0)",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Value"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="oklch(0.75 0.15 160)"
                  strokeWidth={2}
                  fill="url(#portfolio)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast Card */}
        <InsightCard
          title="7-Day Forecast"
          metric="₹34,700 - ₹36,600"
          change="72% confidence"
          changeType="neutral"
          insight="Market volatility is moderate."
          actions={[{ label: "View detailed forecast" }, { label: "Risk analysis" }]}
        />

        {/* Holdings */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase px-1">Holdings</h3>

          {holdings.map((holding) => (
            <div key={holding.ticker} className="bg-card rounded-2xl p-4 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    {holding.positive ? (
                      <TrendingUp className="w-5 h-5 text-primary" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{holding.name}</h4>
                    <p className="text-sm text-muted-foreground">{holding.shares} shares</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">₹{holding.value.toLocaleString()}</div>
                  <div className={holding.positive ? "text-primary text-sm" : "text-destructive text-sm"}>
                    {holding.positive ? "+" : ""}
                    {holding.change}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Allocation */}
        <InsightCard title="Allocation" metric="4 Assets" insight="Well diversified across sectors">
          <div className="mt-4 bg-secondary/50 rounded-xl p-4">
            <StatPill label="Large Cap" value="62%" type="positive" />
            <StatPill label="Mid Cap" value="23%" />
            <StatPill label="Index ETF" value="15%" />
          </div>
        </InsightCard>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-primary text-primary-foreground py-4 rounded-2xl font-medium">Rebalance</button>
          <button className="bg-secondary text-secondary-foreground py-4 rounded-2xl font-medium">Add Funds</button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
