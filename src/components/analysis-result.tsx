'use client';

import Image from 'next/image';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartRadar,
  ChartRadarChart,
  ChartPolarGrid,
  ChartPolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { 
  Repeat, ShoppingBag, Share2, Star, ChevronRight, 
  Dog, Cat, ThumbsUp, ThumbsDown, 
  Scale, Sparkles, CheckCircle2, ShieldCheck, Microscope,
  AlertCircle, Info, Gavel, History, LogIn, HeartPulse, GraduationCap,
  ArrowRight, Award
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
      <div className="space-y-10 animate-in fade-in duration-700 pb-32 max-w-4xl mx-auto">
        
        {/* Guest Save Prompt */}
        {!user && (
          <Card className="bg-gradient-to-r from-primary/5 to-indigo-50 border-primary/20 border-2 border-dashed rounded-[2rem] overflow-hidden shadow-sm">
            <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-primary rounded-2xl text-white shadow-xl shadow-primary/20">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-lg font-black text-primary">분석 결과를 평생 소장하세요!</p>
                  <p className="text-sm text-muted-foreground mt-0.5">로그인하시면 우리 아이의 건강 히스토리를 관리할 수 있습니다.</p>
                </div>
              </div>
              <Button onClick={() => router.push('/login')} className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90 font-bold">
                <LogIn className="w-4 h-4 mr-2" /> 3초 로그인하고 저장
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Header Section: Product Brand & Name */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="px-4 py-1.5 border-primary/30 text-primary bg-primary/5 rounded-full flex gap-2 items-center font-bold text-xs uppercase tracking-widest">
              <Microscope className="w-4 h-4"/> Professional Veterinary Analysis
            </Badge>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full bg-white shadow-md border hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5 text-muted-foreground"/>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-md border hover:scale-110 transition-transform">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500"/>
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary/70 font-black uppercase tracking-[0.2em] text-sm">
              <PetIcon className="w-5 h-5" />
              {productInfo.brand || 'Premium Brand'}
            </div>
            <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter text-foreground leading-[1.1]">
              {productInfo.name}
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {summary.hashtags.map((tag, i) => (
              <Badge key={i} className="bg-white border-2 text-muted-foreground font-bold rounded-xl hover:bg-primary/5 hover:border-primary/20 transition-colors py-2 px-4 text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Hyper-Personalized Matching Score - The WOW Factor */}
        <Card className="relative overflow-hidden border-none shadow-[0_40px_80px_-20px_rgba(75,69,237,0.25)] bg-white rounded-[3rem]">
           <div className="absolute top-0 right-0 p-16 opacity-[0.05] pointer-events-none rotate-12 scale-150">
              <ShieldCheck size={300} />
           </div>
           
           <CardHeader className="bg-primary text-white p-10 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
              <div className="flex justify-between items-center relative z-10">
                <CardTitle className="flex items-center gap-4 text-2xl md:text-3xl font-black font-headline tracking-tight">
                  <Award className="w-10 h-10"/>
                  초개인화 적합도 분석
                </CardTitle>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/30">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-black tracking-widest uppercase">VET-ALGORITHM v2.4</span>
                </div>
              </div>
           </CardHeader>

           <CardContent className="p-10 md:p-16">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="relative h-60 w-60 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-muted-foreground/10" strokeWidth="16" stroke="currentColor" fill="transparent" r="105" cx="120" cy="120" />
                      <circle 
                        className="text-primary transition-all duration-1000 ease-out" 
                        strokeWidth="16" 
                        strokeDasharray={660} 
                        strokeDashoffset={660 - (660 * (matchingScore?.score || 0)) / 100} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="105" 
                        cx="120" 
                        cy="120" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-7xl font-black text-primary tracking-tighter">{matchingScore?.score || '??'}</span>
                      <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">MATCH SCORE</span>
                    </div>
                    {matchingScore?.score && matchingScore.score >= 80 && (
                      <div className="absolute -top-4 -right-4 bg-accent text-white p-3 rounded-full shadow-lg animate-bounce">
                        <Sparkles className="w-6 h-6" />
                      </div>
                    )}
                </div>

                <div className="space-y-8 flex-1">
                   <div className="p-8 bg-primary/5 rounded-[2.5rem] border-2 border-primary/10 relative">
                      <div className="absolute -top-4 left-8 bg-white border-2 border-primary/20 px-4 py-1.5 rounded-full text-[11px] font-black text-primary uppercase tracking-widest shadow-sm">
                         Clinical Insight
                      </div>
                      <p className="text-lg md:text-xl leading-relaxed text-foreground font-medium pt-2">
                        {matchingScore.clinicalReason}
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-none shadow-md bg-muted/40 rounded-[2rem] hover:bg-muted transition-colors">
                        <CardContent className="p-6">
                          <h5 className="text-xs font-black text-muted-foreground mb-3 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary"/> 유전적 소인 분석
                          </h5>
                          <p className="text-sm leading-relaxed font-semibold text-foreground/80">{matchingScore.geneticInsight}</p>
                        </CardContent>
                      </Card>
                      <Card className="border-none shadow-md bg-accent/5 rounded-[2rem] border-2 border-accent/10 hover:bg-accent/10 transition-colors">
                        <CardContent className="p-6">
                          <h5 className="text-xs font-black text-accent mb-3 uppercase tracking-widest flex items-center gap-2">
                            <HeartPulse className="w-4 h-4"/> 복합 건강 조언
                          </h5>
                          <p className="text-sm leading-relaxed font-semibold text-foreground/80">{matchingScore.complexConditionAdvice}</p>
                        </CardContent>
                      </Card>
                   </div>
                </div>
              </div>
           </CardContent>
        </Card>

        {/* Ingredients Analysis Section */}
        <div className="grid md:grid-cols-2 gap-8">
           <Card className="shadow-2xl border-none rounded-[3rem] overflow-hidden bg-white">
              <CardHeader className="bg-success/5 border-b border-success/10 py-8 px-10">
                 <CardTitle className="text-xl font-black flex items-center gap-3 text-success">
                    <ThumbsUp className="w-6 h-6"/> 추천 성분 및 효능
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                 {ingredientsAnalysis.positive.map((item, i) => (
                    <div key={i} className="flex gap-5 group">
                       <div className="h-3 w-3 rounded-full bg-success mt-1.5 shrink-0 group-hover:scale-150 transition-transform shadow-lg shadow-success/20" />
                       <div className="space-y-1.5">
                          <p className="font-black text-base text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed font-medium">{item.effect}</p>
                       </div>
                    </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="shadow-2xl border-none rounded-[3rem] overflow-hidden bg-white">
              <CardHeader className="bg-destructive/5 border-b border-destructive/10 py-8 px-10">
                 <CardTitle className="text-xl font-black flex items-center gap-3 text-destructive">
                    <ThumbsDown className="w-6 h-6"/> 주의 성분 및 리스크
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                 {ingredientsAnalysis.cautionary.map((item, i) => (
                    <div key={i} className="flex gap-5 group">
                       <div className="h-3 w-3 rounded-full bg-destructive mt-1.5 shrink-0 group-hover:scale-150 transition-transform shadow-lg shadow-destructive/20" />
                       <div className="space-y-1.5">
                          <p className="font-black text-base text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed font-medium">{item.risk}</p>
                       </div>
                    </div>
                 ))}
              </CardContent>
           </Card>
        </div>

        {/* Radar Chart & Expert Section */}
        <div className="grid lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-1 shadow-2xl border-none rounded-[3rem] bg-white">
              <CardHeader className="p-10 border-b border-muted/50">
                 <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-[0.2em] text-muted-foreground">
                    <Scale className="w-5 h-5 text-primary"/> 영양 밸런스 프로필
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex items-center justify-center min-h-[350px]">
                 <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <ChartRadarChart data={radarChart} cx="50%" cy="50%" outerRadius="80%">
                          <ChartPolarGrid strokeDasharray="3 3" />
                          <ChartPolarAngleAxis dataKey="attribute" tick={{fontSize: 12, fontWeight: '900', fill: 'hsl(var(--foreground))'}} />
                          <ChartRadar 
                            name="Score" 
                            dataKey="score" 
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary))" 
                            fillOpacity={0.4} 
                          />
                       </ChartRadarChart>
                    </ResponsiveContainer>
                 </div>
              </CardContent>
           </Card>

           <Card className="lg:col-span-2 shadow-2xl border-none rounded-[3rem] bg-white flex flex-col">
              <CardHeader className="p-10 border-b border-muted/50 bg-primary/5">
                 <CardTitle className="text-xs font-black flex items-center gap-2 text-primary uppercase tracking-[0.2em]">
                    <Sparkles className="w-5 h-5"/> AI 수의사 전문 소견 (Pro Insights)
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-10 flex-1 space-y-10">
                 <div className="space-y-4">
                    <h5 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                       <Info className="w-4 h-4 text-primary/40"/> HIDDEN INSIGHTS
                    </h5>
                    <p className="text-lg font-bold leading-relaxed text-foreground/80 italic bg-muted/30 p-6 rounded-[2rem] border-l-4 border-primary">
                      "{ingredientsAnalysis.hiddenInsights}"
                    </p>
                 </div>

                 <div className="p-8 bg-gradient-to-br from-primary/10 to-indigo-50 rounded-[2.5rem] border-2 border-primary/10 shadow-xl shadow-primary/5 relative">
                    <div className="absolute -top-3 left-8 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Expert Choice
                    </div>
                    <h5 className="text-sm font-black text-primary mb-3 uppercase tracking-widest">VET'S PRO TIP</h5>
                    <p className="text-lg md:text-xl font-black text-foreground leading-relaxed">{expertInsight.proTip}</p>
                 </div>

                 <div className="space-y-4">
                    <h5 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                      <GraduationCap className="w-4 h-4"/> SCIENTIFIC REFERENCES
                    </h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {expertInsight.scientificReferences.map((ref, i) => (
                          <li key={i} className="text-xs text-muted-foreground/90 flex items-start gap-3 bg-muted/20 p-3 rounded-xl border border-muted-foreground/10">
                             <span className="text-primary font-black">[{i+1}]</span> 
                             <span className="font-semibold">{ref}</span>
                          </li>
                       ))}
                    </ul>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Feeding Guide & Calories */}
        <Card className="shadow-2xl border-none rounded-[3rem] bg-white overflow-hidden group">
           <CardHeader className="p-10 border-b border-muted/50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/10">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                 <Scale className="w-7 h-7 text-primary"/> 권장 급여 가이드
              </CardTitle>
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border-2 border-primary/10">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="font-black text-primary text-lg">{feedingGuide.dailyCalories}</span>
              </div>
           </CardHeader>
           <CardContent className="p-10">
              <div className="flex flex-col md:flex-row items-center gap-10">
                 <div className="p-8 bg-primary/10 rounded-3xl group-hover:scale-110 transition-transform duration-500">
                    <Scale className="w-12 h-12 text-primary" />
                 </div>
                 <div className="space-y-3 flex-1">
                    <p className="font-black text-2xl text-foreground">일일 권장 급여량 상세</p>
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                      {feedingGuide.recommendation}
                    </p>
                 </div>
                 <Button variant="outline" className="rounded-full px-8 font-black border-2 hover:bg-muted">
                    급여 계산기 열기
                 </Button>
              </div>
           </CardContent>
        </Card>

        {/* Legal Disclaimer & Gavel */}
        <div className="p-8 bg-muted/40 border-l-8 border-primary/30 rounded-r-[2.5rem] flex gap-6 items-start shadow-inner">
           <Gavel className="w-8 h-8 text-muted-foreground shrink-0 mt-1 opacity-50" />
           <div className="space-y-2">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Legal Notice & Medical Disclaimer</p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed italic font-medium" dangerouslySetInnerHTML={{ __html: t('analysisResult.disclaimer') }} />
           </div>
        </div>

        {/* Call to Action: Shopping & Future Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button 
            onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productInfo.name)}`, '_blank')} 
            size="lg" 
            className="h-24 text-2xl font-black rounded-[2.5rem] shadow-[0_20px_40px_rgba(75,69,237,0.3)] hover:scale-[1.02] active:scale-95 transition-all bg-primary hover:bg-primary/90 flex items-center justify-center gap-4 group"
          >
            <ShoppingBag className="h-8 w-8 group-hover:rotate-12 transition-transform"/> 
            이 제품 최저가 검색하기
            <ArrowRight className="h-6 w-6 ml-2" />
          </Button>

          <Button 
            onClick={onReset} 
            variant="outline" 
            size="lg" 
            className="h-24 text-2xl font-black rounded-[2.5rem] border-4 shadow-xl hover:bg-muted/50 transition-all flex items-center justify-center gap-4"
          >
            <Repeat className="h-8 w-8 text-primary" /> 다른 제품 분석하기
          </Button>
        </div>

        <div className="text-center pt-16">
            <p className="text-xs text-muted-foreground/60 max-w-lg mx-auto leading-relaxed uppercase tracking-[0.2em] font-black">
              AI Personalized Nutrition Engine v2.4.0 <br/>
              Pettner Research Center. All rights reserved.
            </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
