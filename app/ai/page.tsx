"use client"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { InsightCard } from "@/components/ui/insight-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  Send,
  Mic,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Brain,
  Zap,
  BarChart3,
  RefreshCw,
  Utensils,
  ShoppingBag,
  Fuel,
  Film,
  Smartphone,
  MessageCircle,
  LineChart,
} from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, BarChart } from "recharts"

// Mock data
const incomePredictionData = [
  { date: "Jan 8", actual: 4200 },
  { date: "Jan 9", actual: 5100 },
  { date: "Jan 10", actual: 3800 },
  { date: "Jan 11", actual: 6200 },
  { date: "Jan 12", actual: 4500 },
  { date: "Jan 13", actual: 5800 },
  { date: "Jan 14", actual: 4900 },
  { date: "Jan 15", predicted: 5200 },
  { date: "Jan 16", predicted: 4800 },
  { date: "Jan 17", predicted: 5500 },
]

const spendingPatternsData = [
  { day: "Mon", amount: 420, avgAmount: 380 },
  { day: "Tue", amount: 350, avgAmount: 400 },
  { day: "Wed", amount: 580, avgAmount: 420 },
  { day: "Thu", amount: 390, avgAmount: 410 },
  { day: "Fri", amount: 720, avgAmount: 500 },
  { day: "Sat", amount: 950, avgAmount: 650 },
  { day: "Sun", amount: 680, avgAmount: 520 },
]

const categoryPatterns = [
  {
    name: "Food & Dining",
    amount: 4200,
    frequency: "4.2x/week",
    trend: "increasing",
    color: "#22c55e",
    icon: Utensils,
  },
  { name: "Transport", amount: 2100, frequency: "2.1x/week", trend: "stable", color: "#06b6d4", icon: Fuel },
  { name: "Shopping", amount: 3500, frequency: "1.5x/week", trend: "increasing", color: "#f59e0b", icon: ShoppingBag },
  { name: "Entertainment", amount: 1800, frequency: "2.3x/week", trend: "stable", color: "#8b5cf6", icon: Film },
]

const optimizations = [
  {
    id: 1,
    priority: "high",
    category: "Food & Dining",
    currentSpend: 6000,
    suggestedSpend: 4200,
    potentialSavings: 1800,
    action: "Reduce food delivery by 30%",
    icon: Utensils,
    color: "#22c55e",
  },
  {
    id: 2,
    priority: "medium",
    category: "Subscriptions",
    currentSpend: 2400,
    suggestedSpend: 1600,
    potentialSavings: 800,
    action: "Cancel unused Hotstar",
    icon: Smartphone,
    color: "#ec4899",
  },
]

// User context for coach
const userContext = {
  balance: 12450,
  safeToSpend: 420,
  predictedIncome: 37100,
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  data?: { type: string; chartData?: { label: string; value: number }[] }
}

// Example prompts
const examplePrompts = [
  { icon: Wallet, text: "Can I afford ₹500?" },
  { icon: TrendingUp, text: "Predict my income" },
  { icon: PiggyBank, text: "How are my goals?" },
  { icon: BarChart3, text: "Spending patterns" },
]

function generateAIResponse(query: string): Message {
  const queryLower = query.toLowerCase()

  if (queryLower.includes("afford") || queryLower.includes("can i")) {
    const amount = Number.parseInt(query.match(/₹?\d+/)?.[0]?.replace("₹", "") || "500")
    const canAfford = amount <= userContext.safeToSpend
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: canAfford
        ? `Yes, you can afford ₹${amount}. Your safe-to-spend is ₹${userContext.safeToSpend}. After this, you'll have ₹${userContext.safeToSpend - amount} left.`
        : `I'd recommend against ₹${amount}. Your safe-to-spend is ₹${userContext.safeToSpend}. Consider waiting or reducing the amount.`,
      timestamp: new Date(),
    }
  }

  if (queryLower.includes("predict") || queryLower.includes("income")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `Based on your patterns, I predict ₹${userContext.predictedIncome.toLocaleString()} over the next 7 days. This is 8% higher than last week.`,
      timestamp: new Date(),
      data: {
        type: "prediction",
        chartData: [
          { label: "Mon", value: 4200 },
          { label: "Tue", value: 6100 },
          { label: "Wed", value: 4800 },
          { label: "Thu", value: 5900 },
          { label: "Fri", value: 5200 },
        ],
      },
    }
  }

  if (queryLower.includes("pattern") || queryLower.includes("spending")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `Top categories: Food & Dining (₹4,200), Shopping (₹3,500), Transport (₹2,100). Weekend spending is 45% higher than weekdays.`,
      timestamp: new Date(),
      data: {
        type: "patterns",
        chartData: [
          { label: "Food", value: 4200 },
          { label: "Shop", value: 3500 },
          { label: "Transport", value: 2100 },
        ],
      },
    }
  }

  return {
    id: Date.now().toString(),
    role: "assistant",
    content: `Your balance is ₹${userContext.balance.toLocaleString()}, safe-to-spend ₹${userContext.safeToSpend}/day. Ask about affordability, predictions, or spending patterns.`,
    timestamp: new Date(),
  }
}

