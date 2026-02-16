'use client';

import { useState } from 'react';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Repeat, ShoppingBag, Pencil, 
  Info, AlertCircle, Scale,
  ChevronRight, ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartStyle 
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Progress } from '@/components/ui/progress';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText }: AnalysisResultProps) {
  const { t } = useLanguage();
  const [productName, setProductName] = useState(result.productIdentity.name);
  const [isEditing, setIsEditing] = useState(false);

  if (result.status === 'error') {
     return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto py-20 text-center">
          <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-30"/>
          <h1 className="text-3xl font-black">분석 중 오류 발생</h1>
          <p className="text-muted-foreground">데이터가 부족하거나 사진이 불명확합니다.</p>
          <Button onClick={onReset} variant="outline" size="lg" className="rounded-full">다시 시도하기</Button>
        </div>
     );
  }

  const feedingData = [
    { name: '감량 식단 (추천)', value: result.feedingGuide.weightLossGrams, fill: 'var(--primary)' },
    { name: '유지 식단', value: result.feedingGuide.maintenanceGrams, fill: 'hsl(var(--muted-foreground))' }
  ];

  const NutrientBar = ({ label, value, pct, isWarning }: { label: string, value: string, pct: number, isWarning?: boolean }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-sm font-bold text-muted-foreground">{label}</span>
        <span className={cn("text-sm font-black", isWarning ? "text-destructive" : "text-primary")}>{value}</span>
      </div>
      <Progress value={pct} className={cn("h-2", isWarning ? "bg-destructive/10" : "bg-muted")} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-40 max-w-4xl mx-auto px-4">
      
      {/* 1. Header: The Verdict */}
      <Card className="border-none shadow-lg rounded-3xl bg-white overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-bold px-3 py-1 rounded-full">
              {result.productIdentity.brand}
            </Badge>
            {result.scoreCard.statusTags.map((tag, i) => (
              <Badge key={i} className={cn("font-bold px-3 py-1 rounded-full border-none", 
                tag.includes('경고') || tag.includes('주의') ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
              )}>
                {tag}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
             <div className="flex items-center gap-2">
               {isEditing ? (
                 <input 
                   value={productName} 
                   onChange={(e) => setProductName(e.target.value)}
                   onBlur={() => setIsEditing(false)}
                   className="text-2xl font-black bg-muted/30 rounded-lg px-2 w-full"
                   autoFocus
                 />
               ) : (
                 <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                   {productName}
                   <Button variant="ghost" size="icon" className="h-6 w-6 opacity-30" onClick={() => setIsEditing(true)}>
                     <Pencil size={12} />
                   </Button>
                 </h1>
               )}
             </div>
             <p className="text-lg font-bold text-muted-foreground leading-tight">
               {input.petProfile?.name}({input.petProfile?.breed}, {input.petProfile?.weight}kg)를 위한 맞춤 솔루션
             </p>
          </div>

          <div className="p-6 bg-muted/10 rounded-2xl border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
               <span className="text-xl font-black">Grade: {result.scoreCard.grade}</span>
               <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-base font-medium leading-relaxed break-keep">{result.scoreCard.headline}</p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Feeding Guide: Obese Algorithm Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg rounded-3xl bg-white p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-sm font-black text-muted-foreground uppercase flex items-center gap-2">
              <Scale size={16} className="text-primary"/> 일일 권장 급여량 비교
            </CardTitle>
          </CardHeader>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedingData} layout="vertical" margin={{ left: -20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={32}>
                  {feedingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2 font-medium">
            {result.feedingGuide.isObese ? 
              `목표 체중(${result.feedingGuide.idealWeight}kg) 달성을 위해 감량 식단을 권장합니다.` : 
              "현재 체중 유지를 위한 권장 급여량입니다."}
          </p>
        </Card>

        <Card className="border-none shadow-lg rounded-3xl bg-primary text-white p-8 flex flex-col justify-center">
          <div className="space-y-1 mb-6">
             <p className="text-xs font-black opacity-70 uppercase">Daily Feeding Guide</p>
             <h3 className="text-3xl font-black">하루 {result.feedingGuide.weightLossGrams}g</h3>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between text-sm border-b border-white/20 pb-2">
               <span className="opacity-70">종이컵 기준</span>
               <span className="font-bold">{result.feedingGuide.visualGuide}</span>
             </div>
             <div className="flex items-center justify-between text-sm border-b border-white/20 pb-2">
               <span className="opacity-70">목표 칼로리</span>
               <span className="font-bold">{result.feedingGuide.targetKcal} kcal</span>
             </div>
             <div className="flex items-center justify-between text-sm">
               <span className="opacity-70">목표 체중</span>
               <span className="font-bold">{result.feedingGuide.idealWeight} kg</span>
             </div>
          </div>
        </Card>
      </div>

      {/* 3. Nutrient Analysis & Ingredient Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg rounded-3xl bg-white p-8 space-y-6">
          <CardTitle className="text-sm font-black text-muted-foreground uppercase flex items-center gap-2">
            영양 농도 분석 (DM 기준)
          </CardTitle>
          <div className="space-y-6">
            <NutrientBar label="단백질" value={result.advancedNutrition.dm_protein} pct={result.advancedNutrition.protein_pct} />
            <NutrientBar label="지방" value={result.advancedNutrition.dm_fat} pct={result.advancedNutrition.fat_pct} />
            <NutrientBar 
              label="탄수화물 (NFE)" 
              value={result.advancedNutrition.dm_carbs} 
              pct={result.advancedNutrition.carbs_pct} 
              isWarning={result.advancedNutrition.carbs_warning}
            />
          </div>
          {result.advancedNutrition.carbs_warning && (
            <div className="p-4 bg-destructive/5 rounded-2xl border border-destructive/10 flex gap-3">
              <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-destructive leading-relaxed">
                탄수화물 함량이 {result.advancedNutrition.dm_carbs}로 높습니다. 비만인 아이의 체중 관리에 불리할 수 있으니 주의가 필요합니다.
              </p>
            </div>
          )}
        </Card>

        <Card className="border-none shadow-lg rounded-3xl bg-white p-8 space-y-6">
          <CardTitle className="text-sm font-black text-muted-foreground uppercase flex items-center gap-2">
            사용 원료 분석
          </CardTitle>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {result.ingredientAnalysis.positive.map((ing, i) => (
                <div key={i} className="group relative">
                  <Badge variant="secondary" className="bg-success/10 text-success border-none font-bold py-1.5 px-3">
                    {ing.tag}
                  </Badge>
                </div>
              ))}
              {result.ingredientAnalysis.cautionary.map((ing, i) => (
                <div key={i} className="group relative">
                  <Badge variant="secondary" className="bg-destructive/10 text-destructive border-none font-bold py-1.5 px-3">
                    {ing.tag}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t">
               <p className="text-xs font-black text-primary mb-2 uppercase">Vet's Insight</p>
               <p className="text-sm font-medium text-muted-foreground leading-relaxed whitespace-pre-line">
                 {result.ingredientAnalysis.proTip}
               </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t z-50 flex justify-center">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black">
            <Repeat size={18} className="mr-2" /> {resetButtonText || '다시 분석'}
          </Button>
          <Button 
            onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productName)}`, '_blank')}
            className="flex-[2] h-14 rounded-2xl text-lg font-black shadow-lg"
          >
            <ShoppingBag size={20} className="mr-2" /> 최저가 검색
          </Button>
        </div>
      </div>
    </div>
  );
}