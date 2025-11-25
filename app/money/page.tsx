"use client"

import type React from "react"
import { useState } from "react"
import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InsightCard } from "@/components/ui/insight-card"
import { JarCard } from "@/components/ui/jar-card"
import { AlertCard } from "@/components/ui/alert-card"
import {
  Plus,
  Upload,
  Search,
  Utensils,
  ShoppingBag,
  Fuel,
  Film,
  Smartphone,
  Zap,
  Home,
  Heart,
  GraduationCap,
  PiggyBank,
  CreditCard,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  TrendingDown,
  ArrowRightLeft,
  Plane,
} from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, Cell } from "recharts"

// Category mapping
const categories = {
  "Food & Dining": { icon: Utensils, color: "#22c55e" },
  "Transport & Fuel": { icon: Fuel, color: "#06b6d4" },
  "Bills & Utilities": { icon: Zap, color: "#f59e0b" },
  "Rent & Housing": { icon: Home, color: "#8b5cf6" },
  "Shopping & Retail": { icon: ShoppingBag, color: "#ec4899" },
  Entertainment: { icon: Film, color: "#f97316" },
  Healthcare: { icon: Heart, color: "#ef4444" },
  Education: { icon: GraduationCap, color: "#14b8a6" },
  "Savings & Investment": { icon: PiggyBank, color: "#22c55e" },
  "EMI & Loans": { icon: CreditCard, color: "#f43f5e" },
  Subscriptions: { icon: Smartphone, color: "#a855f7" },
  Other: { icon: MoreHorizontal, color: "#64748b" },
}

type CategoryKey = keyof typeof categories

// Mock data
const mockTransactions = [
  {
    id: 1,
    date: "2024-01-15",
    amount: 420,
    type: "expense",
    category: "Food & Dining" as CategoryKey,
    description: "Swiggy - Dinner",
    autoCategorized: true,
  },
  {
    id: 2,
    date: "2024-01-15",
    amount: 1200,
    type: "income",
    category: "Other" as CategoryKey,
    description: "Freelance payment",
    autoCategorized: false,
  },
  {
    id: 3,
    date: "2024-01-14",
    amount: 1299,
    type: "expense",
    category: "Shopping & Retail" as CategoryKey,
    description: "Amazon - Headphones",
    autoCategorized: true,
  },
  {
    id: 4,
    date: "2024-01-14",
    amount: 380,
    type: "expense",
    category: "Food & Dining" as CategoryKey,
    description: "Starbucks",
    autoCategorized: true,
  },
  {
    id: 5,
    date: "2024-01-13",
    amount: 245,
    type: "expense",
    category: "Transport & Fuel" as CategoryKey,
    description: "Uber ride",
    autoCategorized: true,
  },
  {
    id: 6,
    date: "2024-01-13",
    amount: 649,
    type: "expense",
    category: "Subscriptions" as CategoryKey,
    description: "Netflix renewal",
    autoCategorized: true,
  },
]

const jars = [
  { name: "Rent", current: 8100, target: 10000, color: "#22c55e", icon: <Home className="w-5 h-5" />, dueIn: "5 days" },
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
]

const weeklySpendingData = [
  { day: "Mon", amount: 850, over: false },
  { day: "Tue", amount: 420, over: false },
  { day: "Wed", amount: 1200, over: true },
  { day: "Thu", amount: 380, over: false },
  { day: "Fri", amount: 920, over: false },
  { day: "Sat", amount: 1450, over: true },
  { day: "Sun", amount: 680, over: false },
]

const spendingCategories = [
  { name: "Food & Dining", amount: 4200, icon: Utensils, color: "#22c55e", percent: 32 },
  { name: "Transport", amount: 2100, icon: Fuel, color: "#06b6d4", percent: 16 },
  { name: "Shopping", amount: 3500, icon: ShoppingBag, color: "#f59e0b", percent: 27 },
  { name: "Entertainment", amount: 1800, icon: Film, color: "#8b5cf6", percent: 14 },
]

