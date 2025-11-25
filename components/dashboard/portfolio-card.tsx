"use client"

import { InsightCard } from "@/components/ui/insight-card"
import { TrendingUp } from "lucide-react"

const holdings = [
  { name: "TCS", value: 24500, change: 2.1, positive: true },
  { name: "HDFC Bank", value: 18200, change: -0.4, positive: false },
  { name: "Nifty 50 ETF", value: 15750, change: 1.2, positive: true },
  { name: "Reliance", value: 10000, change: 0.8, positive: true },
]

export function PortfolioCard() {
  return (
    <InsightCard
      title="Portfolio"
      metric="₹68,450"
      change="+2.3%"
      changeType="positive"
      insight="TCS leads with +2.1% today"
      actions={[{ label: "View holdings" }, { label: "Rebalance" }]}
    >
      <div className="mt-4 space-y-3">
        {holdings.map((holding) => (
          <div key={holding.name} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="font-medium text-foreground">{holding.name}</span>
            </div>
            <div className="text-right">
              <div className="font-medium text-foreground">₹{holding.value.toLocaleString()}</div>
              <div className={holding.positive ? "text-primary text-xs" : "text-destructive text-xs"}>
                {holding.positive ? "+" : ""}
                {holding.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </InsightCard>
  )
}
