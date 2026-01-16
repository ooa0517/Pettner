import type { AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { CheckCircle2, AlertTriangle, Lightbulb, Beaker, FileText, Repeat, Sparkles, Dog, Cat } from 'lucide-react';
import IngredientItem from './ingredient-item';
import { Badge } from '@/components/ui/badge';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  onReset: () => void;
};

export default function AnalysisResult({ result, onReset }: AnalysisResultProps) {
  const { productName, brandName, petType, lifeStage, specialClaims, summaryHeadline, ingredients, nutritionalAnalysis, hiddenInsights, recommendations } = result;

  const PetIcon = petType === '고양이' ? Cat : Dog;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="text-center shadow-2xl shadow-primary/10 border-primary/20 overflow-hidden">
        <CardHeader className="p-8 bg-card">
           <div className="flex justify-center items-center gap-2 text-muted-foreground font-semibold">
              <PetIcon className="w-5 h-5"/>
              <span>{brandName || '분석된 제품'}</span>
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

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline">
              <FileText className="text-primary" />
              성분 상세 분석
            </CardTitle>
            <CardDescription>AI가 분석한 핵심 성분 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="positive" className="w-full">
              {ingredients.positive && ingredients.positive.length > 0 && (
                <IngredientItem
                  value="positive"
                  title="긍정적인 성분"
                  icon={<CheckCircle2 className="text-success" />}
                  ingredients={ingredients.positive}
                />
              )}
              {ingredients.cautionary && ingredients.cautionary.length > 0 && (
                <IngredientItem
                  value="cautionary"
                  title="주의가 필요한 성분"
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
                영양 프로필
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nutritionalAnalysis.estimatedCalories && (
                <div>
                  <h4 className="font-semibold text-muted-foreground">추정 칼로리</h4>
                  <p className="text-xl font-bold">{nutritionalAnalysis.estimatedCalories}</p>
                </div>
              )}
              {nutritionalAnalysis.insights && nutritionalAnalysis.insights.length > 0 && (
                <div>
                  <h4 className="font-semibold text-muted-foreground">영양학적 인사이트</h4>
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
                  전문가 인사이트
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
              AI 맞춤 개선 제안
            </CardTitle>
            {recommendations.introduction && <CardDescription className="text-base">{recommendations.introduction}</CardDescription>}
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            {recommendations.supplementaryIngredients && recommendations.supplementaryIngredients.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-foreground">추천 보충 성분</h4>
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
                <h4 className="font-bold text-lg text-foreground">대안 제품 유형</h4>
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
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto mb-4">
            <strong>면책 조항:</strong> 이 분석은 AI 기술을 활용한 정보 제공 목적으로, 수의사의 전문적인 의학적 조언을 대체할 수 없습니다. 반려동물의 건강에 이상이 있을 경우, 반드시 전문 수의사와 상담하시기 바랍니다.
          </p>
          <Button onClick={onReset} variant="outline" size="lg">
            <Repeat className="mr-2 h-4 w-4" />
            새로운 제품 분석하기
          </Button>
      </div>
    </div>
  );
}
