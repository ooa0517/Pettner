
'use client';

import { useState, useEffect } from 'react';
import { PawPrint, CheckCircle2, ShieldCheck, Microscope, Search, Zap, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/language-context';
import AdBanner from '@/components/ad-banner';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: "이미지에서 텍스트 데이터 추출 중...", icon: Search },
  { id: 2, label: "AAFCO 영양 가이드라인 대조 중...", icon: ShieldCheck },
  { id: 3, label: "원재료별 안전 등급 신호등 판별 중...", icon: Microscope },
  { id: 4, label: "수의 영양학 기호성 알고리즘 연산 중...", icon: Zap },
  { id: 5, label: "1:1 맞춤형 수의 진단 리포트 생성 중...", icon: PawPrint }
];

export default function AnalysisLoading() {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return 99;
        
        let increment = 0;
        if (prev < 30) increment = Math.random() * 2 + 1;
        else if (prev < 70) increment = Math.random() * 1 + 0.5;
        else increment = 0.1;
        
        const next = prev + increment;
        
        // 현재 진행률에 따라 가짜 로딩 스텝 업데이트
        const stepThreshold = 100 / STEPS.length;
        const newStepIdx = Math.min(Math.floor(next / stepThreshold), STEPS.length - 1);
        setCurrentStepIdx(newStepIdx);
        
        return next >= 99.9 ? 99.9 : next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-10 py-20 min-h-[80vh] animate-in fade-in duration-1000">
      <div className="relative flex items-center justify-center h-32 w-32">
        <div className="absolute h-full w-full bg-primary/10 rounded-full animate-ping"></div>
        <div className="absolute h-4/5 w-4/5 bg-primary/20 rounded-full animate-pulse"></div>
        <div className="relative z-10 p-6 bg-primary rounded-3xl shadow-2xl shadow-primary/40 text-white">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </div>

      <div className="space-y-4 max-w-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-black font-headline tracking-tight">정밀 분석 엔진 가동 중</h1>
          <p className="text-sm text-muted-foreground font-medium">수의학 빅데이터와 실시간 매칭 중입니다.</p>
        </div>
        
        <div className="w-full space-y-3 pt-4">
          <Progress value={progress} className="h-2 bg-primary/10" />
          <div className="flex justify-between items-center px-1">
            <p className="text-xs font-black text-primary uppercase tracking-widest">{Math.floor(progress)}% Processed</p>
            <p className="text-[10px] text-muted-foreground font-bold">V25.0 ENGINE</p>
          </div>
        </div>
      </div>

      {/* Dynamic Process Steps */}
      <div className="w-full max-w-xs space-y-3">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStepIdx;
          const isDone = idx < currentStepIdx;
          return (
            <div key={step.id} className={cn(
              "flex items-center gap-4 p-4 rounded-2xl transition-all border-2",
              isActive ? "bg-primary/5 border-primary/20 scale-105" : "bg-white border-transparent opacity-40"
            )}>
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                isActive ? "bg-primary text-white" : isDone ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
              )}>
                {isDone ? <CheckCircle2 size={18} /> : <step.icon size={18} className={cn(isActive && "animate-pulse")} />}
              </div>
              <p className={cn("text-xs font-black text-left leading-tight", isActive ? "text-primary" : "text-muted-foreground")}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-sm pt-4">
        <AdBanner position="loading" />
      </div>
    </div>
  );
}
