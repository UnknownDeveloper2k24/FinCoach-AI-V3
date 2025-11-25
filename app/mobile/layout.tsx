'use client';

import React from 'react';
import { Smartphone } from 'lucide-react';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-sm mx-auto">
        {/* Mobile Frame */}
        <div className="bg-black rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800">
          {/* Notch */}
          <div className="bg-black h-6 flex justify-center items-center">
            <div className="w-32 h-5 bg-black rounded-b-2xl"></div>
          </div>

          {/* Screen */}
          <div className="bg-white min-h-screen overflow-y-auto">
            {children}
          </div>

          {/* Home Indicator */}
          <div className="bg-black h-6 flex justify-center items-center">
            <div className="w-32 h-1 bg-gray-700 rounded-full"></div>
          </div>
        </div>

        {/* Device Info */}
        <div className="text-center mt-6 text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm">Mobile Preview</span>
          </div>
          <p className="text-xs text-gray-400">Max width: 384px</p>
        </div>
      </div>
    </div>
  );
}
