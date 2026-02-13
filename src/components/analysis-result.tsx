'use client';

import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { 
  Repeat, ShoppingBag, Share2, Star, 
  Dog, Cat, ThumbsUp, ThumbsDown, 
  Scale, Sparkles, ShieldCheck, Microscope,
  AlertCircle, History, LogIn, HeartPulse, GraduationCap,
  ArrowRight, Award, Zap, Activity
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import React from 'react';
import { TooltipProvider } from './ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useUser();
  const router = useRouter();

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

  const { productIdentity, scoreCard, advancedNutrition, ingredientCheck, expertVerdict, radarChart, scientificReferences } = result;
  const petType = input.petType.toLowerCase();
  const PetIcon = petType === 'cat' ? Cat : Dog;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Pettner 정밀 분석 리포트', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "링크가 복사되었습니다!" });
      }
    } catch (err) { console.error(err); }
  };

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

  return (
    <TooltipProvider>
      <div className="space-y-10 animate-in fade-in duration-700 pb-32 max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="px-4 py-1.5 border-primary/30 text-primary bg-primary/5 rounded-full flex gap-2 items-center font-bold text-xs uppercase tracking-widest">
              <Microscope className="w-4 h-4"/> Pettner Core Analysis v3.0
            </Badge>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full bg-white shadow-md border">
                <Share2 className="w-5 h-5 text-muted-foreground"/>
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary/70 font-black uppercase tracking-[0.2em] text-sm">
                <PetIcon className="w-5 h-5" />
                {productIdentity.brand || 'Premium Pet Food'}
              </div>
              <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-foreground leading-tight">
                {productIdentity.name}
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

        {/* [NEW] Advanced Nutrition - DM Basis Analysis */}
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white ring-1 ring-black/5">
           <CardHeader className="bg-muted/30 p-10 border-b">
              <CardTitle className="flex items-center gap-3 text-xl font-black">
                 <Zap className="text-primary w-6 h-6"/> 건물 기준(DM) 정밀 영양 분석
              </CardTitle>
           </CardHeader>
           <CardContent className="p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 {[
                   { label: 'DM 단백질', value: advancedNutrition.dm_protein, icon: Activity },
                   { label: 'DM 지방', value: advancedNutrition.dm_fat, icon: HeartPulse },
                   { label: 'DM 탄수화물', value: advancedNutrition.dm_carbs, icon: Scale },
                   { label: '에너지(kg)', value: advancedNutrition.calories_per_kg, icon: Activity }
                 ].map((item, i) => (
                    <div key={i} className="space-y-2 text-center p-4 bg-muted/20 rounded-2xl">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
                       <p className="text-2xl font-black text-primary">{item.value}</p>
                    </div>
                 ))}
              </div>
              <div className="mt-8 grid md:grid-cols-2 gap-4">
                 <div className="flex justify-between items-center p-4 border rounded-2xl bg-muted/10">
                    <span className="text-sm font-bold text-muted-foreground">수분(Original)</span>
                    <span className="font-black">{advancedNutrition.moisture}</span>
                 </div>
                 <div className="flex justify-between items-center p-4 border rounded-2xl bg-muted/10">
                    <span className="text-sm font-bold text-muted-foreground">칼슘:인 비율</span>
                    <span className="font-black">{advancedNutrition.calcium_phosphorus_ratio}</span>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Personalized Matching Score */}
        <Card className="relative overflow-hidden border-none shadow-2xl bg-white rounded-[3rem] ring-1 ring-black/5">
           <CardHeader className="bg-primary text-white p-10">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-4 text-2xl font-black font-headline">
                  <Award className="w-10 h-10"/>
                  초개인화 적합도 분석
                </CardTitle>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                   {input.petProfile?.name || '우리 아이'} 맞춤형
                </Badge>
              </div>
           </CardHeader>
           <CardContent className="p-10">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="relative h-48 w-48 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-muted-foreground/10" strokeWidth="12" stroke="currentColor" fill="transparent" r="85" cx="96" cy="96" />
                      <circle 
                        className="text-primary transition-all duration-1000 ease-out" 
                        strokeWidth="12" 
                        strokeDasharray={534} 
                        strokeDashoffset={534 - (534 * (scoreCard.matchingScore || 0)) / 100} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="85" 
                        cx="96" 
                        cy="96" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-black text-primary tracking-tighter">{scoreCard.matchingScore}</span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Match</span>
                    </div>
                </div>

                <div className="space-y-6 flex-1">
                   <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                      <h4 className="text-sm font-black text-primary mb-2 uppercase tracking-widest flex items-center gap-2">
                         <Sparkles className="w-4 h-4"/> Pettner Core Verdict
                      </h4>
                      <p className="text-lg leading-relaxed text-foreground font-bold">
                        {scoreCard.headline}
                      </p>
                   </div>
                   <p className="text-base leading-relaxed text-muted-foreground">
                      {expertVerdict.recommendation}
                   </p>
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

        {/* Radar Chart & Pro Tip */}
        <div className="grid lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-1 shadow-xl border-none rounded-[3rem] bg-white">
              <CardHeader className="p-8 border-b">
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">영양 밸런스 프로필</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center min-h-[300px]">
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart data={radarChart} cx="50%" cy="50%" outerRadius="80%">
                          <PolarGrid strokeDasharray="3 3" />
                          <PolarAngleAxis dataKey="attribute" tick={{fontSize: 10, fontWeight: 'bold'}} />
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
                 <div className="p-8 bg-gradient-to-br from-primary/10 to-indigo-50 rounded-3xl border border-primary/10 shadow-lg shadow-primary/5">
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

        {/* CTA Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button 
            onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productIdentity.name)}`, '_blank')} 
            size="lg" 
            className="h-20 text-xl font-black rounded-[2rem] shadow-2xl bg-primary hover:bg-primary/90 flex items-center justify-center gap-4"
          >
            <ShoppingBag className="h-6 w-6"/> 최저가 검색하기
          </Button>

          <Button 
            onClick={onReset} 
            variant="outline" 
            size="lg" 
            className="h-20 text-xl font-black rounded-[2rem] border-2 shadow-xl"
          >
            <Repeat className="h-6 w-6 text-primary" /> 다른 제품 분석하기
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
