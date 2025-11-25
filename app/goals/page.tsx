"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { ActionButton } from "@/components/ui/action-button"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { AlertCard } from "@/components/ui/alert-card"
import {
  Plus,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  Edit2,
  Pause,
  Car,
  Plane,
  Home,
  GraduationCap,
  Smartphone,
  Gift,
  PiggyBank,
} from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"

// Goal icons mapping
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
  status: "active" | "completed" | "paused" | "at-risk"
  feasible: boolean
  createdAt: string
  color: string
}

// Mock goals data
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
    feasible: true,
    createdAt: "2024-01-01",
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
    feasible: true,
    createdAt: "2023-12-01",
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
    feasible: false,
    createdAt: "2023-10-01",
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
    feasible: true,
    createdAt: "2023-06-01",
    color: "#f59e0b",
  },
]

// Progress chart data
const progressData = [
  { month: "Sep", actual: 0, target: 10000 },
  { month: "Oct", actual: 12000, target: 20000 },
  { month: "Nov", actual: 22000, target: 30000 },
  { month: "Dec", actual: 28000, target: 40000 },
  { month: "Jan", actual: 34000, target: 50000 },
  { month: "Feb", actual: null, target: 60000, projected: 42000 },
  { month: "Mar", actual: null, target: 70000, projected: 52000 },
  { month: "Apr", actual: null, target: 80000, projected: 62000 },
  { month: "May", actual: null, target: 85000, projected: 72000 },
  { month: "Jun", actual: null, target: 85000, projected: 85000 },
]

