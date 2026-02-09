
'use client';

import Image from 'next/image';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Repeat, Camera, Dog, Cat, Lightbulb, ThumbsUp, ThumbsDown, Bone, List, Sparkles, Scale, ShoppingBag, Share2, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import React from 'react';
import { TooltipProvider } from './ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useToast } from '@/hooks/use-toast';


type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border rounded-lg shadow-lg text-xs">
        <p className="font-bold">{label}</p>
        <p className="text-primary">{`적합도: ${payload[0].value} / 5`}</p>
      </div>
    );
  }
  return null;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { productInfo, summary, allIngredients, pros, cons, radarChart, feedingGuide, expertInsight } = result;

  const petType = input.petType.toLowerCase();
  const PetIcon = petType === 'cat' ? Cat : Dog;

  const top5Ingredients = allIngredients.slice(0, 5);

  const handleShare = async () => {
    const shareData = {
      title: 'Pettner Ingredient Analysis',
      text: `${productInfo.name} 분석 리포트예요!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: t('analysisResult.shareSuccess') });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleShopSearch = () => {
    const query = encodeURIComponent(productInfo.name);
    window.open(`https://search.shopping.naver.com/search/all?query=${query}`, '_blank');
  };

  if (result.status === 'error') {
     return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="text-center shadow-2xl shadow-destructive/10 border-destructive/20 overflow-hidden">
                <CardHeader className="p-8 bg-card">
                  <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-2">{t('analysisResult.analysisError.title')}</h1>
                </CardHeader>
                <CardContent className="p-8 bg-destructive/10">
                  <p className="text-lg font-medium text-foreground/80">{cons[0] || t('analysisResult.analysisError.defaultMessage')}</p>
                </CardContent>
            </Card>
            <div className="text-center pt-4">
              <Button onClick={onReset} variant="outline" size="lg">
                <Repeat className="mr-2 h-4 w-4" />
                {resetButtonText || t('analysisResult.analyzeNewProduct')}
              </Button>
          </div>
        </div>
     )
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <Card className="text-center shadow-2xl shadow-primary/10 border-primary/20 overflow-hidden">
          <CardHeader className="p-8 bg-card relative">
             <div className="flex justify-center items-center gap-2 text-muted-foreground font-semibold">
                <PetIcon className="w-5 h-5"/>
                <span>{productInfo.brand || t('analysisResult.productAnalyzed')}</span>
             </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-2">{productInfo.name}</h1>
            
            <div className="flex justify-center gap-2 mt-4">
              {input.photoDataUri && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-auto p-2">
                      <Camera className="w-4 h-4 mr-2"/>
                      {t('analysisResult.originalImage')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader><DialogTitle>{t('analysisResult.originalImage')}</DialogTitle></DialogHeader>
                    <div className="relative w-full mt-4" style={{'paddingBottom': '150%'}}>
                      <Image src={input.photoDataUri} alt="Ingredient Label" fill className="object-contain" />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button variant="outline" size="sm" onClick={handleShare} className="h-auto p-2">
                <Share2 className="w-4 h-4 mr-2" />
                {t('analysisResult.shareReport')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 bg-muted/30">
            <div className="flex flex-wrap gap-2 justify-center">
              {summary.hashtags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-base px-3 py-1.5 border-primary/30 bg-primary/10 text-primary">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline">
              <Sparkles className="text-primary"/>
              {t('analysisResult.expertReviewTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="p-2 bg-white rounded-full shadow-sm"><ThumbsUp className="text-green-600 w-5 h-5"/></div>
                  <div className="flex-1">
                      <h4 className="font-bold text-green-800">{t('analysisResult.bestPoint')}</h4>
                      <p className="mt-1 text-foreground/80 leading-relaxed">{pros[0]}</p>
                  </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="p-2 bg-white rounded-full shadow-sm"><ThumbsDown className="text-red-600 w-5 h-5"/></div>
                  <div className="flex-1">
                      <h4 className="font-bold text-red-800">{t('analysisResult.cautionPoint')}</h4>
                      <p className="mt-1 text-foreground/80 leading-relaxed">{cons[0]}</p>
                  </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-sky-500/10 border border-sky-500/20">
                  <div className="p-2 bg-white rounded-full shadow-sm"><Lightbulb className="text-sky-600 w-5 h-5"/></div>
                  <div className="flex-1">
                      <h4 className="font-bold text-sky-800">{t('analysisResult.vetTip')}</h4>
                      <p className="mt-1 text-foreground/80 leading-relaxed">{expertInsight.proTip}</p>
                  </div>
              </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-headline">
                <Bone className="text-primary"/>
                {t('analysisResult.topIngredientsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {top5Ingredients.map((ing, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                           <span className="text-primary font-bold w-4">{index + 1}</span> 
                           <span className="text-sm">{ing}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg font-headline">
                    <Scale className="text-primary"/>
                    {t('analysisResult.radarChartTitle')}
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ChartRadarChart data={radarChart} cx="50%" cy="50%" outerRadius="70%">
                      <ChartTooltip content={<CustomTooltip />} />
                      <ChartPolarGrid stroke="#e2e8f0" />
                      <ChartPolarAngleAxis dataKey="attribute" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <ChartRadar name="Suitability" dataKey="score" fill="hsl(var(--primary))" fillOpacity={0.4} stroke="hsl(var(--primary))" strokeWidth={2} />
                  </ChartRadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <Scale className="text-primary"/>
                  {t('analysisResult.feedingGuideTitle')}
              </CardTitle>
               <CardDescription>{t('analysisResult.feedingGuideDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
               <Tabs defaultValue="adult" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="puppy">{t('scannerHome.lifeStages.puppy')}</TabsTrigger>
                    <TabsTrigger value="adult">{t('scannerHome.lifeStages.adult')}</TabsTrigger>
                    <TabsTrigger value="senior">{t('scannerHome.lifeStages.senior')}</TabsTrigger>
                    <TabsTrigger value="geriatric">{t('scannerHome.lifeStages.geriatric')}</TabsTrigger>
                  </TabsList>
                  {['puppy', 'adult', 'senior', 'geriatric'].map((stage) => (
                    <TabsContent key={stage} value={stage}>
                      <div className="border rounded-lg overflow-hidden">
                         <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-center">{t('analysisResult.weightRange')}</TableHead>
                              <TableHead className="text-center">{t('analysisResult.dailyAmount')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(feedingGuide[stage as keyof typeof feedingGuide] || []).map((row: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell className="text-center font-medium">{row.weight}</TableCell>
                                <TableCell className="text-center">{row.amount}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
            </CardContent>
        </Card>

        <div className="space-y-6">
          <h3 className="text-2xl font-extrabold font-headline flex items-center gap-2">
            <ShoppingBag className="text-primary"/>
            {t('analysisResult.buyNowSectionTitle')}
          </h3>
          <Button onClick={handleShopSearch} size="lg" className="w-full h-16 text-xl rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
            <Star className="mr-2 fill-white"/>
            이 상품 최저가 확인하기
          </Button>

          <Card className="bg-primary/5 border-primary/20 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5"/>
                함께 곁들이면 좋은 추천 상품
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-primary/10 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-shadow">
                   <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">🦴</div>
                   <p className="text-xs font-bold text-center">관절 강화 영양제</p>
                   <Button size="sm" variant="outline" className="w-full text-[10px] h-7">최저가 보기</Button>
                </div>
                <div className="p-4 bg-white rounded-xl border border-primary/10 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-shadow">
                   <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">💧</div>
                   <p className="text-xs font-bold text-center">피부 모질 오일</p>
                   <Button size="sm" variant="outline" className="w-full text-[10px] h-7">최저가 보기</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-8 space-y-6">
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t('analysisResult.disclaimer') }} />
            </div>
            <Button onClick={onReset} variant="outline" size="lg" className="rounded-full px-10">
              <Repeat className="mr-2 h-4 w-4" />
              {t('analysisResult.analyzeNewProduct')}
            </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
