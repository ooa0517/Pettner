'use client';

import { useState, useMemo } from 'react';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  ShoppingBag, AlertCircle, Scale,
  Stethoscope, FlaskConical, BarChart3, 
  Award, ShieldAlert, Globe, Microscope, 
  Zap, CheckCircle, ThumbsUp, ThumbsDown, 
  Sparkles, Dna, Calculator, Utensils, 
  PieChart, Factory, UserCircle, Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const [amount, setAmount] = useState<number>(result?.calculatorData?.defaultAmount || 0);

  const calculatedNutrition = useMemo(() => {
    if (!result?.calculatorData) return null;
    const calc = result.calculatorData;
    return {
      kcal: amount * (calc.kcalPerUnit || 0),
      protein: amount * (calc.nutrientsPerUnit?.protein || 0),
      fat: amount * (calc.nutrientsPerUnit?.fat || 0),
      carbs: amount * (calc.nutrientsPerUnit?.carbs || 0),
    };
  }, [amount, result?.calculatorData]);

  if (result?.status === 'error' || !result?.productIdentity || !result?.scoreCard) {
     return (
        <div className="space-y-8 py-20 text-center">
          <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-30"/>
          <h1 className="text-3xl font-black">분석 리포트 생성 오류</h1>
          <p className="text-muted-foreground">AI가 데이터를 정밀하게 처리하는 중 문제가 발생했습니다.</p>
          <Button onClick={onReset} variant="outline" size="lg" className="rounded-full">다시 분석하기</Button>
        </div>
     );
  }

  const isCustomMode = input.analysisMode === 'custom';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-40 max-w-4xl mx-auto px-4">
      
      {/* 1. 종합 요약 */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-1">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                {isCustomMode ? 'Personal Consultant V7.0' : 'Product Specialist V7.0'}
              </Badge>
              <h1 className="text-3xl font-black tracking-tighter pt-2 leading-tight">
                {result.productIdentity.name}
              </h1>
              <p className="text-muted-foreground font-bold">{result.productIdentity.brand} · {result.productIdentity.category}</p>
            </div>
            <div className="text-left md:text-right shrink-0">
               <div className="text-6xl font-black text-primary leading-none">{result.scoreCard.totalScore}<span className="text-xl ml-1">점</span></div>
               <Badge className="mt-3 font-black px-4 py-1 rounded-full text-sm bg-success">
                 Grade {result.productIdentity.qualityGrade || 'A'}
               </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-muted/10 rounded-[2rem] flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-primary"><UserCircle size={20}/></div>
               <div>
                  <p className="text-[10px] font-black opacity-50 uppercase">Target Audience</p>
                  <p className="text-xs font-bold">
                    {result.productIdentity.targetAudience?.lifeStage || '전연령'} · {result.productIdentity.targetAudience?.recommendedBreeds || '전품종'}
                  </p>
               </div>
            </div>
            <div className="p-6 bg-muted/10 rounded-[2rem] flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-primary"><Factory size={20}/></div>
               <div>
                  <p className="text-[10px] font-black opacity-50 uppercase">Manufacturing</p>
                  <p className="text-xs font-bold">
                    {result.productIdentity.manufacturingDetails?.productionType || 'Unknown'} ({result.productIdentity.manufacturingDetails?.facilityInfo || 'Global'})
                  </p>
               </div>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] border-l-8 border-primary bg-primary/5">
             <div className="relative z-10 space-y-4">
               <h3 className="text-xl font-black flex items-center gap-2">
                 {isCustomMode ? <Stethoscope className="text-primary" size={20}/> : <Award className="text-primary" size={20}/>} 
                 {isCustomMode ? '우리 아이 맞춤 가이드' : '제품 품질 정밀 감사'}
               </h3>
               <p className="text-lg font-bold leading-relaxed break-keep">
                 {result.scoreCard.headline}
               </p>
               <div className="flex flex-wrap gap-2">
                 {result.scoreCard.statusTags?.map((tag, i) => (
                   <Badge key={i} variant="secondary" className="bg-white font-bold px-3 py-1 shadow-sm text-primary">
                     {tag}
                   </Badge>
                 ))}
               </div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 1:1 매칭 (맞춤형 전용) */}
      {isCustomMode && result.personalMatching && (
        <div className="space-y-6">
           <div className="flex items-center gap-2 px-2">
            <Sparkles className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-black font-headline tracking-tight">우리 아이 1:1 매칭 리포트</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-success/5 border border-success/10 overflow-hidden">
               <CardHeader className="bg-success/10 pb-4"><CardTitle className="text-lg font-black text-success flex items-center gap-2"><ThumbsUp size={20}/> Perfect Match</CardTitle></CardHeader>
               <CardContent className="p-6 space-y-4">
                  {result.personalMatching.matches?.map((match, i) => (
                    <div key={i} className="space-y-1">
                      <p className="font-black text-sm text-success">{match.feature}</p>
                      <p className="text-xs text-muted-foreground font-bold leading-relaxed">{match.reason}</p>
                    </div>
                  ))}
               </CardContent>
            </Card>
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-destructive/5 border border-destructive/10 overflow-hidden">
               <CardHeader className="bg-destructive/10 pb-4"><CardTitle className="text-lg font-black text-destructive flex items-center gap-2"><ThumbsDown size={20}/> Risk Warning</CardTitle></CardHeader>
               <CardContent className="p-6 space-y-4">
                  {result.personalMatching.mismatches?.map((mismatch, i) => (
                    <div key={i} className="space-y-1">
                      <p className="font-black text-sm text-destructive">{mismatch.feature}</p>
                      <p className="text-xs text-muted-foreground font-bold leading-relaxed">{mismatch.reason}</p>
                    </div>
                  ))}
               </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 3. 실시간 영양 계산기 */}
      {result.calculatorData && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Calculator className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-black font-headline tracking-tight">실시간 영양 계산기</h2>
          </div>
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
            <CardContent className="p-10 space-y-10">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-black text-muted-foreground uppercase">급여할 양</label>
                      <div className="flex items-center gap-2">
                        <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-24 h-12 text-center text-xl font-black rounded-xl bg-muted/20 border-none" />
                        <span className="font-black text-lg">{result.calculatorData.unitName || 'g'}</span>
                      </div>
                    </div>
                    <Slider value={[amount]} min={0} max={500} step={5} onValueChange={(v) => setAmount(v[0])} className="py-4" />
                  </div>
                  <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm"><Utensils className="text-primary" /></div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black opacity-40 uppercase">Total Energy</p>
                      <h4 className="text-3xl font-black text-primary">{calculatedNutrition?.kcal.toFixed(1)} <span className="text-sm">kcal</span></h4>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-muted/10 rounded-[2.5rem] p-8 space-y-6">
                  <p className="text-xs font-black text-muted-foreground flex items-center gap-2"><PieChart size={14} /> 영양소 질량 (g)</p>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: '단백질 (Protein)', value: calculatedNutrition?.protein, color: 'bg-primary' },
                      { label: '지방 (Fat)', value: calculatedNutrition?.fat, color: 'bg-yellow-500' },
                      { label: '탄수화물 (Carbs)', value: calculatedNutrition?.carbs, color: 'bg-muted-foreground' }
                    ].map((item, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-black"><span>{item.label}</span><span>{item.value?.toFixed(2)}g</span></div>
                        <div className="h-1.5 bg-white rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all duration-700", item.color)} style={{ width: `${Math.min((item.value || 0) * 10, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. 체중 진단 (맞춤형 전용) */}
      {isCustomMode && result.weightDiagnosis && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Scale className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-black font-headline tracking-tight">품종 표준 체중 진단</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <div><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Current</p><h4 className="text-4xl font-black">{result.weightDiagnosis.currentWeight}kg</h4></div>
                   <div className="text-right"><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Ideal</p><h4 className="text-4xl font-black text-success">{(result.weightDiagnosis.idealWeight || 0).toFixed(1)}kg</h4></div>
                </div>
                <div className="h-4 bg-muted rounded-full relative overflow-hidden">
                   <div className={cn("h-full transition-all duration-1000", (result.weightDiagnosis.weightGap || 0) > 0 ? "bg-destructive" : "bg-primary")} 
                        style={{ width: `${Math.min(50 + (result.weightDiagnosis.overweightPercentage || 0), 100)}%` }} />
                </div>
                <p className="text-[11px] font-bold text-muted-foreground">품종 표준: {result.weightDiagnosis.breedStandardRange}</p>
              </div>
            </Card>
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white p-10 relative overflow-hidden group">
               <div className="absolute top-[-20px] right-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700"><Dna size={120} /></div>
               <div className="space-y-4 relative z-10">
                  <span className="text-[11px] font-black uppercase tracking-widest opacity-80">Breed Insight</span>
                  <p className="text-base font-bold leading-relaxed">{result.weightDiagnosis.breedGeneticInsight}</p>
               </div>
            </Card>
          </div>
        </div>
      )}

      {/* 5. 딥다이브 */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Microscope className="text-primary w-6 h-6" />
          <h2 className="text-2xl font-black font-headline tracking-tight">전문가용 심층 리포트</h2>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {result?.deepDive?.ingredientAudit && (
            <AccordionItem value="ingredients" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
              <AccordionTrigger className="px-8 py-6 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary"><FlaskConical /></div>
                  <div className="text-left"><h3 className="font-black text-lg">원재료 티어링 감사</h3><p className="text-xs text-muted-foreground font-medium">GI 지수 및 원료 품질</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
                <div className="grid gap-4">
                  {result.deepDive.ingredientAudit.tiers?.map((tier, i) => (
                    <div key={i} className="p-6 rounded-[2rem] bg-muted/10 space-y-2">
                      <Badge className="font-black bg-primary">{tier.level}</Badge>
                      <p className="text-xs font-bold leading-relaxed">{tier.ingredients?.join(', ')}</p>
                      <p className="text-xs text-muted-foreground italic">{tier.comment}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {result?.deepDive?.nutritionalEngineering && (
            <AccordionItem value="nutrition" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
              <AccordionTrigger className="px-8 py-6 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary"><BarChart3 /></div>
                  <div className="text-left"><h3 className="font-black text-lg">영양 엔지니어링</h3><p className="text-xs text-muted-foreground font-medium">Ca:P 비율 및 오메가 밸런스</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
                 <div className="p-6 bg-muted/10 rounded-2xl"><p className="text-xs font-bold leading-relaxed">{result.deepDive.nutritionalEngineering.ratios?.balanceVerdict}</p></div>
              </AccordionContent>
            </AccordionItem>
          )}

          {result?.deepDive?.safetyToxicology && (
            <AccordionItem value="safety" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
              <AccordionTrigger className="px-8 py-6 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary"><ShieldAlert /></div>
                  <div className="text-left"><h3 className="font-black text-lg">공급망 감사 및 안전 필터</h3><p className="text-xs text-muted-foreground font-medium">리콜 이력 및 원료 수급지</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
                 <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                    <Truck className="text-primary" />
                    <div><p className="text-[10px] font-black opacity-50 uppercase">Sourcing Origin</p><p className="text-sm font-bold">{result.productIdentity.manufacturingDetails?.sourcingOrigin || 'Global'}</p></div>
                 </div>
                 <div className="p-6 bg-muted/10 rounded-2xl"><p className="text-xs font-bold leading-relaxed">{result.deepDive.safetyToxicology.recallHistory}</p></div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] bg-primary text-white p-12 relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-10"><Stethoscope size={150} /></div>
        <div className="flex items-center gap-5 mb-8 relative z-10"><div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md"><Stethoscope size={40} /></div><h3 className="text-2xl font-black">수의학적 최종 조언</h3></div>
        <p className="text-xl font-bold leading-relaxed opacity-95 break-keep relative z-10">{result.veterinaryAdvice}</p>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-2xl border-t z-50 flex justify-center shadow-lg">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-black text-primary"><Zap size={20} className="mr-2" /> {resetButtonText || '다시 분석'}</Button>
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(result.productIdentity.name)}`, '_blank')} className="flex-[2] h-16 rounded-2xl text-xl font-black shadow-xl"><ShoppingBag size={24} className="mr-3" /> 최저가 구매</Button>
        </div>
      </div>
    </div>
  );
}
