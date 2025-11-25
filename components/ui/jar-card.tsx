import type React from "react"
import { cn } from "@/lib/utils"

interface JarCardProps {
  name: string
  current: number
  target: number
  color: string
  icon: React.ReactNode
}

export function JarCard({ name, current, target, color, icon }: JarCardProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const isLow = percentage < 30

  return (
    <div className="bg-card rounded-2xl p-4 border border-border/50">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        <div>
          <h4 className="font-medium text-foreground">{name}</h4>
          <p className="text-sm text-muted-foreground">
            ₹{current.toLocaleString()} / ₹{target.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", isLow ? "bg-destructive" : "")}
          style={{
            width: `${percentage}%`,
            backgroundColor: isLow ? undefined : color,
          }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{percentage.toFixed(0)}% filled</span>
        {isLow && <span className="text-destructive">Low balance</span>}
      </div>
    </div>
  )
}
