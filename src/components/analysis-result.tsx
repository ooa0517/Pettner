import type { AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { CheckCircle2, AlertTriangle, Lightbulb, Beaker, FileText, Repeat, Sparkles, Dog, Cat, ShieldAlert } from 'lucide-react';
import IngredientItem from './ingredient-item';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  onReset: () => void;
};

export default function AnalysisResult({ result, onReset }: AnalysisResultProps) {
  const { t } = useLanguage();
  const { productName, brandName, petType, lifeStage, specialClaims, keyTakeaways, summaryHeadline, ingredients, nutritionalAnalysis, hiddenInsights, recommendations } = result;

  const PetIcon = petType.toLowerCase() === 'cat' ? Cat : Dog;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="text-center shadow-2xl shadow-primary/10 border-primary/20 overflow-hidden">
        <CardHeader className="p-8 bg-card">
           <div className="flex justify-center items-center gap-2 text-muted-foreground font-semibold">
              <PetIcon className="w-5 h-5"/>
              <span>{brandName || t('analysisResult.productAnalyzed')}</span>
           </div>
          <CardTitle className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight">{productName}</CardTitle>
          <div className="flex justify-center gap-2 pt-4 flex-wrap">
            {lifeStage && <Badge variant="default">{lifeStage}</Badge>}
            {specialClaims && specialClaims.map((claim, index) => (
              <Badge key={index} variant="secondary">{claim}</Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-8 bg-muted/30">
          <p className="text-lg font-medium text-foreground/80">{summaryHeadline}</p>
        </CardContent>
      </Card>

      {keyTakeaways && keyTakeaways.length > 0 && (
        <Card className="shadow-lg bg-destructive/10 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline text-destructive">
              <ShieldAlert />
              {t('analysisResult.checkThis')}
            </CardTitle>
            <CardDescription>{t('analysisResult.checkThisDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-3 text-base font-medium">
              {keyTakeaways.map((takeaway, index) => (
                <li key={index}>{takeaway}</li>
              ))}
            </ul>
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
              {ingredients.positive && ingredients.positive.length > 0 && (
                <IngredientItem
                  value="positive"
                  title={t('analysisResult.positiveIngredients')}
                  icon={<CheckCircle2 className="text-success" />}
                  ingredients={ingredients.positive}
                />
              )}
              {ingredients.cautionary && ingredients.cautionary.length > 0 && (
                <IngredientItem
                  value="cautionary"
                  title={t('analysisResult.cautionaryIngredients')}
                  icon={<AlertTriangle className="text-destructive" />}
                  ingredients={ingredients.cautionary}
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
              {nutritionalAnalysis.estimatedCalories && (
                <div>
                  <h4 className="font-semibold text-muted-foreground">{t('analysisResult.estimatedCalories')}</h4>
                  <p className="text-xl font-bold">{nutritionalAnalysis.estimatedCalories}</p>
                </div>
              )}
              {nutritionalAnalysis.insights && nutritionalAnalysis.insights.length > 0 && (
                <div>
                  <h4 className="font-semibold text-muted-foreground">{t('analysisResult.nutritionalInsights')}</h4>
                  <ul className="list-disc list-inside space-y-2 mt-2 text-base">
                    {nutritionalAnalysis.insights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {hiddenInsights && hiddenInsights.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-headline">
                  <Lightbulb className="text-primary" />
                  {t('analysisResult.expertInsights')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-base">
                  {hiddenInsights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {recommendations && (
        <Card className="shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline">
              <Sparkles className="text-primary" />
              {t('analysisResult.aiRecommendations')}
            </CardTitle>
            {recommendations.introduction && <CardDescription className="text-base">{recommendations.introduction}</CardDescription>}
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            {recommendations.supplementaryIngredients && recommendations.supplementaryIngredients.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-foreground">{t('analysisResult.recommendedSupplements')}</h4>
                <ul className="space-y-4">
                  {recommendations.supplementaryIngredients.map((item, index) => (
                    <li key={index} className="bg-card/50 p-4 rounded-lg shadow-sm">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recommendations.alternativeProductTypes && recommendations.alternativeProductTypes.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-foreground">{t('analysisResult.alternativeProducts')}</h4>
                 <ul className="space-y-4">
                  {recommendations.alternativeProductTypes.map((item, index) => (
                     <li key={index} className="bg-card/50 p-4 rounded-lg shadow-sm">
                        <p className="font-semibold text-foreground">{item.type}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
