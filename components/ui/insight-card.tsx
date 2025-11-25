"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface InsightCardProps {
  title: string
  metric: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  insight?: string
  actions?: { label: string; onClick?: () => void }[]
  className?: string
  children?: React.ReactNode
}

export function InsightCard({
  title,
  metric,
  change,
  changeType = "neutral",
  insight,
  actions,
  className,
  children,
}: InsightCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl p-5 border border-border/50 transition-all duration-300 hover:border-border",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase">{title}</span>
        {change && (
          <span
            className={cn(
              "text-sm font-medium px-2 py-0.5 rounded-full",
              changeType === "positive" && "text-primary bg-primary/10",
              changeType === "negative" && "text-destructive bg-destructive/10",
              changeType === "neutral" && "text-muted-foreground bg-muted",
            )}
          >
            {change}
          </span>
        )}
      </div>

      <div className="text-3xl font-semibold tracking-tight text-foreground mb-2">{metric}</div>

      {insight && <p className="text-muted-foreground text-sm mb-4">{insight}</p>}

      {children}

      {actions && actions.length > 0 && (
        <div className="mt-4 space-y-2">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/50 hover:bg-secondary text-foreground text-sm font-medium transition-colors"
            >
              {action.label}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
