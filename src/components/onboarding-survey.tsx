
'use client';

import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OnboardingSurvey({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="space-y-4">
        <div className="inline-flex p-3 bg-primary/10 rounded-full">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-extrabold font-headline leading-tight">
          반갑습니다!<br/>분석을 시작해볼까요?
        </h2>
        <p className="text-xl font-bold text-primary px-4">
          우리 아이를 위한 수의 영양학 기반<br/>성분 분석을 하시겠습니까?
        </p>
        <p className="text-muted-foreground text-sm px-6">
          Pettner는 사료, 간식, 영양제를 아우르는<br/>전 세계 수의 영양학 근거를 기반으로 정밀 분석합니다.
        </p>
      </div>

      <Card className="w-full max-w-md border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="font-medium">사료·간식·영양제 통합 영양 분석</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="font-medium">국제 표준(AAFCO/NRC) 가이드라인 준수</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="font-medium">기저질환 및 생애주기별 맞춤 분석</span>
            </div>
          </div>

          <Button onClick={onComplete} size="lg" className="w-full h-16 text-lg rounded-2xl shadow-lg shadow-primary/30">
            예, 전문적인 분석을 시작하겠습니다
          </Button>
        </CardContent>
      </Card>
      
      <Button variant="ghost" onClick={onComplete} className="text-muted-foreground underline">
        건너뛰고 바로 시작하기
      </Button>
    </div>
  );
}
    