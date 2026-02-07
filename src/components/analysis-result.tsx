
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
import { Repeat, Camera, Dog, Cat, Lightbulb, ThumbsUp, ThumbsDown, Bone, List, Sparkles, Scale, Info, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
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
      <div className="p-2 bg-background border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p className="text-sm text-primary">{`Score: ${payload[0].value} / 5`}</p>
      </div>
    );
  }
  return null;
};

const CoupangIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="60" height="18" viewBox="0 0 60 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.8718 1.93652H19.9992V16.064H12.8718C9.28807 16.064 6.3877 13.1636 6.3877 9.57983C6.3877 5.99609 9.28807 1.93652 12.8718 1.93652Z" fill="#E11E16"/>
        <path d="M0 1.93652H7.12744V16.064H0V1.93652Z" fill="#E11E16"/>
        <path d="M30.4137 1.93652L26.3506 12.0006L22.2875 1.93652H15.1601V16.064H21.5748V7.5459L25.1295 16.064H27.5087L31.0634 7.5459V16.064H37.5222V1.93652H30.4137Z" fill="#E11E16"/>
        <path d="M43.9531 1.93652L40.6025 8.26709V1.93652H34.1877V16.064H40.6025V9.48779L43.9531 16.064H50.9687L46.3975 9.11914L51.0566 1.93652H43.9531Z" fill="#E11E16"/>
        <path d="M59.9998 1.93652V16.064H52.8724V1.93652H59.9998Z" fill="#E11E16"/>
    </svg>
);

const AmazonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="64" height="18" viewBox="0 0 64 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M37.6016 17.5V0.5H43.3008V17.5H37.6016Z" fill="#111827"/>
        <path d="M48.9008 1.30078C47.0004 1.30078 45.4004 2.90078 45.4004 4.80117C45.4004 6.70156 47.0004 8.30156 48.9008 8.30156C50.8012 8.30156 52.4012 6.70156 52.4012 4.80117C52.4012 2.90078 50.8012 1.30078 48.9008 1.30078ZM48.9008 17.502C47.0004 17.502 45.4004 15.902 45.4004 14.0016C45.4004 12.1012 47.0004 10.5012 48.9008 10.5012C50.8012 10.5012 52.4012 12.1012 52.4012 14.0016C52.4012 15.902 50.8012 17.502 48.9008 17.502Z" fill="#111827"/>
        <path d="M26.2003 17.502L20.1007 8.10261V17.502H14.4017V0.502014H20.1007L26.2003 9.90144V0.502014H31.8995V17.502H26.2003Z" fill="#111827"/>
        <path d="M5.69922 17.5V0.5H12.1984L12.0984 3.10039C13.298 1.30039 15.4977 0.5 17.3973 0.5C21.1965 0.5 24.1957 3.30039 24.1957 7.60039V17.5H18.4965V8.20039C18.4965 5.50039 16.5969 4.10039 14.4973 4.10039C12.9977 4.10039 11.2977 4.80039 10.098 6.00039V17.5H5.69922Z" fill="#111827"/>
        <path d="M63.3 10.4C63.1 4.3 58 0 52.1 0C48.3 0 45.4 2.1 43.8 4.1L45.9 6.8C47.1 5.4 49.2 4.1 51.5 4.1C54.6 4.1 57.2 6.5 57.3 9.4H43.9C43.7 13.9 47 17.9 51.8 17.9C54.4 17.9 56.5 16.9 58.2 14.8L60.5 16.8C58.6 19.5 55.4 21 51.8 21C46.1 21 41.5 16.9 41.5 10.5C41.5 4.3 46.2 0 52.1 0C55.4 0 58.2 1.5 60.1 3.8L62.4 1.8C60.9 0.4 58.5 0 56 0" fill="#FF9900"/>
    </svg>
);

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
        toast({
          title: t('analysisResult.shareSuccess'),
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (result.status === 'error') {
     return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="text-center shadow-2xl shadow-destructive/10 border-destructive/20 overflow-hidden">
                <CardHeader className="p-8 bg-card">
                  <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-2">{t('analysisResult.analysisError.title')}</h1>
                </CardHeader>
                <CardContent className={cn("p-8", "bg-destructive/10")}>
                  <p className="text-lg font-medium text-foreground/80">{cons[0] || t('analysisResult.analysisError.defaultMessage')}</p>
                </CardContent>
            </Card>
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-4">{expertInsight.proTip}</p>
              <Button onClick={onReset} variant="outline" size="lg">
                <Repeat className="mr-2 h-4 w-4" />
                {resetButtonText || t('analysisResult.analyzeNewProduct')}
              </Button>
          </div>
        </div>
     )
  }

  const handleShopRedirect = (platform: 'coupang' | 'amazon') => {
    const query = encodeURIComponent(productInfo.name);
    if (platform === 'coupang') {
      window.open(`https://www.coupang.com/np/search?q=${query}`, '_blank');
    } else {
      window.open(`https://www.amazon.com/s?k=${query}`, '_blank');
    }
  };

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
                    <DialogHeader>
                      <DialogTitle>{t('analysisResult.originalImage')}</DialogTitle>
                    </DialogHeader>
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
                  <div>
                      <h4 className="font-bold text-green-800">{t('analysisResult.bestPoint')}</h4>
                      <p className="mt-1 text-foreground/80 leading-relaxed">{pros[0]}</p>
                  </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="p-2 bg-white rounded-full shadow-sm"><ThumbsDown className="text-red-600 w-5 h-5"/></div>
                  <div>
                      <h4 className="font-bold text-red-800">{t('analysisResult.cautionPoint')}</h4>
                      <p className="mt-1 text-foreground/80 leading-relaxed">{cons[0]}</p>
                  </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-sky-500/10 border border-sky-500/20">
                  <div className="p-2 bg-white rounded-full shadow-sm"><Lightbulb className="text-sky-600 w-5 h-5"/></div>
                  <div>
                      <h4 className="font-bold text-sky-800">{t('analysisResult.vetTip')}</h4>
                      <p className="mt-1 text-foreground/80 leading-relaxed">{expertInsight.proTip}</p>
                  </div>
              </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
           <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                <Bone className="text-primary"/>
                {t('analysisResult.topIngredientsTitle')}
              </CardTitle>
               <CardDescription>{t('analysisResult.topIngredientsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-3">
                    {top5Ingredients.map((ing, index) => (
                        <Badge key={index} variant="secondary" className="text-base px-4 py-2 bg-muted/50 hover:bg-primary/10 transition-colors">
                           <span className="text-primary font-bold mr-2">{index + 1}</span> {ing}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
        
       <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <Scale className="text-primary"/>
                  {t('analysisResult.radarChartTitle')}
              </CardTitle>
              <CardDescription>{t('analysisResult.radarChartDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ChartRadarChart data={radarChart} cx="50%" cy="50%" outerRadius="80%">
                    <ChartTooltip content={<CustomTooltip />} />
                    <ChartPolarGrid stroke="#e2e8f0" />
                    <ChartPolarAngleAxis dataKey="attribute" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} />
                    <ChartRadar name="Suitability" dataKey="score" fill="hsl(var(--primary))" fillOpacity={0.4} stroke="hsl(var(--primary))" strokeWidth={2} />
                </ChartRadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {pros.length > 1 && (
          <Card className="shadow-lg border-l-4 border-l-green-500">
              <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <ThumbsUp className="text-green-500" />
                  {t('analysisResult.prosTitle')}
              </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {pros.slice(1).map((item, index) => (
                    <li key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/30 transition-colors">
                      <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-green-100 flex items-center justify-center">
                        <ThumbsUp className="w-3 h-3 text-green-600"/>
                      </div>
                      <p className="text-foreground/80 leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
          </Card>
        )}

         {cons.length > 1 && (
            <Card className="shadow-lg border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <ThumbsDown className="text-red-500" />
                  {t('analysisResult.consTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <ul className="space-y-4">
                    {cons.slice(1).map((item, index) => (
                      <li key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/30 transition-colors">
                        <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-red-100 flex items-center justify-center">
                          <ThumbsDown className="w-3 h-3 text-red-600"/>
                        </div>
                        <p className="text-foreground/80 leading-relaxed">{item}</p>
                      </li>
                    ))}
                  </ul>
              </CardContent>
            </Card>
        )}
        
        {allIngredients && allIngredients.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                <List className="text-primary"/>
                {t('analysisResult.allIngredientsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48 w-full p-4 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground leading-relaxed text-sm">
                    {allIngredients.join(', ')}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

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
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="puppy">{t('scannerHome.lifeStages.puppy')}</TabsTrigger>
                    <TabsTrigger value="adult">{t('scannerHome.lifeStages.adult')}</TabsTrigger>
                    <TabsTrigger value="senior">{t('scannerHome.lifeStages.senior')}</TabsTrigger>
                  </TabsList>
                  
                  {['puppy', 'adult', 'senior'].map((stage) => (
                    <TabsContent key={stage} value={stage}>
                      {feedingGuide[stage as keyof typeof feedingGuide] ? (
                        <div className="border rounded-lg overflow-hidden">
                           <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-center">{t('analysisResult.weightRange')}</TableHead>
                                <TableHead className="text-center">{t('analysisResult.dailyAmount')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {feedingGuide[stage as keyof typeof feedingGuide]?.map((row, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="text-center font-medium">{row.weight}</TableCell>
                                  <TableCell className="text-center">{row.amount}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          {t('historyDetailPage.notFound')}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
            </CardContent>
        </Card>
        
        <div className="space-y-6 text-center border-t border-dashed pt-12 mt-12 bg-primary/5 rounded-3xl p-8">
            <div className="flex flex-col items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary bg-primary/5 px-4 py-1">BEST PRICE</Badge>
              <h3 className="text-2xl font-extrabold font-headline">{t('analysisResult.buyNowSectionTitle')}</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button
                    variant="outline"
                    className="w-full md:w-56 h-14 font-bold justify-center border-2 border-primary/20 hover:border-primary/50 hover:bg-white shadow-sm transition-all"
                    onClick={() => handleShopRedirect('coupang')}>
                    <CoupangIcon className="h-6 mr-3" />
                    <span>{t('analysisResult.searchOnCoupang')}</span>
                </Button>
                 <Button
                    variant="outline"
                    className="w-full md:w-56 h-14 font-bold justify-center border-2 border-primary/20 hover:border-primary/50 hover:bg-white shadow-sm transition-all"
                    onClick={() => handleShopRedirect('amazon')}>
                    <AmazonIcon className="h-6 mr-3" />
                    <span>{t('analysisResult.searchOnAmazon')}</span>
                </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-center max-w-md mx-auto leading-relaxed italic">
              {t('analysisResult.affiliateDisclaimer')}
            </p>
        </div>
        
        <div className="text-center pt-8 space-y-6">
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed" dangerouslySetInnerHTML={{ __html: t('analysisResult.disclaimer') }} />
            </div>
            <Button onClick={onReset} variant="outline" size="lg" className="rounded-full px-10">
              <Repeat className="mr-2 h-4 w-4" />
              {resetButtonText || t('analysisResult.analyzeNewProduct')}
            </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
