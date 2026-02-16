'use client';

import { useState } from 'react';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Repeat, ShoppingBag, Pencil, Sparkles, 
  ThumbsUp, ThumbsDown, Info, Zap, 
  UtensilsCrossed, Flame, CupSoda,
  AlertCircle, Heart, User, Activity, Weight,
  Scale
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const { t } = useLanguage();
  const [productName, setProductName] = useState(result.productIdentity.name);
  const [isEditing, setIsEditing] = useState(false);

  if (result.status === 'error') {
     return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto py-20 text-center">
          <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-30"/>
          <h1 className="text-3xl font-black">분석 중 오류 발생</h1>
          <p className="text-muted-foreground">사진이 너무 흐릿하거나 데이터가 부족합니다. 다시 촬영해 주세요.</p>
          <Button onClick={onReset} variant="outline" size="lg" className="rounded-full">다시 시도하기</Button>
        </div>
     );
  }

  const getGradeStyles = (grade: string) => {
    switch(grade) {
      case 'S': return 'bg-yellow-400 text-yellow-900 border-yellow-500';
      case 'A': return 'bg-success text-success-foreground border-success';
      case 'B': return 'bg-primary text-primary-foreground border-primary';
      case 'C': return 'bg-orange-400 text-white border-orange-500';
      case 'D': return 'bg-destructive text-destructive-foreground border-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const BenchmarkBar = ({ label, position, value }: { label: string, position: number, value: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-end px-1">
        <span className="text-[10px] font-black text-muted-foreground uppercase">{label}</span>
        <span className="text-xs font-black text-primary">{value}</span>
      </div>
      <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/50 z-10" />
        <div 
          className="absolute h-full bg-primary transition-all duration-1000"
          style={{ width: `${position}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 pb-40 max-w-4xl mx-auto px-4">
      
      {/* 1. Header & Identity Verification */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-[3rem] shadow-xl ring-1 ring-black/5">
        <div className="relative w-32 h-32 shrink-0">
          <div className="absolute inset-0 bg-primary/10 rounded-[2rem] animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center text-4xl">🥘</div>
        </div>
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Badge variant="outline" className="font-bold text-primary border-primary/20 bg-primary/5">{result.productIdentity.brand}</Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-30 hover:opacity-100" onClick={() => setIsEditing(!isEditing)}>
              <Pencil className="w-3 h-3" />
            </Button>
          </div>
          {isEditing ? (
            <input 
              value={productName} 
              onChange={(e) => setProductName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              className="text-2xl md:text-3xl font-black bg-muted/50 rounded-lg px-2 w-full outline-primary"
              autoFocus
            />
          ) : (
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight">{productName}</h1>
          )}
          <p className="text-sm font-bold text-muted-foreground">{input.petProfile?.name || '우리 아이'}를 위한 분석 리포트</p>
        </div>
        <div className={cn("h-24 w-24 rounded-[2rem] flex flex-col items-center justify-center shadow-2xl border-b-8 transition-transform hover:scale-110", getGradeStyles(result.scoreCard.grade))}>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Grade</span>
          <span className="text-5xl font-black">{result.scoreCard.grade}</span>
        </div>
      </div>

      {/* 2. Pet Status Summary (Pet-First) */}
      <Card className="border-none shadow-xl rounded-[3rem] bg-muted/20 overflow-hidden">
        <CardHeader className="bg-white/50 p-6 border-b">
          <CardTitle className="text-sm font-black flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
            <User size={16} className="text-primary"/> 아이 상태 분석 요약
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase">나이</p>
            <p className="text-lg font-bold">{input.petProfile?.age || '-'}살</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase">현재 체중</p>
            <p className="text-lg font-bold">{input.petProfile?.weight || '-'}kg</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase">중성화</p>
            <p className="text-lg font-bold">{input.petProfile?.neutered ? '완료' : '미완료'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase">활동량</p>
            <p className="text-lg font-bold">{input.petProfile?.activityLevel === 'HIGH' ? '에너자이저' : '보통'}</p>
          </div>
        </CardContent>
      </Card>

      {/* 3. The Verdict Hero */}
      <div className="p-10 bg-primary text-white rounded-[3.5rem] shadow-2xl shadow-primary/30 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 animate-spin-slow" />
          <span className="text-sm font-black uppercase tracking-widest">Pettner Verdict</span>
        </div>
        <p className="text-2xl md:text-4xl font-black leading-snug break-keep">{result.scoreCard.headline}</p>
      </div>

      {/* 4. Feeding Guide Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Flame, label: '하루 필요 열량', value: result.feedingGuide.dailyKcal, color: 'text-orange-500' },
          { icon: UtensilsCrossed, label: '하루 권장 급여량', value: result.feedingGuide.dailyAmount, color: 'text-primary' },
          { icon: CupSoda, label: '시각적 가이드', value: result.feedingGuide.visualGuide, color: 'text-success' }
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-lg rounded-[2.5rem] bg-white text-center hover:translate-y-[-5px] transition-all">
            <CardContent className="p-8 space-y-2">
              <div className={cn("p-4 bg-muted/50 rounded-2xl w-fit mx-auto mb-2", item.color)}>
                <item.icon size={24} />
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase">{item.label}</p>
              <p className="text-xl font-black">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 5. Insight Cards (Pros/Cons) */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl rounded-[3rem] bg-success/5 ring-1 ring-success/10">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-success flex items-center gap-2 font-black"><ThumbsUp size={20}/> 추천 성분</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            {result.ingredientCheck.positive.map((item, i) => (
              <div key={i} className="p-4 bg-white rounded-2xl shadow-sm">
                <p className="font-bold text-sm">✅ {item.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.effect}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[3rem] bg-destructive/5 ring-1 ring-destructive/10">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-destructive flex items-center gap-2 font-black"><ThumbsDown size={20}/> 주의 성분</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            {result.ingredientCheck.cautionary.map((item, i) => (
              <div key={i} className="p-4 bg-white rounded-2xl shadow-sm">
                <p className="font-bold text-sm">⚠️ {item.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.risk}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 6. Expert Verdict Details */}
      <Card className="border-none shadow-2xl bg-white rounded-[3.5rem] overflow-hidden">
        <CardHeader className="p-10 pb-4 bg-muted/20 border-b">
          <CardTitle className="text-sm font-black text-primary uppercase tracking-widest">AI 수의사 분석 소견</CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-10">
          <div className="space-y-4">
            <h5 className="text-lg font-black flex items-center gap-2"><Info className="text-primary" size={18}/> 왜 우리 아이에게 맞을까요?</h5>
            <p className="text-base font-medium leading-relaxed text-muted-foreground">{result.expertVerdict.whyMatch}</p>
          </div>
          <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10">
            <h5 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Vet's Professional Tips</h5>
            <div className="text-sm font-bold text-foreground leading-relaxed whitespace-pre-line">
              {result.expertVerdict.proTip}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7. Detail Accordions */}
      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="nutrition" className="border-none shadow-lg bg-white rounded-[2rem] px-8">
          <AccordionTrigger className="hover:no-underline font-black text-lg py-6">
            <div className="flex items-center gap-3">
              <Zap className="text-primary"/> 영양 농도 상세 
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-bold mb-1 text-xs">DM(Dry Matter)이란?</p>
                    <p className="text-[10px]">수분을 제외한 실제 영양 농도를 의미합니다. 제품 간 정확한 비교를 위한 수의 영양학 표준 기준입니다.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-10 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <BenchmarkBar label="단백질 (DM)" position={result.advancedNutrition.benchmarks.protein.position} value={result.advancedNutrition.dm_protein} />
                <BenchmarkBar label="지방 (DM)" position={result.advancedNutrition.benchmarks.fat.position} value={result.advancedNutrition.dm_fat} />
                <BenchmarkBar label="탄수화물 (DM)" position={result.advancedNutrition.benchmarks.carbs.position} value={result.advancedNutrition.dm_carbs} />
             </div>
             <p className="text-[10px] text-center text-muted-foreground">AAFCO 2024 가이드라인 및 NRC 권장량을 기준으로 산출되었습니다.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* 8. Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t z-50 flex justify-center">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-black">
            <Repeat className="mr-2 w-5 h-5" /> {resetButtonText || '다시 분석'}
          </Button>
          <Button 
            onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productName)}`, '_blank')}
            className="flex-[2] h-16 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30"
          >
            <ShoppingBag className="mr-2 w-6 h-6" /> 최저가 검색
          </Button>
        </div>
      </div>
    </div>
  );
}