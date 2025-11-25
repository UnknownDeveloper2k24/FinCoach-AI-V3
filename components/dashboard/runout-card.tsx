"use client"

import { AlertCard } from "@/components/ui/alert-card"

export function RunoutCard() {
  return (
    <AlertCard
      type="warning"
      title="Runout Forecast"
      message="Likely in 11 days at current spending rate."
      confidence={82}
      actions={[{ label: "Reduce spending by ₹180/day" }, { label: "Add ₹600 to Emergency Jar" }]}
    />
  )
}
