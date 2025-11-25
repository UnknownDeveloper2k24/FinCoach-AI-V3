import { cn } from "@/lib/utils"

interface StatPillProps {
  label: string
  value: string
  type?: "positive" | "negative" | "neutral"
}

export function StatPill({ label, value, type = "neutral" }: StatPillProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span
        className={cn(
          "font-medium",
          type === "positive" && "text-primary",
          type === "negative" && "text-destructive",
          type === "neutral" && "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  )
}
