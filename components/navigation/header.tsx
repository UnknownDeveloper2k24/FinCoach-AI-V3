"use client"

import { Bell, User } from "lucide-react"

interface HeaderProps {
  title?: string
  showGreeting?: boolean
}

export function Header({ title, showGreeting }: HeaderProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 safe-area-pt">
      <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
        <div>
          {showGreeting ? (
            <>
              <p className="text-muted-foreground text-sm">{greeting}</p>
              <h1 className="text-xl font-semibold text-foreground">FinPilot</h1>
            </>
          ) : (
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  )
}
