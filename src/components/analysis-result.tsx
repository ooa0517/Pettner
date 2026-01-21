import type { AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { CheckCircle2, AlertTriangle, Lightbulb, Beaker, FileText, Repeat, Sparkles, Dog, Cat, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import IngredientItem from './ingredient-item';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
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

export default function AnalysisResult({ result, onReset }: AnalysisResultProps) {
  const { t } = useLanguage();
  const { productInfo, summary, ingredientsAnalysis, nutritionFacts, expertInsight } = result;

  const petType = "dog"; // This can be made dynamic if petType is included in the output
  const PetIcon = petType.toLowerCase() === 'cat' ? Cat : Dog;
  const ratingDetails = SafetyRatingInfo[summary.safetyRating];
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="text-center shadow-2xl shadow-primary/10 border-primary/20 overflow-hidden">
        <CardHeader className="p-8 bg-card">
           <div className="flex justify-center items-center gap-2 text-muted-foreground font-semibold">
              <PetIcon className="w-5 h-5"/>
              <span>{productInfo.brand || t('analysisResult.productAnalyzed')}</span>
           </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight mt-2">{productInfo.name}</h1>
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
                <Beaker className="text-primary" />
                {t('analysisResult.nutritionProfile')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-muted-foreground">{t('analysisResult.estimatedCalories')}</h4>
                <p className="text-xl font-bold">{nutritionFacts.estimatedCalories}</p>
              </div>
              <div>
                <h4 className="font-semibold text-muted-foreground">{t('analysisResult.nutritionalInsights')}</h4>
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
      
      <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto mb-4" dangerouslySetInnerHTML={{ __html: t('analysisResult.disclaimer') }} />
          <Button onClick={onReset} variant="outline" size="lg">
            <Repeat className="mr-2 h-4 w-4" />
            {t('analysisResult.analyzeNewProduct')}
          </Button>
      </div>
    </div>
  );
}
