"use client"

import { cn } from "@/lib/utils"
import { Home, Wallet, Target, Sparkles, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 safe-area-pb z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className={cn("p-2 rounded-xl transition-all", isActive && "bg-primary/15")}>
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/money", icon: Wallet, label: "Money" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/ai", icon: Sparkles, label: "AI" },
  { href: "/profile", icon: User, label: "Profile" },
]
