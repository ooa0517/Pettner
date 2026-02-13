'use client';

import Image from 'next/image';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartPolarGrid,
  ChartPolarAngleAxis,
  ChartRadar,
  ChartRadarChart,
} from '@/components/ui/chart';
import { ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { 
  Repeat, ShoppingBag, Share2, Star, ChevronRight, 
  Dog, Cat, ThumbsUp, ThumbsDown, 
  Scale, Sparkles, CheckCircle2, ShieldCheck, Microscope,
  AlertCircle, Info, Gavel, History, LogIn, HeartPulse, GraduationCap
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import React from 'react';
import { TooltipProvider } from './ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

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
  const { productInfo, summary, ingredientsAnalysis, radarChart, expertInsight, matchingScore, feedingGuide } = result;

  const petType = input.petType.toLowerCase();
  const PetIcon = petType === 'cat' ? Cat : Dog;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Pettner 정밀 분석 리포트', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: t('analysisResult.shareSuccess') });
      }
    } catch (err) { console.error(err); }
  };

  if (result.status === 'error') {
     return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
            <Card className="text-center border-destructive/20 bg-destructive/5">
                <CardHeader className="p-8">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4"/>
                  <h1 className="text-2xl font-bold">{t('analysisResult.analysisError.title')}</h1>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-muted-foreground">{t('analysisResult.analysisError.defaultMessage')}</p>
                </CardContent>
            </Card>
            <Button onClick={onReset} variant="outline" className="w-full">다시 시도하기</Button>
        </div>
     )
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in duration-500 pb-32 max-w-4xl mx-auto">
        {/* Guest Save Prompt */}
        {!user && (
          <Card className="bg-primary/10 border-primary/20 border-2 border-dashed rounded-[1.5rem] overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-full text-white shadow-lg shadow-primary/20">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">분석 결과를 평생 소장하세요!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">로그인하시면 언제 어디서든 다시 꺼내볼 수 있습니다.</p>
                </div>
              </div>
              <Button onClick={() => router.push('/login')} className="rounded-full px-6 bg-primary hover:bg-primary/90">
                <LogIn className="w-4 h-4 mr-2" /> 3초 로그인하고 저장
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Header Section: Product Brand & Name */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary bg-primary/5 rounded-full flex gap-1.5 items-center font-bold">
              <Microscope className="w-3.5 h-3.5"/> SCIENTIFIC ANALYSIS
            </Badge>
            <div className="flex-grow" />
            <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full bg-white shadow-sm border"><Share2 className="w-4 h-4 text-muted-foreground"/></Button>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary/70 font-bold uppercase tracking-widest text-sm">
              <PetIcon className="w-4 h-4" />
              {productInfo.brand || 'Premium Brand'}
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-foreground leading-tight">
              {productInfo.name}
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {summary.hashtags.map((tag, i) => (
              <Badge key={i} className="bg-white border text-muted-foreground font-medium rounded-lg hover:bg-muted py-1.5 px-3">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Hyper-Personalized Matching Score - The WOW Factor */}
        <Card className="relative overflow-hidden border-none shadow-[0_20px_50px_rgba(75,69,237,0.15)] bg-white rounded-[2.5rem]">
           <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
              <ShieldCheck size={280} />
           </div>
           
           <CardHeader className="bg-primary text-white p-8 md:p-10">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-3 text-2xl font-black font-headline">
                  <CheckCircle2 className="w-8 h-8"/>
                  초개인화 적합도 분석
                </CardTitle>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-xs font-bold">VET-ALGORITHM 2.4</span>
                </div>
              </div>
           </CardHeader>

           <CardContent className="p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="relative h-48 w-48 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-muted-foreground/10" strokeWidth="14" stroke="currentColor" fill="transparent" r="85" cx="96" cy="96" />
                      <circle 
                        className="text-primary transition-all duration-1000 ease-out" 
                        strokeWidth="14" 
                        strokeDasharray={534} 
                        strokeDashoffset={534 - (534 * (matchingScore?.score || 0)) / 100} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="85" 
                        cx="96" 
                        cy="96" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-6xl font-black text-primary tracking-tighter">{matchingScore?.score || '??'}</span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">MATCH SCORE</span>
                    </div>
                </div>

                <div className="space-y-6 flex-1">
                   <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 relative">
                      <div className="absolute -top-3 left-6 bg-white border border-primary/20 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase tracking-wider">
                         Clinical Insight
                      </div>
                      <p className="text-sm md:text-base leading-relaxed text-foreground font-medium pt-1">
                        {matchingScore.clinicalReason}
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-none shadow-sm bg-muted/30 rounded-[1.5rem]">
                        <CardContent className="p-5">
                          <h5 className="text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-primary"/> 유전적 소인 분석
                          </h5>
                          <p className="text-xs leading-relaxed font-medium text-foreground/70">{matchingScore.geneticInsight}</p>
                        </CardContent>
                      </Card>
                      <Card className="border-none shadow-sm bg-accent/5 rounded-[1.5rem] border border-accent/10">
                        <CardContent className="p-5">
                          <h5 className="text-[10px] font-black text-accent mb-2 uppercase tracking-widest flex items-center gap-1.5">
                            <HeartPulse className="w-3 h-3"/> 복합 건강 조언
                          </h5>
                          <p className="text-xs leading-relaxed font-medium text-foreground/70">{matchingScore.complexConditionAdvice}</p>
                        </CardContent>
                      </Card>
                   </div>
                </div>
              </div>
           </CardContent>
        </Card>

        {/* Ingredients Analysis Section */}
        <div className="grid md:grid-cols-2 gap-6">
           <Card className="shadow-xl border-none rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-success/5 border-b border-success/10 py-6">
                 <CardTitle className="text-lg font-black flex items-center gap-2 text-success">
                    <ThumbsUp className="w-5 h-5"/> 추천 성분 및 효능
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                 {ingredientsAnalysis.positive.map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                       <div className="h-2 w-2 rounded-full bg-success mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                       <div className="space-y-1">
                          <p className="font-bold text-sm text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.effect}</p>
                       </div>
                    </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="shadow-xl border-none rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-destructive/5 border-b border-destructive/10 py-6">
                 <CardTitle className="text-lg font-black flex items-center gap-2 text-destructive">
                    <ThumbsDown className="w-5 h-5"/> 주의 성분 및 리스크
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                 {ingredientsAnalysis.cautionary.map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                       <div className="h-2 w-2 rounded-full bg-destructive mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                       <div className="space-y-1">
                          <p className="font-bold text-sm text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.risk}</p>
                       </div>
                    </div>
                 ))}
              </CardContent>
           </Card>
        </div>

        {/* Radar Chart & Expert Section */}
        <div className="grid lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-1 shadow-xl border-none rounded-[2rem] bg-white">
              <CardHeader className="p-8 border-b border-muted/50">
                 <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                    <Scale className="w-4 h-4 text-primary"/> 영양 밸런스 프로필
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
                 <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <ChartRadarChart data={radarChart} cx="50%" cy="50%" outerRadius="70%">
                          <ChartPolarGrid strokeDasharray="3 3" />
                          <ChartPolarAngleAxis dataKey="attribute" tick={{fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--muted-foreground))'}} />
                          <ChartRadar 
                            name="Score" 
                            dataKey="score" 
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary))" 
                            fillOpacity={0.5} 
                          />
                       </ChartRadarChart>
                    </ResponsiveContainer>
                 </div>
              </CardContent>
           </Card>

           <Card className="lg:col-span-2 shadow-xl border-none rounded-[2rem] bg-white flex flex-col">
              <CardHeader className="p-8 border-b border-muted/50 bg-primary/5">
                 <CardTitle className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-widest">
                    <Sparkles className="w-4 h-4"/> AI 수의사 전문 소견 (Pro Insights)
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex-1 space-y-8">
                 <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                       <Info className="w-3.5 h-3.5"/> HIDDEN INSIGHTS
                    </h5>
                    <p className="text-base font-medium leading-relaxed text-foreground/80 italic">
                      "{ingredientsAnalysis.hiddenInsights}"
                    </p>
                 </div>

                 <div className="p-6 bg-gradient-to-br from-primary/10 to-indigo-50 rounded-[1.5rem] border border-primary/10 shadow-inner">
                    <h5 className="text-xs font-black text-primary mb-2 uppercase tracking-widest">VET'S PRO TIP</h5>
                    <p className="text-sm md:text-base font-bold text-foreground leading-relaxed">{expertInsight.proTip}</p>
                 </div>

                 <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">SCIENTIFIC REFERENCES</h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {expertInsight.scientificReferences.map((ref, i) => (
                          <li key={i} className="text-[10px] text-muted-foreground/80 flex items-start gap-2">
                             <span className="text-primary font-bold">[{i+1}]</span> {ref}
                          </li>
                       ))}
                    </ul>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Feeding Guide & Calories */}
        <Card className="shadow-xl border-none rounded-[2rem] bg-white overflow-hidden">
           <CardHeader className="p-8 border-b border-muted/50 flex flex-row items-center justify-between bg-muted/20">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                 <Scale className="w-5 h-5 text-primary"/> 권장 급여 가이드
              </CardTitle>
              <Badge className="bg-white text-primary font-bold border-primary/20">{feedingGuide.dailyCalories}</Badge>
           </CardHeader>
           <CardContent className="p-8">
              <div className="flex items-center gap-6">
                 <div className="p-5 bg-primary/10 rounded-2xl">
                    <Scale className="w-10 h-10 text-primary" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-black text-xl text-foreground">일일 권장 급여량</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feedingGuide.recommendation}
                    </p>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Legal Disclaimer & Gavel */}
        <div className="p-6 bg-muted/40 border-l-8 border-muted rounded-r-[1.5rem] flex gap-4 items-start shadow-sm">
           <Gavel className="w-6 h-6 text-muted-foreground shrink-0 mt-1" />
           <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Legal Notice & Disclaimer</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic" dangerouslySetInnerHTML={{ __html: t('analysisResult.disclaimer') }} />
           </div>
        </div>

        {/* Call to Action: Shopping & Future Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productInfo.name)}`, '_blank')} 
            size="lg" 
            className="h-20 text-xl font-black rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all bg-primary hover:bg-primary/90"
          >
            <ShoppingBag className="mr-3 h-6 w-6"/> 이 제품 최저가 검색하기
          </Button>

          <Button 
            onClick={onReset} 
            variant="outline" 
            size="lg" 
            className="h-20 text-xl font-black rounded-[2rem] border-2 shadow-lg hover:bg-muted/50"
          >
            <Repeat className="mr-3 h-6 w-6" /> 다른 제품 분석하러 가기
          </Button>
        </div>

        <div className="text-center pt-12">
            <p className="text-[10px] text-muted-foreground/60 max-w-lg mx-auto leading-relaxed uppercase tracking-[0.1em] font-bold">
              AI Personalized Nutrition Engine v2.4.0 <br/>
              Pettner Research Center. All rights reserved.
            </p>
        </div>
      </div>
    </TooltipProvider>
  );
}