'use client';

import { useState, useEffect } from 'react';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, AlertCircle, 
  Stethoscope, BarChart3, 
  Microscope, 
  Zap, 
  PieChart, History, Scale,
  TrendingDown, CheckCircle2,
  Share2, Info, Table as TableIcon,
  ShieldAlert, Leaf, Gavel
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AdBanner from '@/components/ad-banner';
import { useToast } from '@/hooks/use-toast';

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
  isPublicView?: boolean;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText, isPublicView = false }: AnalysisResultProps) {
  const isEn = input.language === 'en';
  const isCat = input.petType === 'cat';
  const isGeneralMode = input.analysisMode === 'general';
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user && db) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setIsPremium(snap.data().isPremium || false);
      });
    }
  }, [user, db]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pettner 분석 리포트: ${result.productIdentity.name}`,
          text: `${isGeneralMode ? '제품 영양 분석 결과입니다.' : input.petProfile?.name + '를 위한 맞춤 영양 분석 결과입니다.'}`,
          url: shareUrl,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "링크 복사 완료", description: "공유 링크가 클립보드에 복사되었습니다." });
    }
  };

  if (!result || !result.productIdentity || !result.scoreCard) {
     return (
        <div className="space-y-8 py-20 text-center">
          <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-30"/>
          <h1 className="text-3xl font-black">Analysis Error</h1>
          <p className="text-muted-foreground">AI failed to generate a complete report. Please try again with a clearer photo.</p>
          <Button onClick={onReset} variant="outline" size="lg" className="rounded-full mt-4">Try Again</Button>
        </div>
     );
  }

  const { productIdentity, scoreCard, scientificAnalysis, esgReport, weightDiagnosis, dietRoadmap, productAnalysisOnly } = result;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-48 max-w-4xl mx-auto px-4">
      
      {!isPublicView && <AdBanner position="top" />}

      {/* 1. Header & Summary Card */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge className={cn("px-3 py-1 rounded-full text-[10px] font-black", 
                  productIdentity.pettnerCompliance.isCompliant ? "bg-success" : "bg-destructive")}>
                  {productIdentity.pettnerCompliance.isCompliant ? 'PETTNER COMPLIANT' : 'NON-COMPLIANT'}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px] font-black border-primary text-primary">
                  V15.0 PRODUCT AUDIT
                </Badge>
              </div>
              <h1 className="text-3xl font-black tracking-tighter pt-2 leading-tight">
                {productIdentity.name}
              </h1>
              <p className="text-muted-foreground font-bold">{productIdentity.brand} · {productIdentity.category}</p>
            </div>
            <div className="text-left md:text-right shrink-0">
               <div className="text-6xl font-black text-primary leading-none">{scoreCard.totalScore}<span className="text-xl ml-1">{isEn ? 'pts' : '점'}</span></div>
               {scoreCard.grade && (
                 <Badge className="mt-3 font-black px-4 py-1 rounded-full text-sm bg-success/20 text-success border-none">
                   Grade {scoreCard.grade}
                 </Badge>
               )}
            </div>
          </div>

          {/* Product Purpose (Only for General Mode) */}
          {isGeneralMode && productAnalysisOnly?.productPurpose && (
            <div className="p-6 bg-muted/20 rounded-3xl border-2 border-dashed border-primary/20">
              <h4 className="font-black text-sm flex items-center gap-2 mb-2">
                <Info size={16} className="text-primary"/> {isEn ? 'Product Goal' : '제품 급여 목적'}
              </h4>
              <p className="text-sm font-bold text-foreground leading-relaxed break-keep">
                {productAnalysisOnly.productPurpose}
              </p>
            </div>
          )}

          <div className="p-8 rounded-[2.5rem] border-l-8 border-primary bg-primary/5">
             <h3 className="text-xl font-black flex items-center gap-2 mb-4">
               <Stethoscope className="text-primary" size={20}/> 
               {isEn ? 'Scientific Verdict' : '수의학적 정밀 진단'}
             </h3>
             <p className="text-lg font-bold leading-relaxed break-keep">
               {scoreCard.headline}
             </p>
          </div>

          <Button 
            onClick={handleShare} 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-2 border-dashed font-bold flex items-center justify-center gap-2 hover:bg-muted/50"
          >
            <Share2 size={18} />
            이 리포트 공유하기
          </Button>
        </CardContent>
      </Card>

      {/* 2. Mode Specific Section: Feeding Guide (General Mode) */}
      {isGeneralMode && productAnalysisOnly?.feedingTable && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <TableIcon className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-black font-headline tracking-tight">{isEn ? 'Daily Feeding Guide' : '일일 권장 급여량 가이드'}</h2>
          </div>
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden p-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-black text-center">{isEn ? 'Weight' : '체중 (kg)'}</TableHead>
                  <TableHead className="font-black text-center">{isEn ? 'Low Activity' : '활동량 낮음'}</TableHead>
                  <TableHead className="font-black text-center">{isEn ? 'High Activity' : '활동량 높음'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productAnalysisOnly.feedingTable.map((row, i) => (
                  <TableRow key={i} className="hover:bg-muted/10">
                    <TableCell className="text-center font-bold">{row.weightRange}</TableCell>
                    <TableCell className="text-center font-medium text-muted-foreground">{row.lowActivityGrams}</TableCell>
                    <TableCell className="text-center font-bold text-primary">{row.highActivityGrams}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-[10px] text-muted-foreground mt-4 text-center">
              * 일일 권장 칼로리(RER/DER)를 기준으로 계산된 예상 수치입니다. 실제 급여 시 아이의 상태를 보며 가감하세요.
            </p>
          </Card>
        </div>
      )}

      {/* 3. Suitability Audit (General Mode) */}
      {isGeneralMode && productAnalysisOnly?.suitabilityAudit && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-4">
            <h4 className="font-black text-sm text-success uppercase flex items-center gap-2">
              <CheckCircle2 size={16}/> {isEn ? 'Recommended For' : '급여 권장'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {productAnalysisOnly.suitabilityAudit.suitableFor.map((item, i) => (
                <Badge key={i} className="bg-success/10 text-success border-none rounded-xl font-bold">{item}</Badge>
              ))}
            </div>
          </Card>
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-4 border-l-8 border-destructive">
            <h4 className="font-black text-sm text-destructive uppercase flex items-center gap-2">
              <ShieldAlert size={16}/> {isEn ? 'NOT Recommended' : '급여 부적합'}
            </h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {productAnalysisOnly.suitabilityAudit.notSuitableFor.map((item, i) => (
                <Badge key={i} className="bg-destructive/10 text-destructive border-none rounded-xl font-bold">{item}</Badge>
              ))}
            </div>
            <p className="text-xs font-bold text-muted-foreground leading-relaxed">
              <span className="text-destructive">⚠️ 경고:</span> {productAnalysisOnly.suitabilityAudit.unsuitableReasons}
            </p>
          </Card>
        </div>
      )}

      {/* 4. 100% Ingredient Analysis (General Mode) */}
      {isGeneralMode && productAnalysisOnly?.ingredientList100 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Microscope className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-black font-headline tracking-tight">{isEn ? '100% Ingredient Audit' : '전성분 원재료 100% 분석'}</h2>
          </div>
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-muted/30">
                {productAnalysisOnly.ingredientList100.map((ing, i) => (
                  <div key={i} className="p-6 flex items-start gap-4 hover:bg-muted/5 transition-colors">
                    <div className={cn("mt-1 w-3 h-3 rounded-full shrink-0", 
                      ing.category === 'positive' ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                      ing.category === 'cautionary' ? 'bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-muted-foreground'
                    )} />
                    <div className="space-y-1">
                      <p className="font-black text-lg">{ing.name}</p>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{ing.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weight Diagnosis (Custom Mode) */}
      {!isGeneralMode && weightDiagnosis && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Scale className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-black font-headline tracking-tight">{isEn ? 'Weight Analysis' : '체형 및 품종 표준 진단'}</h2>
          </div>
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardContent className="p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-muted/20 rounded-3xl">
                     <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Standard Range</p>
                     <p className="text-xl font-black">{weightDiagnosis.breedStandardRange}</p>
                     <p className="text-[10px] font-bold text-primary mt-1">{input.petProfile?.breed} 평균</p>
                  </div>
                  <div className="text-center p-6 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20">
                     <p className="text-[10px] font-black opacity-60 uppercase mb-1">Current Weight</p>
                     <p className="text-3xl font-black">{weightDiagnosis.currentWeight}kg</p>
                     <Badge className="bg-white/20 text-white border-none mt-2">
                        {weightDiagnosis.overweightPercentage > 0 ? `상위 ${weightDiagnosis.overweightPercentage}%` : '표준 범위'}
                     </Badge>
                  </div>
                  <div className="text-center p-6 bg-success/10 rounded-3xl">
                     <p className="text-[10px] font-black text-success uppercase mb-1">Ideal Weight</p>
                     <p className="text-xl font-black text-success">{weightDiagnosis.idealWeight}kg</p>
                     <p className="text-[10px] font-bold text-success mt-1">AI 권장 목표</p>
                  </div>
               </div>
               
               <div className="p-6 bg-muted/10 rounded-[2rem] border-2 border-dashed border-muted-foreground/20">
                  <p className="text-sm font-bold leading-relaxed text-muted-foreground">
                     <AlertCircle className="inline-block mr-2 h-4 w-4 text-primary" />
                     {weightDiagnosis.verdict}
                  </p>
               </div>

               {dietRoadmap && (
                 <div className="space-y-4">
                    <h4 className="font-black text-sm flex items-center gap-2">
                      <TrendingDown size={16} className="text-primary"/> 감량 및 건강 관리 로드맵
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                       {dietRoadmap.map((step, i) => (
                         <div key={i} className="p-4 bg-muted/5 rounded-2xl flex flex-col items-center">
                            <span className="text-[10px] font-black text-muted-foreground mb-2 uppercase">{step.phase}</span>
                            <p className="font-black text-lg">{step.weight}kg</p>
                            <Badge variant="outline" className="mt-1 border-primary text-primary font-bold">{step.grams}g 급여</Badge>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      )}

      {!isPublicView && <AdBanner position="middle" />}

      {/* 5. Scientific Deep Dive (Nutrients) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <PieChart className="text-primary w-6 h-6" />
          <h2 className="text-2xl font-black font-headline tracking-tight">{isEn ? 'Nutrition Audit' : '영양학적 감사'}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
             <h4 className="font-black text-sm text-muted-foreground uppercase flex items-center gap-2 mb-6">
              <PieChart size={16}/> Nutrient Mass (per 100g)
            </h4>
            <div className="space-y-6">
              {[
                { label: 'Protein', value: scientificAnalysis.nutrientMass.protein_g, color: 'bg-primary' },
                { label: 'Fat', value: scientificAnalysis.nutrientMass.fat_g, color: 'bg-yellow-500' },
                { label: 'Carbs', value: scientificAnalysis.nutrientMass.carbs_g, color: 'bg-muted-foreground' }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black"><span>{item.label}</span><span>{item.value.toFixed(1)}g</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: `${Math.min(item.value, 100)}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t flex justify-between items-center">
                 <span className="text-xs font-black">Total Calories</span>
                 <span className="text-xl font-black text-primary">{scientificAnalysis.nutrientMass.kcal} kcal</span>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
            <h4 className="font-black text-sm text-muted-foreground uppercase flex items-center gap-2">
              <BarChart3 size={16}/> {isCat ? 'Cat Specifics' : 'Dog Specifics'}
            </h4>
            <div className="space-y-4">
               {isCat ? (
                 <div className="p-4 bg-muted/5 rounded-2xl">
                   <p className="text-[10px] font-black opacity-50">Taurine Check</p>
                   <p className="text-sm font-bold mt-1">{scientificAnalysis.catSpecific?.taurineCheck || 'Verified'}</p>
                 </div>
               ) : (
                 <div className="p-4 bg-muted/5 rounded-2xl">
                   <p className="text-[10px] font-black opacity-50">Genetic Risk Matching</p>
                   <p className="text-sm font-bold mt-1">{scientificAnalysis.dogSpecific?.breedRiskMatching || 'Optimal'}</p>
                 </div>
               )}
               <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase">Veterinary Advice</p>
                  <p className="text-xs font-bold mt-1 leading-relaxed">{result.veterinaryAdvice}</p>
               </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Gavel className="text-primary w-6 h-6" />
          <h2 className="text-2xl font-black font-headline tracking-tight">{isEn ? 'Corporate Audit' : '기업 신뢰도 리포트'}</h2>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="environmental" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-2xl text-success"><Leaf /></div>
                <div className="text-left"><h3 className="font-black text-lg">{isEn ? 'Environmental' : '환경 경영'}</h3></div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-8 pt-4">
              <p className="text-sm font-bold leading-relaxed">{esgReport.environmental}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recall" className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-2xl text-destructive"><History /></div>
                <div className="text-left"><h3 className="font-black text-lg">{isEn ? 'Recall Audit' : '리콜 이력'}</h3></div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-8 pt-4">
              <p className="text-sm font-bold leading-relaxed">{esgReport.recallHistory}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {!isPublicView && <AdBanner position="bottom" />}

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-2xl border-t z-50 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-black text-primary"><Zap size={20} className="mr-2" /> {resetButtonText || 'New Scan'}</Button>
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productIdentity.name)}`, '_blank')} className="flex-[2] h-16 rounded-2xl text-xl font-black shadow-xl hover:scale-[1.02] transition-transform"><ShoppingBag size={24} className="mr-3" /> {isEn ? 'Best Price' : '최저가 구매'}</Button>
        </div>
      </div>
    </div>
  );
}
