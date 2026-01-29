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
import { CheckCircle2, AlertTriangle, FileText, Repeat, Sparkles, Dog, Cat, ShieldCheck, ShieldAlert, ShieldX, Camera, Star, BarChart3, ShoppingCart, Info, ThumbsUp, Lightbulb } from 'lucide-react';
import IngredientItem from './ingredient-item';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import React from 'react';

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

export default function AnalysisResult({ result, input, onReset }: AnalysisResultProps) {
  const { t } = useLanguage();
  const { productInfo, summary, ingredientsAnalysis, nutritionFacts, expertInsight, topIngredients } = result;

  const petType = input.petType.toLowerCase();
  const PetIcon = petType === 'cat' ? Cat : Dog;
  const ratingDetails = summary.safetyRating ? SafetyRatingInfo[summary.safetyRating] : SafetyRatingInfo.Yellow;
  const RatingIcon = ratingDetails.icon;
  
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
                  <p className="text-lg font-medium text-foreground/80">{expertInsight.cautionPoint}</p>
                </CardContent>
            </Card>
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-4">{expertInsight.proTip}</p>
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
            <div className="flex flex-wrap gap-2 justify-center">
              {summary.hashtags.map((tag, index) => (
                <Badge key={index} className="text-base px-4 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {topIngredients && topIngredients.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-headline">
                <Star className="text-primary"/>
                {t('analysisResult.topIngredients')}
              </CardTitle>
              <CardDescription>{t('analysisResult.topIngredientsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {topIngredients.map((ing, index) => (
                <Badge key={index} variant="secondary" className="text-base py-2 px-4">{ing}</Badge>
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
                        ingredients={ingredientsAnalysis.positive}
                    />
                    )}
                    {ingredientsAnalysis.caution && ingredientsAnalysis.caution.length > 0 && (
                    <IngredientItem
                        value="cautionary"
                        title={t('analysisResult.cautionaryIngredients')}
                        icon={<AlertTriangle className="text-destructive" />}
                        ingredients={ingredientsAnalysis.caution}
                    />
                    )}
                </Accordion>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <BarChart3 className="text-primary" />
                  {t('analysisResult.nutritionProfile')}
                </CardTitle>
                 <CardDescription>{t('analysisResult.nutritionProfileDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="border-l-4 border-primary pl-4 py-2 bg-muted/30 rounded-r-lg">
                  <p className="text-base text-foreground/90">{nutritionFacts.comment}</p>
                </div>
              </CardContent>
            </Card>
        </div>

        <Card className="shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline">
                <Sparkles className="text-primary" />
                {t('analysisResult.expertInsights')}
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/10">
                    <div className="p-2 bg-white rounded-full"><ThumbsUp className="text-green-600"/></div>
                    <div>
                        <h4 className="font-bold text-green-700">{t('analysisResult.goodPointTitle')}</h4>
                        <p className="mt-1 text-foreground/80">{expertInsight.goodPoint}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-4 rounded-lg bg-yellow-500/10">
                    <div className="p-2 bg-white rounded-full"><AlertTriangle className="text-yellow-600"/></div>
                    <div>
                        <h4 className="font-bold text-yellow-700">{t('analysisResult.cautionPointTitle')}</h4>
                        <p className="mt-1 text-foreground/80">{expertInsight.cautionPoint}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-4 rounded-lg bg-sky-500/10">
                    <div className="p-2 bg-white rounded-full"><Lightbulb className="text-sky-600"/></div>
                    <div>
                        <h4 className="font-bold text-sky-700">{t('analysisResult.proTipTitle')}</h4>
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
              {t('analysisResult.analyzeNewProduct')}
            </Button>
        </div>
      </div>
    </>
  );
}
