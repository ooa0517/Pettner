'use client';

import { useState, useEffect } from 'react';
import { PawPrint } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/language-context';
import AdBanner from '@/components/ad-banner';

export default function AnalysisLoading() {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 진행률이 100%를 넘지 않도록 하고, AI 분석 시간에 맞춰 더 천천히 증가하게 조정
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return 99; // 99%에서 멈춰서 실제 응답을 기다림
        
        // 초반에는 조금 빠르게, 80% 이후부터는 매우 천천히 증가하여 '정밀 분석' 느낌 전달
        let increment = 0;
        if (prev < 30) {
          increment = Math.random() * 3 + 1;
        } else if (prev < 70) {
          increment = Math.random() * 1.5 + 0.5;
        } else if (prev < 90) {
          increment = Math.random() * 0.5 + 0.1;
        } else {
          increment = 0.05; // 90% 이상부터는 아주 미세하게 증가
        }
        
        const next = prev + increment;
        return next >= 99.9 ? 99.9 : next;
      });
    }, 200); // 업데이트 주기를 200ms로 늘려 더 부드럽게 이동

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-16">
      <div className="relative flex items-center justify-center h-24 w-24">
        <div className="absolute h-full w-full bg-primary/20 rounded-full animate-ping"></div>
        <PawPrint className="h-12 w-12 text-primary animate-pulse" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight">
          {t('analysisLoading.titleV2')}
        </h1>
        <p className="text-muted-foreground max-w-md pt-2" dangerouslySetInnerHTML={{ __html: t('analysisLoading.descriptionV2') }} />
      </div>
      <div className="w-full max-w-xs space-y-2 pt-4">
        <Progress value={progress} className="h-3" />
        <p className="text-sm font-bold text-primary animate-pulse">
          {Math.floor(progress)}% {t('analysisLoading.statusText') || '분석 중...'}
        </p>
      </div>

      {/* 로딩 중 지루함을 수익으로 전환하는 광고 지면 */}
      <div className="w-full max-w-sm pt-8">
        <AdBanner position="loading" />
      </div>
    </div>
  );
}
