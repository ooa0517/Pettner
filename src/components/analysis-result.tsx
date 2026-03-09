'use client';

import { useState, useEffect, useMemo } from 'react';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, AlertCircle, 
  Stethoscope, Microscope, 
  PieChart, History, Scale,
  TrendingDown, CheckCircle2,
  Share2, Info, Table as TableIcon,
  ShieldAlert, Leaf, Gavel, Search,
  ChevronDown, ChevronUp,
  Flame,
  ArrowRight
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
  const [ingSearch, setIngSearch] = useState('');

  useEffect(() => {
    if (user && db) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setIsPremium(snap.data().isPremium || false);
      });
    }
  }, [user, db]);

  const filteredIngredients = useMemo(() => {
    if (!result.ingredientAnalysis?.ingredientList100) return [];
    if (!ingSearch) return result.ingredientAnalysis.ingredientList100;
    return result.ingredientAnalysis.ingredientList100.filter(ing => 
      ing.name.toLowerCase().includes(ingSearch.toLowerCase())
    );
  }, [result.ingredientAnalysis, ingSearch]);

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

  const getVerdictLabel = (status: string) => {
    if (isEn) return status.toUpperCase();
    switch (status.toLowerCase()) {
      case 'pass': return '적합';
      case 'optimal': return '최적';
      case 'fail': return '주의';
      default: return status;
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

  const { productIdentity, scoreCard, scientificAnalysis, esgReport, weightDiagnosis, dietRoadmap, ingredientAnalysis, feedingGuide } = result;

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
                  V17.0 EXPERT AUDIT
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

          <div className="p-8 rounded-[2.5rem] border-l-8 border-primary bg-primary/5">
             <h3 className="text-xl font-black flex items-center gap-2 mb-4">
               <Stethoscope className="text-primary" size={20}/> 
               {isEn ? 'Scientific Verdict' : '수의학적 정밀 진단'}
             </h3>
             <p className="text-lg font-bold leading-relaxed break-keep">
               {scoreCard.headline}
             </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {scoreCard.statusTags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="px-3 py-1.5 rounded-xl font-bold bg-muted text-foreground/70">
                {tag}
              </Badge>
            ))}
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

      <Accordion type="multiple" defaultValue={["ing-audit", "nut-audit", "feeding-guide", "weight-audit", "corporate-audit"]} className="space-y-6">
        
        {/* 2. 100% Ingredient Analysis */}
        <AccordionItem value="ing-audit" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-6 hover:no-underline [&[data-state=open]>div>svg]:rotate-180">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Microscope size={24} /></div>
              <div className="text-left">
                <h3 className="font-black text-xl">{isEn ? '100% Ingredient Audit' : '전성분 원재료 100% 분석'}</h3>
                <p className="text-xs text-muted-foreground font-medium">{ingredientAnalysis.ingredientList100.length}개의 원재료를 정밀 검수했습니다.</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="성분명 검색 (예: 타우린, 연어...)" 
                className="pl-12 rounded-2xl border-muted bg-muted/20"
                value={ingSearch}
                onChange={(e) => setIngSearch(e.target.value)}
              />
            </div>

            <div className="divide-y divide-muted/30 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredIngredients.length > 0 ? filteredIngredients.map((ing, i) => (
                <div key={i} className="py-5 flex items-start gap-4 hover:bg-muted/5 transition-colors">
                  <div className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0", 
                    ing.category === 'positive' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 
                    ing.category === 'cautionary' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-muted-foreground'
                  )} />
                  <div className="space-y-1">
                    <p className="font-black text-lg">{ing.name}</p>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{ing.reason}</p>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-muted-foreground font-bold">검색 결과가 없습니다.</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-4">
                <h4 className="font-black text-sm text-success flex items-center gap-2">
                  <CheckCircle2 size={16}/> {isEn ? 'Suitable For' : '급여 권장 리스트'}
                </h4>
                <div className="flex flex-col gap-2">
                  {ingredientAnalysis.suitabilityAudit.suitableFor.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-success/5 p-3 rounded-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" /> 
                      <span className="text-xs font-bold text-success">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-black text-sm text-orange-500 flex items-center gap-2">
                  <AlertCircle size={16}/> {isEn ? 'Not Recommended' : '주의 및 부적합 리스트'}
                </h4>
                <div className="flex flex-col gap-2">
                  {ingredientAnalysis.suitabilityAudit.notSuitableFor.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-orange-500/5 p-3 rounded-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> 
                      <span className="text-xs font-bold text-orange-500">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] font-bold text-muted-foreground leading-relaxed bg-orange-500/5 p-3 rounded-xl border border-orange-500/10">
                  <span className="text-orange-500">⚠️ 부적합 사유:</span> {ingredientAnalysis.suitabilityAudit.unsuitableReasons}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. AAFCO Comparative Nutrition Audit */}
        <AccordionItem value="nut-audit" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-6 hover:no-underline">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><PieChart size={24} /></div>
              <div className="text-left">
                <h3 className="font-black text-xl">{isEn ? 'Standard Nutrition Comparison' : '표준 영양 성분 비교 리포트'}</h3>
                <p className="text-xs text-muted-foreground font-medium">AAFCO 표준 가이드라인 대비 제품의 영양학적 위치입니다.</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-8 pt-4 space-y-8">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-muted-foreground uppercase tracking-widest">{isEn ? 'Main Nutrients vs Standard' : '주요 영양소 표준 대비 비교'}</h4>
                <Badge variant="outline" className="text-[10px] font-bold border-muted text-muted-foreground">Basis: DM (Dry Matter)</Badge>
              </div>
              
              <div className="grid gap-8">
                {(result.scientificAnalysis.comparativeChart || []).map((item, i) => {
                  const maxVal = Math.max(item.productValue, item.standardMax || 60);
                  const productPct = (item.productValue / maxVal) * 100;
                  const minPct = (item.standardMin / maxVal) * 100;
                  const maxRangePct = item.standardMax ? (item.standardMax / maxVal) * 100 : 100;

                  return (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-sm font-black text-foreground">{item.nutrient}</span>
                        <p className="text-[10px] text-muted-foreground font-bold">Standard: {item.standardMin}% {item.standardMax ? `~ ${item.standardMax}%` : 'Min'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-primary">{item.productValue}%</span>
                        <p className="text-[10px] text-muted-foreground font-bold">Current Product</p>
                      </div>
                    </div>
                    
                    <div className="relative h-6 w-full bg-muted rounded-full overflow-hidden">
                      {/* Standard Range Overlay */}
                      <div 
                        className="absolute h-full bg-primary/10 border-x border-primary/20 z-0" 
                        style={{ left: `${minPct}%`, width: `${maxRangePct - minPct}%` }} 
                      />
                      {/* Product Value Bar */}
                      <div 
                        className={cn("absolute h-full transition-all duration-1000 z-10 flex items-center justify-end pr-2", 
                          item.productValue < item.standardMin ? "bg-orange-500" : "bg-primary"
                        )} 
                        style={{ width: `${productPct}%` }}
                      >
                         {item.productValue < item.standardMin && <AlertCircle size={12} className="text-white" />}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-muted-foreground uppercase tracking-widest">{isEn ? 'Expert Diagnosis' : '수의학적 전문가 소견'}</h4>
              </div>
              <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10">
                <p className="text-sm font-bold leading-relaxed">{result.veterinaryAdvice}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-muted overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-black text-xs">{isEn ? 'Nutrient' : '영양 성분'}</TableHead>
                    <TableHead className="font-black text-xs text-center">{isEn ? 'Value' : '함량'}</TableHead>
                    <TableHead className="font-black text-xs text-center">{isEn ? 'AAFCO Range' : '표준 범위'}</TableHead>
                    <TableHead className="font-black text-xs text-center">{isEn ? 'Verdict' : '판정'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scientificAnalysis.aafcoComparison.map((row, i) => (
                    <TableRow key={i} className="hover:bg-muted/5">
                      <TableCell className="font-bold text-xs">{row.nutrient}</TableCell>
                      <TableCell className="text-center font-black text-xs text-primary">{row.productValue}{row.unit}</TableCell>
                      <TableCell className="text-center text-xs font-medium text-muted-foreground">
                        {row.aafcoMin !== undefined ? `${row.aafcoMin}${row.unit}` : '-'} ~ {row.aafcoMax !== undefined ? `${row.aafcoMax}${row.unit}` : 'Max'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn("text-[10px] font-black px-2 py-0 border-none", 
                          row.status === 'pass' ? "bg-success" : 
                          row.status === 'optimal' ? "bg-primary" : "bg-destructive"
                        )}>
                          {getVerdictLabel(row.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Feeding Guide */}
        <AccordionItem value="feeding-guide" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-6 hover:no-underline">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><TableIcon size={24} /></div>
              <div className="text-left">
                <h3 className="font-black text-xl">{isEn ? 'Feeding Table & Purpose' : '일일 급여 가이드 및 권장량'}</h3>
                <p className="text-xs text-muted-foreground font-medium">활동량에 따른 권장량과 해당 제품의 칼로리 밀도입니다.</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-muted/20 rounded-3xl border-2 border-dashed border-primary/10">
                <h4 className="font-black text-sm flex items-center gap-2 mb-2">
                  <Info size={16} className="text-primary"/> {isEn ? 'Product Purpose' : '제품 급여 목적'}
                </h4>
                <p className="text-sm font-bold leading-relaxed">{feedingGuide.productPurpose}</p>
              </div>
              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col justify-center items-center">
                 <div className="flex items-center gap-2 text-primary mb-1">
                   <Flame size={18} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Energy Density</span>
                 </div>
                 <p className="text-3xl font-black text-primary tracking-tighter">
                   {scientificAnalysis.nutrientMass.kcal} <span className="text-sm font-bold">kcal/kg</span>
                 </p>
                 <p className="text-[10px] text-muted-foreground font-bold mt-1">{isEn ? 'Calories per kg' : '제품 1kg당 칼로리 밀도'}</p>
              </div>
            </div>

            {feedingGuide.feedingTable && (
              <div className="rounded-2xl border border-muted overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-black text-xs text-center">{isEn ? 'Weight (kg)' : '체중 (kg)'}</TableHead>
                      <TableHead className="font-black text-xs text-center">{isEn ? 'Low Activity' : '활동량 낮음'}</TableHead>
                      <TableHead className="font-black text-xs text-center">{isEn ? 'High Activity' : '활동량 높음'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedingGuide.feedingTable.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-center font-bold text-xs">{row.weightRange}</TableCell>
                        <TableCell className="text-center font-medium text-xs text-muted-foreground">{row.lowActivityGrams}</TableCell>
                        <TableCell className="text-center font-black text-xs text-primary">{row.highActivityGrams}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground font-medium text-center italic">
              {isEn ? '* Calorie ranges in brackets are calculated based on the product\'s energy density.' : '* 괄호 안의 칼로리 범위는 제품의 에너지 밀도를 기반으로 산출되었습니다.'}
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Weight Diagnosis (Custom Mode Only) */}
        {!isGeneralMode && weightDiagnosis && (
          <AccordionItem value="weight-audit" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Scale size={24} /></div>
                <div className="text-left">
                  <h3 className="font-black text-xl">{isEn ? 'Body Condition Audit' : '아이 체형 및 감량 리포트'}</h3>
                  <p className="text-xs text-muted-foreground font-medium">현재 체형 점수(BCS) 기반의 건강 리포트입니다.</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-8 pt-4 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-muted/20 rounded-3xl">
                     <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Standard Range</p>
                     <p className="text-lg font-black">{weightDiagnosis.breedStandardRange}</p>
                     <p className="text-[10px] font-bold text-primary mt-1">{input.petProfile?.breed} {isEn ? 'Avg' : '평균'}</p>
                  </div>
                  <div className="text-center p-6 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20">
                     <p className="text-[10px] font-black opacity-60 uppercase mb-1">Current Weight</p>
                     <p className="text-2xl font-black">{weightDiagnosis.currentWeight}kg</p>
                     <Badge className="bg-white/20 text-white border-none mt-2">
                        {weightDiagnosis.overweightPercentage > 0 ? `${isEn ? 'Top' : '상위'} ${weightDiagnosis.overweightPercentage}%` : (isEn ? 'Optimal' : '표준 범위')}
                     </Badge>
                  </div>
                  <div className="text-center p-6 bg-success/10 rounded-3xl">
                     <p className="text-[10px] font-black text-success uppercase mb-1">Ideal Weight</p>
                     <p className="text-lg font-black text-success">{weightDiagnosis.idealWeight}kg</p>
                     <p className="text-[10px] font-bold text-success mt-1">{isEn ? 'AI Target' : 'AI 권장 목표'}</p>
                  </div>
               </div>
               
               <div className="p-6 bg-muted/10 rounded-[2rem] border-2 border-dashed border-muted-foreground/20">
                  <p className="text-sm font-bold leading-relaxed text-muted-foreground flex items-start gap-3">
                     <AlertCircle className="shrink-0 h-5 w-5 text-primary mt-0.5" />
                     {weightDiagnosis.verdict}
                  </p>
               </div>

               {dietRoadmap && (
                 <div className="space-y-4">
                    <h4 className="font-black text-sm flex items-center gap-2">
                      <TrendingDown size={16} className="text-primary"/> {isEn ? 'Weight Loss Roadmap' : '건강 감량 로드맵 (Step-by-Step)'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                       {dietRoadmap.map((step, i) => (
                         <div key={i} className="p-5 bg-muted/5 rounded-2xl flex flex-col items-center border border-muted/30">
                            <span className="text-[10px] font-black text-muted-foreground mb-2 uppercase">{step.phase}</span>
                            <p className="font-black text-xl text-foreground">{step.weight}kg</p>
                            <Badge className="mt-2 bg-primary/10 text-primary border-none font-black">{step.grams}g {isEn ? 'Feeding' : '급여'}</Badge>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 6. Corporate Integrity */}
        <AccordionItem value="corporate-audit" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-6 hover:no-underline">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Gavel size={24} /></div>
              <div className="text-left">
                <h3 className="font-black text-xl">{isEn ? 'Brand & Safety Audit' : '기업 및 브랜드 안전성 감사'}</h3>
                <p className="text-xs text-muted-foreground font-medium">제조사의 투명성과 리콜 이력 정보입니다.</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-8 pt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-success/5 rounded-3xl border border-success/10 space-y-3">
                <div className="flex items-center gap-2 text-success"><Leaf size={18} /><h4 className="font-black text-sm">{isEn ? 'Environment' : '환경 경영'}</h4></div>
                <p className="text-xs font-bold leading-relaxed text-muted-foreground">{esgReport.environmental}</p>
              </div>
              <div className="p-6 bg-destructive/5 rounded-3xl border border-destructive/10 space-y-3">
                <div className="flex items-center gap-2 text-destructive"><History size={18} /><h4 className="font-black text-sm">{isEn ? 'Recall History' : '리콜 이력'}</h4></div>
                <p className="text-xs font-bold leading-relaxed text-muted-foreground">{esgReport.recallHistory}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {!isPublicView && <AdBanner position="bottom" />}

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-2xl border-t z-50 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-black text-primary"><ChevronDown size={20} className="mr-2" /> {resetButtonText || (isEn ? 'New Scan' : '새로운 분석')}</Button>
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productIdentity.name)}`, '_blank')} className="flex-[2] h-16 rounded-2xl text-xl font-black shadow-xl hover:scale-[1.02] transition-transform"><ShoppingBag size={24} className="mr-3" /> {isEn ? 'Best Price' : '최저가 구매'}</Button>
        </div>
      </div>
    </div>
  );
}
