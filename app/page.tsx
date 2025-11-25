import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { CashflowCard } from "@/components/dashboard/cashflow-card"
import { PortfolioCard } from "@/components/dashboard/portfolio-card"
import { IncomeForecast } from "@/components/dashboard/income-forecast"
import { RunoutCard } from "@/components/dashboard/runout-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { VoiceButton } from "@/components/ui/voice-button"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header showGreeting />

      <main className="max-w-lg mx-auto px-5 py-5 space-y-5">
        {/* Safe to Spend Hero */}
        <div className="bg-card rounded-2xl p-5 border border-border/50">
          <p className="text-muted-foreground text-sm mb-1">Safe to Spend Today</p>
          <h2 className="text-4xl font-semibold text-foreground tracking-tight">₹420</h2>
          <p className="text-muted-foreground text-sm mt-2">Your trend is stable.</p>
        </div>

        {/* Alerts */}
        <RunoutCard />

        {/* Main Cards */}
        <div className="grid gap-4">
          <CashflowCard />
          <PortfolioCard />
          <IncomeForecast />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </main>

      <VoiceButton />
      <BottomNav />
    </div>
  )
}
