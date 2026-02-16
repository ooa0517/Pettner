'use client';

import { useState } from 'react';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Repeat, ShoppingBag, 
  AlertCircle, Scale,
  ChevronRight, TrendingDown, Info,
  CheckCircle2, AlertTriangle,
  Stethoscope, FlaskConical, ShieldCheck, Dna, Activity
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { Progress } from '@/components/ui/progress';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
};

const chartConfig = {
  grams: {
    label: "권장 급여량 (g)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const { t } = useLanguage();
  const [productName] = useState(result.productIdentity.name);

  if (result.status === 'error') {
     return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto py-20 text-center">
          <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-30"/>
          <h1 className="text-3xl font-black">분석 중 오류 발생</h1>
          <Button onClick={onReset} variant="outline" size="lg" className="rounded-full">다시 시도하기</Button>
        </div>
     );
  }

  const isObese = (input.petProfile?.bcs && parseInt(input.petProfile.bcs) >= 4) || false;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-40 max-w-4xl mx-auto px-4">
      
      {/* 1. Medical Summary Header */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                Veterinary Nutrition Report v8.0
              </Badge>
              <h1 className="text-3xl font-black tracking-tighter pt-2">
                {input.petProfile?.name}({input.petProfile?.breed}) 진단 리포트
              </h1>
            </div>
            <div className="text-right">
               <div className="text-5xl font-black text-primary">{result.scoreCard.totalScore}<span className="text-xl">점</span></div>
               <Badge className={cn("mt-2 font-black px-4 py-1 rounded-full", 
                 result.scoreCard.totalScore >= 80 ? "bg-success" : 
                 result.scoreCard.totalScore >= 60 ? "bg-yellow-500" : "bg-destructive"
               )}>
                 {result.scoreCard.grade}
               </Badge>
            </div>
          </div>

          <div className="p-8 bg-muted/20 rounded-[2.5rem] border-l-8 border-primary relative overflow-hidden">
             <Stethoscope className="absolute right-[-20px] top-[-20px] w-40 h-40 text-primary opacity-5 rotate-12" />
             <div className="relative z-10 space-y-4">
               <h3 className="text-xl font-black flex items-center gap-2">
                 <Info className="text-primary" size={20}/> 
                 상태 진단 요약
               </h3>
               <p className="text-lg font-bold leading-relaxed break-keep">
                 {result.scoreCard.headline}
               </p>
               <div className="flex flex-wrap gap-2">
                 {result.scoreCard.statusTags.map((tag, i) => (
                   <Badge key={i} variant="secondary" className={cn("bg-white font-bold px-3 py-1", tag.includes('비만') || tag.includes('주의') ? "text-destructive" : "text-primary")}>
                     {tag}
                   </Badge>
                 ))}
               </div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Weight Diagnosis & Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 space-y-8">
          <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Scale size={18} className="text-primary"/> 품종 대비 체중 분석
          </CardTitle>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black">
                <span className="text-success">표준 ({result.weightDiagnosis.breedStandardRange})</span>
                <span className="text-destructive">우리 아이 ({result.weightDiagnosis.currentWeight}kg)</span>
              </div>
              <div className="h-6 bg-muted rounded-full relative overflow-hidden">
                 <div className="absolute inset-0 bg-success/20 w-[40%]" />
                 <div className="h-full bg-destructive animate-in slide-in-from-left duration-1000" style={{ width: `${Math.min(result.weightDiagnosis.overweightPercentage, 100)}%` }} />
              </div>
            </div>
            <div className="p-5 bg-destructive/5 rounded-2xl border border-destructive/10">
               <div className="text-destructive font-black text-xl">표준 대비 +{result.weightDiagnosis.overweightPercentage}% 초과</div>
               <p className="text-xs font-bold text-muted-foreground mt-1 leading-relaxed">
                 {result.weightDiagnosis.verdict}
               </p>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white p-10 flex flex-col justify-between relative overflow-hidden">
          <TrendingDown className="absolute right-[-10px] bottom-[-10px] w-32 h-32 opacity-10" />
          <div className="space-y-2">
            <p className="text-xs font-black opacity-70 uppercase tracking-widest">Weight Loss Target</p>
            <h3 className="text-4xl font-black">감량 목표: -{result.weightDiagnosis.weightGap.toFixed(1)}kg</h3>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-end border-b border-white/20 pb-2">
                <span className="text-sm opacity-70">현재 체중</span>
                <span className="text-xl font-bold">{result.weightDiagnosis.currentWeight}kg</span>
             </div>
             <div className="flex justify-between items-end border-b border-white/20 pb-2">
                <span className="text-sm opacity-70">목표 체중</span>
                <span className="text-xl font-bold text-success-foreground">{result.weightDiagnosis.idealWeight}kg</span>
             </div>
          </div>
        </Card>
      </div>

      {/* 3. Diet Roadmap Graph */}
      <Card className="border-none shadow-xl rounded-[3rem] bg-white p-10 space-y-8">
        <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          📉 [단계별 체중 조절 플랜]
        </CardTitle>
        <div className="h-[250px] w-full">
           <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart data={result.dietRoadmap} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="weight" tick={{ fontSize: 10, fontWeight: 'bold' }} label={{ value: '몸무게 (kg)', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} label={{ value: '급여량 (g)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ReferenceLine x={result.weightDiagnosis.idealWeight} stroke="green" strokeDasharray="3 3" label={{ value: 'Ideal', position: 'top', fontSize: 10, fill: 'green' }} />
                <Line type="monotone" dataKey="grams" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }} />
              </LineChart>
           </ChartContainer>
        </div>
      </Card>

      {/* 4. Deep Ingredient Anatomy (★NEW★) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Dna className="text-primary w-6 h-6" />
          <h2 className="text-2xl font-black font-headline">🧬 원재료 정밀 분석</h2>
        </div>
        
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <div className="bg-muted/30 p-8 border-b">
            <h3 className="font-black flex items-center gap-2 text-muted-foreground">
              <FlaskConical size={18} /> 제1~5원료 퀄리티 체크
            </h3>
          </div>
          <CardContent className="p-8 space-y-4">
             {result.ingredientAnatomy.firstFive.map((ing, i) => (
               <div key={i} className="flex gap-4 p-4 rounded-2xl bg-muted/10 items-start hover:bg-muted/20 transition-colors">
                  <div className="px-3 py-1 bg-white rounded-full text-xs font-black shadow-sm shrink-0">{ing.tierLabel}</div>
                  <div className="space-y-1">
                    <p className="font-bold">{ing.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ing.description}</p>
                  </div>
               </div>
             ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
            <h3 className="font-black flex items-center gap-2 text-primary">
              <Activity size={18} /> 기능성 성분 매칭
            </h3>
            <div className="space-y-3">
              {result.ingredientAnatomy.functionalBoosters.map((booster, i) => (
                <div key={i} className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="font-black text-primary text-sm">🔥 [{booster.benefit}] {booster.name}</p>
                  <p className="text-xs font-medium mt-1">{booster.description}</p>
                </div>
              ))}
              {result.ingredientAnatomy.functionalBoosters.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">해당되는 기능성 성분이 발견되지 않았습니다.</p>
              )}
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
            <h3 className="font-black flex items-center gap-2 text-success">
              <ShieldCheck size={18} /> 세이프티 & 리스크 필터
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 size={16} className={result.ingredientAnatomy.safetyFilter.noArtificialPreservatives ? "text-success" : "text-muted-foreground"} />
                <span>합성 보존료 무첨가 (BHA/BHT Free)</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 size={16} className={result.ingredientAnatomy.safetyFilter.noArtificialColors ? "text-success" : "text-muted-foreground"} />
                <span>인공 착색료 무첨가</span>
              </div>
              {result.ingredientAnatomy.safetyFilter.allergyWarning && (
                <div className="mt-4 p-4 bg-destructive/5 border border-destructive/10 rounded-2xl flex gap-3">
                  <AlertTriangle className="text-destructive shrink-0" size={16} />
                  <p className="text-xs font-bold text-destructive leading-relaxed">
                    알러지 주의: {result.ingredientAnatomy.safetyFilter.allergyWarning}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 5. Nutritional Density (DM Basis) */}
      <Card className="border-none shadow-xl rounded-[3rem] bg-white p-10 space-y-8">
        <div className="space-y-1">
          <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            📊 수분 제외 영양 밀도 (DM 기준)
          </CardTitle>
          <p className="text-[10px] text-muted-foreground font-bold">* 수분 함량을 제외한 실제 영양 농도 분석값입니다.</p>
        </div>

        <div className="space-y-8">
           {[
             { label: "단백질 (Protein)", value: result.advancedNutrition.protein_dm, color: "bg-primary" },
             { label: "지방 (Fat)", value: result.advancedNutrition.fat_dm, color: result.advancedNutrition.fat_dm > 20 ? "bg-yellow-500" : "bg-primary" },
             { label: "탄수화물 (Carbs/NFE)", value: result.advancedNutrition.carbs_nfe_dm, color: result.advancedNutrition.isHighCarb ? "bg-destructive" : "bg-primary", isWarning: result.advancedNutrition.isHighCarb }
           ].map((stat, i) => (
             <div key={i} className="space-y-3">
               <div className="flex justify-between items-end">
                 <span className="text-sm font-bold">{stat.label}</span>
                 <span className={cn("text-lg font-black", stat.isWarning ? "text-destructive" : "text-primary")}>{stat.value}%</span>
               </div>
               <div className="h-4 bg-muted rounded-full relative overflow-hidden">
                  <div className={cn("h-full transition-all duration-1000", stat.color)} style={{ width: `${Math.min(stat.value, 100)}%` }} />
               </div>
               {stat.isWarning && isObese && (
                 <p className="text-[10px] font-black text-destructive leading-tight animate-pulse">
                   ⚠️ 탄수화물 함량이 매우 높습니다. 비만 관리에 치명적일 수 있습니다!
                 </p>
               )}
             </div>
           ))}
        </div>
      </Card>

      {/* 6. Veterinary Advice */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-primary text-white p-10">
        <div className="flex items-center gap-4 mb-6">
          <Stethoscope size={32} />
          <h3 className="text-2xl font-black">수의학적 종합 조언</h3>
        </div>
        <p className="text-lg font-medium leading-relaxed opacity-90 break-keep">
          {result.veterinaryAdvice}
        </p>
      </Card>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t z-50 flex justify-center">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black">
            <Repeat size={18} className="mr-2" /> 다시 분석
          </Button>
          <Button 
            onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productName)}`, '_blank')}
            className="flex-[2] h-14 rounded-2xl text-lg font-black shadow-lg"
          >
            <ShoppingBag size={20} className="mr-2" /> 최저가 검색
          </Button>
        </div>
      </div>
    </div>
  );
}
