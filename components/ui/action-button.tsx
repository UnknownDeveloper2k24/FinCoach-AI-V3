"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface ActionButtonProps {
  label: string
  sublabel?: string
  icon?: React.ReactNode
  onClick?: () => void
  variant?: "default" | "primary" | "ghost"
}

export function ActionButton({ label, sublabel, icon, onClick, variant = "default" }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200",
        variant === "default" && "bg-card border border-border/50 hover:border-border",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "ghost" && "hover:bg-secondary",
      )}
    >
      {icon && (
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            variant === "primary" ? "bg-primary-foreground/20" : "bg-secondary",
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 text-left">
        <div className="font-medium">{label}</div>
        {sublabel && (
          <div
            className={cn("text-sm", variant === "primary" ? "text-primary-foreground/70" : "text-muted-foreground")}
          >
            {sublabel}
          </div>
        )}
      </div>
      <ChevronRight
        className={cn("w-5 h-5", variant === "primary" ? "text-primary-foreground/70" : "text-muted-foreground")}
      />
    </button>
  )
}
