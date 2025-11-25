"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCard } from "@/components/ui/alert-card"
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Home,
  AlertTriangle,
  Wallet,
  PiggyBank,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  CheckCircle2,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Demo scenario data - Raju's Week
interface DayData {
  day: number
  dayName: string
  date: string
  income: number
  expenses: { amount: number; description: string; category: string }[]
  balance: number
  jars: {
    rent: { current: number; target: number }
    emergency: { current: number; target: number }
    savings: { current: number; target: number }
  }
  alert: { type: "danger" | "warning" | "success" | "info"; title: string; message: string } | null
  narration: string
  highlight: "income" | "expense" | "alert" | "jar" | "milestone" | null
}

const demoData: DayData[] = [
  {
    day: 1,
    dayName: "Monday",
    date: "Jan 15",
    income: 600,
    expenses: [],
    balance: 3100,
    jars: {
      rent: { current: 6200, target: 10000 },
      emergency: { current: 12000, target: 50000 },
      savings: { current: 25000, target: 100000 },
    },
    alert: null,
    narration: "Raju starts the week with ₹2,500. He earns ₹600 from a morning delivery gig. Balance: ₹3,100",
    highlight: "income",
  },
  {
    day: 2,
    dayName: "Tuesday",
    date: "Jan 16",
    income: 800,
    expenses: [{ amount: 300, description: "Lunch + snacks", category: "Food" }],
    balance: 3600,
    jars: {
      rent: { current: 6400, target: 10000 },
      emergency: { current: 12000, target: 50000 },
      savings: { current: 25200, target: 100000 },
    },
    alert: null,
    narration: "Good earning day! ₹800 from deliveries. Spent ₹300 on food. Auto-allocated ₹400 to jars.",
    highlight: "income",
  },
  {
    day: 3,
    dayName: "Wednesday",
    date: "Jan 17",
    income: 700,
    expenses: [{ amount: 450, description: "Petrol + bike repair", category: "Transport" }],
    balance: 3850,
    jars: {
      rent: { current: 6600, target: 10000 },
      emergency: { current: 12100, target: 50000 },
      savings: { current: 25400, target: 100000 },
    },
    alert: null,
    narration: "Earns ₹700 but bike needs repair. ₹450 spent on transport. Still making progress on jars.",
    highlight: "expense",
  },
  {
    day: 4,
    dayName: "Thursday",
    date: "Jan 18",
    income: 1000,
    expenses: [{ amount: 900, description: "Phone bill + party", category: "Bills" }],
    balance: 3950,
    jars: {
      rent: { current: 6800, target: 10000 },
      emergency: { current: 12100, target: 50000 },
      savings: { current: 25400, target: 100000 },
    },
    alert: {
      type: "warning",
      title: "Spending Spike",
      message: "Today's spending is 80% higher than your daily average.",
    },
    narration: "High earning day (₹1,000) but also high spending (₹900). FinCoach detects overspending pattern.",
    highlight: "alert",
  },
  {
    day: 5,
    dayName: "Friday",
    date: "Jan 19",
    income: 650,
    expenses: [{ amount: 200, description: "Groceries", category: "Food" }],
    balance: 4400,
    jars: {
      rent: { current: 7000, target: 10000 },
      emergency: { current: 12200, target: 50000 },
      savings: { current: 25500, target: 100000 },
    },
    alert: {
      type: "danger",
      title: "Rent Risk Alert",
      message: "₹3,000 short for rent. Due in 5 days. Work 2 extra shifts to stay on track.",
    },
    narration: "Rent deadline approaching! FinCoach alerts Raju: ₹3,000 shortfall. Suggests working extra shifts.",
    highlight: "alert",
  },
  {
    day: 6,
    dayName: "Saturday",
    date: "Jan 20",
    income: 1200,
    expenses: [{ amount: 350, description: "Dinner out", category: "Food" }],
    balance: 5250,
    jars: {
      rent: { current: 8200, target: 10000 },
      emergency: { current: 12200, target: 50000 },
      savings: { current: 25600, target: 100000 },
    },
    alert: { type: "info", title: "Great Progress!", message: "Rent jar is now 82% full. Keep it up!" },
    narration: "Raju works an extra shift! Earns ₹1,200. FinCoach automatically allocates ₹1,200 to Rent jar.",
    highlight: "jar",
  },
  {
    day: 7,
    dayName: "Sunday",
    date: "Jan 21",
    income: 1100,
    expenses: [{ amount: 400, description: "Weekly groceries", category: "Food" }],
    balance: 5950,
    jars: {
      rent: { current: 10000, target: 10000 },
      emergency: { current: 12300, target: 50000 },
      savings: { current: 25700, target: 100000 },
    },
    alert: {
      type: "success",
      title: "Rent Jar Complete!",
      message: "Congratulations! You're fully prepared for rent. Great financial discipline!",
    },
    narration: "Victory! Another strong day (₹1,100). Rent jar is now FULL at ₹10,000. Raju is rent-ready!",
    highlight: "milestone",
  },
]

