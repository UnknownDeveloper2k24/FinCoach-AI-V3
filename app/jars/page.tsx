"use client"

import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { JarCard } from "@/components/ui/jar-card"
import { AlertCard } from "@/components/ui/alert-card"
import { ActionButton } from "@/components/ui/action-button"
import { Home, AlertTriangle, ShoppingBag, Plane, PiggyBank, Plus, ArrowRightLeft } from "lucide-react"

const jars = [
  {
    name: "Rent",
    current: 8100,
    target: 10000,
    color: "#22c55e",
    icon: <Home className="w-5 h-5" />,
    dueIn: "5 days",
  },
  {
    name: "Emergency",
    current: 15000,
    target: 50000,
    color: "#f59e0b",
    icon: <AlertTriangle className="w-5 h-5" />,
    dueIn: null,
  },
  {
    name: "Groceries",
    current: 3200,
    target: 5000,
    color: "#06b6d4",
    icon: <ShoppingBag className="w-5 h-5" />,
    dueIn: "12 days",
  },
  {
    name: "Vacation",
    current: 12500,
    target: 40000,
    color: "#8b5cf6",
    icon: <Plane className="w-5 h-5" />,
    dueIn: null,
  },
  {
    name: "Savings",
    current: 28000,
    target: 100000,
    color: "#ec4899",
    icon: <PiggyBank className="w-5 h-5" />,
    dueIn: null,
  },
]

export default function JarsPage() {
  const totalInJars = jars.reduce((sum, jar) => sum + jar.current, 0)

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Jars" />

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Total in Jars */}
        <div className="bg-card rounded-3xl p-6 border border-border/50">
          <p className="text-muted-foreground text-sm mb-1">Total in Jars</p>
          <h2 className="text-5xl font-semibold text-foreground tracking-tight">₹{totalInJars.toLocaleString()}</h2>
          <p className="text-muted-foreground text-sm mt-2">Across {jars.length} jars</p>
        </div>

        {/* Rent Warning */}
        <AlertCard
          type="danger"
          title="Rent Shortfall"
          message="₹1,900 short in 5 days. Add ₹400/day to stay on track."
          actions={[{ label: "Add ₹400/day" }, { label: "Shift from Emergency" }]}
        />

        {/* Jars Grid */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase px-1">Your Jars</h3>

          <div className="grid gap-3">
            {jars.map((jar) => (
              <JarCard key={jar.name} {...jar} />
            ))}
          </div>
        </div>

        {/* Daily Suggestion */}
        <div className="bg-secondary/50 rounded-2xl p-5 border border-border/50">
          <h4 className="font-medium text-foreground mb-2">Daily Saving Suggestion</h4>
          <p className="text-muted-foreground text-sm mb-4">Save ₹200 today to keep all jars on track.</p>
          <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium">
            Auto-allocate ₹200
          </button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <ActionButton
            label="Create New Jar"
            sublabel="Set up a savings goal"
            icon={<Plus className="w-5 h-5 text-muted-foreground" />}
          />
          <ActionButton
            label="Transfer Between Jars"
            sublabel="Move funds around"
            icon={<ArrowRightLeft className="w-5 h-5 text-muted-foreground" />}
          />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
