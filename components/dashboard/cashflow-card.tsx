"use client"

import { InsightCard } from "@/components/ui/insight-card"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { day: "Mon", amount: 12400 },
  { day: "Tue", amount: 11800 },
  { day: "Wed", amount: 10200 },
  { day: "Thu", amount: 9800 },
  { day: "Fri", amount: 8500 },
  { day: "Sat", amount: 7200 },
  { day: "Sun", amount: 6800 },
]

export function CashflowCard() {
  return (
    <InsightCard
      title="Cashflow"
      metric="₹6,800"
      change="Stable"
      changeType="positive"
      insight="Safe to spend: ₹420 today"
      actions={[{ label: "View weekly plan" }, { label: "Adjust daily limit" }]}
    >
      <div className="h-32 mt-4 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="cashflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.75 0.15 160)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.75 0.15 160)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "oklch(0.16 0.005 270)",
                border: "1px solid oklch(0.25 0.005 270)",
                borderRadius: "12px",
                color: "oklch(0.98 0 0)",
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, "Balance"]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="oklch(0.75 0.15 160)"
              strokeWidth={2}
              fill="url(#cashflow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </InsightCard>
  )
}
