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
  Award, BarChart3, Flame, Bone, ShieldAlert, Info,
  History, Globe, Leaf, Microscope, Zap, Heart, CheckCircle
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-40 max-w-4xl mx-auto px-4">
      
      {/* 1. Summary Header (Progressive Disclosure - Level 1) */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                {isCustomMode ? 'Veterinary Medical Report' : 'Product Quality Audit'}
              </Badge>
              <h1 className="text-3xl font-black tracking-tighter pt-2">
                {result.productIdentity.name}
              </h1>
              <p className="text-muted-foreground font-bold">{result.productIdentity.brand} · {result.productIdentity.category}</p>
            </div>
            <div className="text-right">
               <div className="text-5xl font-black text-primary">{result.scoreCard.totalScore}<span className="text-xl">점</span></div>
               <Badge className={cn("mt-2 font-black px-4 py-1 rounded-full", 
                 result.scoreCard.totalScore >= 80 ? "bg-success" : 
                 result.scoreCard.totalScore >= 60 ? "bg-yellow-500" : "bg-destructive"
               )}>
                 Grade {result.productIdentity.qualityGrade}
               </Badge>
            </div>
          </div>

          <div className={cn("p-8 rounded-[2.5rem] border-l-8 relative overflow-hidden", isCustomMode ? "bg-muted/20 border-primary" : "bg-primary/5 border-primary")}>
             <div className="relative z-10 space-y-4">
               <h3 className="text-xl font-black flex items-center gap-2">
                 {isCustomMode ? <Stethoscope className="text-primary" size={20}/> : <Award className="text-primary" size={20}/>} 
                 종합 진단 결과
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

      {/* 2. Personalized Feeding (Level 2 - Custom Mode Only) */}
      {isCustomMode && result.weightDiagnosis && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Scale className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-black font-headline tracking-tight">⚖️ 맞춤 체중 & 급여 솔루션</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-xs font-black text-muted-foreground uppercase mb-1">Current Weight</p>
                      <h4 className="text-3xl font-black">{result.weightDiagnosis.currentWeight}kg</h4>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-black text-muted-foreground uppercase mb-1">Ideal Weight</p>
                      <h4 className="text-3xl font-black text-success">{result.weightDiagnosis.idealWeight.toFixed(1)}kg</h4>
                   </div>
                </div>
                <div className="h-6 bg-muted rounded-full relative overflow-hidden">
                   <div className="absolute inset-y-0 bg-success/20 w-[40%] left-[10%]" />
                   <div className={cn("h-full transition-all duration-1000", result.weightDiagnosis.weightGap > 0 ? "bg-destructive" : "bg-primary")} 
                        style={{ width: `${Math.min(50 + result.weightDiagnosis.overweightPercentage, 100)}%` }} />
                </div>
                <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                   {result.weightDiagnosis.verdict}
                </p>
              </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white p-10">
               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Dna size={18} className="opacity-70" />
                    <span className="text-[11px] font-black uppercase tracking-widest opacity-70">Breed Genetic Insight</span>
                  </div>
                  <p className="text-sm font-bold leading-relaxed">{result.weightDiagnosis.breedGeneticInsight}</p>
                  <div className="pt-4 border-t border-white/20">
                     <p className="text-xs font-bold opacity-80">
                        {result.weightDiagnosis.weightGap > 0 ? `체중 감량 목표: -${result.weightDiagnosis.weightGap.toFixed(1)}kg` : '현재 정상 체중을 유지하는 식단이 권장됩니다.'}
                     </p>
                  </div>
               </div>
            </Card>
          </div>

          {result.dietRoadmap && (
            <Card className="border-none shadow-xl rounded-[3rem] bg-white p-10 space-y-8">
              <CardHeader className="p-0">
                <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    📉 [5단계 정밀 다이어트 로드맵]
                </CardTitle>
              </CardHeader>
              <div className="h-[280px] w-full">
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
              <div className="bg-muted/20 p-6 rounded-3xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <Zap className="text-primary fill-primary" />
                   <div>
                      <p className="text-xs font-black text-muted-foreground uppercase">Phase 1 권장 급여량</p>
                      <p className="text-2xl font-black text-primary">{result.dietRoadmap[0]?.grams}g</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-muted-foreground">종이컵 기준</p>
                   <p className="text-lg font-black">약 {(result.dietRoadmap[0]?.grams / 100).toFixed(1)}컵</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 3. Deep-Dive Report (Level 3 - Progressive Disclosure) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Microscope className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-black font-headline tracking-tight">전문가용 심층 분석 리포트</h2>
          </div>
          <Badge variant="outline" className="border-primary text-primary font-bold">Deep Dive</Badge>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          
          {/* Section A: Ingredient Quality Audit */}
          <AccordionItem value="ingredients" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><FlaskConical /></div>
                <div className="text-left">
                  <h3 className="font-black text-lg">🧬 원재료 등급 정밀 감사</h3>
                  <p className="text-xs text-muted-foreground font-medium">원료의 '계급'과 혈당 지수 분석</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
              {result.deepDive.ingredientAudit.tiers.map((tier, i) => (
                <div key={i} className="p-5 rounded-3xl bg-muted/10 space-y-3">
                   <div className="flex items-center gap-2">
                      <Badge className={cn("font-black", 
                        tier.level === 'Tier 1' ? "bg-success" : 
                        tier.level === 'Tier 2' ? "bg-primary" : "bg-destructive"
                      )}>
                        {tier.level === 'Tier 1' ? '🥇 Tier 1 (최고급)' : tier.level === 'Tier 2' ? '🥈 Tier 2 (일반)' : '🥉 Tier 3 (저급/주의)'}
                      </Badge>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {tier.ingredients.map((ing, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs font-bold border">{ing}</span>
                      ))}
                   </div>
                   <p className="text-xs text-muted-foreground font-bold leading-relaxed">{tier.comment}</p>
                </div>
              ))}
              <div className="p-5 rounded-3xl border-2 border-dashed flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <Flame className={cn("w-5 h-5", result.deepDive.ingredientAudit.giIndex === 'High' ? "text-destructive" : "text-success")} />
                    <span className="text-sm font-black">GI 지수(혈당) 판정:</span>
                 </div>
                 <Badge variant="outline" className={cn("font-black", 
                   result.deepDive.ingredientAudit.giIndex === 'High' ? "text-destructive border-destructive" : "text-success border-success"
                 )}>{result.deepDive.ingredientAudit.giIndex}</Badge>
              </div>
              <p className="text-xs text-muted-foreground px-2 italic">{result.deepDive.ingredientAudit.giComment}</p>
            </AccordionContent>
          </AccordionItem>

          {/* Section B: Nutritional Engineering */}
          <AccordionItem value="nutrition" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><BarChart3 /></div>
                <div className="text-left">
                  <h3 className="font-black text-lg">⚖️ 영양 밸런스 엔지니어링</h3>
                  <p className="text-xs text-muted-foreground font-medium">AAFCO 기준 및 핵심 성분 비율</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-8 pt-4 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 flex justify-between items-center">
                    <span className="text-sm font-black">칼슘 : 인 비율</span>
                    <span className="text-lg font-black text-primary">{result.deepDive.nutritionalEngineering.ratios.caPRatio}</span>
                 </div>
                 <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 flex justify-between items-center">
                    <span className="text-sm font-black">오메가 6 : 3 비율</span>
                    <span className="text-lg font-black text-primary">{result.deepDive.nutritionalEngineering.ratios.omega63Ratio}</span>
                 </div>
              </div>
              <div className="p-5 rounded-3xl bg-muted/20">
                 <h4 className="text-xs font-black text-muted-foreground uppercase mb-2">Engineering Verdict</h4>
                 <p className="text-sm font-bold leading-relaxed">{result.deepDive.nutritionalEngineering.ratios.balanceVerdict}</p>
              </div>
              
              <div className="space-y-6 pt-4">
                <h4 className="text-xs font-black text-muted-foreground uppercase px-2">Dry Matter (DM) 정밀 분석</h4>
                {Object.entries(result.deepDive.nutritionalEngineering.metrics).map(([key, metric]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-xs font-black uppercase">{key}</span>
                      <span className="text-xs font-bold text-muted-foreground">{metric.minStd}% ~ {metric.maxStd}% 권장</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full relative overflow-hidden">
                       <div className="absolute inset-y-0 bg-success/20 w-[40%] left-[10%]" />
                       <div className={cn("h-full", metric.status === 'optimal' ? "bg-success" : "bg-destructive")} style={{ width: `${(metric.value / 60) * 100}%` }} />
                    </div>
                    <div className="flex justify-between items-center px-2 text-[10px] font-bold">
                       <span className={cn(metric.status === 'optimal' ? "text-success" : "text-destructive")}>{metric.verdict}</span>
                       <span>현측치: {metric.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section C: Safety & Toxicology */}
          <AccordionItem value="safety" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><ShieldCheck /></div>
                <div className="text-left">
                  <h3 className="font-black text-lg">🛡️ 유해 성분 & 안전성 필터</h3>
                  <p className="text-xs text-muted-foreground font-medium">첨가물 검출 및 리콜 이력 추적</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {result.deepDive.safetyToxicology.checks.map((check, i) => (
                   <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/10">
                      {check.status ? <CheckCircle className="text-success w-5 h-5" /> : <AlertTriangle className="text-destructive w-5 h-5" />}
                      <div className="space-y-0.5">
                         <p className="text-xs font-black">{check.label}</p>
                         <p className="text-[10px] text-muted-foreground font-bold">{check.comment}</p>
                      </div>
                   </div>
                 ))}
              </div>
              {result.deepDive.safetyToxicology.riskAlert && (
                 <div className="p-5 bg-destructive/5 border border-destructive/20 rounded-3xl flex gap-3">
                    <ShieldAlert className="text-destructive shrink-0" />
                    <p className="text-xs font-black text-destructive leading-relaxed">{result.deepDive.safetyToxicology.riskAlert}</p>
                 </div>
              )}
              <div className="p-5 bg-muted/20 rounded-3xl">
                 <div className="flex items-center gap-2 mb-2">
                    <History className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-black text-muted-foreground uppercase">Brand Recall History</span>
                 </div>
                 <p className="text-sm font-bold leading-relaxed">{result.deepDive.safetyToxicology.recallHistory}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section D: Brand & ESG */}
          <AccordionItem value="brand" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Globe /></div>
                <div className="text-left">
                  <h3 className="font-black text-lg">🌍 기업 윤리 & 환경 점수</h3>
                  <p className="text-xs text-muted-foreground font-medium">제조사 인프라 및 지속 가능성 평가</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-8 pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { icon: Award, label: "제조 시설", value: result.deepDive.brandESG.facility },
                   { icon: Microscope, label: "R&D 투자", value: result.deepDive.brandESG.rdLevel },
                   { icon: Leaf, label: "친환경/패키징", value: result.deepDive.brandESG.sustainability },
                   { icon: Heart, label: "동물 복지", value: result.deepDive.brandESG.animalWelfare }
                 ].map((item, i) => (
                   <div key={i} className="p-5 rounded-3xl bg-muted/5 border flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-primary">
                        <item.icon size={16} />
                        <span className="text-xs font-black uppercase">{item.label}</span>
                      </div>
                      <p className="text-sm font-bold leading-relaxed">{item.value}</p>
                   </div>
                 ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* 4. Veterinary Final Advice */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-primary text-white p-10">
        <div className="flex items-center gap-4 mb-6">
          <Stethoscope size={36} />
          <h3 className="text-2xl font-black">수의학적 최종 조언</h3>
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
