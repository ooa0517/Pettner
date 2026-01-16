import type { AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { CheckCircle2, AlertTriangle, Lightbulb, Beaker, FileText, Repeat, Sparkles } from 'lucide-react';
import IngredientItem from './ingredient-item';
import { Badge } from '@/components/ui/badge';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  onReset: () => void;
};

export default function AnalysisResult({ result, onReset }: AnalysisResultProps) {
  const { productName, brandName, petType, lifeStage, specialClaims, summaryHeadline, ingredients, nutritionalAnalysis, hiddenInsights, recommendations } = result;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="text-center shadow-lg">
        <CardHeader>
          <CardDescription>{brandName || '분석된 제품'}</CardDescription>
          <CardTitle className="text-3xl font-bold font-headline">{productName}</CardTitle>
          <CardDescription className="pt-2">{summaryHeadline}</CardDescription>
          <div className="flex justify-center gap-2 pt-4 flex-wrap">
            {petType && <Badge variant="secondary">{petType}</Badge>}
            {lifeStage && <Badge variant="secondary">{lifeStage}</Badge>}
            {specialClaims && specialClaims.map((claim, index) => (
              <Badge key={index} variant="outline">{claim}</Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
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
                  icon={<AlertTriangle className="text-accent" />}
                  ingredients={ingredients.cautionary}
                />
              )}
            </Accordion>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Beaker className="text-primary" />
                영양소 및 칼로리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nutritionalAnalysis.estimatedCalories && (
                <div>
                  <h4 className="font-semibold text-muted-foreground">추정 칼로리</h4>
                  <p className="text-lg font-bold">{nutritionalAnalysis.estimatedCalories}</p>
                </div>
              )}
              {nutritionalAnalysis.insights && nutritionalAnalysis.insights.length > 0 && (
                <div>
                  <h4 className="font-semibold text-muted-foreground">영양학적 인사이트</h4>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-sm">
                    {nutritionalAnalysis.insights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {hiddenInsights && hiddenInsights.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lightbulb className="text-primary" />
                  숨겨진 인사이트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
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
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="text-primary" />
              AI 맞춤 개선 제안
            </CardTitle>
            {recommendations.introduction && <CardDescription>{recommendations.introduction}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">
            {recommendations.supplementaryIngredients && recommendations.supplementaryIngredients.length > 0 && (
              <div>
                <h4 className="font-semibold text-muted-foreground mb-2">추천 보충 성분</h4>
                <ul className="space-y-3">
                  {recommendations.supplementaryIngredients.map((item, index) => (
                    <li key={index} className="pl-2 border-l-2 border-accent ml-2">
                        <div className="pl-4">
                            <p className="font-semibold text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.reason}</p>
                        </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recommendations.alternativeProductTypes && recommendations.alternativeProductTypes.length > 0 && (
              <div>
                <h4 className="font-semibold text-muted-foreground mb-2">대안 제품 유형</h4>
                 <ul className="space-y-3">
                  {recommendations.alternativeProductTypes.map((item, index) => (
                    <li key={index} className="pl-2 border-l-2 border-accent ml-2">
                         <div className="pl-4">
                            <p className="font-semibold text-foreground">{item.type}</p>
                            <p className="text-sm text-muted-foreground">{item.reason}</p>
                        </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-none border-t rounded-none">
        <CardFooter className="flex-col items-center gap-4 p-4 pt-6">
          <p className="text-xs text-muted-foreground text-center">
            <strong>면책 조항:</strong> 이 분석은 이미지 인식 기술과 일반적인 영양학적 근거를 바탕으로 한 정보 제공 목적이며, 수의사의 의학적 조언을 대체할 수 없습니다. 반려동물의 건강에 이상이 있을 경우, 반드시 전문 수의사와 상담하시기 바랍니다.
          </p>
          <Button onClick={onReset} variant="outline" className="mt-2 self-center">
            <Repeat className="mr-2 h-4 w-4" />
            새로운 제품 분석하기
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
