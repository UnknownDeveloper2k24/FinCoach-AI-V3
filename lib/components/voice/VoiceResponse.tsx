'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceResponseProps {
  text: string;
  autoPlay?: boolean;
}

export function VoiceResponse({ text, autoPlay = false }: VoiceResponseProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (autoPlay && text) {
      speak();
    }
  }, [text, autoPlay]);

  const speak = async () => {
    if (!text) return;

    setIsLoading(true);
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-slate-900">{text}</p>
      </div>

      <Button
        onClick={isSpeaking ? stop : speak}
        disabled={isLoading || !text}
        className="w-full"
        variant={isSpeaking ? 'destructive' : 'default'}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : isSpeaking ? (
          <>
            <Volume2 className="mr-2 h-4 w-4" />
            Stop Speaking
          </>
        ) : (
          <>
            <Volume2 className="mr-2 h-4 w-4" />
            Play Response
          </>
        )}
      </Button>
    </div>
  );
}
