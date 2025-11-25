"use client"

import { InsightCard } from "@/components/ui/insight-card"
import { StatPill } from "@/components/ui/stat-pill"

export function IncomeForecast() {
  return (
    <InsightCard
      title="Income Forecast"
      metric="₹52,000"
      change="78% confidence"
      changeType="neutral"
      insight="Expected in next 7 days"
    >
      <div className="mt-4 bg-secondary/50 rounded-xl p-4">
        <StatPill label="7-day forecast" value="₹52,000 - ₹58,000" />
        <StatPill label="30-day forecast" value="₹1,80,000" />
        <StatPill label="Trend" value="Stable" type="positive" />
      </div>
    </InsightCard>
  )
}
