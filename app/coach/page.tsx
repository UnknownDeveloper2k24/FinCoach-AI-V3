"use client"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/navigation/header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  TrendingUp,
  Wallet,
  Target,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  data?: {
    type: "affordability" | "prediction" | "balance" | "patterns" | "goal" | "alert"
    value?: number
    suggestion?: string
    chartData?: { label: string; value: number }[]
  }
}

// Example prompts based on SOP
const examplePrompts = [
  { icon: Wallet, text: "Can I afford ₹500 for dinner?", category: "affordability" },
  { icon: TrendingUp, text: "Predict my income next week", category: "prediction" },
  { icon: PiggyBank, text: "How are my savings goals?", category: "goals" },
  { icon: BarChart3, text: "Show my spending patterns", category: "patterns" },
  { icon: AlertTriangle, text: "When will I run out of money?", category: "runout" },
  { icon: Target, text: "Can I save for a ₹60k scooter?", category: "goal-planning" },
]

// Mock context panel data
const userContext = {
  balance: 12450,
  safeToSpend: 420,
  predictedIncome: 37100,
  jars: [
    { name: "Rent", current: 8100, target: 10000, status: "at-risk" },
    { name: "Emergency", current: 15000, target: 50000, status: "ok" },
    { name: "Savings", current: 28000, target: 100000, status: "ok" },
  ],
  activeGoals: 3,
  alerts: 2,
}

// Simulated AI responses based on query type
function generateAIResponse(query: string): Message {
  const queryLower = query.toLowerCase()

  // Affordability check
  if (queryLower.includes("afford") || queryLower.includes("can i") || queryLower.includes("spend")) {
    const amount = Number.parseInt(query.match(/₹?\d+/)?.[0]?.replace("₹", "") || "500")
    const canAfford = amount <= userContext.safeToSpend

    return {
      id: Date.now().toString(),
      role: "assistant",
      content: canAfford
        ? `Yes, you can afford ₹${amount} today. Your safe-to-spend limit is ₹${userContext.safeToSpend}. After this purchase, you'll have ₹${userContext.safeToSpend - amount} remaining for the day.`
        : `I'd recommend against spending ₹${amount} right now. Your safe-to-spend today is ₹${userContext.safeToSpend}. This purchase would put you ₹${amount - userContext.safeToSpend} over budget. Consider waiting until tomorrow or reducing the amount.`,
      timestamp: new Date(),
      data: {
        type: "affordability",
        value: amount,
        suggestion: canAfford ? "Proceed with purchase" : "Wait or reduce amount",
      },
    }
  }

  // Income prediction
  if (queryLower.includes("predict") || queryLower.includes("income") || queryLower.includes("earn")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `Based on your earning patterns, I predict you'll earn approximately ₹${userContext.predictedIncome.toLocaleString()} over the next 7 days. This is 8% higher than last week. Your strongest earning days are typically Tuesday and Thursday.`,
      timestamp: new Date(),
      data: {
        type: "prediction",
        value: userContext.predictedIncome,
        chartData: [
          { label: "Mon", value: 4200 },
          { label: "Tue", value: 6100 },
          { label: "Wed", value: 4800 },
          { label: "Thu", value: 5900 },
          { label: "Fri", value: 5200 },
          { label: "Sat", value: 5400 },
          { label: "Sun", value: 5500 },
        ],
      },
    }
  }

  // Balance/status
  if (queryLower.includes("balance") || queryLower.includes("how much") || queryLower.includes("money left")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `Your current balance is ₹${userContext.balance.toLocaleString()}. You have ₹${userContext.safeToSpend} safe to spend today. Your Rent jar needs attention - it's ₹1,900 short with 5 days until the deadline.`,
      timestamp: new Date(),
      data: {
        type: "balance",
        value: userContext.balance,
        suggestion: "Focus on filling Rent jar",
      },
    }
  }

  // Spending patterns
  if (queryLower.includes("pattern") || queryLower.includes("spending") || queryLower.includes("where")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `Your top spending categories this month: Food & Dining (₹4,200, 32%), Shopping (₹3,500, 27%), and Transport (₹2,100, 16%). I notice your weekend spending is 45% higher than weekdays. Consider setting a weekend spending limit to improve savings.`,
      timestamp: new Date(),
      data: {
        type: "patterns",
        chartData: [
          { label: "Food", value: 4200 },
          { label: "Shopping", value: 3500 },
          { label: "Transport", value: 2100 },
          { label: "Entertainment", value: 1800 },
          { label: "Bills", value: 1400 },
        ],
      },
    }
  }

  // Goals
  if (queryLower.includes("goal") || queryLower.includes("save for") || queryLower.includes("saving")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `You have 3 active goals. Your "Buy Scooter" goal is 40% complete (₹34,000/₹85,000). To reach it by June, you need to save ₹12,750/month. Based on your disposable income, this is achievable if you reduce dining out by 20%.`,
      timestamp: new Date(),
      data: {
        type: "goal",
        value: 40,
        suggestion: "Reduce dining out by 20%",
      },
    }
  }

  // Cash runout
  if (queryLower.includes("run out") || queryLower.includes("deplete") || queryLower.includes("last")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `At your current spending rate (₹850/day avg), your balance will deplete in approximately 14 days. However, with predicted income of ₹37,100 next week, you should maintain a healthy balance. I recommend keeping daily spending under ₹600 to be safe.`,
      timestamp: new Date(),
      data: {
        type: "alert",
        value: 14,
        suggestion: "Keep daily spending under ₹600",
      },
    }
  }

  // Default response
  return {
    id: Date.now().toString(),
    role: "assistant",
    content: `I understand you're asking about "${query}". Based on your current financial situation: Balance ₹${userContext.balance.toLocaleString()}, Safe to spend ₹${userContext.safeToSpend}/day. How can I help you further? You can ask about affordability, predictions, spending patterns, or goals.`,
    timestamp: new Date(),
  }
}

