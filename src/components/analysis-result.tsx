
'use client';

import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Repeat, ShoppingBag, 
  Dog, Cat, ThumbsUp, ThumbsDown, 
  Sparkles, HeartPulse, 
  AlertCircle, Zap, Activity,
  Smile, Frown, 
  UtensilsCrossed, Weight, InfoIcon as InfoLucide
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const { t, language } = useLanguage();
  const [productName] = useState(result?.productIdentity?.name || '분석된 제품');
  const [palatability, setPalatability] = useState<'good' | 'normal' | 'bad' | null>(null);

  if (!result || result.status === 'error') {
     return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
            <Card className="text-center border-destructive/20 bg-destructive/5">
                <CardHeader className="p-8">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4"/>
                  <h1 className="text-2xl font-bold">분석 실패</h1>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-muted-foreground">성분표 분석 중 오류가 발생했습니다. 다시 시도해 주세요.</p>
                </CardContent>
            </Card>
            <Button onClick={onReset} variant="outline" className="w-full">다시 시도하기</Button>
        </div>
     );
  }

  const { 
    scoreCard, 
    advancedNutrition, 
    ingredientCheck, 
    expertVerdict, 
    protocol_used, 
    petSummary,
    feedingGuide
  } = result;
  
  const PetIcon = protocol_used === 'Cat' ? Cat : Dog;

  const getGradeColor = (grade: string) => {
    switch(grade) {
      case 'S': return 'bg-yellow-400 text-yellow-900';
      case 'A': return 'bg-success text-success-foreground';
      case 'B': return 'bg-primary text-primary-foreground';
      case 'C': return 'bg-orange-400 text-white';
      case 'D': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoLucide className="w-3.5 h-3.5 text-muted-foreground/40 cursor-help inline-block ml-1" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px] p-3 text-xs leading-relaxed bg-white border shadow-xl text-foreground">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const BenchmarkBar = ({ label, position, value, tooltip }: { label: string, position: number, value: string, tooltip: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-muted-foreground flex items-center">
          {label}
          <InfoTooltip content={tooltip} />
        </span>
        <span className="text-sm font-black text-primary">{value}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-0 bg-muted/30 rounded-full" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-muted-foreground/30 z-10" />
        <div 
          className="absolute h-3 w-3 bg-primary rounded-full shadow-lg border-2 border-white transition-all duration-1000 z-20"
          style={{ left: `calc(${position}% - 6px)` }}
        />
      </div>
    </div>
  );

  const dmDescription = language === 'ko' 
    ? "수분을 0%로 가정했을 때의 실제 영양 농도입니다. 제품 간 정확한 비교를 위한 국제 수의 표준 기준입니다." 
    : "Actual nutrient density assuming 0% moisture. This is the global veterinary standard for accurate comparisons.";

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-40 max-w-4xl mx-auto px-4">
      
      {/* 1. Pet Summary Section */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary/5 to-indigo-50/30 ring-1 ring-black/5">
         <CardHeader className="pb-2">
            <Badge className="w-fit mb-2 bg-primary text-white font-bold">{input?.petProfile?.name || '우리 아이'} 맞춤 리포트</Badge>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
               <PetIcon className="w-6 h-6 text-primary" /> {petSummary.statusMessage || '분석 완료'}
            </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
               <div className="p-4 bg-white/60 rounded-2xl border border-white flex items-center gap-3">
                  <Weight className="text-primary w-5 h-5" />
                  <div>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">권장 체중 범위</p>
                     <p className="text-sm font-black">{petSummary.idealWeightRange}</p>
                  </div>
               </div>
               <div className="p-4 bg-white/60 rounded-2xl border border-white flex items-center gap-3">
                  <HeartPulse className="text-primary w-5 h-5" />
                  <div>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">상태 요약</p>
                     <p className="text-sm font-black">{petSummary.description}</p>
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>

      {/* 2. Product Header */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tighter text-foreground leading-tight">
            {productName}
          </h1>
          <div className={cn("shrink-0 h-20 w-20 rounded-2xl flex flex-col items-center justify-center shadow-lg", getGradeColor(scoreCard?.grade || ''))}>
             <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Grade</span>
             <span className="text-4xl font-black">{scoreCard?.grade}</span>
          </div>
        </div>
        
        <div className="p-6 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20">
           <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">Pettner Verdict</span>
           </div>
           <p className="text-xl font-black leading-snug">{scoreCard.headline}</p>
        </div>
      </div>

      {/* 3. Feeding Guide */}
      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-black/5">
         <CardHeader className="bg-muted/30 p-8 border-b">
            <CardTitle className="flex items-center gap-3 text-lg font-black">
               <UtensilsCrossed className="text-primary w-5 h-5"/> 정밀 급여 가이드
            </CardTitle>
         </CardHeader>
         <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: '하루 필요 열량', value: feedingGuide.dailyKcal },
                 { label: '하루 급여량', value: feedingGuide.dailyAmount },
                 { label: '1회 급여량', value: feedingGuide.perMealAmount },
                 { label: '직관적 가이드', value: feedingGuide.visualGuide }
               ].map((item, i) => (
                  <div key={i} className="text-center space-y-1">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</p>
                     <p className="text-lg font-black text-primary">{item.value}</p>
                  </div>
               ))}
            </div>
         </CardContent>
      </Card>

      {/* 4. Advanced Nutrition */}
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white ring-1 ring-black/5">
         <CardHeader className="bg-muted/30 p-10 border-b">
            <CardTitle className="flex flex-col gap-1">
               <div className="flex items-center gap-3 text-xl font-black">
                 <Zap className="text-primary w-6 h-6"/> 수분 제외 영양 밀도 (DM)
                 <InfoTooltip content={dmDescription} />
               </div>
            </CardTitle>
         </CardHeader>
         <CardContent className="p-10 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <BenchmarkBar 
                 label="실제 단백질 농도" 
                 position={advancedNutrition.benchmarks.protein.position} 
                 value={advancedNutrition.dm_protein} 
                 tooltip="근육과 장기 건강의 핵심 지표입니다."
               />
               <BenchmarkBar 
                 label="실제 지방 농도" 
                 position={advancedNutrition.benchmarks.fat.position} 
                 value={advancedNutrition.dm_fat} 
                 tooltip="에너지원이며 비만과 직결되는 수치입니다."
               />
               <BenchmarkBar 
                 label="실제 탄수화물 농도" 
                 position={advancedNutrition.benchmarks.carbs.position} 
                 value={advancedNutrition.dm_carbs} 
                 tooltip="NFE 공식을 통해 산출된 수치로, 50%를 넘으면 주의가 필요합니다."
               />
            </div>
         </CardContent>
      </Card>

      {/* 5. Expert Verdict */}
      <Card className="border-none shadow-2xl bg-white rounded-[3rem] ring-1 ring-black/5 overflow-hidden">
         <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-black text-primary uppercase tracking-widest">AI 수의사 분석 소견</CardTitle>
         </CardHeader>
         <CardContent className="p-10 pt-0 space-y-8">
            <div className="p-8 bg-gradient-to-br from-primary/10 to-indigo-50 rounded-3xl border border-primary/10">
               <h5 className="text-xs font-black text-primary mb-3 uppercase tracking-widest">WHY THIS MATCHES?</h5>
               <p className="text-lg font-bold text-foreground leading-relaxed">{expertVerdict.whyMatch}</p>
            </div>
            <div className="p-8 bg-muted/30 rounded-3xl">
               <h5 className="text-xs font-black text-muted-foreground mb-3 uppercase tracking-widest">VET'S PRO TIP</h5>
               <p className="text-base font-bold text-foreground leading-relaxed">{expertVerdict.proTip}</p>
            </div>
         </CardContent>
      </Card>

      {/* 6. Ingredient Check */}
      <div className="grid md:grid-cols-2 gap-8">
         <Card className="shadow-xl border-none rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-success/5 border-b py-6 px-8">
               <CardTitle className="text-base font-black flex items-center gap-3 text-success">
                  <ThumbsUp className="w-5 h-5"/> 추천 원재료 및 이점
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-5">
               {ingredientCheck?.positive?.map((item, i) => (
                  <div key={i} className="flex gap-4">
                     <div className="h-1.5 w-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                     <div className="space-y-0.5">
                        <p className="font-bold text-sm text-foreground">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.effect}</p>
                     </div>
                  </div>
               ))}
            </CardContent>
         </Card>

         <Card className="shadow-xl border-none rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-destructive/5 border-b py-6 px-8">
               <CardTitle className="text-base font-black flex items-center gap-3 text-destructive">
                  <ThumbsDown className="w-5 h-5"/> 주의 성분 및 리스크
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-5">
               {ingredientCheck?.cautionary?.map((item, i) => (
                  <div key={i} className="flex gap-4">
                     <div className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                     <div className="space-y-0.5">
                        <p className="font-bold text-sm text-foreground">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.risk}</p>
                     </div>
                  </div>
               ))}
            </CardContent>
         </Card>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t shadow-[0_-8px_30px_rgb(0,0,0,0.04)] p-4 z-50 flex justify-center">
        <div className="w-full max-w-4xl flex gap-3">
          <Button 
            onClick={onReset} 
            variant="outline" 
            className="flex-[1] h-14 rounded-2xl border-2"
          >
            <Repeat className="h-5 w-5 text-primary" />
          </Button>
          <Button 
            onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productName)}`, '_blank')} 
            className="flex-[3] h-14 text-lg font-black rounded-2xl bg-primary text-white"
          >
            <ShoppingBag className="h-5 w-5 mr-2"/> 최저가 검색
          </Button>
        </div>
      </div>
    </div>
  );
}
