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
import type { ChartConfig } from '@/components/ui/chart';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Repeat, Camera, Dog, Cat, Lightbulb, ThumbsUp, ThumbsDown, Bone, Info, HelpingHand, List, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


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
        <p className="text-sm text-primary">{`점수: ${payload[0].value} / 5`}</p>
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
  const { productInfo, summary, allIngredients, pros, cons, radarChart, feedingGuide, expertInsight } = result;

  const petType = input.petType.toLowerCase();
  const PetIcon = petType === 'cat' ? Cat : Dog;

  const top5Ingredients = allIngredients.slice(0, 5);
  
  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
    피부모질: { color: "hsl(var(--chart-1))" },
    소화기건강: { color: "hsl(var(--chart-2))" },
    체중관리: { color: "hsl(var(--chart-3))" },
    관절강화: { color: "hsl(var(--chart-4))" },
    활동에너지: { color: "hsl(var(--chart-5))" },
  } satisfies ChartConfig;

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

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in duration-500">
        <Card className="text-center shadow-2xl shadow-primary/10 border-primary/20 overflow-hidden">
          <CardHeader className="p-8 bg-card relative">
             <div className="flex justify-center items-center gap-2 text-muted-foreground font-semibold">
                <PetIcon className="w-5 h-5"/>
                <span>{productInfo.brand || t('analysisResult.productAnalyzed')}</span>
             </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-2">{productInfo.name}</h1>
            {input.photoDataUri && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="absolute top-4 right-4 h-auto p-2">
                    <Camera className="w-4 h-4 mr-2"/>
                    {t('analysisResult.originalImage')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{t('analysisResult.originalImage')}</DialogTitle>
                  </DialogHeader>
                  <div className="relative w-full mt-4" style={{'paddingBottom': '150%'}}>
                    <Image src={input.photoDataUri} alt="Ingredient Label" layout="fill" objectFit="contain" />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="p-8 bg-muted/30">
            <div className="flex flex-wrap gap-2 justify-center">
              {summary.hashtags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-base px-3 py-1.5 border-primary/30 bg-primary/10 text-primary-foreground/80">{tag}</Badge>
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
              <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/10">
                  <div className="p-2 bg-white rounded-full"><ThumbsUp className="text-green-600"/></div>
                  <div>
                      <h4 className="font-semibold text-green-800">{t('analysisResult.bestPoint')}</h4>
                      <p className="mt-1 text-foreground/80">{pros[0]}</p>
                  </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-yellow-500/10">
                  <div className="p-2 bg-white rounded-full"><ThumbsDown className="text-yellow-600"/></div>
                  <div>
                      <h4 className="font-semibold text-yellow-800">{t('analysisResult.cautionPoint')}</h4>
                      <p className="mt-1 text-foreground/80">{cons[0]}</p>
                  </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-sky-500/10">
                  <div className="p-2 bg-white rounded-full"><Lightbulb className="text-sky-600"/></div>
                  <div>
                      <h4 className="font-semibold text-sky-800">{t('analysisResult.vetTip')}</h4>
                      <p className="mt-1 text-foreground/80">{expertInsight.proTip}</p>
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
                <div className="flex flex-wrap gap-2">
                    {top5Ingredients.map((ing, index) => (
                        <Badge key={index} variant="secondary" className="text-base px-3 py-1">{ing}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
        
       <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <Sparkles className="text-primary"/>
                  {t('analysisResult.radarChartTitle')}
              </CardTitle>
              <CardDescription>{t('analysisResult.radarChartDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ChartRadarChart data={radarChart} >
                    <ChartTooltip content={<CustomTooltip />} />
                    <ChartPolarGrid />
                    <ChartPolarAngleAxis dataKey="attribute" />
                    <ChartRadar name="Score" dataKey="score" fill="hsl(var(--primary))" fillOpacity={0.6} />
                </ChartRadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {pros.length > 1 && (
          <Card className="shadow-lg">
              <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <ThumbsUp className="text-green-500" />
                  {t('analysisResult.prosTitle')}
              </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {pros.slice(1).map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 mt-1 rounded-full bg-green-100 flex items-center justify-center">
                        <ThumbsUp className="w-3 h-3 text-green-600"/>
                      </div>
                      <p className="text-foreground/80">{item}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
          </Card>
        )}

         {cons.length > 1 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <ThumbsDown className="text-red-500" />
                  {t('analysisResult.consTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <ul className="space-y-3">
                    {cons.slice(1).map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 mt-1 rounded-full bg-red-100 flex items-center justify-center">
                          <ThumbsDown className="w-3 h-3 text-red-600"/>
                        </div>
                        <p className="text-foreground/80">{item}</p>
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
              <ScrollArea className="h-48 w-full p-4 border rounded-lg">
                <p className="text-muted-foreground leading-relaxed">
                    {allIngredients.join(', ')}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

         <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <HelpingHand className="text-primary"/>
                  {t('analysisResult.feedingGuideTitle')}
              </CardTitle>
               <CardDescription>{t('analysisResult.feedingGuideDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Add tabs for puppy, adult, senior */}
            </CardContent>
        </Card>
        
        <div className="space-y-4 text-center border-t pt-8 mt-8">
            <h3 className="text-lg font-semibold font-headline">{t('analysisResult.buyNowSectionTitle')}</h3>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
                <Button
                    variant="outline"
                    className="w-full md:w-auto font-bold justify-center"
                    size="lg"
                    onClick={() => {
                        const query = encodeURIComponent(productInfo.name);
                        window.open(`https://www.coupang.com/np/search?q=${query}`, '_blank');
                    }}>
                    <CoupangIcon className="h-5" />
                </Button>
                 <Button
                    variant="outline"
                    className="w-full md:w-auto font-bold justify-center"
                    size="lg"
                    onClick={() => {
                        const query = encodeURIComponent(productInfo.name);
                        window.open(`https://www.amazon.com/s?k=${query}`, '_blank');
                    }}>
                    <AmazonIcon className="h-5" />
                </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-center max-w-md mx-auto">
              {t('analysisResult.affiliateDisclaimer')}
            </p>
        </div>
        
        <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto mb-4" dangerouslySetInnerHTML={{ __html: t('analysisResult.disclaimer') }} />
            <Button onClick={onReset} variant="outline" size="lg">
              <Repeat className="mr-2 h-4 w-4" />
              {resetButtonText || t('analysisResult.analyzeNewProduct')}
            </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