// SMS Parser component
function SMSParser({
  onParsed,
}: { onParsed: (tx: { amount: number; type: string; merchant: string; category: CategoryKey }) => void }) {
  const [smsText, setSmsText] = useState("")
  const [parsed, setParsed] = useState<{
    amount: number
    type: string
    merchant: string
    category: CategoryKey
    confidence: number
  } | null>(null)
  const [error, setError] = useState("")

  const parseSMS = () => {
    const patterns = [
      { regex: /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*debited.*?(?:to|at)\s+(.+?)(?:\s+on|\.|$)/i, type: "expense" },
      { regex: /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*credited.*?(?:from|by)\s+(.+?)(?:\s+on|\.|$)/i, type: "income" },
      { regex: /INR\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:debited|spent).*?(?:at|to)\s+(.+?)(?:\.|$)/i, type: "expense" },
    ]

    for (const pattern of patterns) {
      const match = smsText.match(pattern.regex)
      if (match) {
        const amount = Number.parseFloat(match[1].replace(/,/g, ""))
        const merchant = match[2].trim()
        let category: CategoryKey = "Other"
        let confidence = 0.7

        const merchantLower = merchant.toLowerCase()
        if (merchantLower.includes("swiggy") || merchantLower.includes("zomato")) {
          category = "Food & Dining"
          confidence = 0.92
        } else if (merchantLower.includes("uber") || merchantLower.includes("ola")) {
          category = "Transport & Fuel"
          confidence = 0.89
        } else if (merchantLower.includes("amazon") || merchantLower.includes("flipkart")) {
          category = "Shopping & Retail"
          confidence = 0.85
        }

        setParsed({ amount, type: pattern.type, merchant, category, confidence })
        setError("")
        return
      }
    }
    setError("Could not parse SMS. Please enter manually.")
    setParsed(null)
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste your bank SMS here..."
        value={smsText}
        onChange={(e) => setSmsText(e.target.value)}
        className="min-h-[100px] bg-secondary border-border"
      />
      <Button onClick={parseSMS} className="w-full">
        Parse SMS
      </Button>
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      {parsed && (
        <div className="bg-secondary/50 rounded-xl p-4 space-y-3 border border-border">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Parsed Successfully</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-semibold text-foreground">₹{parsed.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-semibold text-foreground">{parsed.category}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              onParsed(parsed)
              setSmsText("")
              setParsed(null)
            }}
            className="w-full"
          >
            Add Transaction
          </Button>
        </div>
      )}
    </div>
  )
}

