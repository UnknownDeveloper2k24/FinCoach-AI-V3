"use client"

import { ActionButton } from "@/components/ui/action-button"
import { CreditCard, PiggyBank, Target, Wallet } from "lucide-react"

export function QuickActions() {
  return (
    <div className="space-y-3">
      <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase px-1">Quick Actions</h3>
      <ActionButton
        label="Add Expense"
        sublabel="Log a new transaction"
        icon={<CreditCard className="w-5 h-5 text-muted-foreground" />}
      />
      <ActionButton
        label="Transfer to Jar"
        sublabel="Move money between jars"
        icon={<PiggyBank className="w-5 h-5 text-muted-foreground" />}
      />
      <ActionButton
        label="Check Affordability"
        sublabel="Can I afford this purchase?"
        icon={<Wallet className="w-5 h-5 text-muted-foreground" />}
      />
      <ActionButton
        label="Set Goal"
        sublabel="Plan for something new"
        icon={<Target className="w-5 h-5 text-muted-foreground" />}
      />
    </div>
  )
}
