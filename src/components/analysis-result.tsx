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
  CheckCircle2,
  Search,
  Flame,
  ChevronDown,
  Leaf,
  Star,
  ShieldCheck,
  Factory,
  Zap,
  Target
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

type AnalysisResultProps = {
  result: AnalyzePetFoodIngredientsOutput;
  input: AnalyzePetFoodIngredientsInput;
  onReset: () => void;
  resetButtonText?: string;
  isPublicView?: boolean;
};

export default function AnalysisResult({ result, input, onReset, resetButtonText, isPublicView = false }: AnalysisResultProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [isPremium, setIsPremium] = useState(false);
  const [ingSearch, setIngSearch] = useState('');
  
  const isCustom = input.analysisMode === 'custom';

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

  if (!result || !result.productIdentity) {
     return (
        <div className="space-y-8 py-20 text-center">
          <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-30"/>
          <h1 className="text-3xl font-black">Analysis Error</h1>
          <p className="text-muted-foreground">AI failed to generate a complete report. Please try again.</p>
          <button onClick={onReset} className="text-primary font-bold underline">Try Again</button>
        </div>
     );
  }

  const { productIdentity, scoreCard, scientificAnalysis, esgReport, ingredientAnalysis, feedingGuide, matchingReport } = result;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-48 max-w-4xl mx-auto px-4">
      
      {!isPublicView && <AdBanner position="top" />}

      {/* 1. TOP SCORE CARD / MATCH CARD */}
      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap gap-2">
                <Badge className={cn("px-4 py-1.5 rounded-full text-[10px] font-black", 
                  productIdentity.pettnerCompliance.isCompliant ? "bg-success" : "bg-destructive")}>
                  {productIdentity.pettnerCompliance.isCompliant ? 'PETTNER CERTIFIED' : 'SAFETY ALERT'}
                </Badge>
                <Badge variant="outline" className="px-4 py-1.5 rounded-full text-[10px] font-black border-primary text-primary">
                  {isCustom ? 'V21.0 PET MATCHING' : 'V21.0 PRODUCT AUDIT'}
                </Badge>
              </div>
              <h1 className="text-4xl font-black tracking-tighter leading-tight">
                {productIdentity.name}
              </h1>
              <p className="text-lg text-muted-foreground font-bold">{productIdentity.brand} · {productIdentity.category}</p>
            </div>

            <div className="shrink-0 flex flex-col items-center md:items-end gap-4">
               {/* 맞춤 분석일 때는 매칭 점수를, 일반 분석일 때는 제품 등급을 강조 */}
               <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/30" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                      strokeDasharray={364} strokeDashoffset={364 - (364 * (isCustom ? (matchingReport?.matchScore || 0) : scoreCard.totalScore)) / 100}
                      className={cn("transition-all duration-1000", isCustom ? "text-primary" : "text-success")} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-4xl font-black", isCustom ? "text-primary" : "text-success")}>
                      {isCustom ? matchingReport?.matchScore : scoreCard.totalScore}
                    </span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase">{isCustom ? 'MATCH %' : 'PTS'}</span>
                  </div>
               </div>
               <Badge className={cn("font-black px-6 py-2 rounded-full text-lg border-none", 
                 isCustom ? "bg-primary/10 text-primary" : "bg-success/10 text-success")}>
                 {isCustom ? 'Matching Result' : `Grade ${scoreCard.grade}`}
               </Badge>
            </div>
          </div>

          {/* 맞춤 분석 전용: Pros/Cons 요약 */}
          {isCustom && matchingReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-success/5 border border-success/20 space-y-3">
                <h4 className="font-black text-sm text-success flex items-center gap-2">
                  <CheckCircle2 size={16} /> {input.petProfile?.name}에게 좋은 점
                </h4>
                <ul className="space-y-1.5">
                  {matchingReport.pros?.map((p, i) => (
                    <li key={i} className="text-xs font-bold text-foreground/70">• {p}</li>
                  ))}
                </ul>
              </div>
              <div className="p-6 rounded-3xl bg-orange-500/5 border border-orange-500/20 space-y-3">
                <h4 className="font-black text-sm text-orange-500 flex items-center gap-2">
                  <AlertCircle size={16} /> 주의가 필요한 점
                </h4>
                <ul className="space-y-1.5">
                  {matchingReport.cons?.map((c, i) => (
                    <li key={i} className="text-xs font-bold text-foreground/70">• {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className={cn("p-8 rounded-[2.5rem] border-l-8", isCustom ? "border-primary bg-primary/5" : "border-success bg-success/5")}>
             <h3 className="text-xl font-black flex items-center gap-2 mb-4">
               {isCustom ? <Target className="text-primary" size={24}/> : <Stethoscope className="text-success" size={24}/>}
               {isCustom ? `${input.petProfile?.name}을 위한 맞춤 소견` : '수의학적 정밀 진단'}
             </h3>
             <p className="text-lg font-bold leading-relaxed break-keep">
               {isCustom ? matchingReport?.suitabilityVerdict : scoreCard.headline}
             </p>
          </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["ing-audit", "nut-audit", "feeding-guide"]} className="space-y-6">
        
        {/* 2. INGREDIENT AUDIT */}
        <AccordionItem value="ing-audit" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-8 hover:no-underline">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary"><Microscope size={28} /></div>
              <div className="text-left">
                <h3 className="font-black text-2xl">전성분 원재료 100% 분석</h3>
                <p className="text-sm text-muted-foreground font-medium">재료별 출처, 안전성, 영양 가치 논문 기반 평가</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-10 pt-4 space-y-8">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="찾으시는 성분이 있나요?" 
                className="pl-14 rounded-2xl h-14 border-muted bg-muted/20 font-bold"
                value={ingSearch}
                onChange={(e) => setIngSearch(e.target.value)}
              />
            </div>

            <div className="divide-y divide-muted/30 max-h-[500px] overflow-y-auto pr-3">
              {filteredIngredients.map((ing, i) => (
                <div key={i} className="py-6 flex items-start gap-5 hover:bg-muted/5 transition-colors rounded-2xl px-4">
                  <div className={cn("mt-2 w-3 h-3 rounded-full shrink-0", 
                    ing.category === 'positive' ? 'bg-success' : 
                    ing.category === 'cautionary' ? 'bg-orange-500' : 'bg-muted-foreground'
                  )} />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <p className="font-black text-xl">{ing.name}</p>
                      {ing.safetyRating && <Badge variant="outline" className="text-[10px] font-bold">{ing.safetyRating}</Badge>}
                    </div>
                    <p className="text-sm text-foreground/80 font-medium leading-relaxed">{ing.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. NUTRITIONAL AUDIT */}
        <AccordionItem value="nut-audit" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-8 hover:no-underline">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary"><PieChart size={28} /></div>
              <div className="text-left">
                <h3 className="font-black text-2xl">영양학적 데이터 상세</h3>
                <p className="text-sm text-muted-foreground font-medium">AAFCO 최소/최대 범위 정밀 비교</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-10 pt-4 space-y-10">
            <div className="grid gap-8">
              {scientificAnalysis.comparativeChart.map((item, i) => {
                const maxVal = Math.max(item.productValue, item.standardMax || 50);
                const productPct = Math.min((item.productValue / maxVal) * 100, 100);
                const minPct = (item.standardMin / maxVal) * 100;
                const maxRangePct = item.standardMax ? (item.standardMax / maxVal) * 100 : 100;

                return (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-black text-foreground">{item.nutrient}</span>
                    <span className="text-2xl font-black text-primary">{item.productValue}%</span>
                  </div>
                  <div className="relative h-6 w-full bg-muted rounded-full overflow-hidden">
                    <div className="absolute h-full bg-primary/10 border-x border-primary/20 z-0" style={{ left: `${minPct}%`, width: `${Math.max(0, maxRangePct - minPct)}%` }} />
                    <div className={cn("absolute h-full transition-all duration-1000 z-10", 
                        item.productValue < item.standardMin ? "bg-orange-500" : "bg-primary"
                      )} style={{ width: `${productPct}%` }} />
                  </div>
                </div>
              )})}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. FEEDING GUIDE */}
        <AccordionItem value="feeding-guide" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-8 hover:no-underline">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary"><Scale size={28} /></div>
              <div className="text-left">
                <h3 className="font-black text-2xl">{isCustom ? `${input.petProfile?.name} 전용 급여 가이드` : '표준 권장 급여량'}</h3>
                <p className="text-sm text-muted-foreground font-medium">활동량에 따른 정밀 급여량 계산</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-10 pt-4 space-y-8">
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 text-center space-y-2">
               <span className="text-[10px] font-black uppercase tracking-widest text-primary">Energy Density</span>
               <p className="text-4xl font-black text-primary tracking-tighter">
                 {scientificAnalysis.nutrientMass.kcal} <span className="text-sm font-bold">kcal/kg</span>
               </p>
            </div>

            <div className="rounded-[2rem] border-2 border-muted overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-muted/50 h-16">
                  <TableRow>
                    <TableHead className="font-black text-center">체중 (kg)</TableHead>
                    <TableHead className="font-black text-center">활동량 낮음</TableHead>
                    <TableHead className="font-black text-center text-primary">활동량 높음</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isCustom ? (
                    <TableRow className="h-16 bg-primary/5">
                      <TableCell className="text-center font-black">{input.petProfile?.weight}kg (아이 맞춤)</TableCell>
                      <TableCell className="text-center font-bold">
                        {Math.round((input.petProfile?.weight || 0) * 15)}g
                      </TableCell>
                      <TableCell className="text-center font-black text-primary">
                        {Math.round((input.petProfile?.weight || 0) * 25)}g
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedingGuide.feedingTable?.map((row, i) => (
                      <TableRow key={i} className="h-16">
                        <TableCell className="text-center font-bold">{row.weightRange}</TableCell>
                        <TableCell className="text-center font-bold text-muted-foreground">{row.lowActivityGrams}</TableCell>
                        <TableCell className="text-center font-black text-primary">{row.highActivityGrams}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. CORPORATE AUDIT */}
        <AccordionItem value="corporate-audit" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-8 hover:no-underline">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary"><Factory size={28} /></div>
              <div className="text-left">
                <h3 className="font-black text-2xl">회사 제조 과정 투명성</h3>
                <p className="text-sm text-muted-foreground font-medium">제조사 직접 재료 선정 및 리콜 이력</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-10 pt-4 space-y-8">
            <div className="flex flex-wrap gap-3">
              <Badge className={cn("px-6 py-3 rounded-2xl text-sm font-black border-none", 
                esgReport.transparencyStatus === 'DIRECT' ? "bg-success text-white" : "bg-orange-500 text-white")}>
                {esgReport.transparencyStatus === 'DIRECT' ? '✓ 직접 소싱 생산' : '⚠ OEM/위탁 생산'}
              </Badge>
              {esgReport.certifications.map((cert, i) => (
                <Badge key={i} variant="outline" className="px-6 py-3 rounded-2xl text-sm font-black border-2 border-primary text-primary">
                  {cert} CERTIFIED
                </Badge>
              ))}
            </div>
            <p className="text-sm font-bold leading-relaxed p-6 bg-muted/20 rounded-2xl">{esgReport.recallHistory}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-2xl border-t z-50 flex justify-center shadow-2xl">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-black text-primary">새로운 분석</Button>
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productIdentity.name)}`, '_blank')} className="flex-[2] h-16 rounded-2xl text-xl font-black shadow-xl"><ShoppingBag size={24} className="mr-3" /> 최저가 구매</Button>
        </div>
      </div>
    </div>
  );
}
