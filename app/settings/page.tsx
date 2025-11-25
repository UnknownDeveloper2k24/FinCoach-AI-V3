"use client"

import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ActionButton } from "@/components/ui/action-button"
import {
  User,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  MessageSquare,
  FileText,
  LogOut,
  ChevronRight,
  Smartphone,
  Link2,
  Moon,
} from "lucide-react"

const profileSettings = [
  { label: "Personal Info", sublabel: "Name, email, phone", icon: User },
  { label: "Linked Accounts", sublabel: "Bank accounts & UPI", icon: Link2 },
  { label: "Payment Methods", sublabel: "Cards & wallets", icon: CreditCard },
]

const appSettings = [
  { label: "Notifications", sublabel: "Alerts & reminders", icon: Bell },
  { label: "Privacy & Security", sublabel: "PIN, biometrics", icon: Shield },
  { label: "Appearance", sublabel: "Dark mode, themes", icon: Moon },
  { label: "SMS Permissions", sublabel: "Auto-parse transactions", icon: Smartphone },
]

const supportSettings = [
  { label: "Help Center", sublabel: "FAQs & guides", icon: HelpCircle },
  { label: "Contact Support", sublabel: "Get help from our team", icon: MessageSquare },
  { label: "Terms & Privacy", sublabel: "Legal documents", icon: FileText },
]

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Settings" />

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-card rounded-3xl p-6 border border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">A</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">Arjun Sharma</h2>
              <p className="text-muted-foreground text-sm">arjun@email.com</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold text-foreground">127</p>
                <p className="text-xs text-muted-foreground">Days Active</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-primary">₹1.2L</p>
                <p className="text-xs text-muted-foreground">Saved</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">Goals Met</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase px-1">Account</h3>
          {profileSettings.map((item) => (
            <ActionButton
              key={item.label}
              label={item.label}
              sublabel={item.sublabel}
              icon={<item.icon className="w-5 h-5 text-muted-foreground" />}
            />
          ))}
        </div>

        {/* App Settings */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase px-1">App Settings</h3>
          {appSettings.map((item) => (
            <ActionButton
              key={item.label}
              label={item.label}
              sublabel={item.sublabel}
              icon={<item.icon className="w-5 h-5 text-muted-foreground" />}
            />
          ))}
        </div>

        {/* Support */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase px-1">Support</h3>
          {supportSettings.map((item) => (
            <ActionButton
              key={item.label}
              label={item.label}
              sublabel={item.sublabel}
              icon={<item.icon className="w-5 h-5 text-muted-foreground" />}
            />
          ))}
        </div>

        {/* Logout */}
        <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-destructive/10 text-destructive font-medium">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground">FinPilot v1.0.0</p>
      </main>

      <BottomNav />
    </div>
  )
}
