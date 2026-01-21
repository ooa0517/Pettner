import Image from 'next/image';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { CheckCircle2, AlertTriangle, FileText, Repeat, Sparkles, Dog, Cat, ShieldCheck, ShieldAlert, ShieldX, Camera, Star, BarChart3, ShoppingCart } from 'lucide-react';
import IngredientItem from './ingredient-item';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
};

const SafetyRatingInfo = {
  Green: {
    icon: ShieldCheck,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
    titleKey: 'analysisResult.safetyRating.green',
    descriptionKey: 'analysisResult.safetyRating.greenDesc',
  },
  Yellow: {
    icon: ShieldAlert,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    titleKey: 'analysisResult.safetyRating.yellow',
    descriptionKey: 'analysisResult.safetyRating.yellowDesc',
  },
  Red: {
    icon: ShieldX,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    titleKey: 'analysisResult.safetyRating.red',
    descriptionKey: 'analysisResult.safetyRating.redDesc',
  },
};

const AAFCO_MIN_PROTEIN_ADULT = 18;
const AAFCO_MIN_FAT_ADULT = 5.5;

export default function AnalysisResult({ result, input, onReset }: AnalysisResultProps) {
  const { t } = useLanguage();
  const { productInfo, summary, ingredientsAnalysis, nutritionFacts, expertInsight } = result;

  const petType = input.petType.toLowerCase();
  const PetIcon = petType === 'cat' ? Cat : Dog;
  const ratingDetails = SafetyRatingInfo[summary.safetyRating];
  const RatingIcon = ratingDetails.icon;

  const { chartData, proteinDM, fatDM, nutrientValues } = useMemo(() => {
    const parseNutrient = (value?: string) => parseFloat(value?.replace(/[^0-9.]/g, '')) || 0;
    
    const proteinValue = parseNutrient(nutritionFacts.protein);
    const fatValue = parseNutrient(nutritionFacts.fat);
    const fiberValue = parseNutrient(nutritionFacts.fiber);
    const ashValue = parseNutrient(nutritionFacts.ash);
    const moistureValue = parseNutrient(nutritionFacts.moisture) || 10; // Assume 10% if not present
    
    const calculateDM = (value: number) => {
        if (moistureValue >= 100) return 0;
        return (value / (100 - moistureValue)) * 100;
    };

    const proteinDM = calculateDM(proteinValue);
    const fatDM = calculateDM(fatValue);

    const chartData = [
      { name: t('analysisResult.protein'), [t('analysisResult.guaranteedAnalysis')]: proteinValue, aafco: AAFCO_MIN_PROTEIN_ADULT },
      { name: t('analysisResult.fat'), [t('analysisResult.guaranteedAnalysis')]: fatValue, aafco: AAFCO_MIN_FAT_ADULT },
    ];
    
    const nutrientValues = { proteinValue, fatValue, fiberValue, ashValue, moistureValue };

    return { chartData, proteinDM, fatDM, nutrientValues };
  }, [nutritionFacts, t]);
  
  const chartConfig = useMemo(() => ({
      [t('analysisResult.guaranteedAnalysis')]: { label: t('analysisResult.guaranteedAnalysis'), color: 'hsl(var(--chart-1))' },
  }), [t]);
  
  if (result.status === 'error') {
     return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Card className={cn("text-center shadow-2xl shadow-destructive/10 border-destructive/20 overflow-hidden", ratingDetails.borderColor)}>
                <CardHeader className="p-8 bg-card">
                   <div className="flex justify-center items-center gap-2 text-muted-foreground font-semibold">
                      <RatingIcon className={cn("w-8 h-8", ratingDetails.color)} />
                   </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-2">{t('analysisResult.analysisError.title')}</h1>
                </CardHeader>
                <CardContent className={cn("p-8", ratingDetails.bgColor)}>
                  <p className="text-lg font-medium text-foreground/80">{summary.headline}</p>
                </CardContent>
            </Card>
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-4">{expertInsight}</p>
              <Button onClick={onReset} variant="outline" size="lg">
                <Repeat className="mr-2 h-4 w-4" />
                {t('analysisResult.analyzeNewProduct')}
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
            <p className="text-lg font-medium text-foreground/80">{summary.headline}</p>
          </CardContent>
        </Card>

        <Card className={cn("shadow-lg", ratingDetails.bgColor, ratingDetails.borderColor)}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-3 text-xl font-headline", ratingDetails.color)}>
              <RatingIcon />
              {t(ratingDetails.titleKey)}
            </CardTitle>
            <CardDescription>{t(ratingDetails.descriptionKey)}</CardDescription>
          </CardHeader>
        </Card>
        
        {ingredientsAnalysis.topIngredients && ingredientsAnalysis.topIngredients.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                <Star className="text-primary"/>
                {t('analysisResult.topIngredients')}
              </CardTitle>
              <CardDescription>{t('analysisResult.topIngredientsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {ingredientsAnalysis.topIngredients.map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="text-base px-3 py-1">{`#${index + 1} ${ingredient}`}</Badge>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                <FileText className="text-primary" />
                {t('analysisResult.ingredientAnalysis')}
              </CardTitle>
              <CardDescription>{t('analysisResult.ingredientAnalysisDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="positive" className="w-full">
                {ingredientsAnalysis.positive && ingredientsAnalysis.positive.length > 0 && (
                  <IngredientItem
                    value="positive"
                    title={t('analysisResult.positiveIngredients')}
                    icon={<CheckCircle2 className="text-success" />}
                    ingredients={ingredientsAnalysis.positive.map(i => ({ name: i.name, reason: i.benefit }))}
                  />
                )}
                {ingredientsAnalysis.caution && ingredientsAnalysis.caution.length > 0 && (
                  <IngredientItem
                    value="cautionary"
                    title={t('analysisResult.cautionaryIngredients')}
                    icon={<AlertTriangle className="text-destructive" />}
                    ingredients={ingredientsAnalysis.caution.map(i => ({ name: i.name, reason: i.risk }))}
                  />
                )}
              </Accordion>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <BarChart3 className="text-primary" />
                  {t('analysisResult.nutritionProfile')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div>
                    <h4 className="font-semibold text-muted-foreground text-sm">{t('analysisResult.guaranteedAnalysis')}</h4>
                     <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between"><span>{t('analysisResult.protein')}</span><span className="font-semibold">{nutritionFacts.protein} <span className="text-muted-foreground text-xs font-normal">{t('analysisResult.dmBasis', {value: proteinDM.toFixed(1)})}</span></span></div>
                        <div className="flex justify-between"><span>{t('analysisResult.fat')}</span><span className="font-semibold">{nutritionFacts.fat} <span className="text-muted-foreground text-xs font-normal">{t('analysisResult.dmBasis', {value: fatDM.toFixed(1)})}</span></span></div>
                        <div className="flex justify-between"><span>{t('analysisResult.fiber')}</span><span className="font-semibold">{nutritionFacts.fiber}</span></div>
                        <div className="flex justify-between"><span>{t('analysisResult.ash')}</span><span className="font-semibold">{nutritionFacts.ash}</span></div>
                        <div className="flex justify-between"><span>{t('analysisResult.moisture')}</span><span className="font-semibold">{nutritionFacts.moisture}</span></div>
                     </div>
                 </div>

                {chartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-48 w-full">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ left: 10, right: 30 }}
                    >
                      <CartesianGrid horizontal={false} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        minTickGap={10}
                      />
                      <XAxis dataKey={t('analysisResult.guaranteedAnalysis')} type="number" />
                      <ChartTooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Legend />
                      <ReferenceLine
                        y={t('analysisResult.protein')}
                        x={AAFCO_MIN_PROTEIN_ADULT}
                        stroke="hsl(var(--muted-foreground))"
                        strokeDasharray="3 3"
                        strokeWidth={1}
                      >
                         <ReferenceLine.Label position="insideTopRight" fontSize="10" fill="hsl(var(--muted-foreground))" >{t('analysisResult.aaffcoMin')}</ReferenceLine.Label>
                      </ReferenceLine>
                       <ReferenceLine
                         y={t('analysisResult.fat')}
                         x={AAFCO_MIN_FAT_ADULT}
                         stroke="hsl(var(--muted-foreground))"
                         strokeDasharray="3 3"
                         strokeWidth={1}
                       />
                      <Bar dataKey={t('analysisResult.guaranteedAnalysis')} radius={4} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="mt-2 text-sm">{t('analysisResult.noData')}</p>
                )}
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-muted-foreground text-sm">{t('analysisResult.nutritionalInsights')}</h4>
                  <p className="mt-2 text-base">{nutritionFacts.comment}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <Sparkles className="text-primary" />
                   {t('analysisResult.expertInsights')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-base">{expertInsight}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline">
              <ShoppingCart className="text-primary"/>
              {t('analysisResult.buyNowTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button 
                variant="outline"
                className="w-full justify-center gap-2 font-bold hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/50"
                onClick={() => {
                  const query = encodeURIComponent(productInfo.name);
                  window.open(`https://www.coupang.com/np/search?component=&q=${query}&channel=user`, '_blank');
                }}
              >
                {t('analysisResult.searchOnCoupang')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center gap-2 font-bold hover:bg-gray-800/10 hover:text-gray-900 hover:border-gray-800/50"
                onClick={() => {
                  const query = encodeURIComponent(productInfo.name);
                  window.open(`https://www.amazon.com/s?k=${query}`, '_blank');
                }}
              >
                {t('analysisResult.searchOnAmazon')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center gap-2 font-bold hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/50"
                onClick={() => {
                  const query = encodeURIComponent(productInfo.name);
                  window.open(`https://search.shopping.naver.com/search/all?query=${query}`, '_blank');
                }}
              >
                {t('analysisResult.searchOnNaver')}
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              {t('analysisResult.affiliateDisclaimer')}
            </p>
          </CardContent>
        </Card>
        
        <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto mb-4" dangerouslySetInnerHTML={{ __html: t('analysisResult.disclaimer') }} />
            <Button onClick={onReset} variant="outline" size="lg">
              <Repeat className="mr-2 h-4 w-4" />
              {t('analysisResult.analyzeNewProduct')}
            </Button>
        </div>
      </div>
    </>
  );
}
