import Image from 'next/image';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Repeat, Camera, Dog, Cat, Lightbulb, ThumbsUp, ThumbsDown, Bone, Heart, Activity, Rabbit, Weight, Scale, Baby, Info } from 'lucide-react';
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
        <p className="text-sm text-primary">{`수치: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const NaverIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
        <path fill="#03c75a" d="M24,4.7L4,4.7v38.6h38.6V4.7H24z M33.2,33.2H24v-9.5l-8.1,9.5h-9.2v-19h9.8l8.1,9.3V14.2h9.5V33.2z"></path>
    </svg>
);

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const { t } = useLanguage();
  const { productInfo, summary, allIngredients, ingredientsAnalysis, nutritionProfile, feedingGuide, expertInsight } = result;

  const petType = input.petType.toLowerCase();
  const PetIcon = petType === 'cat' ? Cat : Dog;

  const top5Ingredients = allIngredients.slice(0, 5);

  const moisture = nutritionProfile.find(p => p.name.includes('수분'))?.value || 10;
  
  const getDMValue = (value: number) => {
    if (moisture >= 100) return 0;
    return ((value / (100 - moisture)) * 100).toFixed(1);
  }
  
  const aafcoData = {
    dog: { protein: 18, fat: 5.5 },
    cat: { protein: 26, fat: 9 },
  }
  const aafcoStandards = aafcoData[petType as keyof typeof aafcoData] || aafcoData.dog;

  if (result.status === 'error') {
     return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="text-center shadow-2xl shadow-destructive/10 border-destructive/20 overflow-hidden">
                <CardHeader className="p-8 bg-card">
                  <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-2">{t('analysisResult.analysisError.title')}</h1>
                </CardHeader>
                <CardContent className={cn("p-8", "bg-destructive/10")}>
                  <p className="text-lg font-medium text-foreground/80">{expertInsight.cautionPoint || t('analysisResult.analysisError.defaultMessage')}</p>
                </CardContent>
            </Card>
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-4">{expertInsight.vetTip}</p>
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
                <Badge key={index} variant="outline" className={cn("text-base px-3 py-1.5", 
                  {'border-green-500/50 bg-green-500/10 text-green-700': summary.safetyRating === 'Green' },
                  {'border-yellow-500/50 bg-yellow-500/10 text-yellow-700': summary.safetyRating === 'Yellow' },
                  {'border-red-500/50 bg-red-500/10 text-red-700': summary.safetyRating === 'Red' }
                )}>{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline">
              <Heart className="text-primary"/>
              {t('analysisResult.expertReviewTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/10">
                  <div className="p-2 bg-white rounded-full"><ThumbsUp className="text-green-600"/></div>
                  <div>
                      <h4 className="font-semibold text-green-800">{t('analysisResult.bestPoint')}</h4>
                      <p className="mt-1 text-foreground/80">{expertInsight.bestPoint}</p>
                  </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-yellow-500/10">
                  <div className="p-2 bg-white rounded-full"><ThumbsDown className="text-yellow-600"/></div>
                  <div>
                      <h4 className="font-semibold text-yellow-800">{t('analysisResult.cautionPoint')}</h4>
                      <p className="mt-1 text-foreground/80">{expertInsight.cautionPoint}</p>
                  </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-sky-500/10">
                  <div className="p-2 bg-white rounded-full"><Lightbulb className="text-sky-600"/></div>
                  <div>
                      <h4 className="font-semibold text-sky-800">{t('analysisResult.vetTip')}</h4>
                      <p className="mt-1 text-foreground/80">{expertInsight.vetTip}</p>
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
                    <Activity className="text-primary"/>
                    {t('analysisResult.nutritionProfileTitle')}
                </CardTitle>
                <CardDescription>{t('analysisResult.nutritionProfileDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={nutritionProfile.filter(p => ['조단백', '조지방', '조섬유', '조회분'].includes(p.name))} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" hide />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted))'}} />
                            <Bar dataKey="value" radius={[5, 5, 5, 5]}>
                                {nutritionProfile.map((entry, index) => (
                                    <Bar key={`cell-${index}`} fill={entry.name === '조단백' ? 'hsl(var(--primary))' : entry.name === '조지방' ? 'hsl(var(--accent))' : 'hsl(var(--secondary))'} />
                                ))}
                            </Bar>
                             <ReferenceLine x={aafcoStandards.protein} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                            <ReferenceLine x={aafcoStandards.fat} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                    {nutritionProfile.map((nutrient) => (
                        <div key={nutrient.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="flex items-center gap-2 font-semibold">
                                            {nutrient.name}
                                            <Info className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t(`analysisResult.nutrientTooltips.${nutrient.name.replace('조','')}`)}</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Badge variant="outline">{nutrient.badge}</Badge>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-primary">{nutrient.value}%</p>
                                <p className="text-xs text-muted-foreground">{t('analysisResult.dmBasis')}: {getDMValue(nutrient.value)}%</p>
                            </div>
                        </div>
                    ))}
                     <p className="text-xs text-muted-foreground text-center pt-2">
                        {t('analysisResult.aafcoDisclaimer', { petType: t(`common.${petType}`) })}
                        ({t('analysisResult.protein')}: {aafcoStandards.protein}%+, {t('analysisResult.fat')}: {aafcoStandards.fat}%+)
                     </p>
                </div>
                 <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="font-semibold text-primary-foreground/80">{nutritionProfile.find(p => p.name === '코멘트')?.value}</p>
                 </div>
            </CardContent>
        </Card>

        {ingredientsAnalysis.positive.length > 0 && (
          <Card className="shadow-lg">
              <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <ThumbsUp className="text-green-500" />
                  {t('analysisResult.prosTitle')}
              </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {ingredientsAnalysis.positive.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 mt-1 rounded-full bg-green-100 flex items-center justify-center">
                        <ThumbsUp className="w-3 h-3 text-green-600"/>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">{item.name}</span>
                        <p className="text-sm text-foreground/80">{item.benefit}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
          </Card>
        )}

         {ingredientsAnalysis.caution.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <ThumbsDown className="text-red-500" />
                  {t('analysisResult.consTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <ul className="space-y-3">
                    {ingredientsAnalysis.caution.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 mt-1 rounded-full bg-red-100 flex items-center justify-center">
                          <ThumbsDown className="w-3 h-3 text-red-600"/>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">{item.name}</span>
                          <p className="text-sm text-foreground/80">{item.risk}</p>
                        </div>
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
                <Rabbit className="text-primary"/>
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
        
        <div className="space-y-4 text-center border-t pt-8 mt-8">
            <h3 className="text-lg font-semibold font-headline">{t('analysisResult.buyNowSectionTitle')}</h3>
            <Button 
                variant="outline"
                className="w-full md:w-auto font-bold"
                size="lg" 
                onClick={() => {
                    const query = encodeURIComponent(productInfo.name);
                    window.open(`https://search.shopping.naver.com/search/all?query=${query}`, '_blank');
                }}>
                <NaverIcon className="w-5 h-5 mr-2" />
                {t('analysisResult.searchOnNaver')}
            </Button>
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
