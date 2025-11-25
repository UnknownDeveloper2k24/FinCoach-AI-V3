'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onResponse?: (response: string) => void;
}

export function VoiceInput({ onTranscript, onResponse }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/v1/voice', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setTranscript(data.transcript || '');
      onTranscript(data.transcript || '');

      if (data.response) {
        onResponse?.(data.response);
      }
    } catch (error) {
      console.error('Audio processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        {!isListening ? (
          <Button
            onClick={startListening}
            disabled={isProcessing}
            className="flex-1"
            size="lg"
          >
            <Mic className="mr-2 h-4 w-4" />
            Start Listening
          </Button>
        ) : (
          <Button
            onClick={stopListening}
            variant="destructive"
            className="flex-1"
            size="lg"
          >
            <Square className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        )}
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing audio...</span>
        </div>
      )}

      {transcript && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-slate-600 mb-2">Transcript:</p>
          <p className="text-slate-900">{transcript}</p>
        </div>
      )}
    </div>
  );
}
