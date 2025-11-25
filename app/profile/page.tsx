"use client"

import { useState } from "react"
import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ActionButton } from "@/components/ui/action-button"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
  Link2,
  Moon,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Settings,
  Smartphone,
  Home,
  AlertTriangle,
  CheckCircle2,
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

// Demo data
const demoData = [
  {
    day: 1,
    dayName: "Monday",
    balance: 2500,
    income: 600,
    expense: 0,
    jarRent: 6000,
    narration: "Raju starts the week with ₹2,500. Earns ₹600 from morning deliveries.",
    alert: null,
  },
  {
    day: 2,
    dayName: "Tuesday",
    balance: 3100,
    income: 800,
    expense: 300,
    jarRent: 6400,
    narration: "Good day! Earned ₹800. Spent ₹300 on food supplies.",
    alert: null,
  },
  {
    day: 3,
    dayName: "Wednesday",
    balance: 3600,
    income: 700,
    expense: 450,
    jarRent: 6850,
    narration: "Steady earnings of ₹700. Transport costs ₹450.",
    alert: null,
  },
  {
    day: 4,
    dayName: "Thursday",
    balance: 3850,
    income: 1000,
    expense: 900,
    jarRent: 7150,
    narration: "Best day so far! ₹1,000 earned. But spent ₹900 - overspending alert!",
    alert: { type: "warning", message: "Overspending detected! ₹900 is 2x your daily average." },
  },
  {
    day: 5,
    dayName: "Friday",
    balance: 3950,
    income: 650,
    expense: 200,
    jarRent: 7650,
    narration: "Lower earnings today. AI suggests: Work extra shifts this weekend.",
    alert: { type: "danger", message: "Rent jar ₹1,900 short with 2 days left!" },
  },
  {
    day: 6,
    dayName: "Saturday",
    balance: 4400,
    income: 1200,
    expense: 400,
    jarRent: 8850,
    narration: "Weekend hustle! Extra shift earned ₹1,200. Spent ₹400.",
    alert: { type: "info", message: "Great progress! Keep it up to meet rent goal." },
  },
  {
    day: 7,
    dayName: "Sunday",
    balance: 5100,
    income: 1100,
    expense: 300,
    jarRent: 10000,
    narration: "Rent jar is fully funded! Raju can relax now.",
    alert: { type: "success", message: "Rent jar fully funded! Goal achieved." },
  },
]

// Settings Tab
function SettingsTab() {
  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-card rounded-2xl p-5 border border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="text-xl font-semibold text-primary">A</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Arjun Sharma</h2>
            <p className="text-muted-foreground text-sm">arjun@email.com</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="mt-5 pt-5 border-t border-border/50 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-semibold text-foreground">127</p>
            <p className="text-[10px] text-muted-foreground">Days Active</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-primary">₹1.2L</p>
            <p className="text-[10px] text-muted-foreground">Saved</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">5</p>
            <p className="text-[10px] text-muted-foreground">Goals Met</p>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="space-y-2">
        <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase px-1">Account</h3>
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
      <div className="space-y-2">
        <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase px-1">App Settings</h3>
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
      <div className="space-y-2">
        <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase px-1">Support</h3>
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
      <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 text-destructive font-medium text-sm">
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>

      <p className="text-center text-[10px] text-muted-foreground">FinCoach AI v1.0.0</p>
    </div>
  )
}

// Demo Tab - Raju's Week
function DemoTab() {
  const [currentDay, setCurrentDay] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const current = demoData[currentDay]
  const rentProgress = (current.jarRent / 10000) * 100

  const nextDay = () => {
    if (currentDay < demoData.length - 1) setCurrentDay(currentDay + 1)
  }

  const prevDay = () => {
    if (currentDay > 0) setCurrentDay(currentDay - 1)
  }

  const reset = () => {
    setCurrentDay(0)
    setIsPlaying(false)
  }

  // Auto-play logic
  useState(() => {
    if (isPlaying && currentDay < demoData.length - 1) {
      const timer = setTimeout(() => setCurrentDay(currentDay + 1), 3000)
      return () => clearTimeout(timer)
    } else if (currentDay >= demoData.length - 1) {
      setIsPlaying(false)
    }
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-card rounded-2xl p-5 border border-border/50 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-1">Raju's Week</h3>
        <p className="text-muted-foreground text-sm">See how FinCoach AI helps a gig worker manage finances</p>
      </div>

      {/* Day Indicator */}
      <div className="flex items-center justify-between">
        {demoData.map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              i === currentDay
                ? "bg-primary text-primary-foreground scale-110"
                : i < currentDay
                  ? "bg-primary/30 text-primary"
                  : "bg-secondary text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Current Day Card */}
      <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-foreground">
              Day {current.day}: {current.dayName}
            </h4>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">₹{current.balance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Balance</p>
          </div>
        </div>

        {/* Income/Expense */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/10 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Earned</p>
            <p className="text-lg font-semibold text-primary">+₹{current.income}</p>
          </div>
          <div className="bg-destructive/10 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className="text-lg font-semibold text-destructive">-₹{current.expense}</p>
          </div>
        </div>

        {/* Narration */}
        <p className="text-muted-foreground text-sm leading-relaxed">{current.narration}</p>

        {/* Alert */}
        {current.alert && (
          <div
            className={`rounded-xl p-3 border ${
              current.alert.type === "danger"
                ? "bg-destructive/10 border-destructive/20"
                : current.alert.type === "warning"
                  ? "bg-warning/10 border-warning/20"
                  : current.alert.type === "success"
                    ? "bg-primary/10 border-primary/20"
                    : "bg-secondary border-border"
            }`}
          >
            <div className="flex items-start gap-2">
              {current.alert.type === "danger" && (
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              )}
              {current.alert.type === "warning" && <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />}
              {current.alert.type === "success" && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
              <p
                className={`text-sm ${
                  current.alert.type === "danger"
                    ? "text-destructive"
                    : current.alert.type === "warning"
                      ? "text-warning"
                      : "text-primary"
                }`}
              >
                {current.alert.message}
              </p>
            </div>
          </div>
        )}

        {/* Rent Jar Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">Rent Jar</span>
            </div>
            <span className="text-muted-foreground">₹{current.jarRent.toLocaleString()} / ₹10,000</span>
          </div>
          <Progress value={rentProgress} className="h-2" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="secondary" size="icon" onClick={reset} disabled={currentDay === 0}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={prevDay} disabled={currentDay === 0}>
          <SkipForward className="w-4 h-4 rotate-180" />
        </Button>
        <Button size="icon" className="w-12 h-12" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <Button variant="secondary" size="icon" onClick={nextDay} disabled={currentDay === demoData.length - 1}>
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary (show at end) */}
      {currentDay === demoData.length - 1 && (
        <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20 text-center">
          <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
          <h4 className="font-semibold text-foreground mb-2">Week Complete!</h4>
          <p className="text-muted-foreground text-sm mb-4">
            Raju earned ₹6,050, spent ₹2,550, and fully funded his rent jar with AI-powered guidance.
          </p>
          <Button onClick={reset}>Watch Again</Button>
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("settings")

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Profile" />

      <main className="max-w-lg mx-auto px-5 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-secondary mb-5">
            <TabsTrigger value="settings" className="text-xs flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="demo" className="text-xs flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              Demo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-0">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="demo" className="mt-0">
            <DemoTab />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  )
}
