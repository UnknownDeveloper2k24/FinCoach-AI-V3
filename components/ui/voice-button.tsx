"use client"

import { useState } from "react"
import { Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"

export function VoiceButton() {
  const [isListening, setIsListening] = useState(false)

  return (
    <button
      onClick={() => setIsListening(!isListening)}
      className={cn(
        "fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
        isListening ? "bg-destructive scale-110 animate-pulse" : "bg-primary hover:scale-105",
      )}
    >
      {isListening ? (
        <MicOff className="w-6 h-6 text-destructive-foreground" />
      ) : (
        <Mic className="w-6 h-6 text-primary-foreground" />
      )}
    </button>
  )
}
