
'use client';

import { useState, useEffect } from 'react';
import { PawPrint } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/language-context';

export default function AnalysisLoading() {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 500);

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
        <p className="text-sm font-bold text-primary animate-pulse">{progress}% 분석 중...</p>
      </div>
    </div>
  );
}
