
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Repeat, Camera, Dog, Cat, Lightbulb, ThumbsUp, ThumbsDown, 
  Bone, Scale, ShoppingBag, Share2, Star, ChevronRight, 
  Crown, Sparkles, CheckCircle2, ShieldCheck, Microscope,
  AlertCircle, Info
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import React from 'react';
import { TooltipProvider } from './ui/tooltip';
import { useToast } from '@/hooks/use-toast';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { productInfo, summary, ingredientsAnalysis, radarChart, expertInsight, matchingScore } = result;

  const petType = input.petType.toLowerCase();
  const PetIcon = petType === 'cat' ? Cat : Dog;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Pettner Report', url: window.location.href });
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
      <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-4xl mx-auto">
        {/* Header Section */}
        <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-white to-primary/5">
          <CardHeader className="p-8 pb-4">
             <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary bg-primary/5 flex gap-1.5 items-center">
                   <Microscope className="w-3.5 h-3.5"/> Scientific Report
                </Badge>
                <Button variant="ghost" size="icon" onClick={handleShare}><Share2 className="w-5 h-5 opacity-50"/></Button>
             </div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-primary/10 rounded-xl"><PetIcon className="w-6 h-6 text-primary"/></div>
               <span className="text-lg font-bold text-primary/80">{productInfo.brand || 'Premium Brand'}</span>
            </div>
            <h1 className="text-4xl font-black font-headline tracking-tight text-foreground">{productInfo.name}</h1>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-4">
             <div className="flex flex-wrap gap-2">
                {summary.hashtags.map((tag, i) => (
                  <Badge key={i} className="bg-white border text-muted-foreground font-normal hover:bg-muted">{tag}</Badge>
                ))}
             </div>
          </CardContent>
        </Card>

        {/* Hyper-Personalized Matching Score */}
        <Card className="relative overflow-hidden border-2 border-primary/30 shadow-xl bg-card">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
              <ShieldCheck size={200} />
           </div>
           <CardHeader className="bg-primary text-white p-6">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <CheckCircle2 className="w-6 h-6"/>
                  초개인화 영양 매칭
                </CardTitle>
                <Badge className="bg-yellow-400 text-black font-bold">PREMIUM ANALYSIS</Badge>
              </div>
           </CardHeader>
           <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative h-40 w-40 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-muted-foreground/10" strokeWidth="12" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                      <circle className="text-primary" strokeWidth="12" strokeDasharray={440} strokeDashoffset={440 - (440 * (matchingScore?.score || 0)) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-black text-primary">{matchingScore?.score || '??'}</span>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Match Score</span>
                    </div>
                </div>
                <div className="space-y-5">
                   <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                      <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
                        <Microscope className="w-4 h-4"/> 수의 영양학적 근거
                      </h4>
                      <p className="text-sm leading-relaxed text-foreground/80">{matchingScore.clinicalReason}</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <h5 className="text-xs font-bold text-muted-foreground mb-1 uppercase">유전적 소인 분석</h5>
                        <p className="text-xs leading-relaxed">{matchingScore.geneticInsight}</p>
                      </div>
                      <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                        <h5 className="text-xs font-bold text-accent mb-1 uppercase">복합 건강 상태 조언</h5>
                        <p className="text-xs leading-relaxed">{matchingScore.complexConditionAdvice}</p>
                      </div>
                   </div>
                </div>
              </div>
           </CardContent>
        </Card>

        {/* Core Ingredient Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
           <Card className="shadow-lg">
              <CardHeader className="bg-muted/30 border-b">
                 <CardTitle className="text-lg flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-success"/> 장점 및 유효 성분
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 {ingredientsAnalysis.positive.map((item, i) => (
                    <div key={i} className="flex gap-3">
                       <Badge variant="outline" className="h-fit bg-success/10 text-success border-success/20 shrink-0">{item.name}</Badge>
                       <p className="text-xs text-muted-foreground leading-relaxed">{item.effect}</p>
                    </div>
                 ))}
              </CardContent>
           </Card>
           <Card className="shadow-lg">
              <CardHeader className="bg-muted/30 border-b">
                 <CardTitle className="text-lg flex items-center gap-2">
                    <ThumbsDown className="w-5 h-5 text-destructive"/> 주의 및 위험 요소
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 {ingredientsAnalysis.cautionary.map((item, i) => (
                    <div key={i} className="flex gap-3">
                       <Badge variant="outline" className="h-fit bg-destructive/10 text-destructive border-destructive/20 shrink-0">{item.name}</Badge>
                       <p className="text-xs text-muted-foreground leading-relaxed">{item.risk}</p>
                    </div>
                 ))}
              </CardContent>
           </Card>
        </div>

        {/* Nutritional Chart & Expert Insight */}
        <div className="grid md:grid-cols-3 gap-6">
           <Card className="md:col-span-1 shadow-lg overflow-hidden">
              <CardHeader className="p-5 border-b">
                 <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary"/> 영양 밸런스 지수
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center">
                 <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <ChartRadarChart data={radarChart} cx="50%" cy="50%" outerRadius="60%">
                          <ChartPolarGrid />
                          <ChartPolarAngleAxis dataKey="attribute" tick={{fontSize: 10}} />
                          <ChartRadar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                       </ChartRadarChart>
                    </ResponsiveContainer>
                 </div>
              </CardContent>
           </Card>

           <Card className="md:col-span-2 shadow-lg flex flex-col">
              <CardHeader className="p-5 border-b bg-primary/5">
                 <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                    <Sparkles className="w-4 h-4"/> AI 수의사 전문 소견
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-1 space-y-5">
                 <div>
                    <h5 className="text-xs font-bold text-muted-foreground mb-2 uppercase flex items-center gap-1">
                       <Info className="w-3 h-3"/> 숨겨진 제조사 인사이트
                    </h5>
                    <p className="text-sm italic leading-relaxed text-foreground/70">"{ingredientsAnalysis.hiddenInsights}"</p>
                 </div>
                 <div className="p-4 bg-muted rounded-xl">
                    <h5 className="text-xs font-bold text-primary mb-1">PRO TIP</h5>
                    <p className="text-sm font-medium">{expertInsight.proTip}</p>
                 </div>
                 <div>
                    <h5 className="text-[10px] font-bold text-muted-foreground mb-1 uppercase">Scientific References</h5>
                    <ul className="text-[9px] text-muted-foreground space-y-1">
                       {expertInsight.scientificReferences.map((ref, i) => (
                          <li key={i}>• {ref}</li>
                       ))}
                    </ul>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Call to Action: Shopping & Future Plan */}
        <div className="space-y-6">
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productInfo.name)}`, '_blank')} size="lg" className="w-full h-16 text-xl rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform">
            <ShoppingBag className="mr-2"/> 이 제품 최저가 검색하기
          </Button>

          <Card className="bg-muted/20 border-dashed border-2">
             <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                   <strong>나중에 업데이트될 기능:</strong> 분석된 데이터를 기반으로 아이의 알러지/질환에 완벽히 대응하는 대체 상품을 AI가 직접 찾아드립니다.
                </p>
                <Badge variant="outline">Coming Soon: AI Personalized Recommendation Engine</Badge>
             </CardContent>
          </Card>
        </div>

        <div className="text-center pt-8">
            <Button onClick={onReset} variant="ghost" className="text-muted-foreground hover:text-primary">
              <Repeat className="mr-2 h-4 w-4" /> 다른 제품 분석하러 가기
            </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