// Add Transaction Modal
function AddTransactionModal({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("manual")

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full bg-secondary">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="sms">SMS Parse</TabsTrigger>
            <TabsTrigger value="csv">CSV</TabsTrigger>
          </TabsList>
          <TabsContent value="manual" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select defaultValue="expense">
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" placeholder="₹0" className="bg-secondary border-border" />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(categories).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input placeholder="Enter description" className="bg-secondary border-border" />
            </div>
            <Button className="w-full">Add Transaction</Button>
          </TabsContent>
          <TabsContent value="sms" className="mt-4">
            <SMSParser onParsed={(tx) => console.log("Parsed:", tx)} />
          </TabsContent>
          <TabsContent value="csv" className="mt-4 space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">Drop your CSV file here</p>
              <Button variant="secondary">Select File</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Transactions Tab
function TransactionsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const filteredTransactions = mockTransactions.filter((tx) =>
    tx.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalIncome = mockTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const totalExpense = mockTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-primary" />
            </div>
            <span className="text-muted-foreground text-sm">Income</span>
          </div>
          <p className="text-xl font-semibold text-foreground">₹{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-destructive" />
            </div>
            <span className="text-muted-foreground text-sm">Expenses</span>
          </div>
          <p className="text-xl font-semibold text-foreground">₹{totalExpense.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.map((tx) => {
          const CategoryIcon = categories[tx.category]?.icon || MoreHorizontal
          const categoryColor = categories[tx.category]?.color || "#64748b"

          return (
            <div key={tx.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${categoryColor}20` }}
              >
                <CategoryIcon className="w-5 h-5" style={{ color: categoryColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground truncate text-sm">{tx.description}</h4>
                  {tx.autoCategorized && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full">AI</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{tx.category}</p>
              </div>
              <p className={`font-semibold text-sm ${tx.type === "income" ? "text-primary" : "text-foreground"}`}>
                {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString()}
              </p>
            </div>
          )
        })}
      </div>

      {/* Add Button */}
      <AddTransactionModal>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </AddTransactionModal>
    </div>
  )
}

// Jars Tab
function JarsTab() {
  const totalInJars = jars.reduce((sum, jar) => sum + jar.current, 0)

  return (
    <div className="space-y-5">
      {/* Total */}
      <div className="bg-card rounded-2xl p-5 border border-border/50">
        <p className="text-muted-foreground text-sm mb-1">Total in Jars</p>
        <h2 className="text-3xl font-semibold text-foreground">₹{totalInJars.toLocaleString()}</h2>
        <p className="text-muted-foreground text-sm mt-1">Across {jars.length} jars</p>
      </div>

      {/* Rent Warning */}
      <AlertCard
        type="danger"
        title="Rent Shortfall"
        message="₹1,900 short in 5 days. Add ₹400/day to stay on track."
        actions={[{ label: "Add ₹400/day" }]}
      />

      {/* Jars Grid */}
      <div className="space-y-3">
        {jars.map((jar) => (
          <JarCard key={jar.name} {...jar} />
        ))}
      </div>

      {/* Daily Suggestion */}
      <div className="bg-secondary/50 rounded-2xl p-4 border border-border/50">
        <h4 className="font-medium text-foreground mb-2 text-sm">Daily Saving Suggestion</h4>
        <p className="text-muted-foreground text-sm mb-3">Save ₹200 today to keep all jars on track.</p>
        <Button className="w-full" size="sm">
          Auto-allocate ₹200
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" className="h-auto py-3">
          <Plus className="w-4 h-4 mr-2" />
          New Jar
        </Button>
        <Button variant="secondary" className="h-auto py-3">
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Transfer
        </Button>
      </div>
    </div>
  )
}

// Spending Tab
function SpendingTab() {
  return (
    <div className="space-y-5">
      {/* This Month */}
      <div className="bg-card rounded-2xl p-5 border border-border/50">
        <p className="text-muted-foreground text-sm mb-1">Spent This Month</p>
        <h2 className="text-3xl font-semibold text-foreground">₹13,000</h2>
        <div className="flex items-center gap-2 mt-2">
          <TrendingDown className="w-4 h-4 text-primary" />
          <span className="text-primary text-sm font-medium">12% less than last month</span>
        </div>
      </div>

      {/* Weekly Chart */}
      <InsightCard
        title="This Week"
        metric="₹5,900"
        change="On track"
        changeType="positive"
        insight="Wed & Sat had spikes. Consider reducing weekend spending."
      >
        <div className="h-28 mt-3 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklySpendingData} barCategoryGap="20%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.16 0.005 270)",
                  border: "1px solid oklch(0.25 0.005 270)",
                  borderRadius: "12px",
                  color: "oklch(0.98 0 0)",
                }}
                formatter={(value: number) => [`₹${value}`, "Spent"]}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {weeklySpendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.over ? "oklch(0.65 0.2 25)" : "oklch(0.75 0.15 160)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </InsightCard>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">By Category</h3>
        {spendingCategories.map((cat) => (
          <div key={cat.name} className="bg-card rounded-xl p-3 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">{cat.name}</h4>
                  <p className="text-xs text-muted-foreground">{cat.percent}% of total</p>
                </div>
              </div>
              <span className="font-semibold text-foreground text-sm">₹{cat.amount.toLocaleString()}</span>
            </div>
            <Progress value={cat.percent} className="h-1.5" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MoneyPage() {
  const [activeTab, setActiveTab] = useState("transactions")

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Money" />

      <main className="max-w-lg mx-auto px-5 py-4">
        {/* Segment Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-secondary mb-5">
            <TabsTrigger value="transactions" className="text-xs">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="jars" className="text-xs">
              Jars
            </TabsTrigger>
            <TabsTrigger value="spending" className="text-xs">
              Spending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-0">
            <TransactionsTab />
          </TabsContent>

          <TabsContent value="jars" className="mt-0">
            <JarsTab />
          </TabsContent>

          <TabsContent value="spending" className="mt-0">
            <SpendingTab />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  )
}
