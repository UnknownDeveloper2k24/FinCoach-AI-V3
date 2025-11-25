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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Upload,
  MessageSquare,
  Filter,
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
} from "lucide-react"

// Category mapping with icons and colors
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

// Mock transactions data
const mockTransactions = [
  {
    id: 1,
    date: "2024-01-15",
    amount: 420,
    type: "expense",
    category: "Food & Dining" as CategoryKey,
    description: "Swiggy - Dinner",
    autoCategorized: true,
    confidence: 0.92,
  },
  {
    id: 2,
    date: "2024-01-15",
    amount: 1200,
    type: "income",
    category: "Other" as CategoryKey,
    description: "Freelance payment",
    autoCategorized: false,
    confidence: 0,
  },
  {
    id: 3,
    date: "2024-01-14",
    amount: 1299,
    type: "expense",
    category: "Shopping & Retail" as CategoryKey,
    description: "Amazon - Headphones",
    autoCategorized: true,
    confidence: 0.88,
  },
  {
    id: 4,
    date: "2024-01-14",
    amount: 380,
    type: "expense",
    category: "Food & Dining" as CategoryKey,
    description: "Starbucks",
    autoCategorized: true,
    confidence: 0.95,
  },
  {
    id: 5,
    date: "2024-01-13",
    amount: 245,
    type: "expense",
    category: "Transport & Fuel" as CategoryKey,
    description: "Uber ride",
    autoCategorized: true,
    confidence: 0.91,
  },
  {
    id: 6,
    date: "2024-01-13",
    amount: 649,
    type: "expense",
    category: "Subscriptions" as CategoryKey,
    description: "Netflix renewal",
    autoCategorized: true,
    confidence: 0.98,
  },
  {
    id: 7,
    date: "2024-01-12",
    amount: 5200,
    type: "income",
    category: "Other" as CategoryKey,
    description: "Client payment - Design work",
    autoCategorized: false,
    confidence: 0,
  },
  {
    id: 8,
    date: "2024-01-12",
    amount: 1500,
    type: "expense",
    category: "Bills & Utilities" as CategoryKey,
    description: "Electricity bill",
    autoCategorized: true,
    confidence: 0.97,
  },
  {
    id: 9,
    date: "2024-01-11",
    amount: 850,
    type: "expense",
    category: "Food & Dining" as CategoryKey,
    description: "Zomato - Weekly groceries",
    autoCategorized: true,
    confidence: 0.85,
  },
  {
    id: 10,
    date: "2024-01-11",
    amount: 450,
    type: "expense",
    category: "Transport & Fuel" as CategoryKey,
    description: "Petrol",
    autoCategorized: true,
    confidence: 0.94,
  },
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
    // Simulated SMS parsing logic based on SOP patterns
    const patterns = [
      { regex: /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*debited.*?(?:to|at)\s+(.+?)(?:\s+on|\.|$)/i, type: "expense" },
      { regex: /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*credited.*?(?:from|by)\s+(.+?)(?:\s+on|\.|$)/i, type: "income" },
      { regex: /INR\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:debited|spent).*?(?:at|to)\s+(.+?)(?:\.|$)/i, type: "expense" },
      {
        regex: /INR\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:credited|received).*?(?:from|by)\s+(.+?)(?:\.|$)/i,
        type: "income",
      },
    ]

    for (const pattern of patterns) {
      const match = smsText.match(pattern.regex)
      if (match) {
        const amount = Number.parseFloat(match[1].replace(/,/g, ""))
        const merchant = match[2].trim()

        // Auto-categorize based on merchant keywords
        let category: CategoryKey = "Other"
        let confidence = 0.7

        const merchantLower = merchant.toLowerCase()
        if (merchantLower.includes("swiggy") || merchantLower.includes("zomato") || merchantLower.includes("food")) {
          category = "Food & Dining"
          confidence = 0.92
        } else if (
          merchantLower.includes("uber") ||
          merchantLower.includes("ola") ||
          merchantLower.includes("petrol")
        ) {
          category = "Transport & Fuel"
          confidence = 0.89
        } else if (merchantLower.includes("amazon") || merchantLower.includes("flipkart")) {
          category = "Shopping & Retail"
          confidence = 0.85
        } else if (merchantLower.includes("netflix") || merchantLower.includes("spotify")) {
          category = "Subscriptions"
          confidence = 0.95
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
        placeholder="Paste your bank SMS here...&#10;&#10;Example: Rs.420 debited from A/c XX1234 to SWIGGY on 15-01-24"
        value={smsText}
        onChange={(e) => setSmsText(e.target.value)}
        className="min-h-[120px] bg-secondary border-border"
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
              <p className="text-muted-foreground">Type</p>
              <p className="font-semibold text-foreground capitalize">{parsed.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Merchant</p>
              <p className="font-semibold text-foreground">{parsed.merchant}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-semibold text-foreground">{parsed.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full">
              {Math.round(parsed.confidence * 100)}% confidence
            </span>
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
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
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
            <div>
              <Label>Date</Label>
              <Input type="date" className="bg-secondary border-border" />
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
              <p className="text-muted-foreground text-sm mb-4">or click to browse</p>
              <Button variant="secondary">Select File</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Expected columns:</p>
              <p>date, amount, type, category, description</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Filter transactions
  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || tx.type === filterType
    const matchesCategory = filterCategory === "all" || tx.category === filterCategory
    return matchesSearch && matchesType && matchesCategory
  })

  // Group by date
  const groupedTransactions = filteredTransactions.reduce(
    (acc, tx) => {
      const date = tx.date
      if (!acc[date]) acc[date] = []
      acc[date].push(tx)
      return acc
    },
    {} as Record<string, typeof mockTransactions>,
  )

  // Calculate totals
  const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const totalExpense = filteredTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Transactions" />

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-primary" />
              </div>
              <span className="text-muted-foreground text-sm">Income</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">₹{totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-muted-foreground text-sm">Expenses</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">₹{totalExpense.toLocaleString()}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary text-primary-foreground" : ""}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {showFilters && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                <SelectTrigger className="w-32 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40 bg-secondary border-border">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.keys(categories).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Auto-categorization Stats */}
        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary font-medium">Auto-categorization</p>
              <p className="text-muted-foreground text-sm">80% of transactions categorized</p>
            </div>
            <div className="text-2xl font-bold text-primary">80%</div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, transactions]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium px-1">
                {new Date(date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </h3>
              {transactions.map((tx) => {
                const CategoryIcon = categories[tx.category]?.icon || MoreHorizontal
                const categoryColor = categories[tx.category]?.color || "#64748b"

                return (
                  <div key={tx.id} className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${categoryColor}20` }}
                    >
                      <CategoryIcon className="w-5 h-5" style={{ color: categoryColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground truncate">{tx.description}</h4>
                        {tx.autoCategorized && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full shrink-0">
                            AI
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{tx.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === "income" ? "text-primary" : "text-foreground"}`}>
                        {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3 pt-4">
          <AddTransactionModal>
            <ActionButton
              label="Add Transaction"
              sublabel="Manual entry, SMS, or CSV"
              icon={<Plus className="w-5 h-5 text-muted-foreground" />}
            />
          </AddTransactionModal>
          <ActionButton
            label="Parse Bank SMS"
            sublabel="Auto-detect from message"
            icon={<MessageSquare className="w-5 h-5 text-muted-foreground" />}
          />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
