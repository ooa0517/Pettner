import Image from 'next/image';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChartContainer, ChartRadar, ChartRadarChart, ChartPolarGrid, ChartPolarAngleAxis, ChartPolarRadiusAxis, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Repeat, Camera, Dog, Cat, ShoppingCart, Lightbulb, ThumbsUp, ThumbsDown, Bone, Heart, Activity, Rabbit, Weight, Scale, Baby, GitCommitHorizontal, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const { t } = useLanguage();
  const { productInfo, summary, allIngredients, pros, cons, radarChart, feedingGuide, expertInsight } = result;

  const petType = input.petType.toLowerCase();
  const PetIcon = petType === 'cat' ? Cat : Dog;

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
  };

  const FeedingGuideTab = ({ lifeStage, weight, amount }: { lifeStage: string; weight: string; amount: string }) => (
     <div className="grid grid-cols-3 items-center gap-4 text-center">
        <p className="font-medium flex items-center justify-center gap-2"><Scale className="w-4 h-4 text-muted-foreground"/> {weight}</p>
        <p className="text-primary font-bold text-lg">{amount}</p>
        <p className="text-sm text-muted-foreground">{Math.round(parseInt(amount) * 3.8)} kcal</p>
    </div>
  );
  
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
    <>
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
                <Badge key={index} className="text-base px-4 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {radarChart && radarChart.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                <Heart className="text-primary"/>
                {t('analysisResult.recommendationTitle')}
              </CardTitle>
              <CardDescription>{t('analysisResult.recommendationDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full aspect-square h-[250px] sm:h-[350px]">
                    <ChartRadarChart data={radarChart}>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartPolarGrid />
                        <ChartPolarAngleAxis dataKey="attribute" />
                        <ChartPolarRadiusAxis angle={30} domain={[0, 5]} tickCount={6} />
                        <ChartRadar
                        dataKey="score"
                        fill="var(--color-score)"
                        fillOpacity={0.6}
                        stroke="var(--color-score)"
                        />
                    </ChartRadarChart>
                </ChartContainer>
            </CardContent>
          </Card>
        )}
        
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-headline">
                    <ThumbsUp className="text-green-500" />
                    {t('analysisResult.prosTitle')}
                </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 mt-1 rounded-full bg-green-100 flex items-center justify-center">
                          <ThumbsUp className="w-3 h-3 text-green-600"/>
                        </div>
                        <span className="text-foreground/80">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <ThumbsDown className="text-red-500" />
                  {t('analysisResult.consTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <ul className="space-y-3">
                    {cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 mt-1 rounded-full bg-red-100 flex items-center justify-center">
                          <ThumbsDown className="w-3 h-3 text-red-600"/>
                        </div>
                        <span className="text-foreground/80">{con}</span>
                      </li>
                    ))}
                  </ul>
              </CardContent>
            </Card>
        </div>
        
        {feedingGuide && (feedingGuide.adult || feedingGuide.puppy || feedingGuide.senior) && (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl font-headline">
                        <Bone className="text-primary" />
                        {t('analysisResult.feedingGuideTitle')}
                    </CardTitle>
                    <CardDescription>{t('analysisResult.feedingGuideDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue={input.lifeStage?.toLowerCase() || 'adult'} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="puppy" disabled={!feedingGuide.puppy}>{t('analysisResult.lifeStages.puppy')}</TabsTrigger>
                            <TabsTrigger value="adult" disabled={!feedingGuide.adult}>{t('analysisResult.lifeStages.adult')}</TabsTrigger>
                            <TabsTrigger value="senior" disabled={!feedingGuide.senior}>{t('analysisResult.lifeStages.senior')}</TabsTrigger>
                        </TabsList>
                        {feedingGuide.puppy && (
                        <TabsContent value="puppy" className="mt-6 space-y-4">
                            <div className="flex justify-center mb-4">
                                <Image src="https://picsum.photos/seed/puppy/200/200" width={100} height={100} alt="Puppy" className="rounded-full" data-ai-hint="puppy dog" />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4 text-center font-semibold text-muted-foreground text-sm">
                                <span>{t('analysisResult.weight')}</span>
                                <span>{t('analysisResult.dailyAmount')}</span>
                                <span>{t('analysisResult.estimatedCalories')}</span>
                            </div>
                             {feedingGuide.puppy.map((item, index) => (
                                <FeedingGuideTab key={`puppy-${index}`} lifeStage="puppy" {...item} />
                             ))}
                        </TabsContent>
                        )}
                        {feedingGuide.adult && (
                        <TabsContent value="adult" className="mt-6 space-y-4">
                            <div className="flex justify-center mb-4">
                                <Image src="https://picsum.photos/seed/adult-dog/200/200" width={100} height={100} alt="Adult Dog" className="rounded-full" data-ai-hint="adult dog" />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4 text-center font-semibold text-muted-foreground text-sm">
                                <span>{t('analysisResult.weight')}</span>
                                <span>{t('analysisResult.dailyAmount')}</span>
                                <span>{t('analysisResult.estimatedCalories')}</span>
                            </div>
                            {feedingGuide.adult.map((item, index) => (
                                <FeedingGuideTab key={`adult-${index}`} lifeStage="adult" {...item} />
                            ))}
                        </TabsContent>
                        )}
                        {feedingGuide.senior && (
                        <TabsContent value="senior" className="mt-6 space-y-4">
                             <div className="flex justify-center mb-4">
                                <Image src="https://picsum.photos/seed/senior-dog/200/200" width={100} height={100} alt="Senior Dog" className="rounded-full" data-ai-hint="senior dog" />
                            </div>
                             <div className="grid grid-cols-3 items-center gap-4 text-center font-semibold text-muted-foreground text-sm">
                                <span>{t('analysisResult.weight')}</span>
                                <span>{t('analysisResult.dailyAmount')}</span>
                                <span>{t('analysisResult.estimatedCalories')}</span>
                            </div>
                           {feedingGuide.senior.map((item, index) => (
                                <FeedingGuideTab key={`senior-${index}`} lifeStage="senior" {...item} />
                            ))}
                        </TabsContent>
                        )}
                    </Tabs>
                </CardContent>
            </Card>
        )}

        {allIngredients && allIngredients.length > 0 && (
          <Card className="shadow-lg">
            <Accordion type="single" collapsible>
              <AccordionItem value="all-ingredients">
                <AccordionTrigger className="p-6 text-xl font-headline flex items-center gap-3">
                  <Rabbit className="text-primary"/>
                  {t('analysisResult.allIngredientsTitle')}
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                  <ScrollArea className="h-48 w-full">
                    <p className="text-muted-foreground leading-relaxed">
                        {allIngredients.join(', ')}
                    </p>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        )}
        
        <Card className="shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline">
                <Lightbulb className="text-primary" />
                {t('analysisResult.proTipTitle')}
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-sky-500/10">
                    <div className="p-2 bg-white rounded-full"><Lightbulb className="text-sky-600"/></div>
                    <div>
                        <p className="mt-1 text-foreground/80">{expertInsight.proTip}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline">
              <ShoppingCart className="text-primary"/>
              {t('analysisResult.buyNowTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
             <Button 
                className="w-full font-bold" 
                size="lg" 
                onClick={() => {
                    const query = encodeURIComponent(productInfo.name);
                    window.open(`https://search.shopping.naver.com/search/all?query=${query}`, '_blank');
                }}>
                {t('analysisResult.findBestPrice')}
              </Button>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              {t('analysisResult.affiliateDisclaimer')}
            </p>
          </CardContent>
        </Card>
        
        <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto mb-4" dangerouslySetInnerHTML={{ __html: t('analysisResult.disclaimer') }} />
            <Button onClick={onReset} variant="outline" size="lg">
              <Repeat className="mr-2 h-4 w-4" />
              {resetButtonText || t('analysisResult.analyzeNewProduct')}
            </Button>
        </div>
      </div>
    </>
  );
}