// Insights Tab
function InsightsTab() {
  return (
    <div className="space-y-5">
      {/* Predictions Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground text-xs">7-Day Forecast</span>
          </div>
          <p className="text-xl font-bold text-foreground">₹37,100</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-primary text-xs">+8%</span>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground text-xs">Confidence</span>
          </div>
          <p className="text-xl font-bold text-primary">78%</p>
          <Progress value={78} className="h-1.5 mt-2" />
        </div>
      </div>

      {/* Income Trend */}
      <InsightCard title="Income Trend + Forecast" metric="Strong weekday pattern" insight="Weekend income varies.">
        <div className="h-36 mt-3 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incomePredictionData}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.75 0.15 160)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.75 0.15 160)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.12 200)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.7 0.12 200)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.65 0 0)", fontSize: 9 }}
                interval={1}
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
                  `₹${value?.toLocaleString()}`,
                  name === "actual" ? "Actual" : "Predicted",
                ]}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="oklch(0.75 0.15 160)"
                strokeWidth={2}
                fill="url(#actualGrad)"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="oklch(0.7 0.12 200)"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="url(#predictedGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </InsightCard>

      {/* Spending Patterns */}
      <InsightCard title="Spending by Day" metric="Peak: Saturday" insight="Weekend spending 45% higher.">
        <div className="h-32 mt-3 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendingPatternsData} barCategoryGap="20%">
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
              <Bar dataKey="avgAmount" fill="oklch(0.25 0.005 270)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="amount" fill="oklch(0.75 0.15 160)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </InsightCard>

      {/* Category Patterns */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground text-sm">Category Patterns</h4>
        {categoryPatterns.slice(0, 3).map((cat) => {
          const Icon = cat.icon
          return (
            <div key={cat.name} className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                <Icon className="w-4 h-4" style={{ color: cat.color }} />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-foreground text-sm">{cat.name}</h5>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{cat.frequency}</span>
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      cat.trend === "increasing" ? "text-destructive" : "text-primary",
                    )}
                  >
                    {cat.trend === "increasing" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {cat.trend}
                  </span>
                </div>
              </div>
              <span className="font-semibold text-foreground text-sm">₹{cat.amount.toLocaleString()}</span>
            </div>
          )
        })}
      </div>

      {/* Optimizations */}
      <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <p className="text-muted-foreground text-xs">Potential Monthly Savings</p>
            <p className="text-xl font-bold text-primary">₹3,400</p>
          </div>
        </div>
        <div className="space-y-2">
          {optimizations.map((opt) => (
            <div key={opt.id} className="bg-card/50 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-foreground font-medium">{opt.category}</span>
                <span className="text-primary font-medium">Save ₹{opt.potentialSavings.toLocaleString()}</span>
              </div>
              <p className="text-muted-foreground text-xs">{opt.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Coach Tab
function CoachTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI financial coach. Ask me about affordability, income predictions, or spending patterns.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    const aiResponse = generateAIResponse(input)
    setMessages((prev) => [...prev, aiResponse])
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      {/* Messages */}
      <ScrollArea className="flex-1 px-1" ref={scrollRef}>
        <div className="space-y-3 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-2", message.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {message.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border/50 text-foreground rounded-tl-sm",
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.data?.chartData && (
                  <div className="flex items-end gap-1 h-12 mt-2 pt-2 border-t border-border/30">
                    {message.data.chartData.map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-primary/30 rounded-t"
                          style={{
                            height: `${(item.value / Math.max(...message.data!.chartData!.map((d) => d.value))) * 32}px`,
                          }}
                        />
                        <span className="text-[8px] text-muted-foreground">{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-3 py-2">
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Example Prompts */}
        {messages.length <= 2 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {examplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setInput(prompt.text)}
                className="flex items-center gap-2 p-2.5 bg-card rounded-xl border border-border/50 text-left hover:border-primary/50 transition-colors"
              >
                <prompt.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-foreground">{prompt.text}</span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="pt-3 border-t border-border/50 mt-auto">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Mic className="w-5 h-5" />
          </Button>
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-secondary border-0"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AIPage() {
  const [activeTab, setActiveTab] = useState("insights")

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="AI Assistant" />

      <main className="max-w-lg mx-auto px-5 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-secondary mb-5">
            <TabsTrigger value="insights" className="text-xs flex items-center gap-1.5">
              <LineChart className="w-3.5 h-3.5" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="coach" className="text-xs flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              Coach
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="mt-0">
            <InsightsTab />
          </TabsContent>

          <TabsContent value="coach" className="mt-0">
            <CoachTab />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  )
}
