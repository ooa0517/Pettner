'use client';

import { useState } from 'react';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Repeat, ShoppingBag, 
  AlertCircle, Scale,
  TrendingDown,
  CheckCircle2, AlertTriangle,
  Stethoscope, FlaskConical, ShieldCheck, Dna, Activity,
  Award, BarChart3, Flame, Bone, ShieldAlert, Info
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer } from 'recharts';

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

  if (result.status === 'error' || !result.scoreCard) {
     return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto py-20 text-center">
          <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-30"/>
          <h1 className="text-3xl font-black">분석 중 오류 발생</h1>
          <p className="text-muted-foreground">데이터를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.</p>
          <Button onClick={onReset} variant="outline" size="lg" className="rounded-full">다시 시도하기</Button>
        </div>
     );
  }

  const isCustomMode = input.analysisMode === 'custom';

  const nutritionMetrics = [
    { label: "단백질 (Protein)", data: result.advancedNutrition.protein },
    { label: "지방 (Fat)", data: result.advancedNutrition.fat },
    { label: "탄수화물 (Carbs/NFE)", data: result.advancedNutrition.carbs, isCritical: result.advancedNutrition.isHighCarb },
    { label: "조섬유 (Fiber)", data: result.advancedNutrition.fiber },
    { label: "조회분 (Ash)", data: result.advancedNutrition.ash }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-40 max-w-4xl mx-auto px-4">
      
      {/* 1. Header Section */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                {isCustomMode ? 'Veterinary Medical Report' : 'Product Quality Audit'}
              </Badge>
              <h1 className="text-3xl font-black tracking-tighter pt-2">
                {isCustomMode 
                  ? `${input.petProfile?.name}(${input.petProfile?.breed}) 진단 리포트` 
                  : `${result.productIdentity.name} 품질 감사 보고서`}
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

          <div className={cn("p-8 rounded-[2.5rem] border-l-8 relative overflow-hidden", isCustomMode ? "bg-muted/20 border-primary" : "bg-primary/5 border-primary")}>
             <div className="relative z-10 space-y-4">
               <h3 className="text-xl font-black flex items-center gap-2">
                 {isCustomMode ? <Stethoscope className="text-primary" size={20}/> : <Award className="text-primary" size={20}/>} 
                 {isCustomMode ? '수의학적 진단 요약' : '전문 심사관 총평'}
               </h3>
               <p className="text-lg font-bold leading-relaxed break-keep">
                 {result.scoreCard.headline}
               </p>
               <div className="flex flex-wrap gap-2">
                 {result.scoreCard.statusTags.map((tag, i) => (
                   <Badge key={i} variant="secondary" className={cn("bg-white font-bold px-3 py-1", tag.includes('주의') || tag.includes('비만') || tag.includes('경고') ? "text-destructive" : "text-primary")}>
                     {tag}
                   </Badge>
                 ))}
               </div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Weight Diagnosis & Diet Roadmap (Custom Mode Only) */}
      {isCustomMode && result.weightDiagnosis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 space-y-8">
              <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Scale size={18} className="text-primary"/> 🐕 품종 표준 체중 비교
              </CardTitle>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black mb-1">
                    <span className="text-success">표준 ({result.weightDiagnosis.breedStandardRange})</span>
                    <span className="text-destructive">우리 아이 ({result.weightDiagnosis.currentWeight}kg)</span>
                  </div>
                  <div className="h-6 bg-muted rounded-full relative overflow-hidden">
                     <div className="absolute inset-y-0 bg-success/20 w-[40%] left-[10%]" />
                     <div className={cn("h-full transition-all duration-1000", result.weightDiagnosis.overweightPercentage > 20 ? "bg-destructive" : "bg-primary")} 
                          style={{ width: `${Math.min(50 + result.weightDiagnosis.overweightPercentage, 100)}%` }} />
                  </div>
                </div>
                <div className={cn("p-5 rounded-2xl border", result.weightDiagnosis.weightGap > 0 ? "bg-destructive/5 border-destructive/10" : "bg-success/5 border-success/10")}>
                   <div className={cn("font-black text-xl", result.weightDiagnosis.weightGap > 0 ? "text-destructive" : "text-success")}>
                     {result.weightDiagnosis.weightGap > 0 ? `감량 목표: -${result.weightDiagnosis.weightGap.toFixed(1)}kg` : '정상 체중 유지 중'}
                   </div>
                   <p className="text-xs font-bold text-muted-foreground mt-1 leading-relaxed">
                     {result.weightDiagnosis.verdict}
                   </p>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white p-10 flex flex-col justify-between relative overflow-hidden">
              <TrendingDown className="absolute right-[-10px] bottom-[-10px] w-32 h-32 opacity-10" />
              <div className="space-y-2">
                <p className="text-xs font-black opacity-70 uppercase tracking-widest">Target Weight</p>
                <h3 className="text-4xl font-black">{result.weightDiagnosis.idealWeight.toFixed(1)}kg</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-2 bg-white/10 p-4 rounded-2xl">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase opacity-70">Genetic Insight</p>
                        <p className="text-xs font-bold leading-relaxed">{result.weightDiagnosis.breedGeneticInsight}</p>
                    </div>
                </div>
                <p className="text-sm font-bold opacity-80 leading-relaxed">
                    현재 {result.weightDiagnosis.currentWeight}kg에서 목표 {result.weightDiagnosis.idealWeight.toFixed(1)}kg까지 안전하게 도달하기 위한 플랜입니다.
                </p>
              </div>
            </Card>
          </div>

          {result.dietRoadmap && result.dietRoadmap.length > 0 && (
            <Card className="border-none shadow-xl rounded-[3rem] bg-white p-10 space-y-8">
              <CardHeader className="p-0">
                <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    📉 [단계별 체중 조절 플랜]
                </CardTitle>
                <p className="text-xs text-muted-foreground font-bold mt-1 italic">
                    * 감량 시기에는 칼로리를 엄격히 제한하고, 목표 체중 도달 후에는 건강 유지를 위해 급여량을 서서히 늘립니다.
                </p>
              </CardHeader>
              <div className="h-[250px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.dietRoadmap} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="weight" tick={{ fontSize: 10, fontWeight: 'bold' }} label={{ value: '몸무게 (kg)', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} label={{ value: '급여량 (g)', angle: -90, position: 'insideLeft', fontSize: 10, offset: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <ReferenceLine x={result.weightDiagnosis.idealWeight} stroke="green" strokeDasharray="3 3" label={{ value: '목표', position: 'top', fontSize: 10, fill: 'green' }} />
                      <Line type="monotone" dataKey="grams" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="flex justify-between items-center bg-muted/20 p-5 rounded-3xl">
                <div className="flex items-center gap-2">
                    <Activity className="text-primary w-5 h-5" />
                    <span className="text-sm font-black">감량 식단 권장량:</span>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-primary">{result.dietRoadmap[0]?.grams}g</span>
                    <p className="text-[10px] font-bold text-muted-foreground">종이컵 약 {(result.dietRoadmap[0]?.grams / 100).toFixed(1)}컵</p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* 3. Deep Ingredient Anatomy */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Dna className="text-primary w-6 h-6" />
          <h2 className="text-2xl font-black font-headline tracking-tight">🧬 [원재료 정밀 분석]</h2>
        </div>
        
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <div className="bg-muted/30 p-8 border-b">
            <h3 className="font-black flex items-center gap-2 text-muted-foreground">
              <FlaskConical size={18} /> 제1~5원료 품질 심사
            </h3>
          </div>
          <CardContent className="p-8 space-y-4">
             {result.ingredientAnatomy.firstFive.map((ing, i) => (
               <div key={i} className="flex gap-4 p-5 rounded-3xl bg-muted/10 items-start hover:bg-muted/20 transition-all">
                  <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm shrink-0 uppercase tracking-widest", 
                    ing.tier === 'Tier 1' ? "bg-success text-white" : 
                    ing.tier === 'Tier 2' ? "bg-primary text-white" : "bg-destructive text-white"
                  )}>
                    {ing.tierLabel}
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-lg flex items-center gap-2">
                      {ing.name}
                      {ing.description.includes('혈당') && <ShieldAlert className="text-destructive w-4 h-4" />}
                    </p>
                    <p className="text-xs text-muted-foreground font-bold leading-relaxed">{ing.description}</p>
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
                <div key={i} className="p-5 rounded-3xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 font-black text-primary text-sm mb-1">
                    {booster.benefit.includes('체지방') ? <Flame className="w-4 h-4" /> : <Bone className="w-4 h-4" />}
                    <span>[{booster.benefit}] {booster.name}</span>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">{booster.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
            <h3 className="font-black flex items-center gap-2 text-success">
              <ShieldCheck size={18} /> 세이프티 필터링
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-black">
                <CheckCircle2 size={18} className={result.ingredientAnatomy.safetyFilter.noArtificialPreservatives ? "text-success" : "text-muted-foreground"} />
                <span>합성 보존료 무첨가 (BHA/BHT Free)</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-black">
                <CheckCircle2 size={18} className={result.ingredientAnatomy.safetyFilter.noArtificialColors ? "text-success" : "text-muted-foreground"} />
                <span>인공 착색료 무첨가</span>
              </div>
              {result.ingredientAnatomy.safetyFilter.allergyWarning && (
                <div className="mt-4 p-5 bg-destructive/5 border border-destructive/10 rounded-3xl flex gap-3">
                  <AlertTriangle className="text-destructive shrink-0" size={20} />
                  <p className="text-xs font-black text-destructive leading-relaxed">
                    [알러지 주의] {result.ingredientAnatomy.safetyFilter.allergyWarning}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Nutritional Density (DM) */}
      <Card className="border-none shadow-xl rounded-[3rem] bg-white p-10 space-y-8">
        <div className="space-y-1">
          <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="text-primary" size={20}/> 📊 [수분 제외 영양 밀도 (DM)]
          </CardTitle>
          <p className="text-[11px] text-muted-foreground font-black">* AAFCO/NRC 가이드라인 및 종별 권장 범위와 대조한 결과입니다.</p>
        </div>

        <div className="space-y-10">
           {nutritionMetrics.map((metric, i) => {
             const metricData = metric.data;
             if (!metricData) return null;

             const { value, minStd, maxStd, status, verdict } = metricData;
             const range = Math.max(value, maxStd, 100);
             const idealStart = (minStd / range) * 100;
             const idealWidth = ((maxStd - minStd) / range) * 100;

             return (
               <div key={i} className="space-y-4">
                 <div className="flex justify-between items-end">
                   <div className="space-y-1">
                     <span className="text-sm font-black">{metric.label}</span>
                     <p className="text-[10px] font-bold text-muted-foreground">권장 범위: {minStd}% ~ {maxStd}%</p>
                   </div>
                   <div className="text-right">
                     <span className={cn("text-xl font-black", 
                        status === 'optimal' ? "text-success" : "text-destructive"
                     )}>{value}%</span>
                     <Badge variant="outline" className={cn("ml-2 font-bold px-2", 
                        status === 'optimal' ? "border-success text-success bg-success/5" : "border-destructive text-destructive bg-destructive/5"
                     )}>{status.toUpperCase()}</Badge>
                   </div>
                 </div>

                 <div className="h-6 bg-muted rounded-full relative overflow-hidden">
                    <div 
                      className="absolute h-full bg-success/20 border-x border-success/30"
                      style={{ left: `${idealStart}%`, width: `${idealWidth}%` }}
                    />
                    <div 
                      className={cn("h-full transition-all duration-1000", 
                        status === 'optimal' ? "bg-success" : 
                        status === 'high' ? "bg-destructive" : "bg-yellow-500"
                      )} 
                      style={{ width: `${(value / range) * 100}%` }} 
                    />
                 </div>
                 <p className={cn("text-[11px] font-bold leading-relaxed italic", metric.isCritical ? "text-destructive" : "text-muted-foreground")}>
                   {metric.isCritical ? '🚨 ' : '💡 '} {verdict}
                 </p>
               </div>
             );
           })}
        </div>
      </Card>

      {/* 5. Comprehensive Advice */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-primary text-white p-10">
        <div className="flex items-center gap-4 mb-6">
          <Stethoscope size={36} />
          <h3 className="text-2xl font-black">수의학적 종합 조언</h3>
        </div>
        <p className="text-lg font-bold leading-relaxed opacity-95 break-keep">
          {result.veterinaryAdvice}
        </p>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t z-50 flex justify-center">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black">
            <Repeat size={18} className="mr-2" /> 다시 분석
          </Button>
          <Button 
            onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(result.productIdentity.name)}`, '_blank')}
            className="flex-[2] h-14 rounded-2xl text-lg font-black shadow-lg"
          >
            <ShoppingBag size={20} className="mr-2" /> 최저가 검색
          </Button>
        </div>
      </div>
    </div>
  );
}
