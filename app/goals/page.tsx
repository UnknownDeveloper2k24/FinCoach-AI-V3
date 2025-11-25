"use client"

import type React from "react"
import { useState } from "react"
import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Car,
  Plane,
  Home,
  GraduationCap,
  Smartphone,
  Gift,
  PiggyBank,
  Edit2,
} from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"

const goalIcons = {
  vehicle: Car,
  travel: Plane,
  home: Home,
  education: GraduationCap,
  gadget: Smartphone,
  gift: Gift,
  savings: PiggyBank,
  other: Target,
}

type GoalIconKey = keyof typeof goalIcons

interface Goal {
  id: number
  name: string
  icon: GoalIconKey
  targetAmount: number
  currentAmount: number
  deadline: string
  monthlyNeeded: number
  status: "active" | "completed" | "at-risk"
  color: string
}

const mockGoals: Goal[] = [
  {
    id: 1,
    name: "Buy Scooter",
    icon: "vehicle",
    targetAmount: 85000,
    currentAmount: 34000,
    deadline: "2024-06-15",
    monthlyNeeded: 12750,
    status: "active",
    color: "#22c55e",
  },
  {
    id: 2,
    name: "Goa Trip",
    icon: "travel",
    targetAmount: 25000,
    currentAmount: 18500,
    deadline: "2024-03-01",
    monthlyNeeded: 3250,
    status: "active",
    color: "#06b6d4",
  },
  {
    id: 3,
    name: "New iPhone",
    icon: "gadget",
    targetAmount: 80000,
    currentAmount: 45000,
    deadline: "2024-09-01",
    monthlyNeeded: 5000,
    status: "at-risk",
    color: "#8b5cf6",
  },
  {
    id: 4,
    name: "Emergency Fund",
    icon: "savings",
    targetAmount: 100000,
    currentAmount: 100000,
    deadline: "2024-01-01",
    monthlyNeeded: 0,
    status: "completed",
    color: "#f59e0b",
  },
]

const progressData = [
  { month: "Oct", actual: 12000, target: 20000 },
  { month: "Nov", actual: 22000, target: 30000 },
  { month: "Dec", actual: 28000, target: 40000 },
  { month: "Jan", actual: 34000, target: 50000 },
  { month: "Feb", projected: 42000, target: 60000 },
  { month: "Mar", projected: 52000, target: 70000 },
]

