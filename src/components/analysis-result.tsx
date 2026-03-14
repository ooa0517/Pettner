
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, AlertCircle, 
  Stethoscope, Microscope, 
  PieChart, Scale,
  CheckCircle2,
  Search,
  Factory,
  Target,
  Bot,
  ThumbsUp,
  Beef,
  Zap,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  ChartContainer,
  ChartRadar,
  ChartRadarChart,
  ChartPolarGrid,
  ChartPolarAngleAxis,
} from "@/components/ui/chart";
import AdBanner from '@/components/ad-banner';

type AnalysisResultProps = {
  result: any; // Flexible for A/B output
  input: any;
  onReset: () => void;
  resetButtonText?: string;
  isPublicView?: boolean;
};

export default function AnalysisResult({ result, input, onReset, isPublicView = false }: AnalysisResultProps) {
  const [ingSearch, setIngSearch] = useState('');
  const mode = input.analysisMode; // 'general' or 'custom'
  const category = input.productCategory || result.productIdentity?.category?.toLowerCase() || 'food';

  const filteredIngredients = useMemo(() => {
    const list = mode === 'general' ? result.ingredientAnalysis : result.matchingReport?.ingredientAnalysis;
    if (!list) return [];
    if (!ingSearch) return list;
    return list.filter((ing: any) => ing.name.toLowerCase().includes(ingSearch.toLowerCase()));
  }, [result, mode, ingSearch]);

  if (!result || result.status === 'error') {
    return (
      <div className="space-y-8 py-20 text-center">
        <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-30"/>
        <h1 className="text-3xl font-black">분석 실패</h1>
        <p className="text-muted-foreground">데이터를 불러오는 중 오류가 발생했습니다.</p>
        <Button onClick={onReset}>다시 시도</Button>
      </div>
    );
  }

  // --- Rendering Helpers ---

  const renderModeASummary = () => (
    <div className="space-y-6">
      <div className={cn("p-8 rounded-[2.5rem] border-l-8 border-success bg-success/5")}>
        <h3 className="text-xl font-black flex items-center gap-2 mb-4">
          <Microscope className="text-success" size={24}/> 제품 팩트 체크 판정
        </h3>
        <p className="text-2xl font-black leading-tight tracking-tight break-keep">
          "{result.summary?.headline}"
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20">
          <h4 className="font-black text-sm text-blue-600 flex items-center gap-2 mb-3"><ThumbsUp size={16}/> Best Target</h4>
          <div className="flex flex-wrap gap-2">
            {result.summary?.bestFor?.map((t: string, i: number) => <Badge key={i} variant="secondary" className="bg-white">{t}</Badge>)}
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-destructive/5 border border-destructive/20">
          <h4 className="font-black text-sm text-destructive flex items-center gap-2 mb-3"><AlertTriangle size={16}/> Worst Target</h4>
          <div className="flex flex-wrap gap-2">
            {result.summary?.worstFor?.map((t: string, i: number) => <Badge key={i} variant="outline" className="text-destructive border-destructive/30">{t}</Badge>)}
          </div>
        </div>
      </div>
    </div>
  );

  const renderModeBSummary = () => (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/20" />
            <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" 
              strokeDasharray={465} strokeDashoffset={465 - (465 * result.matchingReport?.matchScore) / 100}
              className="text-primary transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-primary">{result.matchingReport?.matchScore}%</span>
            <span className="text-[10px] font-black text-muted-foreground uppercase">Matching Score</span>
          </div>
        </div>
        <Badge className="bg-primary text-white font-black px-6 py-2 rounded-full text-lg">
          {input.petProfile?.name}을 위한 1:1 맞춤 진단
        </Badge>
      </div>
      <div className="p-8 rounded-[2.5rem] bg-primary/5 border-l-8 border-primary space-y-4">
        <h3 className="text-xl font-black flex items-center gap-2 text-primary"><Stethoscope size={24}/> 수의학적 맞춤 소견</h3>
        <p className="text-lg font-bold leading-relaxed text-foreground/90 break-keep">
          {result.matchingReport?.suitabilityVerdict}
        </p>
      </div>
    </div>
  );

  const renderCategorySpec = () => {
    if (category === 'food') {
      const chartConfig = {
        value: { label: "제품 함량", color: "hsl(var(--primary))" },
        standard: { label: "AAFCO 표준", color: "hsl(var(--muted-foreground))" }
      };
      return (
        <div className="space-y-6">
          <h3 className="font-black text-2xl flex items-center gap-2"><TrendingUp className="text-primary"/> 영양 밸런스 헥사곤</h3>
          <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig}>
              <ChartRadarChart data={result.nutritionalAnalysis?.radarData || []}>
                <ChartPolarGrid />
                <ChartPolarAngleAxis dataKey="nutrient" />
                <ChartRadar name="standard" dataKey="standard" stroke="var(--color-standard)" fill="var(--color-standard)" fillOpacity={0.1} />
                <ChartRadar name="value" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.5} />
              </ChartRadarChart>
            </ChartContainer>
          </div>
          <p className="text-center text-xs text-muted-foreground font-medium italic">※ AAFCO/FEDIAF 권장 가이드라인 대비 탄/단/지/무기질 비율</p>
        </div>
      );
    }
    if (category === 'treat') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="font-black text-2xl flex items-center gap-2 text-destructive"><AlertCircle/> 첨가물 & 칼로리 경고장</h3>
            <p className="text-xl font-black text-primary">{result.nutritionalAnalysis?.caloriePerUnit} / 1개</p>
          </div>
          <div className="grid gap-3">
            {result.nutritionalAnalysis?.additiveWarnings?.map((w: any, i: number) => (
              <div key={i} className="p-5 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-start gap-4">
                <div className={cn("mt-1.5 w-3 h-3 rounded-full shrink-0", w.riskLevel === 'high' ? "bg-destructive" : "bg-orange-500")} />
                <div className="space-y-1">
                  <p className="font-black text-destructive text-lg">{w.name}</p>
                  <p className="text-sm font-medium text-foreground/70">{w.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (category === 'supplement') {
      return (
        <div className="space-y-6">
          <h3 className="font-black text-2xl flex items-center gap-2 text-primary"><Zap/> 유효 성분 집중 타격</h3>
          <div className="grid gap-6">
            {result.nutritionalAnalysis?.activeIngredients?.map((item: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between font-black">
                  <span>{item.name}</span>
                  <span className="text-primary">{item.amount}</span>
                </div>
                <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-1000" style={{ width: '80%' }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                  <span>Target: {item.recommended}</span>
                  <span>Status: {item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const renderFeedingGuide = () => {
    const guide = result.personalizedFeedingGuide;
    if (!guide) return null;

    return (
      <div className="space-y-6">
        <h3 className="font-black text-2xl flex items-center gap-2"><Scale className="text-primary"/> 카테고리별 정밀 처방</h3>
        <Card className="border-none shadow-xl bg-primary/5 rounded-[2.5rem]">
          <CardContent className="p-8 space-y-6">
            {category === 'food' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl text-center space-y-1 shadow-sm">
                  <p className="text-xs font-black text-muted-foreground uppercase">Daily Grams</p>
                  <p className="text-3xl font-black text-primary">{guide.dailyGrams}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl text-center space-y-1 shadow-sm">
                  <p className="text-xs font-black text-muted-foreground uppercase">Per Meal</p>
                  <p className="text-3xl font-black text-primary">{guide.perMealGrams}</p>
                </div>
                <div className="col-span-2 text-center py-2">
                  <p className="text-sm font-bold text-primary/70">{guide.kcalInstruction}</p>
                </div>
              </div>
            )}
            {category === 'treat' && (
              <div className="space-y-4">
                <div className="bg-white p-8 rounded-3xl text-center shadow-sm border-2 border-primary/20">
                  <p className="text-xs font-black text-muted-foreground uppercase mb-2">10% Rule Limit</p>
                  <p className="text-4xl font-black text-primary mb-2">하루 최대 {guide.maxUnitsPerDay}</p>
                  <p className="text-sm font-bold text-destructive">{guide.ruleOf10PercentMsg}</p>
                </div>
              </div>
            )}
            {category === 'supplement' && (
              <div className="space-y-4">
                <div className="bg-white p-8 rounded-3xl text-center shadow-sm">
                  <p className="text-xs font-black text-muted-foreground uppercase mb-2">Daily Dosage</p>
                  <p className="text-4xl font-black text-primary">하루 {guide.dosage}</p>
                  <Badge className="mt-2 bg-muted text-foreground border-none font-bold uppercase">{guide.dosageUnit}</Badge>
                </div>
                <p className="text-center text-xs font-bold text-destructive flex items-center justify-center gap-2">
                  <AlertCircle size={14}/> {guide.sideEffectWarning}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFulfillmentBriefing = () => {
    const briefing = result.fulfillmentBriefing;
    if (!briefing) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-success/5 border border-success/20">
          <h4 className="font-black text-lg text-success flex items-center gap-2 mb-4"><CheckCircle2/> 충족되는 영양</h4>
          <ul className="space-y-2">
            {briefing.pros?.map((p: string, i: number) => (
              <li key={i} className="text-sm font-bold text-foreground/70 flex items-start gap-2">
                <span className="text-success mt-1">•</span> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-8 rounded-[2.5rem] bg-orange-500/5 border border-orange-500/20">
          <h4 className="font-black text-lg text-orange-600 flex items-center gap-2 mb-4"><TrendingUp/> 추가 필요 보충</h4>
          <ul className="space-y-2">
            {briefing.cons?.map((c: string, i: number) => (
              <li key={i} className="text-sm font-bold text-foreground/70 flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span> {c}
              </li>
            ))}
          </ul>
          <Button variant="link" className="mt-4 p-0 h-auto text-orange-600 font-black flex items-center gap-1 group">
            추천 보조제 확인하기 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-48 max-w-4xl mx-auto px-4">
      
      {!isPublicView && <AdBanner position="top" />}

      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardContent className="p-10 space-y-10">
          <div className="flex flex-col md:flex-row gap-8">
            {input.photoDataUri && (
              <div className="w-full md:w-1/3">
                <img src={input.photoDataUri} alt="Product" className="rounded-3xl w-full h-auto object-cover aspect-[3/4] shadow-lg"/>
              </div>
            )}
            <div className="flex flex-col justify-between flex-1">
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Badge className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase", mode === 'general' ? "bg-success" : "bg-primary")}>
                            {mode === 'general' ? 'PETTNER AUDIT A' : 'PERSONAL MATCHING'}
                        </Badge>
                        <Badge variant="outline" className="px-4 py-1.5 rounded-full text-[10px] font-black border-muted text-muted-foreground uppercase">
                            V23.0 CORE ENGINE
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter leading-tight">
                        {input.productName || result.productIdentity?.name}
                    </h1>
                    <p className="text-lg text-muted-foreground font-bold">{result.productIdentity?.brand} · {result.productIdentity?.category}</p>
                </div>
            </div>
          </div>

          <Separator />

          {/* Main Top Section: Match Score or Fact Headline */}
          {mode === 'general' ? renderModeASummary() : renderModeBSummary()}

          {/* Dynamic Spec View based on Category */}
          {renderCategorySpec()}

          {/* Customized Feeding Guide for Mode B */}
          {mode === 'custom' && renderFeedingGuide()}

          {/* Fulfillment Briefing for Mode B */}
          {mode === 'custom' && renderFulfillmentBriefing()}
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["ing-audit", "corporate-audit"]} className="space-y-6">
        
        <AccordionItem value="ing-audit" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-8 hover:no-underline">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary"><Microscope size={28} /></div>
              <div className="text-left">
                <h3 className="font-black text-2xl">전성분 원재료 100% 분석</h3>
                <p className="text-sm text-muted-foreground font-medium">안전성 및 영양 가치 신호등 평가</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-10 pt-4 space-y-8">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="성분 검색..." 
                className="pl-14 rounded-2xl h-14 border-muted bg-muted/20 font-bold"
                value={ingSearch}
                onChange={(e) => setIngSearch(e.target.value)}
              />
            </div>

            <div className="divide-y divide-muted/30 max-h-[500px] overflow-y-auto pr-3">
              {filteredIngredients.map((ing: any, i: number) => (
                <div key={i} className="py-6 flex items-start gap-5 hover:bg-muted/5 transition-colors rounded-2xl px-4">
                  <div className={cn("mt-2 w-3 h-3 rounded-full shrink-0", 
                    ing.category === 'positive' ? 'bg-success' : 
                    ing.category === 'cautionary' ? 'bg-orange-500' : 'bg-muted-foreground'
                  )} />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <p className="font-black text-xl">{ing.name}</p>
                      {ing.safetyRating && <Badge variant="outline" className="text-[10px] font-bold uppercase">{ing.safetyRating}</Badge>}
                    </div>
                    <p className="text-sm text-foreground/80 font-medium leading-relaxed">{ing.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="corporate-audit" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-8 hover:no-underline">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary"><Factory size={28} /></div>
              <div className="text-left">
                <h3 className="font-black text-2xl">제조사 투명성 및 리콜 이력</h3>
                <p className="text-sm text-muted-foreground font-medium">직접 생산 여부 및 국제 인증 감사</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-10 pt-4 space-y-8">
            <div className="flex flex-wrap gap-3">
              <Badge className={cn("px-6 py-3 rounded-2xl text-sm font-black border-none shadow-sm", 
                result.esgReport?.transparencyStatus === 'DIRECT' ? "bg-success text-white" : "bg-orange-500 text-white")}>
                {result.esgReport?.transparencyStatus === 'DIRECT' ? '✓ 직접 원료 소싱 및 생산' : '⚠ 위탁(OEM) 생산 방식'}
              </Badge>
              {result.esgReport?.certifications?.map((cert: string, i: number) => (
                <Badge key={i} variant="outline" className="px-6 py-3 rounded-2xl text-sm font-black border-2 border-primary text-primary">
                  {cert} 인증
                </Badge>
              ))}
            </div>
            <div className="p-6 bg-muted/20 rounded-2xl space-y-2">
               <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">이슈 팩트 체크</p>
               <p className="text-sm font-bold leading-relaxed">{result.esgReport?.recallHistory || '최근 5년 내 중대한 리콜 이력 없음'}</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-2xl border-t z-50 flex justify-center shadow-2xl">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-black text-primary">새로운 분석 시작</Button>
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(input.productName || result.productIdentity?.name)}`, '_blank')} className="flex-[2] h-16 rounded-2xl text-xl font-black shadow-xl"><ShoppingBag size={24} className="mr-3" /> 최저가 확인</Button>
        </div>
      </div>
    </div>
  );
}

import { Separator } from '@/components/ui/separator';