// Message Component
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border/50 text-foreground rounded-tl-sm",
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>

        {/* Data visualization for assistant messages */}
        {message.data && !isUser && (
          <div className="mt-3 pt-3 border-t border-border/50">
            {message.data.type === "affordability" && (
              <div
                className={cn(
                  "flex items-center gap-2 text-sm",
                  message.data.value! <= userContext.safeToSpend ? "text-primary" : "text-warning",
                )}
              >
                {message.data.value! <= userContext.safeToSpend ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{message.data.suggestion}</span>
              </div>
            )}

            {message.data.chartData && (
              <div className="flex items-end gap-1 h-16 mt-2">
                {message.data.chartData.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/30 rounded-t"
                      style={{
                        height: `${(item.value / Math.max(...message.data!.chartData!.map((d) => d.value))) * 48}px`,
                      }}
                    />
                    <span className="text-[9px] text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            )}

            {message.data.suggestion && message.data.type !== "affordability" && (
              <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                <ChevronRight className="w-4 h-4" />
                <span>{message.data.suggestion}</span>
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground mt-2">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  )
}

// Context Panel Component
function ContextPanel() {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-4">
      <h4 className="font-medium text-foreground text-sm">Your Context</h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-lg font-semibold text-foreground">₹{userContext.balance.toLocaleString()}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Safe to Spend</p>
          <p className="text-lg font-semibold text-primary">₹{userContext.safeToSpend}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Jars Status</p>
        {userContext.jars.map((jar) => (
          <div key={jar.name} className="flex items-center justify-between text-sm">
            <span className="text-foreground">{jar.name}</span>
            <span className={cn("font-medium", jar.status === "at-risk" ? "text-warning" : "text-primary")}>
              {Math.round((jar.current / jar.target) * 100)}%
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
        <span className="text-muted-foreground">{userContext.alerts} active alerts</span>
        <Button variant="ghost" size="sm" className="text-primary h-auto p-0">
          View
        </Button>
      </div>
    </div>
  )
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm your AI financial coach. I can help you with affordability checks, income predictions, spending analysis, and goal planning. What would you like to know?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showContext, setShowContext] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 800))

    const aiResponse = generateAIResponse(input)
    setMessages((prev) => [...prev, aiResponse])
    setIsLoading(false)
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const toggleVoice = () => {
    setIsListening(!isListening)
    // Voice recognition would be implemented here
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="AI Coach" />

      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Context Toggle */}
        <div className="px-5 py-3 border-b border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowContext(!showContext)}
            className="text-muted-foreground"
          >
            {showContext ? "Hide Context" : "Show Context"}
            <ChevronRight className={cn("w-4 h-4 ml-1 transition-transform", showContext && "rotate-90")} />
          </Button>
        </div>

        {/* Context Panel */}
        {showContext && (
          <div className="px-5 py-4 border-b border-border/50">
            <ContextPanel />
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 px-5 py-4" ref={scrollRef}>
          <div className="space-y-1">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
          </div>

          {/* Example Prompts - show when conversation is short */}
          {messages.length <= 2 && (
            <div className="mt-6 space-y-3">
              <p className="text-xs text-muted-foreground px-1">Try asking:</p>
              <div className="grid grid-cols-2 gap-2">
                {examplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handlePromptClick(prompt.text)}
                    className="flex items-center gap-2 p-3 bg-card rounded-xl border border-border/50 text-left hover:border-primary/50 transition-colors"
                  >
                    <prompt.icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs text-foreground line-clamp-2">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="px-5 py-4 border-t border-border/50 bg-card/50 backdrop-blur-xl safe-area-pb mb-20">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              className={cn("shrink-0", isListening && "bg-primary/20 text-primary")}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Input
              ref={inputRef}
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
      </main>

      <BottomNav />
    </div>
  )
}
