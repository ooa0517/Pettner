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
  Award, ShieldAlert, Microscope, 
  Zap, ThumbsUp, ThumbsDown, 
  Sparkles, Dna, Calculator, Utensils, 
  PieChart, Factory, UserCircle, Truck,
  CheckCircle2, Info, Globe, Calendar, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const isCustomMode = input.analysisMode === 'custom';
  const isEn = input.language === 'en';
  const [amount, setAmount] = useState<number>(result?.calculatorData?.defaultAmount || 0);

  const calculatedNutrition = useMemo(() => {
    if (!result?.calculatorData) return null;
    const calc = result.calculatorData;
    const ratio = amount; 
    return {
      kcal: ratio * (calc.kcalPerUnit || 0),
      protein: ratio * (calc.nutrientsPerUnit?.protein || 0),
      fat: ratio * (calc.nutrientsPerUnit?.fat || 0),
      carbs: ratio * (calc.nutrientsPerUnit?.carbs || 0),
    };
  }, [amount, result?.calculatorData]);

  if (!result || !result.productIdentity || !result.scoreCard) {
     return (
        <div className="space-y-8 py-20 text-center animate-in fade-in duration-500">
          <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-30"/>
          <h1 className="text-3xl font-black">Analysis Report Error</h1>
          <p className="text-muted-foreground">AI failed to generate a complete report due to missing label data.</p>
          <Button onClick={onReset} variant="outline" size="lg" className="rounded-full mt-4">Try Again</Button>
        </div>
     );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-40 max-w-4xl mx-auto px-4">
      
      {/* 1. Header & Summary */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-1">
              <Badge variant="outline" className={cn("border-none px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase font-black", 
                isCustomMode ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                {isCustomMode ? 'Pettner V10.0 Consultant' : 'Pettner V10.0 Auditor'}
              </Badge>
              <h1 className="text-3xl font-black tracking-tighter pt-2 leading-tight">
                {result.productIdentity.name}
              </h1>
              <p className="text-muted-foreground font-bold">{result.productIdentity.brand} · {result.productIdentity.category}</p>
            </div>
            <div className="text-left md:text-right shrink-0">
               <div className="text-6xl font-black text-primary leading-none">{result.scoreCard.totalScore}<span className="text-xl ml-1">{isEn ? 'pts' : '점'}</span></div>
               <Badge className="mt-3 font-black px-4 py-1 rounded-full text-sm bg-success">
                 Grade {result.productIdentity.qualityGrade || 'N/A'}
               </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 bg-muted/10 rounded-[2rem] flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-primary"><UserCircle size={20}/></div>
               <div>
                  <p className="text-[10px] font-black opacity-50 uppercase">Target Audience</p>
                  <p className="text-xs font-bold leading-tight">
                    {result.productIdentity.targetAudience?.lifeStage}<br/>
                    {result.productIdentity.targetAudience?.recommendedBreeds}
                  </p>
               </div>
            </div>
            <div className="p-6 bg-muted/10 rounded-[2rem] flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-primary"><Factory size={20}/></div>
               <div>
                  <p className="text-[10px] font-black opacity-50 uppercase">Manufacture</p>
                  <p className="text-xs font-bold leading-tight">
                    {result.productIdentity.manufacturingDetails?.productionType}<br/>
                    <span className="text-[10px] opacity-60 font-medium">{result.productIdentity.manufacturingDetails?.facilityInfo}</span>
                  </p>
               </div>
            </div>
            <div className="p-6 bg-muted/10 rounded-[2rem] flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-primary"><Truck size={20}/></div>
               <div>
                  <p className="text-[10px] font-black opacity-50 uppercase">Sourcing</p>
                  <p className="text-xs font-bold leading-tight">
                    {result.productIdentity.manufacturingDetails?.sourcingOrigin}
                  </p>
               </div>
            </div>
          </div>

          <div className={cn("p-8 rounded-[2.5rem] border-l-8", isCustomMode ? "border-primary bg-primary/5" : "border-muted bg-muted/5")}>
             <div className="relative z-10 space-y-4">
               <h3 className="text-xl font-black flex items-center gap-2">
                 {isCustomMode ? <Stethoscope className="text-primary" size={20}/> : <Award className="text-primary" size={20}/>} 
                 {isCustomMode ? (isEn ? 'Veterinary Consultation' : '수의학적 정밀 컨설팅') : (isEn ? 'Audit Result' : '제품 정밀 감사 결과')}
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

      {/* 2. Personal Match (Mode B Only) */}
      {isCustomMode && result.personalMatching && (
        <div className="space-y-6">
           <div className="flex items-center gap-2 px-2">
            <Sparkles className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-black font-headline tracking-tight">{isEn ? '1:1 Compatibility Report' : '우리 아이 1:1 매칭 리포트'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-success/5 border border-success/10 overflow-hidden">
               <CardHeader className="bg-success/10 pb-4"><CardTitle className="text-lg font-black text-success flex items-center gap-2"><ThumbsUp size={20}/> {isEn ? 'Perfect Match' : '궁합 최고'}</CardTitle></CardHeader>
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
               <CardHeader className="bg-destructive/10 pb-4"><CardTitle className="text-lg font-black text-destructive flex items-center gap-2"><ThumbsDown size={20}/> {isEn ? 'Risk Warning' : '주의 및 위험'}</CardTitle></CardHeader>
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

      {/* 3. Real-time Nutrition Calculator */}
      {result.calculatorData && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Calculator className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-black font-headline tracking-tight">{isEn ? 'Precision Feeding Calculator' : '실시간 정밀 영양 계산기'}</h2>
          </div>
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
            <CardContent className="p-10 space-y-10">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-black text-muted-foreground uppercase">{isEn ? 'Set Amount' : '급여할 양 설정'}</label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          value={amount} 
                          onChange={(e) => setAmount(Number(e.target.value))} 
                          className="w-24 h-12 text-center text-xl font-black rounded-xl bg-muted/10 border-none" 
                        />
                        <span className="font-black text-lg">{result.calculatorData?.unitName}</span>
                      </div>
                    </div>
                    <Slider 
                      value={[amount]} 
                      min={0} 
                      max={result.calculatorData.unitName.includes('g') ? 500 : 20} 
                      step={result.calculatorData.unitName.includes('g') ? 5 : 1} 
                      onValueChange={(v) => setAmount(v[0])} 
                      className="py-4" 
                    />
                  </div>
                  
                  {isCustomMode && result.feedingSummary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <div className="p-5 bg-primary text-white rounded-[2rem] shadow-lg shadow-primary/20">
                          <p className="text-[10px] font-black opacity-60 uppercase mb-1">Target Daily</p>
                          <h4 className="text-xl font-black">{result.feedingSummary.dailyAmount}</h4>
                          <p className="text-[9px] opacity-40 font-bold">1 Meal: {result.feedingSummary.perMealAmount}</p>
                       </div>
                       <div className="p-5 bg-white border-2 border-primary/20 rounded-[2rem] text-primary">
                          <p className="text-[10px] font-black opacity-60 uppercase mb-1">Cup Guide</p>
                          <h4 className="text-xl font-black">{result.feedingSummary.cupGuide}</h4>
                          <p className="text-[9px] opacity-40 font-bold">{isEn ? 'Standard Cup (240ml)' : '종이컵 기준 (180ml)'}</p>
                       </div>
                    </div>
                  )}

                  <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex items-center gap-6">
                    <div className="p-4 bg-white rounded-2xl shadow-sm"><Utensils className="text-primary" size={24} /></div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black opacity-40 uppercase">Total Calories (kcal)</p>
                      <h4 className="text-4xl font-black text-primary">{calculatedNutrition?.kcal.toFixed(1)} <span className="text-lg">kcal</span></h4>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 bg-muted/10 rounded-[3rem] p-10 space-y-8">
                  <p className="text-xs font-black text-muted-foreground flex items-center gap-2"><PieChart size={14} /> {isEn ? 'Nutrient Weight (g)' : '영양소 질량 상세 (g)'}</p>
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { label: isEn ? 'Protein' : '단백질', value: calculatedNutrition?.protein, color: 'bg-primary' },
                      { label: isEn ? 'Fat' : '지방', value: calculatedNutrition?.fat, color: 'bg-yellow-500' },
                      { label: isEn ? 'Carbs' : '탄수화물', value: calculatedNutrition?.carbs, color: 'bg-muted-foreground' }
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[12px] font-black"><span>{item.label}</span><span>{item.value?.toFixed(2)}g</span></div>
                        <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
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

      {/* 4. Weight Diagnosis & Roadmap (Mode B Only) */}
      {isCustomMode && result.weightDiagnosis && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Scale className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-black font-headline tracking-tight">{isEn ? 'Obesity Diagnosis & Roadmap' : '비만도 진단 및 다이어트 로드맵'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10">
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                   <div><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Current</p><h4 className="text-5xl font-black">{result.weightDiagnosis.currentWeight}kg</h4></div>
                   <div className="text-right"><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Ideal</p><h4 className="text-5xl font-black text-success">{(result.weightDiagnosis.idealWeight || 0).toFixed(1)}kg</h4></div>
                </div>
                <div className="space-y-2">
                   <div className="h-5 bg-muted rounded-full relative overflow-hidden shadow-inner">
                      <div className={cn("h-full transition-all duration-1000", (result.weightDiagnosis.weightGap || 0) > 0 ? "bg-destructive" : "bg-primary")} 
                           style={{ width: `${Math.max(10, Math.min(50 + (result.weightDiagnosis.overweightPercentage || 0), 100))}%` }} />
                   </div>
                   <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                      <span>{isEn ? 'Breed Standard' : '품종 표준'}: {result.weightDiagnosis.breedStandardRange}</span>
                      <span className="text-destructive">{isEn ? 'Overweight' : '비만도'} {result.weightDiagnosis.overweightPercentage}%</span>
                   </div>
                </div>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">{result.weightDiagnosis.verdict}</p>
              </div>
            </Card>
            
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white p-10 relative overflow-hidden group">
                 <div className="absolute top-[-20px] right-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700"><Dna size={120} /></div>
                 <div className="space-y-4 relative z-10">
                    <span className="text-[11px] font-black uppercase tracking-widest opacity-80 flex items-center gap-1.5"><Info size={12}/> {isEn ? 'Genetic Vulnerability' : '유전적 취약점 조언'}</span>
                    <p className="text-lg font-bold leading-relaxed">{result.weightDiagnosis.breedGeneticInsight}</p>
                 </div>
            </Card>
          </div>

          {result.dietRoadmap && result.dietRoadmap.length > 0 && (
             <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10">
                <div className="space-y-6">
                   <h3 className="font-black text-lg flex items-center gap-2"><History className="text-primary w-5 h-5"/> {isEn ? 'Weight Loss Roadmap' : '단계별 체중 감량 로드맵'}</h3>
                   <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.dietRoadmap}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="phase" hide />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                            formatter={(value: any, name: any) => [value + (name === 'weight' ? 'kg' : 'g'), name === 'weight' ? (isEn ? 'Weight' : '목표체중') : (isEn ? 'Amount' : '급여량')]}
                          />
                          <Line type="monotone" dataKey="grams" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: 'white', strokeWidth: 3 }} activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={4} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      {result.dietRoadmap.map((step, i) => (
                        <div key={i} className="text-center space-y-1">
                           <p className="text-[10px] font-black opacity-40 uppercase">{step.phase}</p>
                           <p className="text-xs font-black">{step.weight}kg / {step.grams}g</p>
                        </div>
                      ))}
                   </div>
                </div>
             </Card>
          )}
        </div>
      )}

      {/* 5. Deep Dive (Common) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Microscope className="text-primary w-6 h-6" />
          <h2 className="text-2xl font-black font-headline tracking-tight">{isEn ? 'Expert Deep Dive Audit' : '전문가용 심층 감사 리포트'}</h2>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {result?.deepDive?.ingredientAudit && (
            <AccordionItem value="ingredients" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
              <AccordionTrigger className="px-8 py-6 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary"><FlaskConical /></div>
                  <div className="text-left"><h3 className="font-black text-lg">{isEn ? 'Ingredient Audit' : '원재료 품질 감사'}</h3><p className="text-xs text-muted-foreground font-medium">{isEn ? 'Tier-based analysis of top 10 ingredients' : '제1~10원료 수급지 및 가공 방식'}</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
                <div className="grid gap-4">
                  {result.deepDive.ingredientAudit.tiers?.map((tier, i) => (
                    <div key={i} className="p-6 rounded-[2rem] bg-muted/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="font-black bg-primary/20 text-primary border-none">{tier.level}</Badge>
                        <span className="text-[10px] font-bold opacity-40 uppercase">Core Ingredients</span>
                      </div>
                      <p className="text-sm font-black leading-relaxed">{tier.ingredients?.join(', ')}</p>
                      <p className="text-xs text-muted-foreground italic leading-relaxed">{tier.comment}</p>
                    </div>
                  ))}
                  <div className="p-6 rounded-[2rem] bg-muted/5 border-2 border-dashed border-muted flex items-center justify-between">
                     <div><p className="text-[10px] font-black opacity-50 uppercase">GI Index</p><p className="font-bold text-primary">{result.deepDive.ingredientAudit.giIndex}</p></div>
                     <p className="text-xs text-muted-foreground flex-1 ml-6 leading-relaxed">{result.deepDive.ingredientAudit.giComment}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {result?.deepDive?.nutritionalEngineering && (
            <AccordionItem value="nutrition" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
              <AccordionTrigger className="px-8 py-6 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary"><BarChart3 /></div>
                  <div className="text-left"><h3 className="font-black text-lg">{isEn ? 'Nutritional Engineering' : '수의 영양 엔지니어링'}</h3><p className="text-xs text-muted-foreground font-medium">{isEn ? 'Dry Matter (DM) balance report' : '건물(DM) 기준 정밀 밸런스'}</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-muted/10 rounded-2xl text-center"><p className="text-[10px] font-black opacity-50 mb-1">Ca:P Ratio</p><p className="font-bold text-primary">{result.deepDive.nutritionalEngineering.ratios?.caPRatio}</p></div>
                    <div className="p-5 bg-muted/10 rounded-2xl text-center"><p className="text-[10px] font-black opacity-50 mb-1">Omega 6:3 Ratio</p><p className="font-bold text-primary">{result.deepDive.nutritionalEngineering.ratios?.omega63Ratio}</p></div>
                 </div>
                 <div className="p-6 bg-muted/10 rounded-2xl border-l-4 border-primary"><p className="text-xs font-bold leading-relaxed">{result.deepDive.nutritionalEngineering.ratios?.balanceVerdict}</p></div>
              </AccordionContent>
            </AccordionItem>
          )}

          {result?.deepDive?.safetyToxicology && (
            <AccordionItem value="safety" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
              <AccordionTrigger className="px-8 py-6 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary"><ShieldAlert /></div>
                  <div className="text-left"><h3 className="font-black text-lg">{isEn ? 'Safety & Compliance' : '공급망 감사 및 안전 필터'}</h3><p className="text-xs text-muted-foreground font-medium">{isEn ? 'Recall history and facility audit' : '리콜 이력 및 시설 인증'}</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
                 <div className="flex gap-4">
                    <div className="flex-1 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                        <Truck className="text-primary" />
                        <div><p className="text-[10px] font-black opacity-50 uppercase">Origin</p><p className="text-sm font-bold">{result.productIdentity.manufacturingDetails?.sourcingOrigin}</p></div>
                    </div>
                    <div className="flex-1 p-6 bg-muted/10 rounded-2xl flex items-center gap-4">
                        <CheckCircle2 className="text-success" />
                        <div><p className="text-[10px] font-black opacity-50 uppercase">Certified</p><p className="text-sm font-bold">HACCP / ISO</p></div>
                    </div>
                 </div>
                 <div className="p-6 bg-muted/10 rounded-2xl space-y-2">
                    <p className="text-[10px] font-black opacity-50 uppercase">{isEn ? 'Recall History' : '리콜 및 안전 이력'}</p>
                    <p className="text-xs font-bold leading-relaxed">{result.deepDive.safetyToxicology.recallHistory}</p>
                 </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {result?.deepDive?.brandESG && (
            <AccordionItem value="esg" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
              <AccordionTrigger className="px-8 py-6 hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Globe className="w-5 h-5" /></div>
                  <div className="text-left"><h3 className="font-black text-lg">{isEn ? 'Brand Trust & ESG' : '브랜드 신뢰도 감사'}</h3><p className="text-xs text-muted-foreground font-medium">{isEn ? 'R&D and Sustainability report' : '윤리적 수급 및 환경 경영'}</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-muted/10 rounded-2xl"><p className="text-[10px] font-black opacity-50 mb-1">R&D Level</p><p className="font-bold text-primary">{result.deepDive.brandESG.rdLevel}</p></div>
                    <div className="p-6 bg-muted/10 rounded-2xl"><p className="text-[10px] font-black opacity-50 mb-1">Sustainability</p><p className="font-bold text-primary">{result.deepDive.brandESG.sustainability}</p></div>
                 </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>

      {/* 6. Final Advice Card */}
      <Card className="border-none shadow-2xl rounded-[3.5rem] bg-primary text-white p-12 relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-10"><Stethoscope size={150} /></div>
        <div className="flex items-center gap-5 mb-8 relative z-10">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md"><Zap size={40} /></div>
          <h3 className="text-2xl font-black">{isEn ? 'Final Veterinary Advice' : '수의학적 최종 처방 조언'}</h3>
        </div>
        <p className="text-xl font-bold leading-relaxed opacity-95 break-keep relative z-10">{result.veterinaryAdvice}</p>
      </Card>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-2xl border-t z-50 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-black text-primary"><Zap size={20} className="mr-2" /> {resetButtonText || (isEn ? 'New Scan' : '다시 분석')}</Button>
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(result.productIdentity.name)}`, '_blank')} className="flex-[2] h-16 rounded-2xl text-xl font-black shadow-xl hover:scale-[1.02] transition-transform"><ShoppingBag size={24} className="mr-3" /> {isEn ? 'Buy Lowest Price' : '최저가 구매'}</Button>
        </div>
      </div>
    </div>
  );
}
