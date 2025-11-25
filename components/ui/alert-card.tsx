"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, TrendingDown, TrendingUp, Wallet } from "lucide-react"

type AlertType = "warning" | "danger" | "success" | "info"

interface AlertCardProps {
  type: AlertType
  title: string
  message: string
  actions?: { label: string; onClick?: () => void }[]
  confidence?: number
}

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/10",
    border: "border-warning/30",
    iconColor: "text-warning",
  },
  danger: {
    icon: TrendingDown,
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    iconColor: "text-destructive",
  },
  success: {
    icon: TrendingUp,
    bg: "bg-primary/10",
    border: "border-primary/30",
    iconColor: "text-primary",
  },
  info: {
    icon: Wallet,
    bg: "bg-chart-2/10",
    border: "border-chart-2/30",
    iconColor: "text-chart-2",
  },
}

export function AlertCard({ type, title, message, actions, confidence }: AlertCardProps) {
  const config = alertConfig[type]
  const Icon = config.icon

  return (
    <div className={cn("rounded-2xl p-4 border", config.bg, config.border)}>
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-xl", config.bg)}>
          <Icon className={cn("w-5 h-5", config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-foreground">{title}</h4>
            {confidence && <span className="text-xs text-muted-foreground">{confidence}% confidence</span>}
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>

          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className="text-sm font-medium text-foreground bg-secondary/80 hover:bg-secondary px-3 py-1.5 rounded-lg transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