// Goal Card Component
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
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${goal.color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: goal.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-foreground truncate">{goal.name}</h4>
            {goal.status === "completed" && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
            {goal.status === "at-risk" && <AlertTriangle className="w-5 h-5 text-warning shrink-0" />}
            {goal.status === "paused" && <Pause className="w-5 h-5 text-muted-foreground shrink-0" />}
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-lg font-semibold text-foreground">₹{goal.currentAmount.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">/ ₹{goal.targetAmount.toLocaleString()}</span>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
            {goal.status !== "completed" && daysLeft > 0 && (
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysLeft} days left
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-3" />
      </div>
    </button>
  )
}

// Goal Detail Modal
function GoalDetailModal({ goal, open, onClose }: { goal: Goal | null; open: boolean; onClose: () => void }) {
  if (!goal) return null

  const progress = (goal.currentAmount / goal.targetAmount) * 100
  const Icon = goalIcons[goal.icon]
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const monthsLeft = Math.ceil(daysLeft / 30)

  // Calculate feasibility
  const disposableIncome = 15000 // Mock - would come from backend
  const isFeasible = goal.monthlyNeeded <= disposableIncome * 0.5

  // Milestones
  const milestones = [
    { percent: 25, amount: goal.targetAmount * 0.25, reached: progress >= 25 },
    { percent: 50, amount: goal.targetAmount * 0.5, reached: progress >= 50 },
    { percent: 75, amount: goal.targetAmount * 0.75, reached: progress >= 75 },
    { percent: 100, amount: goal.targetAmount, reached: progress >= 100 },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${goal.color}20` }}
            >
              <Icon className="w-6 h-6" style={{ color: goal.color }} />
            </div>
            <div>
              <DialogTitle>{goal.name}</DialogTitle>
              <p className="text-muted-foreground text-sm">Target: ₹{goal.targetAmount.toLocaleString()}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Progress Overview */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Progress</span>
              <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3 mb-3" />
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-medium">₹{goal.currentAmount.toLocaleString()}</span>
              <span className="text-muted-foreground">
                ₹{(goal.targetAmount - goal.currentAmount).toLocaleString()} to go
              </span>
            </div>
          </div>

          {/* Feasibility Analysis */}
          {goal.status !== "completed" && (
            <div
              className={`rounded-xl p-4 border ${
                isFeasible ? "bg-primary/10 border-primary/20" : "bg-warning/10 border-warning/20"
              }`}
            >
              <div className="flex items-start gap-3">
                {isFeasible ? (
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${isFeasible ? "text-primary" : "text-warning"}`}>
                    {isFeasible ? "On Track" : "Needs Adjustment"}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {isFeasible
                      ? `Save ₹${goal.monthlyNeeded.toLocaleString()}/month to reach your goal on time.`
                      : `You need ₹${goal.monthlyNeeded.toLocaleString()}/month but have ₹${(disposableIncome * 0.5).toLocaleString()} available.`}
                  </p>
                  {!isFeasible && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Suggested Actions:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" className="text-xs">
                          Extend deadline
                        </Button>
                        <Button variant="secondary" size="sm" className="text-xs">
                          Reduce Food spending
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Chart */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Progress Timeline</h4>
            <div className="h-48 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={goal.color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={goal.color} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#64748b" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
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
                    formatter={(value: number, name: string) => [
                      `₹${value?.toLocaleString() || 0}`,
                      name === "actual" ? "Saved" : name === "projected" ? "Projected" : "Target",
                    ]}
                  />
                  <ReferenceLine y={goal.targetAmount} stroke="#64748b" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="actual" stroke={goal.color} strokeWidth={2} fill="url(#actualGrad)" />
                  <Area
                    type="monotone"
                    dataKey="projected"
                    stroke="#64748b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="url(#projectedGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Milestones</h4>
            <div className="grid grid-cols-4 gap-2">
              {milestones.map((m) => (
                <div
                  key={m.percent}
                  className={`text-center p-3 rounded-xl border ${
                    m.reached ? "bg-primary/10 border-primary/30" : "bg-secondary/50 border-border"
                  }`}
                >
                  <div className={`text-lg font-bold ${m.reached ? "text-primary" : "text-muted-foreground"}`}>
                    {m.percent}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">₹{(m.amount / 1000).toFixed(0)}k</div>
                  {m.reached && <CheckCircle2 className="w-3 h-3 text-primary mx-auto mt-1" />}
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Plan */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Monthly Savings Plan</h4>
              <span className="text-primary font-semibold">₹{goal.monthlyNeeded.toLocaleString()}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily target</span>
                <span className="text-foreground">₹{Math.round(goal.monthlyNeeded / 30).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Months remaining</span>
                <span className="text-foreground">{monthsLeft}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deadline</span>
                <span className="text-foreground">
                  {new Date(goal.deadline).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button className="w-full">Add Funds</Button>
            <Button variant="secondary" className="w-full">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Create Goal Modal
function CreateGoalModal({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1)
  const [goalData, setGoalData] = useState({
    name: "",
    amount: "",
    deadline: "",
    icon: "other" as GoalIconKey,
  })

  // Mock feasibility calculation
  const monthlyNeeded =
    goalData.amount && goalData.deadline
      ? Math.round(
          Number.parseInt(goalData.amount) /
            Math.max(1, Math.ceil((new Date(goalData.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))),
        )
      : 0
  const disposableIncome = 15000
  const isFeasible = monthlyNeeded <= disposableIncome * 0.5

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Create New Goal" : step === 2 ? "Set Target" : "Feasibility Check"}</DialogTitle>
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
                    className={`p-3 rounded-xl border transition-colors ${
                      goalData.icon === key
                        ? "bg-primary/10 border-primary"
                        : "bg-secondary border-border hover:border-muted-foreground"
                    }`}
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
              className={`rounded-xl p-4 border ${
                isFeasible ? "bg-primary/10 border-primary/20" : "bg-warning/10 border-warning/20"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {isFeasible ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-warning" />
                )}
                <span className={`font-semibold ${isFeasible ? "text-primary" : "text-warning"}`}>
                  {isFeasible ? "Goal is Achievable!" : "Challenging Goal"}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly savings needed</span>
                  <span className="text-foreground font-medium">₹{monthlyNeeded.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available disposable</span>
                  <span className="text-foreground font-medium">₹{disposableIncome.toLocaleString()}</span>
                </div>
              </div>
              {!isFeasible && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Suggested adjustments:</p>
                  <p className="text-sm text-foreground">
                    Extend deadline by 3 months OR reduce target by ₹
                    {((monthlyNeeded - disposableIncome * 0.5) * 6).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                Adjust
              </Button>
              <Button className="flex-1">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function GoalsPage() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  const activeGoals = mockGoals.filter((g) => g.status === "active" || g.status === "at-risk")
  const completedGoals = mockGoals.filter((g) => g.status === "completed")

  const filteredGoals = filter === "all" ? mockGoals : filter === "active" ? activeGoals : completedGoals

  const totalTarget = activeGoals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved = activeGoals.reduce((s, g) => s + g.currentAmount, 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Goals" />

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Overall Progress */}
        <div className="bg-card rounded-3xl p-6 border border-border/50">
          <p className="text-muted-foreground text-sm mb-1">Total Saved Towards Goals</p>
          <h2 className="text-5xl font-semibold text-foreground tracking-tight">₹{totalSaved.toLocaleString()}</h2>
          <div className="flex items-center gap-2 mt-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">
              {Math.round(overallProgress)}% of ₹{totalTarget.toLocaleString()} target
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* At-risk Alert */}
        {mockGoals.some((g) => g.status === "at-risk") && (
          <AlertCard
            type="warning"
            title="Goal Needs Attention"
            message="New iPhone goal requires ₹5,000/month more than available. Consider adjusting."
            actions={[{ label: "Adjust Goal" }, { label: "View Suggestions" }]}
          />
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all"
                ? `All (${mockGoals.length})`
                : f === "active"
                  ? `Active (${activeGoals.length})`
                  : `Done (${completedGoals.length})`}
            </button>
          ))}
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onSelect={() => setSelectedGoal(goal)} />
          ))}
        </div>

        {filteredGoals.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No goals in this category</p>
          </div>
        )}

        {/* Monthly Snapshot */}
        <div className="bg-secondary/50 rounded-2xl p-5 border border-border/50">
          <h4 className="font-medium text-foreground mb-3">This Month's Savings Plan</h4>
          <div className="space-y-3">
            {activeGoals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">{goal.name}</span>
                <span className="text-foreground font-medium">₹{goal.monthlyNeeded.toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-foreground font-medium">Total Monthly Target</span>
              <span className="text-primary font-semibold">
                ₹{activeGoals.reduce((s, g) => s + g.monthlyNeeded, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Create Goal */}
        <CreateGoalModal>
          <ActionButton
            label="Create New Goal"
            sublabel="Set a savings target with AI analysis"
            icon={<Plus className="w-5 h-5 text-muted-foreground" />}
          />
        </CreateGoalModal>

        {/* Goal Detail Modal */}
        <GoalDetailModal goal={selectedGoal} open={!!selectedGoal} onClose={() => setSelectedGoal(null)} />
      </main>

      <BottomNav />
    </div>
  )
}
