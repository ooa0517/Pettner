
'use client';

import { PawPrint } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-primary flex flex-col items-center justify-center z-50 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
        <PawPrint className="h-24 w-24 text-white relative z-10 animate-bounce" />
      </div>
      <h1 className="text-4xl font-black text-white mt-8 font-headline tracking-tighter">
        Pettner
      </h1>
      <p className="text-white/60 mt-2 font-medium">수의 영양학의 새로운 기준</p>
    </div>
  );
}
