'use client';

import { useState } from 'react';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Repeat, ShoppingBag, Pencil, 
  AlertCircle, Scale,
  ChevronRight, ArrowRight,
  TrendingDown, Info,
  CheckCircle2, AlertTriangle,
  Stethoscope
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Progress } from '@/components/ui/progress';

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
          <Button onClick={onReset} variant="outline" size="lg" className="rounded-full">다시 시도하기</Button>
        </div>
     );
  }

  const isObese = (input.petProfile?.bcs && parseInt(input.petProfile.bcs) >= 4) || false;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-40 max-w-4xl mx-auto px-4">
      
      {/* 1. Medical Summary Header */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                Veterinary Nutrition Report
              </Badge>
              <h1 className="text-3xl font-black tracking-tighter pt-2">
                {input.petProfile?.name}({input.petProfile?.breed}, {input.petProfile?.weight}kg) 진단 리포트
              </h1>
            </div>
            <div className="text-right">
               <div className="text-5xl font-black text-primary">{result.scoreCard.totalScore}<span className="text-xl">점</span></div>
               <Badge className={cn("mt-2 font-black px-4 py-1 rounded-full", 
                 result.scoreCard.totalScore >= 80 ? "bg-success" : 
                 result.scoreCard.totalScore >= 60 ? "bg-yellow-500" : "bg-destructive"
               )}>
                 적합 등급: {result.scoreCard.grade}
               </Badge>
            </div>
          </div>

          <div className="p-8 bg-muted/20 rounded-[2.5rem] border-l-8 border-primary relative overflow-hidden">
             <Stethoscope className="absolute right-[-20px] top-[-20px] w-40 h-40 text-primary opacity-5 rotate-12" />
             <div className="relative z-10 space-y-4">
               <h3 className="text-xl font-black flex items-center gap-2">
                 <Info className="text-primary" size={20}/> 
                 {isObese ? "집중 체중 관리 솔루션" : "영양 밸런스 요약"}
               </h3>
               <p className="text-lg font-bold leading-relaxed break-keep">
                 {result.scoreCard.headline}
               </p>
               <div className="flex flex-wrap gap-2">
                 {result.scoreCard.statusTags.map((tag, i) => (
                   <Badge key={i} variant="secondary" className="bg-white text-primary border-none shadow-sm font-bold px-3 py-1">
                     {tag}
                   </Badge>
                 ))}
               </div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Weight Diagnosis: Breed Standard vs Current */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 space-y-8">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Scale size={18} className="text-primary"/> 품종 대비 체중 분석
            </CardTitle>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black">
                <span className="text-success">표준 체중 ({result.weightDiagnosis.breedStandardRange})</span>
                <span className="text-destructive">우리 아이 ({result.weightDiagnosis.currentWeight}kg)</span>
              </div>
              <div className="h-6 bg-muted rounded-full relative overflow-hidden flex">
                 <div className="h-full bg-success/30 flex-1 border-r border-white" />
                 <div className="h-full bg-destructive flex-[1.5] animate-in slide-in-from-left duration-1000" />
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
            <h3 className="text-4xl font-black">감량 목표: -{result.weightDiagnosis.weightGap}kg</h3>
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
             <p className="text-[10px] font-bold opacity-60">* 수의학적 BCS 공식을 적용한 이상적 몸무게입니다.</p>
          </div>
        </Card>
      </div>

      {/* 3. Diet Roadmap Graph */}
      <Card className="border-none shadow-xl rounded-[3rem] bg-white p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            📉 [단계별 체중 조절 플랜]
          </CardTitle>
          <div className="flex gap-4">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary"/> <span className="text-[10px] font-bold">감량 가이드</span></div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success"/> <span className="text-[10px] font-bold">유지기 시작</span></div>
          </div>
        </div>

        <div className="h-[300px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.dietRoadmap} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="weight" 
                  label={{ value: '몸무게 (kg)', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 'bold' }} 
                  tick={{ fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis 
                  label={{ value: '급여량 (g)', angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 'bold' }} 
                  tick={{ fontSize: 10, fontWeight: 'bold' }}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ReferenceLine x={result.weightDiagnosis.idealWeight} stroke="green" strokeDasharray="3 3" label={{ value: 'Ideal', position: 'top', fontSize: 10, fill: 'green' }} />
                <Line 
                  type="monotone" 
                  dataKey="grams" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8 }}
                  name="권장 급여량 (g)"
                />
              </LineChart>
           </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
           {result.dietRoadmap.map((point, i) => (
             <div key={i} className="flex flex-col gap-1 text-center">
               <span className="text-[10px] font-black text-muted-foreground">{point.phase}</span>
               <span className="text-sm font-bold">{point.weight}kg 시점</span>
               <span className="text-lg font-black text-primary">{point.grams}g</span>
             </div>
           ))}
        </div>
      </Card>

      {/* 4. Veterinary Diagnosis Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 space-y-8">
           <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
             🧪 영양 농도 분석 (DM 기준)
           </CardTitle>
           <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold">탄수화물 (NFE)</span>
                  <span className={cn("text-lg font-black", result.advancedNutrition.isHighCarb ? "text-destructive" : "text-primary")}>
                    {result.advancedNutrition.carbs_nfe_dm}%
                  </span>
                </div>
                <Progress value={result.advancedNutrition.carbs_nfe_dm} className={cn("h-3", result.advancedNutrition.isHighCarb ? "bg-destructive/10" : "bg-muted")} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold">단백질</span>
                  <span className="text-lg font-black text-primary">{result.advancedNutrition.protein_dm}%</span>
                </div>
                <Progress value={result.advancedNutrition.protein_dm} className="h-3 bg-muted" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold">지방</span>
                  <span className="text-lg font-black text-primary">{result.advancedNutrition.fat_dm}%</span>
                </div>
                <Progress value={result.advancedNutrition.fat_dm} className="h-3 bg-muted" />
              </div>
           </div>

           {result.veterinaryDiagnosis.criticalMismatch && (
             <div className="p-6 bg-destructive/5 rounded-3xl border-2 border-destructive/20 flex gap-4">
                <AlertTriangle className="text-destructive shrink-0 mt-1" size={24}/>
                <div className="space-y-1">
                  <p className="font-black text-destructive">핵심 부적합 사유</p>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">{result.veterinaryDiagnosis.criticalMismatch}</p>
                </div>
             </div>
           )}
        </Card>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 space-y-8">
           <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
             🔍 성분 매칭 분석
           </CardTitle>
           <div className="space-y-6">
              <div className="space-y-4">
                 <p className="text-xs font-black text-success flex items-center gap-1.5"><CheckCircle2 size={14}/> 긍정 성분</p>
                 <div className="space-y-2">
                    {result.veterinaryDiagnosis.positivePoints.map((p, i) => (
                      <p key={i} className="text-sm font-medium bg-success/5 p-3 rounded-xl border border-success/10 leading-relaxed">{p}</p>
                    ))}
                 </div>
              </div>
              <div className="space-y-4">
                 <p className="text-xs font-black text-destructive flex items-center gap-1.5"><AlertTriangle size={14}/> 주의 성분</p>
                 <div className="space-y-2">
                    {result.veterinaryDiagnosis.cautionaryPoints.map((p, i) => (
                      <p key={i} className="text-sm font-medium bg-destructive/5 p-3 rounded-xl border border-destructive/10 leading-relaxed">{p}</p>
                    ))}
                 </div>
              </div>
           </div>
        </Card>
      </div>

      {/* 5. Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t z-50 flex justify-center">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black">
            <Repeat size={18} className="mr-2" /> {resetButtonText || '다시 분석'}
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
