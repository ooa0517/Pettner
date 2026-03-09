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
  Share2, Search,
  Flame,
  ChevronDown,
  Gavel,
  Leaf,
  Star,
  Zap,
  ShieldCheck,
  Factory
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

  const { productIdentity, scoreCard, scientificAnalysis, esgReport, ingredientAnalysis, feedingGuide } = result;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-48 max-w-4xl mx-auto px-4">
      
      {!isPublicView && <AdBanner position="top" />}

      {/* 1. Scientific Score Header */}
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
                  V19.2 VET AUDIT
                </Badge>
              </div>
              <h1 className="text-4xl font-black tracking-tighter leading-tight">
                {productIdentity.name}
              </h1>
              <p className="text-lg text-muted-foreground font-bold">{productIdentity.brand} · {productIdentity.category}</p>
              
              <div className="p-6 rounded-[2rem] bg-muted/30 border-2 border-dashed border-muted-foreground/20">
                <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 mb-2">
                  <Star size={14} className="text-amber-500 fill-amber-500" /> 스코어 산정 기준 (수의학 논문 기반)
                </p>
                <p className="text-[11px] leading-relaxed font-medium text-foreground/70">
                  {scoreCard.scoringBasis}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center md:items-end gap-4">
               <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/30" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                      strokeDasharray={364} strokeDashoffset={364 - (364 * scoreCard.totalScore) / 100}
                      className="text-primary transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-primary">{scoreCard.totalScore}</span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase">PTS</span>
                  </div>
               </div>
               <Badge className="font-black px-6 py-2 rounded-full text-lg bg-primary/10 text-primary border-none">
                 Grade {scoreCard.grade}
               </Badge>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] border-l-8 border-primary bg-primary/5">
             <h3 className="text-xl font-black flex items-center gap-2 mb-4">
               <Stethoscope className="text-primary" size={24}/> 수의학적 정밀 진단
             </h3>
             <p className="text-lg font-bold leading-relaxed break-keep">
               {scoreCard.headline}
             </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {scoreCard.statusTags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="px-4 py-2 rounded-2xl font-bold bg-muted text-foreground/80">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["ing-audit", "nut-audit", "feeding-guide"]} className="space-y-6">
        
        {/* 2. 100% Ingredient Analysis */}
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
                placeholder="찾으시는 성분이 있나요? (예: 닭고기, 타우린...)" 
                className="pl-14 rounded-2xl h-14 border-muted bg-muted/20 font-bold"
                value={ingSearch}
                onChange={(e) => setIngSearch(e.target.value)}
              />
            </div>

            <div className="divide-y divide-muted/30 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
              {filteredIngredients.length > 0 ? filteredIngredients.map((ing, i) => (
                <div key={i} className="py-6 flex items-start gap-5 hover:bg-muted/5 transition-colors rounded-2xl px-4">
                  <div className={cn("mt-2 w-3 h-3 rounded-full shrink-0", 
                    ing.category === 'positive' ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 
                    ing.category === 'cautionary' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]' : 'bg-muted-foreground'
                  )} />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <p className="font-black text-xl">{ing.name}</p>
                      {ing.safetyRating && <Badge variant="outline" className="text-[10px] font-bold border-muted-foreground/20 text-muted-foreground">{ing.safetyRating}</Badge>}
                    </div>
                    <p className="text-sm text-foreground/80 font-medium leading-relaxed">{ing.reason}</p>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center text-muted-foreground font-bold">검색 결과가 없습니다.</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t">
              <div className="space-y-4">
                <h4 className="font-black text-sm text-success flex items-center gap-2">
                  <CheckCircle2 size={18}/> 급여 권장 리스트
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ingredientAnalysis.suitabilityAudit.suitableFor.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-success/10 px-4 py-2.5 rounded-2xl border border-success/20">
                      <span className="text-xs font-bold text-success">✓ {item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-black text-sm text-orange-500 flex items-center gap-2">
                  <AlertCircle size={18}/> 주의 및 부적합 리스트
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ingredientAnalysis.suitabilityAudit.notSuitableFor.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-orange-500/10 px-4 py-2.5 rounded-2xl border border-orange-500/20">
                      <span className="text-xs font-bold text-orange-500">⚠ {item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. AAFCO Standards Chart */}
        <AccordionItem value="nut-audit" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-8 hover:no-underline">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary"><PieChart size={28} /></div>
              <div className="text-left">
                <h3 className="font-black text-2xl">영양학적 데이터 상세</h3>
                <p className="text-sm text-muted-foreground font-medium">AAFCO 최소/최대 범위 정밀 비교 그래프</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-10 pt-4 space-y-10">
            <div className="grid gap-8">
              {(result.scientificAnalysis.comparativeChart || []).map((item, i) => {
                const maxVal = Math.max(item.productValue, item.standardMax || 60);
                const productPct = Math.min((item.productValue / maxVal) * 100, 100);
                const minPct = (item.standardMin / maxVal) * 100;
                const maxRangePct = item.standardMax ? (item.standardMax / maxVal) * 100 : 100;

                return (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-lg font-black text-foreground">{item.nutrient}</span>
                      <p className="text-[11px] text-muted-foreground font-bold">권장 범위: {item.standardMin}% {item.standardMax ? `~ ${item.standardMax}%` : '이상'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-primary">{item.productValue}%</span>
                    </div>
                  </div>
                  
                  <div className="relative h-8 w-full bg-muted rounded-full overflow-hidden border border-muted-foreground/10">
                    <div className="absolute h-full bg-primary/10 border-x border-primary/20 z-0" style={{ left: `${minPct}%`, width: `${Math.max(0, maxRangePct - minPct)}%` }} />
                    <div className={cn("absolute h-full transition-all duration-1000 z-10 flex items-center justify-end pr-3", 
                        item.productValue < item.standardMin ? "bg-orange-500" : "bg-primary"
                      )} style={{ width: `${productPct}%` }}>
                       {item.productValue < item.standardMin && <AlertCircle size={16} className="text-white" />}
                    </div>
                  </div>
                </div>
              )})}
            </div>

            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
              <h4 className="font-black text-sm text-primary mb-3 flex items-center gap-2">
                <Stethoscope size={16} /> 수의학적 전문가 소견 (Nutr Rev Pet, 2023)
              </h4>
              <p className="text-sm font-bold leading-relaxed">{result.veterinaryAdvice}</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Feeding Guide Table */}
        <AccordionItem value="feeding-guide" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-8 hover:no-underline">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary"><Scale size={28} /></div>
              <div className="text-left">
                <h3 className="font-black text-2xl">Kg 당 급여량 & Kcal 계산</h3>
                <p className="text-sm text-muted-foreground font-medium">체중별 권장 칼로리 및 정밀 급여량 (AVMA J, 2022)</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-10 pt-4 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex flex-col items-center justify-center text-center">
                 <div className="flex items-center gap-2 text-primary mb-2">
                   <Flame size={20} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Energy Density</span>
                 </div>
                 <p className="text-4xl font-black text-primary tracking-tighter">
                   {scientificAnalysis.nutrientMass.kcal} <span className="text-sm font-bold">kcal/kg</span>
                 </p>
              </div>
              <div className="p-8 bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-muted flex flex-col justify-center">
                <h4 className="font-black text-sm mb-2 flex items-center gap-2">
                  <Leaf size={16} className="text-success"/> 제품 급여 목적
                </h4>
                <p className="text-sm font-bold leading-relaxed">{feedingGuide.productPurpose}</p>
              </div>
            </div>

            {feedingGuide.feedingTable && (
              <div className="rounded-[2rem] border-2 border-muted overflow-hidden bg-white shadow-inner">
                <Table>
                  <TableHeader className="bg-muted/50 h-16">
                    <TableRow>
                      <TableHead className="font-black text-center">체중 (kg)</TableHead>
                      <TableHead className="font-black text-center">급여량 (g)</TableHead>
                      <TableHead className="font-black text-center text-primary">총 Kcal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedingGuide.feedingTable.map((row, i) => (
                      <TableRow key={i} className="h-16">
                        <TableCell className="text-center font-bold">{row.weightRange}</TableCell>
                        <TableCell className="text-center font-bold text-muted-foreground">{row.lowActivityGrams} ~ {row.highActivityGrams}</TableCell>
                        <TableCell className="text-center font-black text-primary">{row.totalKcalRange}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 5. Brand Integrity */}
        <AccordionItem value="corporate-audit" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-8 hover:no-underline">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary"><Factory size={28} /></div>
              <div className="text-left">
                <h3 className="font-black text-2xl">회사 제조 과정 투명성</h3>
                <p className="text-sm text-muted-foreground font-medium">제조사 직접 재료 선정 및 리콜 이력 감사</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-muted/20 rounded-[2.5rem] space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground"><History size={20} /><h4 className="font-black text-sm">리콜 및 안전 기록</h4></div>
                <p className="text-sm font-bold leading-relaxed">{esgReport.recallHistory}</p>
              </div>
              <div className="p-8 bg-muted/20 rounded-[2.5rem] space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck size={20} /><h4 className="font-black text-sm">환경 및 윤리 경영</h4></div>
                <p className="text-sm font-bold leading-relaxed">{esgReport.environmental}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {!isPublicView && <AdBanner position="bottom" />}

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-2xl border-t z-50 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-black text-primary"><ChevronDown size={20} className="mr-2" /> 새로운 분석</Button>
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(productIdentity.name)}`, '_blank')} className="flex-[2] h-16 rounded-2xl text-xl font-black shadow-xl"><ShoppingBag size={24} className="mr-3" /> 최저가 구매</Button>
        </div>
      </div>
    </div>
  );
}
