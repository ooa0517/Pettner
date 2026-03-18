
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, AlertCircle, 
  Stethoscope, Microscope, 
  Scale, ThumbsUp, AlertTriangle,
  TrendingUp, Globe, UtensilsCrossed,
  Activity, Factory, Search, Share2,
  ArrowLeft, Droplets, Clock, ShieldCheck,
  Zap, Info, Cat, Dog, Battery,
  Wind, InfoIcon, ChevronDown, ChevronUp
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

type AnalysisResultProps = {
  result: any;
  input: any;
  onReset: () => void;
  isPublicView?: boolean;
};

export default function AnalysisResult({ result, input, onReset, isPublicView = false }: AnalysisResultProps) {
  const [ingSearch, setIngSearch] = useState('');
  const { toast } = useToast();
  const mode = input.analysisMode;
  const category = input.productCategory || result.productIdentity?.category?.toLowerCase() || 'food';

  const filteredIngredients = useMemo(() => {
    const list = result.ingredientAnalysis || [];
    if (!ingSearch) return list;
    return list.filter((ing: any) => ing.name.toLowerCase().includes(ingSearch.toLowerCase()));
  }, [result, ingSearch]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Pettner - ${result.productIdentity?.name} 분석 리포트`,
        text: `${result.productIdentity?.name}의 정밀 분석 결과를 확인해보세요!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "링크 복사 완료", description: "리포트 주소가 클립보드에 복사되었습니다." });
    }
  };

  if (!result || result.status === 'error') {
    return (
      <div className="space-y-8 py-20 text-center">
        <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-30"/>
        <h1 className="text-3xl font-black">분석 실패</h1>
        <p className="text-muted-foreground">데이터를 불러오는 중 오류가 발생했습니다.</p>
        <Button onClick={onReset} className="rounded-full px-8">다시 시도</Button>
      </div>
    );
  }

  // --- RENDERING HELPERS FOR TYPE A (PRODUCT AUDIT) ---

  const renderSectionHeader = (title: string, icon: React.ReactNode, subtitle?: string) => (
    <div className="space-y-1 mb-6">
      <h3 className="text-2xl font-black flex items-center gap-3">
        <span className="p-2 bg-primary/10 rounded-xl text-primary">{icon}</span>
        {title}
      </h3>
      {subtitle && <p className="text-sm font-medium text-muted-foreground ml-14">{subtitle}</p>}
    </div>
  );

  const renderMeatCarbTracker = () => {
    const data = result.meatCarbRatio;
    if (!data) return null;
    return (
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden border-2 border-primary/5">
        <CardContent className="p-8 md:p-10 space-y-8">
          {renderSectionHeader("진짜 고기 vs 탄수화물 비율", <Scale size={24} />, "사료 회사가 숨기는 '잉여 탄수화물' 역산 결과")}
          
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-2">
              <div className="text-center flex-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Protein (Meat)</p>
                <p className="text-3xl font-black text-rose-500">{data.proteinPct}%</p>
              </div>
              <div className="h-10 w-px bg-muted mx-4" />
              <div className="text-center flex-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Net Carbohydrates</p>
                <p className="text-3xl font-black text-amber-500">{data.carbPct}%</p>
              </div>
            </div>
            
            <div className="relative h-6 w-full bg-muted rounded-full overflow-hidden flex shadow-inner">
              <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${data.proteinPct}%` }} />
              <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${data.carbPct}%` }} />
            </div>

            <div className="p-6 bg-muted/30 rounded-[2rem] border border-dashed border-muted-foreground/20">
              <p className="text-sm font-bold leading-relaxed text-foreground/80 break-keep">
                <Zap size={16} className="inline mr-2 text-primary fill-primary" />
                {data.commentary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWasteOdorForecast = () => {
    const data = result.wasteAndOdorForecast;
    if (!data) return null;
    return (
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <CardContent className="p-8 md:p-10 space-y-8">
          {renderSectionHeader("섭취 후 배변 & 체취 예측", <Activity size={24} />, "성분 조합으로 미리 보는 우리 아이 컨디션")}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 rounded-lg text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 15a10 10 0 0 0 10 0"/><path d="M2 12a10 10 0 0 1 20 0"/><path d="M7 9h.01"/><path d="M17 9h.01"/></svg>
                </div>
                <span className="font-black text-sm text-amber-700">예상 배변 상태</span>
              </div>
              <p className="text-sm font-bold text-foreground/80 leading-relaxed">{data.stoolCondition}</p>
            </div>

            <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500 rounded-lg text-white">
                  <Wind size={20} />
                </div>
                <span className="font-black text-sm text-blue-700">체취 및 변 냄새</span>
              </div>
              <p className="text-sm font-bold text-foreground/80 leading-relaxed">{data.odorLevel}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium italic ml-2">※ {data.reasoning}</p>
        </CardContent>
      </Card>
    );
  };

  const renderSatietyIndex = () => {
    const data = result.satietyIndex;
    if (!data) return null;
    return (
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <CardContent className="p-8 md:p-10 space-y-8">
          {renderSectionHeader("포만감 지속 지수", <Battery size={24} />, "다이어트 및 공복 칭얼거림 예측 지표")}
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32 shrink-0">
              <div className={cn(
                "absolute inset-0 rounded-full border-[10px] border-muted",
                data.level === 'HIGH' ? "border-success/20" : data.level === 'NORMAL' ? "border-primary/20" : "border-rose-500/20"
              )} />
              <div className={cn(
                "absolute inset-0 flex flex-col items-center justify-center",
                data.level === 'HIGH' ? "text-success" : data.level === 'NORMAL' ? "text-primary" : "text-rose-500"
              )}>
                <Battery size={32} className="mb-1" />
                <span className="font-black text-xl">{data.level}</span>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <Badge className={cn(
                "px-4 py-1.5 rounded-full font-black text-xs",
                data.level === 'HIGH' ? "bg-success" : data.level === 'NORMAL' ? "bg-primary" : "bg-rose-500"
              )}>
                지속력: {data.durationLabel}
              </Badge>
              <p className="text-base font-bold text-foreground/80 leading-relaxed break-keep">
                {data.analysis}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMarketRiskRadar = () => {
    const data = result.marketAndRisk;
    if (!data) return null;
    return (
      <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden">
        <CardContent className="p-10 space-y-10">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <Globe className="text-blue-400" /> 스마트 리스크 레이더
              </h3>
              <p className="text-xs text-slate-400 font-medium">글로벌 리콜 및 제조사 투명성 실시간 대조</p>
            </div>
            {data.cleanMark && (
              <div className="flex flex-col items-center gap-1">
                <div className="p-3 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-[10px] font-black text-blue-400 uppercase">Clean Mark</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest">
                <Scale size={14} /> 시장 가성비 분석
              </div>
              <p className="text-xl font-black">{data.priceEfficiency}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest">
                <Factory size={14} /> 제조사 신뢰도
              </div>
              <p className="text-xl font-black">{data.manufacturerTrust}</p>
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-widest">
              <AlertTriangle size={14} /> 글로벌 리스크 & 논란
            </div>
            <p className="text-sm font-bold leading-relaxed text-slate-200 break-keep">
              {data.globalRiskRadar}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderNutritionalRadar = () => {
    if (category !== 'food' || !result.nutritionalAnalysis?.radarData) return null;
    const chartConfig = {
      value: { label: "제품 함량", color: "hsl(var(--primary))" },
      standardAAFCO: { label: "AAFCO 기준", color: "hsl(45, 100%, 50%)" },
      standardFEDIAF: { label: "FEDIAF 기준", color: "hsl(210, 100%, 50%)" }
    };
    return (
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <CardContent className="p-8 md:p-10 space-y-8">
          <div className="flex justify-between items-end">
            {renderSectionHeader("영양 밸런스 헥사곤", <TrendingUp size={24} />, "AAFCO/FEDIAF 글로벌 표준 대조 결과")}
            <div className="flex gap-3 text-[10px] font-bold mb-6">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"/> 제품</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"/> AAFCO</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> FEDIAF</div>
            </div>
          </div>
          <div className="h-[380px] w-full bg-muted/10 rounded-[3rem] p-6 relative">
            <ChartContainer config={chartConfig}>
              <ChartRadarChart data={result.nutritionalAnalysis.radarData}>
                <ChartPolarGrid strokeOpacity={0.1} />
                <ChartPolarAngleAxis dataKey="nutrient" className="font-black text-[11px] fill-muted-foreground" />
                <ChartRadar name="standardAAFCO" dataKey="standardAAFCO" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.05} />
                <ChartRadar name="standardFEDIAF" dataKey="standardFEDIAF" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} />
                <ChartRadar name="value" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.4} strokeWidth={3} />
              </ChartRadarChart>
            </ChartContainer>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase">영양 밀도 스코어</p>
                <p className="text-2xl font-black text-primary">{result.nutritionalAnalysis?.nutritionalDensityScore}점</p>
             </div>
             <div className="p-4 bg-muted/30 rounded-2xl border border-muted/50 text-center flex items-center justify-center">
                <p className="text-xs font-bold text-muted-foreground break-keep">부피 대비 영양소 농축도 분석</p>
             </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // --- MAIN RENDER ---

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-48 max-w-4xl mx-auto px-4">
      
      {!isPublicView && <AdBanner position="top" />}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={isPublicView ? () => window.history.back() : onReset} className="rounded-full font-bold gap-2">
          <ArrowLeft size={18}/> {isPublicView ? '돌아가기' : '새로운 분석'}
        </Button>
        <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full h-12 w-12 border-muted hover:bg-muted/50 shadow-sm">
          <Share2 size={20} className="text-muted-foreground" />
        </Button>
      </div>

      {/* 1. 제품 요약 & AI 총평 */}
      <Card className="border-none shadow-2xl rounded-[4rem] bg-white overflow-hidden">
        <CardContent className="p-12 space-y-10">
          <div className="flex flex-col md:flex-row gap-12">
            {input.photoDataUri && (
              <div className="w-full md:w-[35%] shrink-0">
                <img src={input.photoDataUri} alt="Product" className="rounded-[3rem] w-full h-auto object-cover aspect-[3/4] shadow-2xl border-[10px] border-muted/30"/>
              </div>
            )}
            <div className="flex flex-col justify-center flex-1 space-y-6">
                <Badge className={cn("w-fit px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm", mode === 'general' ? "bg-success" : "bg-primary")}>
                    {mode === 'general' ? 'TYPE A: PRODUCT AUDIT' : 'TYPE B: PERSONAL MATCHING'}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] text-foreground break-keep">
                    {input.productName || result.productIdentity?.name}
                </h1>
                <div className="p-8 rounded-[2.5rem] border-l-8 border-primary bg-primary/5 shadow-inner">
                  <p className="text-xl md:text-2xl font-black leading-tight tracking-tight break-keep text-foreground/90">
                    "{result.summary?.headline}"
                  </p>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {mode === 'general' ? (
        <div className="space-y-12">
          {/* 2. 진짜 고기 vs 탄수화물 비율 추적기 */}
          {renderMeatCarbTracker()}

          {/* 3. 영양 밸런스 헥사곤 */}
          {renderNutritionalRadar()}

          {/* 4. 섭취 후 배변 & 체취 예측 */}
          {renderWasteOdorForecast()}

          {/* 5. 전성분 100% 현미경 감사 + 대중 알러지 통계 */}
          <Accordion type="multiple" defaultValue={["ing-audit"]} className="space-y-8">
            <AccordionItem value="ing-audit" className="border-none shadow-2xl rounded-[3.5rem] bg-white overflow-hidden">
              <AccordionTrigger className="px-12 py-12 hover:no-underline">
                <div className="flex items-center gap-6 text-left">
                  <div className="p-6 bg-primary/10 rounded-[2rem] text-primary"><Microscope size={36} /></div>
                  <div>
                    <h3 className="font-black text-2xl tracking-tight">전성분 현미경 감사 & 알러지 통계</h3>
                    <p className="text-sm text-muted-foreground font-medium">국내외 통계 데이터 기반 성분 리스크 대조</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-12 pb-16 pt-4 space-y-12">
                <div className="relative">
                  <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                  <Input placeholder="찾으시는 성분이 있나요?" className="pl-20 rounded-[2rem] h-20 bg-muted/20 border-none text-xl font-bold shadow-inner" value={ingSearch} onChange={(e) => setIngSearch(e.target.value)} />
                </div>
                <div className="divide-y divide-muted/30 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
                  {filteredIngredients.map((ing: any, i: number) => (
                    <div key={i} className="py-10 flex items-start gap-8 group">
                      <div className={cn("mt-2.5 w-5 h-5 rounded-full shrink-0 shadow-lg", ing.category === 'positive' ? 'bg-success ring-4 ring-success/10' : ing.category === 'cautionary' ? 'bg-rose-500 ring-4 ring-rose-500/10' : 'bg-muted-foreground/50')} />
                      <div className="space-y-3">
                        <p className="font-black text-3xl group-hover:text-primary transition-colors tracking-tight">{ing.name}</p>
                        <p className="text-lg text-foreground/70 font-medium leading-relaxed break-keep">{ing.reason}</p>
                        {ing.allergyStat && (
                          <Badge variant="outline" className="bg-rose-500/5 text-rose-500 border-rose-500/20 font-black text-xs px-3 py-1 rounded-lg">
                            ⚠️ 알러지 통계: {ing.allergyStat}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* 6. 포만감 지속 지수 */}
          {renderSatietyIndex()}

          {/* 7. 최하단: 스마트 컨슈머 & 리스크 레이더 */}
          {renderMarketRiskRadar()}
        </div>
      ) : (
        /* Analyzer B UI (기존 기능 유지하되 위계 조정) */
        <div className="space-y-12">
           <Card className="border-none shadow-2xl rounded-[4rem] bg-white p-12 space-y-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-muted/20" />
                    <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="14" fill="transparent" 
                      strokeDasharray={502} strokeDashoffset={502 - (502 * (result.matchingReport?.matchScore || 0)) / 100}
                      className="text-primary transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-primary tracking-tighter">{result.matchingReport?.matchScore}</span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Matching Score</span>
                  </div>
                </div>
                <Badge className="bg-primary text-white font-black px-6 py-2 rounded-full text-lg shadow-xl shadow-primary/20">
                  {input.petProfile?.name || '우리 아이'} 맞춤 리포트
                </Badge>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-primary/5 border-l-8 border-primary space-y-4">
                <h3 className="text-xl font-black flex items-center gap-2 text-primary"><Stethoscope size={24}/> 주치의 핵심 소견</h3>
                <p className="text-lg font-bold leading-relaxed text-foreground/90 break-keep">{result.matchingReport?.suitabilityVerdict}</p>
              </div>
           </Card>
           
           <Card className="border-none shadow-xl bg-primary/5 rounded-[2.5rem] p-10 space-y-8 text-center">
              <h3 className="font-black text-2xl flex items-center justify-center gap-2"><Scale className="text-primary"/> 정밀 급여 처방</h3>
              {category === 'food' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/10"><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">1일 권장량</p><p className="text-3xl font-black text-primary tracking-tighter">{result.personalizedFeedingGuide?.dailyGrams}</p></div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/10"><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">1회 급여량</p><p className="text-3xl font-black text-primary tracking-tighter">{result.personalizedFeedingGuide?.perMealGrams}</p></div>
                </div>
              )}
              <p className="text-sm font-bold text-primary/70 bg-white/50 py-3 rounded-2xl border border-dashed border-primary/20">{result.personalizedFeedingGuide?.kcalInstruction}</p>
           </Card>

           {/* Type B용 제품 교체 스케줄 추가 */}
           {result.riskAndTransition?.transitionSchedule && (
             <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-10 space-y-6">
                <h3 className="font-black text-2xl flex items-center gap-3"><Clock className="text-primary"/> 7일 안전 제품 교체 스케줄</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {result.riskAndTransition.transitionSchedule.map((item: any, i: number) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-2xl text-center space-y-1">
                      <p className="text-[10px] font-black text-primary uppercase">{item.day}</p>
                      <p className="font-black text-sm">{item.ratio}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                  <p className="text-xs font-bold text-amber-700 flex items-center gap-2">
                    <Info size={14}/> {result.riskAndTransition.expectedStoolChanges}
                  </p>
                </div>
             </Card>
           )}

           {/* 강제 음수량 가이드 (특히 고양이에게 중요) */}
           {result.behavioralForecast?.mandatoryWaterIntake && (
             <Card className="border-none shadow-xl bg-blue-500 rounded-[2.5rem] p-10 text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-2xl"><Droplets size={28}/></div>
                  <h3 className="font-black text-2xl">필수 강제 음수량 처방</h3>
                </div>
                <p className="text-4xl font-black tracking-tighter">{result.behavioralForecast.mandatoryWaterIntake.ml}</p>
                <p className="text-sm font-medium opacity-80 leading-relaxed">{result.behavioralForecast.mandatoryWaterIntake.reason}</p>
             </Card>
           )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/90 backdrop-blur-3xl border-t z-50 flex justify-center shadow-[0_-20px_60px_rgba(0,0,0,0.15)]">
        <div className="w-full max-w-4xl flex gap-6">
          <Button onClick={onReset} variant="outline" className="flex-1 h-20 rounded-[2rem] border-[3px] font-black text-primary text-xl hover:bg-primary/5 active:scale-95 transition-all">새로운 분석</Button>
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(input.productName || result.productIdentity?.name)}`, '_blank')} className="flex-[2] h-20 rounded-[2rem] text-2xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"><ShoppingBag size={28} className="mr-4" /> 최저가 검색하기</Button>
        </div>
      </div>
    </div>
  );
}
