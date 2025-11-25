"use client"

import { cn } from "@/lib/utils"
import { LayoutDashboard, PieChart, Wallet, Bell, Settings, Receipt, Target, Brain, MessageCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const primaryNavItems = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/transactions", icon: Receipt, label: "Txns" },
  { href: "/jars", icon: Wallet, label: "Jars" },
  { href: "/insights", icon: Brain, label: "Insights" },
  { href: "/coach", icon: MessageCircle, label: "Coach" },
]

const moreNavItems = [
  { href: "/portfolio", icon: PieChart, label: "Portfolio" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/spending", icon: Receipt, label: "Spending" },
  { href: "/alerts", icon: Bell, label: "Alerts" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/demo", icon: LayoutDashboard, label: "Demo" },
]

export function BottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const allItems = [...primaryNavItems, ...moreNavItems]
  const isMoreActive = moreNavItems.some((item) => pathname === item.href)

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setShowMore(false)} />
      )}

      {/* More menu */}
      {showMore && (
        <div className="fixed bottom-20 left-4 right-4 bg-card rounded-2xl border border-border p-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="grid grid-cols-3 gap-4">
            {moreNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 safe-area-pb z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
              isMoreActive || showMore ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Settings className={cn("w-5 h-5", (isMoreActive || showMore) && "stroke-[2.5]")} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
