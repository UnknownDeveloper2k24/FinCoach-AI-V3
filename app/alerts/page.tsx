"use client"

import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { AlertCard } from "@/components/ui/alert-card"
import { ActionButton } from "@/components/ui/action-button"
import { Bell, BellOff, Filter } from "lucide-react"
import { useState } from "react"

const alerts = [
  {
    id: 1,
    type: "danger" as const,
    title: "Rent Risk",
    message: "₹1,900 shortfall in 5 days. Take action now.",
    confidence: 92,
    time: "Just now",
    actions: [{ label: "Add ₹400/day" }, { label: "Shift from Emergency" }],
  },
  {
    id: 2,
    type: "warning" as const,
    title: "Spending Spike",
    message: "Weekend spending 40% higher than usual.",
    confidence: 85,
    time: "2h ago",
    actions: [{ label: "View breakdown" }, { label: "Set weekend limit" }],
  },
  {
    id: 3,
    type: "success" as const,
    title: "Goal Milestone",
    message: "Vacation jar reached 30% completion.",
    confidence: 100,
    time: "Yesterday",
    actions: [{ label: "View progress" }],
  },
  {
    id: 4,
    type: "info" as const,
    title: "Income Detected",
    message: "₹52,000 credited. Auto-allocation ready.",
    confidence: 98,
    time: "Yesterday",
    actions: [{ label: "Allocate now" }, { label: "Customize split" }],
  },
  {
    id: 5,
    type: "warning" as const,
    title: "Subscription Renewal",
    message: "Netflix ₹649 renewing in 3 days.",
    confidence: 100,
    time: "2 days ago",
    actions: [{ label: "Keep active" }, { label: "Cancel" }],
  },
  {
    id: 6,
    type: "danger" as const,
    title: "Cash Runout",
    message: "At current rate, balance depletes in 11 days.",
    confidence: 78,
    time: "3 days ago",
    actions: [{ label: "Reduce spending" }, { label: "View forecast" }],
  },
]

export default function AlertsPage() {
  const [filter, setFilter] = useState<"all" | "danger" | "warning" | "success" | "info">("all")

  const filteredAlerts = filter === "all" ? alerts : alerts.filter((a) => a.type === filter)

  const unreadCount = alerts.length

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Alerts" />

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Summary */}
        <div className="bg-card rounded-3xl p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Active Alerts</p>
              <h2 className="text-5xl font-semibold text-foreground tracking-tight">{unreadCount}</h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Bell className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            {alerts.filter((a) => a.type === "danger").length} require immediate attention
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-5 px-5">
          {["all", "danger", "warning", "success", "info"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="relative">
              <span className="absolute -top-1 -right-1 text-xs text-muted-foreground">{alert.time}</span>
              <AlertCard
                type={alert.type}
                title={alert.title}
                message={alert.message}
                confidence={alert.confidence}
                actions={alert.actions}
              />
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No alerts in this category</p>
          </div>
        )}

        {/* Settings */}
        <div className="space-y-3 pt-4">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase px-1">Alert Settings</h3>
          <ActionButton
            label="Configure Alerts"
            sublabel="Customize notification preferences"
            icon={<Filter className="w-5 h-5 text-muted-foreground" />}
          />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
