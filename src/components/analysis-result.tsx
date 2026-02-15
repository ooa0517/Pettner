'use client';

import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Repeat, ShoppingBag, 
  Dog, Cat, ThumbsUp, ThumbsDown, 
  Scale, Sparkles, Microscope,
  AlertCircle, HeartPulse, GraduationCap,
  Award, Zap, Activity, Edit2, Check,
  Smile, Frown, Info, ShieldAlert,
  Dna
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const { t } = useLanguage();
  
  const [productName, setProductName] = useState(result.productIdentity.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [palatability, setPalatability] = useState<'good' | 'normal' | 'bad' | null>(null);

  if (result.status === 'error') {
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

  const { scoreCard, advancedNutrition, ingredientCheck, expertVerdict, radarChart, scientificReferences, safety_check, protocol_used, genetic_analysis } = result;
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

  const getWarningLevelColor = (level: string) => {
    switch(level) {
      case 'Red': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Yellow': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Green': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const InfoIcon = ({ content }: { content: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-3.5 h-3.5 text-muted-foreground/40 cursor-help inline-block ml-1" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[200px] p-2 text-xs leading-relaxed">
        {content}
      </TooltipContent>
    </Tooltip>
  );

  const BenchmarkBar = ({ label, position, value, tooltip }: { label: string, position: number, value: string, tooltip: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-muted-foreground flex items-center">
          {label}
          <InfoIcon content={tooltip} />
        </span>
        <span className="text-sm font-black text-primary">{value}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-0 bg-muted/30 rounded-full" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-muted-foreground/30 z-10">
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-muted-foreground whitespace-nowrap">시장 평균(Avg)</span>
        </div>
        <div 
          className="absolute h-3 w-3 bg-primary rounded-full shadow-lg border-2 border-white transition-all duration-1000 z-20"
          style={{ left: `calc(${position}% - 6px)` }}
        />
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="space-y-10 animate-in fade-in duration-700 pb-40 max-w-4xl mx-auto px-4">
        
        {/* Header & Verification Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="px-4 py-1.5 border-primary/30 text-primary bg-primary/5 rounded-full flex gap-2 items-center font-bold text-xs uppercase tracking-widest">
              <Microscope className="w-4 h-4"/> Pettner Core Engine v3.6 ({protocol_used})
            </Badge>
            {safety_check.toxic_detected && (
              <Badge variant="destructive" className="animate-bounce flex gap-1 items-center font-black">
                <ShieldAlert size={14} /> 독성 주의!
              </Badge>
            )}
          </div>

          <Card className="border-none shadow-md overflow-hidden bg-white/80 backdrop-blur-sm ring-1 ring-black/5 rounded-3xl">
            <div className="p-4 flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border">
                {input.photoDataUri ? (
                  <Image src={input.photoDataUri} alt="원본 이미지" fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <PetIcon size={24} />
                  </div>
                )}
              </div>
              <div className="flex-grow space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={10} className="text-primary" /> AI 인식 제품명
                </p>
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <Input 
                      value={productName} 
                      onChange={(e) => setProductName(e.target.value)} 
                      className="h-9 font-bold focus:ring-primary rounded-lg"
                      autoFocus
                    />
                  ) : (
                    <h2 className="text-lg font-black tracking-tight truncate">{productName}</h2>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary/40 hover:text-primary"
                    onClick={() => setIsEditingName(!isEditingName)}
                  >
                    {isEditingName ? <Check size={16} /> : <Edit2 size={16} />}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary/70 font-black uppercase tracking-[0.2em] text-sm">
                <PetIcon className="w-5 h-5" />
                {result.productIdentity.brand || 'Premium Pet Food'}
              </div>
              <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-foreground leading-tight">
                {productName}
              </h1>
              <div className="flex flex-wrap gap-2 pt-2">
                {scoreCard.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="bg-white border text-muted-foreground font-bold">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className={cn("shrink-0 h-24 w-24 rounded-3xl flex flex-col items-center justify-center shadow-xl", getGradeColor(scoreCard.grade))}>
               <span className="text-xs font-black uppercase tracking-widest opacity-70">Grade</span>
               <span className="text-5xl font-black">{scoreCard.grade}</span>
            </div>
          </div>
        </div>

        {/* Genetic Analysis Warning */}
        {genetic_analysis.is_risk_breed && (
          <Card className={cn("border-2 rounded-3xl overflow-hidden shadow-sm", getWarningLevelColor(genetic_analysis.warning_level))}>
            <div className="p-6 flex gap-4 items-start">
              <div className="p-3 bg-white/50 rounded-2xl shadow-sm">
                <Dna className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm uppercase tracking-wider">유전적 질환 예방 알림: {genetic_analysis.breed_name}</h3>
                  <Badge variant="outline" className="text-[10px] font-bold border-current/20">PREVENTIVE</Badge>
                </div>
                <p className="text-sm font-bold leading-relaxed">{genetic_analysis.message}</p>
                {genetic_analysis.risk_factor_detected && (
                  <p className="text-[11px] opacity-70 font-medium pt-1">
                    탐지된 요인: {genetic_analysis.risk_factor_detected} ({genetic_analysis.trigger_value})
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Advanced Nutrition */}
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white ring-1 ring-black/5">
           <CardHeader className="bg-muted/30 p-10 border-b">
              <CardTitle className="flex items-center gap-3 text-xl font-black">
                 <Zap className="text-primary w-6 h-6"/> 건물 기준(DM) 정밀 영양 분석
                 <InfoIcon content="건물 기준(DM)이란? 수분을 제외한 실제 영양소의 농도를 뜻하며, 사료 간의 영양 밸런스를 공정하게 비교하는 국제 표준 기준입니다." />
              </CardTitle>
           </CardHeader>
           <CardContent className="p-10 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <BenchmarkBar 
                   label="DM 단백질" 
                   position={advancedNutrition.benchmarks.protein.position} 
                   value={advancedNutrition.dm_protein} 
                   tooltip="근육과 장기 건강을 담당하는 단백질의 함량입니다."
                 />
                 <BenchmarkBar 
                   label="DM 지방" 
                   position={advancedNutrition.benchmarks.fat.position} 
                   value={advancedNutrition.dm_fat} 
                   tooltip="주요 에너지원이며 비타민 흡수를 돕는 지방 함량입니다."
                 />
                 <BenchmarkBar 
                   label="DM 탄수화물" 
                   position={advancedNutrition.benchmarks.carbs.position} 
                   value={advancedNutrition.dm_carbs} 
                   tooltip="NFE 공식을 통해 산출된 탄수화물 함량입니다. 50%를 넘으면 비만 리스크가 큽니다."
                 />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-6 border-t">
                 {[
                   { label: '에너지(kg)', value: advancedNutrition.calories_per_kg, icon: Activity, tip: "해당 제품의 kg당 칼로리 밀도입니다." },
                   { label: '수분(Original)', value: advancedNutrition.moisture, icon: HeartPulse, tip: "제조 시 포함된 원본 수분 함량입니다." },
                   { label: '칼슘:인 비율', value: advancedNutrition.calcium_phosphorus_ratio, icon: Scale, tip: "뼈 건강에 중요한 미네랄 비율입니다. 보통 1.1~1.4:1이 이상적입니다." }
                 ].map((item, i) => (
                    <div key={i} className="space-y-1 text-center">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-center">
                         {item.label}
                         <InfoIcon content={item.tip} />
                       </p>
                       <p className="text-xl font-black text-foreground">{item.value}</p>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>

        {/* Verdict */}
        <Card className="relative overflow-hidden border-none shadow-2xl bg-white rounded-[3rem] ring-1 ring-black/5">
           <CardHeader className="bg-primary text-white p-10">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-4 text-2xl font-black font-headline">
                  <Award className="w-10 h-10"/>
                  초개인화 적합도 분석
                </CardTitle>
                <div className="flex flex-col items-center">
                   <span className="text-4xl font-black">{scoreCard.match_score}</span>
                   <span className="text-[10px] uppercase font-bold opacity-70">Score</span>
                </div>
              </div>
           </CardHeader>
           <CardContent className="p-10">
              <div className="space-y-6">
                 <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                    <h4 className="text-sm font-black text-primary mb-2 uppercase tracking-widest flex items-center gap-2">
                       <Sparkles className="w-4 h-4"/> Pettner Core Verdict
                    </h4>
                    <p className="text-lg leading-relaxed text-foreground font-bold">
                      {scoreCard.headline}
                    </p>
                 </div>
                 <div className="space-y-4">
                    <p className="text-base leading-relaxed text-muted-foreground">
                        {expertVerdict.recommendation}
                    </p>
                    {safety_check.toxic_detected && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3">
                            <ShieldAlert className="text-destructive" />
                            <p className="text-sm font-bold text-destructive">
                                주의: {safety_check.toxic_items.join(', ')} 성분이 감지되었습니다. 즉시 급여를 중단하십시오.
                            </p>
                        </div>
                    )}
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Ingredient Check */}
        <div className="grid md:grid-cols-2 gap-8">
           <Card className="shadow-xl border-none rounded-[3rem] overflow-hidden bg-white">
              <CardHeader className="bg-success/5 border-b py-8 px-10">
                 <CardTitle className="text-lg font-black flex items-center gap-3 text-success">
                    <ThumbsUp className="w-6 h-6"/> 추천 원재료 및 이점
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                 {ingredientCheck.positive.map((item, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="h-2 w-2 rounded-full bg-success mt-2 shrink-0" />
                       <div className="space-y-1">
                          <p className="font-bold text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.effect}</p>
                       </div>
                    </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="shadow-xl border-none rounded-[3rem] overflow-hidden bg-white">
              <CardHeader className="bg-destructive/5 border-b py-8 px-10">
                 <CardTitle className="text-lg font-black flex items-center gap-3 text-destructive">
                    <ThumbsDown className="w-6 h-6"/> 주의 성분 및 리스크
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                 {ingredientCheck.cautionary.map((item, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="h-2 w-2 rounded-full bg-destructive mt-2 shrink-0" />
                       <div className="space-y-1">
                          <p className="font-bold text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.risk}</p>
                       </div>
                    </div>
                 ))}
              </CardContent>
           </Card>
        </div>

        {/* Radar Chart */}
        <div className="grid lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-1 shadow-xl border-none rounded-[3rem] bg-white">
              <CardHeader className="p-8 border-b">
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">영양 밸런스 프로필</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center min-h-[300px]">
                 <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart data={radarChart} cx="50%" cy="50%" outerRadius="60%" margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                          <PolarGrid strokeDasharray="3 3" />
                          <PolarAngleAxis 
                            dataKey="attribute" 
                            tick={{fontSize: 10, fontWeight: '800', fill: 'hsl(var(--foreground))'}} 
                          />
                          <Radar 
                            name="Score" 
                            dataKey="score" 
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary))" 
                            fillOpacity={0.4} 
                          />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </CardContent>
           </Card>

           <Card className="lg:col-span-2 shadow-xl border-none rounded-[3rem] bg-white flex flex-col">
              <CardHeader className="p-10 border-b bg-muted/10">
                 <CardTitle className="text-sm font-black text-primary uppercase tracking-widest">AI 수의사 전문 소견</CardTitle>
              </CardHeader>
              <CardContent className="p-10 flex-1 space-y-8">
                 <div className="p-8 bg-gradient-to-br from-primary/10 to-indigo-50 rounded-3xl border border-primary/10">
                    <h5 className="text-xs font-black text-primary mb-3 uppercase tracking-widest">VET'S PRO TIP</h5>
                    <p className="text-xl font-black text-foreground leading-relaxed">{expertVerdict.proTip}</p>
                 </div>

                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Scientific References</h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {scientificReferences.map((ref, i) => (
                          <li key={i} className="text-[10px] text-muted-foreground flex items-center gap-2">
                             <GraduationCap className="w-3 h-3 text-primary/40"/> {ref}
                          </li>
                       ))}
                    </ul>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Palatability Record */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden ring-1 ring-black/5">
          <CardHeader className="p-8 pb-4 text-center">
            <CardTitle className="text-lg font-black">우리 아이 기호성 기록하기</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
             <div className="grid grid-cols-3 gap-4">
                <Button 
                  variant={palatability === 'good' ? 'default' : 'outline'}
                  className={cn("h-20 flex-col gap-2 rounded-2xl border-2 transition-all", palatability === 'good' && "bg-success border-success text-white")}
                  onClick={() => setPalatability('good')}
                >
                  <Smile size={24} />
                  <span className="font-bold">잘 먹어요</span>
                </Button>
                <Button 
                  variant={palatability === 'normal' ? 'default' : 'outline'}
                  className={cn("h-20 flex-col gap-2 rounded-2xl border-2 transition-all", palatability === 'normal' && "bg-primary border-primary text-white")}
                  onClick={() => setPalatability('normal')}
                >
                  <Meho size={24} />
                  <span className="font-bold">보통</span>
                </Button>
                <Button 
                  variant={palatability === 'bad' ? 'default' : 'outline'}
                  className={cn("h-20 flex-col gap-2 rounded-2xl border-2 transition-all", palatability === 'bad' && "bg-destructive border-destructive text-white")}
                  onClick={() => setPalatability('bad')}
                >
                  <Frown size={24} />
                  <span className="font-bold">안 먹어요</span>
                </Button>
             </div>
          </CardContent>
        </Card>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t shadow-[0_-8px_30px_rgb(0,0,0,0.04)] p-4 z-50 flex justify-center">
          <div className="w-full max-w-4xl flex gap-3">
            <Button 
              onClick={onReset} 
              variant="outline" 
              className="flex-[1] h-14 rounded-2xl border-2 shadow-sm flex items-center justify-center"
            >
              <Repeat className="h-5 w-5 text-primary" />
            </Button>
            <Button 
              onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productName)}`, '_blank')} 
              className="flex-[3] h-14 text-lg font-black rounded-2xl shadow-xl bg-primary hover:bg-primary/90 flex items-center justify-center gap-3 text-white"
            >
              <ShoppingBag className="h-5 w-5"/> 최저가 검색하기
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

const Meho = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="15" x2="16" y2="15" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);