// Jar visualization component
function JarVisualization({
  name,
  current,
  target,
  color,
  icon: Icon,
}: { name: string; current: number; target: number; color: string; icon: React.ElementType }) {
  const progress = Math.min((current / target) * 100, 100)
  const isFull = current >= target

  return (
    <div
      className={cn(
        "bg-card rounded-2xl p-4 border transition-all duration-500",
        isFull ? "border-primary/50 bg-primary/5" : "border-border/50",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="font-medium text-foreground text-sm">{name}</span>
        </div>
        {isFull && <CheckCircle2 className="w-5 h-5 text-primary" />}
      </div>
      <div className="relative h-20 bg-secondary/50 rounded-xl overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out rounded-t-lg"
          style={{
            height: `${progress}%`,
            backgroundColor: color,
            opacity: 0.6,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-foreground text-lg">₹{current.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{Math.round(progress)}%</span>
        <span>Goal: ₹{target.toLocaleString()}</span>
      </div>
    </div>
  )
}

// Transaction item component
function TransactionItem({
  type,
  amount,
  description,
}: { type: "income" | "expense"; amount: number; description: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-xl animate-in slide-in-from-right-5">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            type === "income" ? "bg-primary/20" : "bg-destructive/20",
          )}
        >
          {type === "income" ? (
            <ArrowDownLeft className="w-4 h-4 text-primary" />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-destructive" />
          )}
        </div>
        <span className="text-sm text-foreground">{description}</span>
      </div>
      <span className={cn("font-semibold", type === "income" ? "text-primary" : "text-foreground")}>
        {type === "income" ? "+" : "-"}₹{amount.toLocaleString()}
      </span>
    </div>
  )
}

export default function DemoPage() {
  const [currentDay, setCurrentDay] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [animationPhase, setAnimationPhase] = useState(0)

  const dayData = demoData[currentDay]
  const totalProgress = ((currentDay + 1) / demoData.length) * 100

  // Auto-advance animation
  useEffect(() => {
    if (!isPlaying) return

    const phases = [0, 1, 2, 3] // income -> expense -> jar update -> alert
    let phaseIndex = 0

    const phaseInterval = setInterval(() => {
      phaseIndex++
      if (phaseIndex < phases.length) {
        setAnimationPhase(phases[phaseIndex])
      }
    }, 2000)

    const dayInterval = setTimeout(() => {
      if (currentDay < demoData.length - 1) {
        setCurrentDay((prev) => prev + 1)
        setAnimationPhase(0)
      } else {
        setIsPlaying(false)
      }
    }, 8000)

    return () => {
      clearInterval(phaseInterval)
      clearTimeout(dayInterval)
    }
  }, [isPlaying, currentDay])

  const handlePlay = () => {
    if (currentDay === demoData.length - 1) {
      setCurrentDay(0)
    }
    setIsPlaying(true)
    setAnimationPhase(0)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentDay(0)
    setAnimationPhase(0)
  }

  const handleNext = () => {
    if (currentDay < demoData.length - 1) {
      setCurrentDay((prev) => prev + 1)
      setAnimationPhase(0)
    }
  }

  const handlePrev = () => {
    if (currentDay > 0) {
      setCurrentDay((prev) => prev - 1)
      setAnimationPhase(0)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Demo: Raju's Week" />

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Hero Intro */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Raju's Financial Journey</h2>
              <p className="text-muted-foreground text-sm">Watch how FinCoach helps a gig worker</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Follow Raju through a week of variable income, unexpected expenses, and smart financial decisions powered by
            AI.
          </p>
        </div>

        {/* Progress Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Week Progress</span>
            <span className="text-foreground font-medium">Day {currentDay + 1} of 7</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
          <div className="flex justify-between">
            {demoData.map((day, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentDay(i)
                  setAnimationPhase(0)
                }}
                className={cn(
                  "w-8 h-8 rounded-full text-xs font-medium transition-all",
                  i === currentDay
                    ? "bg-primary text-primary-foreground scale-110"
                    : i < currentDay
                      ? "bg-primary/30 text-primary"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Day Header */}
        <div className="bg-card rounded-2xl p-5 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-foreground">{dayData.dayName}</h3>
              <p className="text-muted-foreground text-sm">{dayData.date}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Balance</p>
              <p className="text-3xl font-bold text-foreground">₹{dayData.balance.toLocaleString()}</p>
            </div>
          </div>

          {/* Narration */}
          <div className="bg-secondary/50 rounded-xl p-4 mb-4">
            <p className="text-sm text-foreground leading-relaxed">{dayData.narration}</p>
          </div>

          {/* Day's Transactions */}
          <div className="space-y-2">
            {dayData.income > 0 && <TransactionItem type="income" amount={dayData.income} description="Gig earnings" />}
            {dayData.expenses.map((exp, i) => (
              <TransactionItem key={i} type="expense" amount={exp.amount} description={exp.description} />
            ))}
          </div>
        </div>

        {/* Alert Card */}
        {dayData.alert && (
          <div className="animate-in slide-in-from-bottom-5">
            <AlertCard type={dayData.alert.type} title={dayData.alert.title} message={dayData.alert.message} />
          </div>
        )}

        {/* Jars Visualization */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            Money Jars
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <JarVisualization
              name="Rent"
              current={dayData.jars.rent.current}
              target={dayData.jars.rent.target}
              color="#22c55e"
              icon={Home}
            />
            <JarVisualization
              name="Emergency"
              current={dayData.jars.emergency.current}
              target={dayData.jars.emergency.target}
              color="#f59e0b"
              icon={AlertTriangle}
            />
            <JarVisualization
              name="Savings"
              current={dayData.jars.savings.current}
              target={dayData.jars.savings.target}
              color="#8b5cf6"
              icon={PiggyBank}
            />
          </div>
        </div>

        {/* Weekly Summary (show on day 7) */}
        {currentDay === 6 && (
          <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20 animate-in slide-in-from-bottom-5">
            <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Week Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Earned</p>
                <p className="text-xl font-bold text-foreground">₹6,050</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold text-foreground">₹2,600</p>
              </div>
              <div>
                <p className="text-muted-foreground">Net Savings</p>
                <p className="text-xl font-bold text-primary">₹3,450</p>
              </div>
              <div>
                <p className="text-muted-foreground">Goals Met</p>
                <p className="text-xl font-bold text-primary">1 (Rent)</p>
              </div>
            </div>
          </div>
        )}

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={handlePrev}
            disabled={currentDay === 0}
            className="w-12 h-12 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {isPlaying ? (
            <Button onClick={handlePause} size="icon" className="w-16 h-16 rounded-full">
              <Pause className="w-8 h-8" />
            </Button>
          ) : (
            <Button onClick={handlePlay} size="icon" className="w-16 h-16 rounded-full">
              <Play className="w-8 h-8 ml-1" />
            </Button>
          )}

          <Button
            variant="secondary"
            size="icon"
            onClick={handleNext}
            disabled={currentDay === demoData.length - 1}
            className="w-12 h-12 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Reset Button */}
        <div className="flex justify-center">
          <Button variant="ghost" onClick={handleReset} className="text-muted-foreground">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Demo
          </Button>
        </div>

        {/* Key Features Showcase */}
        <div className="space-y-3 pt-4">
          <h4 className="font-medium text-foreground text-sm">Key Features Demonstrated</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: TrendingUp, label: "Income Prediction" },
              { icon: Wallet, label: "Smart Jar System" },
              { icon: AlertTriangle, label: "Proactive Alerts" },
              { icon: Zap, label: "Auto-Allocation" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl">
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