function GoalCard({ goal, onSelect }: { goal: Goal; onSelect: () => void }) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100
  const Icon = goalIcons[goal.icon]
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <button
      onClick={onSelect}
      className="w-full bg-card rounded-2xl p-4 border border-border/50 text-left transition-all hover:border-border"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${goal.color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: goal.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-foreground truncate text-sm">{goal.name}</h4>
            {goal.status === "completed" && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
            {goal.status === "at-risk" && <AlertTriangle className="w-4 h-4 text-warning shrink-0" />}
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-base font-semibold text-foreground">₹{goal.currentAmount.toLocaleString()}</span>
            <span className="text-muted-foreground text-xs">/ ₹{goal.targetAmount.toLocaleString()}</span>
          </div>
          <Progress value={progress} className="h-1.5 mb-2" />
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
            {goal.status !== "completed" && daysLeft > 0 && (
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysLeft} days
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-3" />
      </div>
    </button>
  )
}

function GoalDetailModal({ goal, open, onClose }: { goal: Goal | null; open: boolean; onClose: () => void }) {
  if (!goal) return null

  const progress = (goal.currentAmount / goal.targetAmount) * 100
  const Icon = goalIcons[goal.icon]
  const disposableIncome = 15000
  const isFeasible = goal.monthlyNeeded <= disposableIncome * 0.5

  const milestones = [
    { percent: 25, reached: progress >= 25 },
    { percent: 50, reached: progress >= 50 },
    { percent: 75, reached: progress >= 75 },
    { percent: 100, reached: progress >= 100 },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${goal.color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: goal.color }} />
            </div>
            <div>
              <DialogTitle className="text-base">{goal.name}</DialogTitle>
              <p className="text-muted-foreground text-sm">Target: ₹{goal.targetAmount.toLocaleString()}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Progress */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Progress</span>
              <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2.5 mb-2" />
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-medium">₹{goal.currentAmount.toLocaleString()}</span>
              <span className="text-muted-foreground">
                ₹{(goal.targetAmount - goal.currentAmount).toLocaleString()} to go
              </span>
            </div>
          </div>

          {/* Feasibility */}
          {goal.status !== "completed" && (
            <div
              className={`rounded-xl p-4 border ${isFeasible ? "bg-primary/10 border-primary/20" : "bg-warning/10 border-warning/20"}`}
            >
              <div className="flex items-start gap-2">
                {isFeasible ? (
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                )}
                <div>
                  <p className={`font-medium text-sm ${isFeasible ? "text-primary" : "text-warning"}`}>
                    {isFeasible ? "On Track" : "Needs Adjustment"}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Save ₹{goal.monthlyNeeded.toLocaleString()}/month to reach your goal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground text-sm">Progress Timeline</h4>
            <div className="h-36 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="actualGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={goal.color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={goal.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.16 0.005 270)",
                      border: "1px solid oklch(0.25 0.005 270)",
                      borderRadius: "12px",
                      color: "oklch(0.98 0 0)",
                    }}
                    formatter={(value: number) => [`₹${value?.toLocaleString()}`, ""]}
                  />
                  <ReferenceLine y={goal.targetAmount} stroke="#64748b" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="actual" stroke={goal.color} strokeWidth={2} fill="url(#actualGrad2)" />
                  <Area
                    type="monotone"
                    dataKey="projected"
                    stroke="#64748b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Milestones */}
          <div className="grid grid-cols-4 gap-2">
            {milestones.map((m) => (
              <div
                key={m.percent}
                className={`text-center p-2 rounded-lg border ${m.reached ? "bg-primary/10 border-primary/30" : "bg-secondary/50 border-border"}`}
              >
                <div className={`text-sm font-bold ${m.reached ? "text-primary" : "text-muted-foreground"}`}>
                  {m.percent}%
                </div>
                {m.reached && <CheckCircle2 className="w-3 h-3 text-primary mx-auto mt-1" />}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button className="w-full">Add Funds</Button>
            <Button variant="secondary" className="w-full">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CreateGoalModal({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1)
  const [goalData, setGoalData] = useState({ name: "", amount: "", deadline: "", icon: "other" as GoalIconKey })

  const monthlyNeeded =
    goalData.amount && goalData.deadline
      ? Math.round(
          Number.parseInt(goalData.amount) /
            Math.max(1, Math.ceil((new Date(goalData.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))),
        )
      : 0
  const isFeasible = monthlyNeeded <= 7500

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Create Goal" : step === 2 ? "Set Target" : "Analysis"}</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 mt-4">
            <div>
              <Label>Goal Name</Label>
              <Input
                placeholder="e.g., Buy Scooter"
                value={goalData.name}
                onChange={(e) => setGoalData({ ...goalData, name: e.target.value })}
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div>
              <Label>Icon</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {Object.entries(goalIcons).map(([key, Icon]) => (
                  <button
                    key={key}
                    onClick={() => setGoalData({ ...goalData, icon: key as GoalIconKey })}
                    className={`p-3 rounded-xl border transition-colors ${goalData.icon === key ? "bg-primary/10 border-primary" : "bg-secondary border-border"}`}
                  >
                    <Icon className="w-5 h-5 mx-auto text-foreground" />
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => setStep(2)} className="w-full" disabled={!goalData.name}>
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-4">
            <div>
              <Label>Target Amount</Label>
              <Input
                type="number"
                placeholder="₹0"
                value={goalData.amount}
                onChange={(e) => setGoalData({ ...goalData, amount: e.target.value })}
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div>
              <Label>Target Date</Label>
              <Input
                type="date"
                value={goalData.deadline}
                onChange={(e) => setGoalData({ ...goalData, deadline: e.target.value })}
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1" disabled={!goalData.amount || !goalData.deadline}>
                Analyze
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 mt-4">
            <div
              className={`rounded-xl p-4 border ${isFeasible ? "bg-primary/10 border-primary/20" : "bg-warning/10 border-warning/20"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isFeasible ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning" />
                )}
                <span className={`font-semibold text-sm ${isFeasible ? "text-primary" : "text-warning"}`}>
                  {isFeasible ? "Achievable!" : "Challenging"}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">Monthly savings needed: ₹{monthlyNeeded.toLocaleString()}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button className="flex-1">Create Goal</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function GoalsPage() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  const activeGoals = mockGoals.filter((g) => g.status !== "completed")
  const completedGoals = mockGoals.filter((g) => g.status === "completed")
  const totalSaved = mockGoals.reduce((sum, g) => sum + g.currentAmount, 0)

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Goals" />

      <main className="max-w-lg mx-auto px-5 py-4 space-y-5">
        {/* Summary */}
        <div className="bg-card rounded-2xl p-5 border border-border/50">
          <p className="text-muted-foreground text-sm mb-1">Total Saved</p>
          <h2 className="text-3xl font-semibold text-foreground">₹{totalSaved.toLocaleString()}</h2>
          <p className="text-muted-foreground text-sm mt-1">{activeGoals.length} active goals</p>
        </div>

        {/* Active Goals */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase px-1">Active Goals</h3>
          {activeGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onSelect={() => setSelectedGoal(goal)} />
          ))}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase px-1">Completed</h3>
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onSelect={() => setSelectedGoal(goal)} />
            ))}
          </div>
        )}

        {/* Create Goal */}
        <CreateGoalModal>
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create New Goal
          </Button>
        </CreateGoalModal>

        {/* Goal Detail Modal */}
        <GoalDetailModal goal={selectedGoal} open={!!selectedGoal} onClose={() => setSelectedGoal(null)} />
      </main>

      <BottomNav />
    </div>
  )
}
