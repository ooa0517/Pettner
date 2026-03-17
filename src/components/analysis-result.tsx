
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, AlertCircle, 
  Stethoscope, Microscope, 
  Scale,
  ThumbsUp,
  AlertTriangle,
  TrendingUp,
  Globe,
  Calendar,
  UtensilsCrossed,
  Activity,
  Factory,
  Search,
  Share2,
  ArrowLeft,
  Droplets,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Cat,
  Dog,
  CheckCircle2
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

type AnalysisResultProps = {
  result: any;
  input: any;
  onReset: () => void;
  resetButtonText?: string;
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

  // --- RENDERING HELPERS ---

  const renderModeASummary = () => (
    <div className="space-y-8">
      <div className="p-8 rounded-[2.5rem] border-l-8 border-primary bg-primary/5 shadow-sm relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-5">
          <Microscope size={120} />
        </div>
        <h3 className="text-sm font-black flex items-center gap-2 mb-3 text-primary uppercase tracking-widest">
          <ShieldCheck size={18}/> 제품 팩트 체크 판정
        </h3>
        <p className="text-2xl md:text-3xl font-black leading-tight tracking-tight break-keep text-foreground/90">
          "{result.summary?.headline}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 space-y-4">
          <h4 className="font-black text-sm text-blue-600 flex items-center gap-2"><ThumbsUp size={18}/> Best Target</h4>
          <div className="flex flex-wrap gap-2">
            {result.summary?.bestFor?.map((t: string, i: number) => (
              <Badge key={i} variant="secondary" className="bg-white font-bold text-xs px-3 py-1 shadow-sm border-none">{t}</Badge>
            ))}
          </div>
        </div>
        <div className="p-8 rounded-[2.5rem] bg-destructive/5 border border-destructive/10 space-y-4">
          <h4 className="font-black text-sm text-destructive flex items-center gap-2"><AlertTriangle size={18}/> Worst Target</h4>
          <div className="flex flex-wrap gap-2">
            {result.summary?.worstFor?.map((t: string, i: number) => (
              <Badge key={i} variant="outline" className="text-destructive border-destructive/30 font-bold text-xs px-3 py-1 bg-white/50">{t}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/30 p-6 rounded-3xl text-center space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">영양 밀도</p>
          <p className="text-2xl font-black text-primary">{result.summary?.nutritionalDensityScore}점</p>
        </div>
        <div className="bg-muted/30 p-6 rounded-3xl text-center space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">가성비 분석</p>
          <p className="text-sm font-black truncate">{result.nutritionalAnalysis?.priceEfficiency || '평균 수준'}</p>
        </div>
        <div className="bg-muted/30 p-6 rounded-3xl text-center space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">리콜 이력</p>
          <p className="text-sm font-black text-success">CLEAN</p>
        </div>
      </div>
    </div>
  );

  const renderNutritionalRadar = () => {
    if (category !== 'food' || !result.nutritionalAnalysis?.radarData) return null;
    const chartConfig = {
      value: { label: "제품 함량", color: "hsl(var(--primary))" },
      standardAAFCO: { label: "AAFCO 기준", color: "hsl(45, 100%, 50%)" },
      standardFEDIAF: { label: "FEDIAF 기준", color: "hsl(210, 100%, 50%)" }
    };
    return (
      <div className="space-y-8 py-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="font-black text-2xl flex items-center gap-2"><TrendingUp className="text-primary"/> 영양 밸런스 헥사곤</h3>
            <p className="text-xs font-medium text-muted-foreground">AAFCO 및 FEDIAF 글로벌 표준 대비 함량 분석</p>
          </div>
          <div className="flex gap-3 text-[10px] font-bold">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"/> 제품</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"/> AAFCO</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> FEDIAF</div>
          </div>
        </div>
        <div className="h-[380px] w-full bg-white rounded-[3rem] p-6 shadow-inner border border-muted/20 relative">
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
        <div className="p-6 bg-primary/5 rounded-3xl border border-dashed border-primary/20 flex items-start gap-4">
          <Zap size={20} className="text-primary shrink-0 mt-1" />
          <p className="text-sm font-bold leading-relaxed text-foreground/80 break-keep">
            {result.summary?.densityComment}
          </p>
        </div>
      </div>
    );
  };

  const renderPhysicalAudit = () => (
    <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white overflow-hidden">
      <CardContent className="p-12 space-y-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-black flex items-center gap-3"><UtensilsCrossed className="text-primary"/> 물리적 스펙 & 태생 감사</h3>
          <p className="text-sm font-medium text-muted-foreground">원료 수급처부터 가공 방식까지의 투명성 리포트</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {result.physicalOriginAudit?.originRiskMap?.map((item: any, i: number) => (
            <div key={i} className="p-5 bg-muted/20 rounded-3xl flex justify-between items-center group hover:bg-muted/30 transition-all border border-transparent hover:border-muted-foreground/10">
              <div className="space-y-0.5">
                <p className="font-black text-base">{item.ingredient}</p>
                <p className="text-xs text-muted-foreground font-bold flex items-center gap-1"><Globe size={12}/> {item.origin}</p>
              </div>
              <Badge className={cn("text-[10px] font-black px-3 py-1 rounded-full", item.riskLevel === 'safe' ? "bg-success text-white" : "bg-orange-500 text-white")}>
                {item.riskLevel === 'safe' ? 'SAFE' : 'CAUTION'}
              </Badge>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-primary/5 rounded-[2.5rem] space-y-4 border border-primary/10">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-xl text-white"><Factory size={18}/></div>
              <p className="font-black text-xs text-primary uppercase tracking-widest">가공 공법 분석</p>
            </div>
            <div className="space-y-2">
              <p className="font-black text-xl">{result.physicalOriginAudit?.processingAnalysis?.method}</p>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed break-keep">{result.physicalOriginAudit?.processingAnalysis?.nutrientLossNote}</p>
            </div>
          </div>
          <div className="p-8 bg-muted/30 rounded-[2.5rem] space-y-4 border border-muted/20">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-muted-foreground/20 rounded-xl text-muted-foreground"><Zap size={18}/></div>
              <p className="font-black text-xs uppercase tracking-widest text-muted-foreground">Kibble(알갱이) 특성</p>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-white border-none shadow-sm font-black px-3 py-1">{result.physicalOriginAudit?.kibbleSpecs?.texture}</Badge>
                <Badge variant="outline" className="bg-white border-none shadow-sm font-black px-3 py-1">{result.physicalOriginAudit?.kibbleSpecs?.size}</Badge>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed break-keep">{result.physicalOriginAudit?.kibbleSpecs?.digestibilityNote}</p>
            </div>
          </div>
        </div>

        <Separator className="opacity-50" />

        <div className="bg-success/5 p-8 rounded-[2.5rem] border-2 border-dashed border-success/30 flex flex-col md:flex-row items-center gap-8">
           <div className="shrink-0 flex flex-col items-center gap-2">
              <div className={cn("p-5 rounded-full", result.esgReport?.cleanMarkGranted ? "bg-success text-white shadow-xl shadow-success/20" : "bg-muted text-muted-foreground")}>
                <ShieldCheck size={48} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter text-success">Pettner Clean Mark</span>
           </div>
           <div className="space-y-2 text-center md:text-left">
              <h4 className="text-xl font-black flex items-center justify-center md:justify-start gap-2">제조사 신뢰도 & 리콜 이력</h4>
              <p className="text-sm font-bold text-foreground/70 leading-relaxed break-keep">
                {result.esgReport?.recallHistory}
              </p>
              <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                {result.esgReport?.certifications?.map((c: string, i: number) => (
                  <Badge key={i} className="bg-success/10 text-success border-none text-[10px] font-black uppercase">{c}</Badge>
                ))}
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderModeBSummary = () => (
    <div className="space-y-8">
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
      <div className="p-8 rounded-[2.5rem] bg-primary/5 border-l-8 border-primary space-y-4 shadow-sm">
        <h3 className="text-xl font-black flex items-center gap-2 text-primary"><Stethoscope size={24}/> 주치의 핵심 소견</h3>
        <p className="text-lg font-bold leading-relaxed text-foreground/90 break-keep">
          {result.matchingReport?.suitabilityVerdict}
        </p>
      </div>
    </div>
  );

  const renderFeedingGuide = () => (
    <div className="space-y-6">
      <h3 className="font-black text-2xl flex items-center gap-2"><Scale className="text-primary"/> 정밀 급여 처방</h3>
      <Card className="border-none shadow-xl bg-primary/5 rounded-[2.5rem]">
        <CardContent className="p-8 space-y-6 text-center">
          {category === 'food' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/10"><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">1일 권장량</p><p className="text-3xl font-black text-primary tracking-tighter">{result.personalizedFeedingGuide?.dailyGrams}</p></div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/10"><p className="text-[10px] font-black text-muted-foreground uppercase mb-1">1회 급여량</p><p className="text-3xl font-black text-primary tracking-tighter">{result.personalizedFeedingGuide?.perMealGrams}</p></div>
            </div>
          )}
          {(category === 'treat' || category === 'supplement') && (
            <div className="bg-white p-10 rounded-3xl shadow-lg border-2 border-accent/20">
              <p className="text-xs font-black text-accent uppercase mb-2 tracking-widest">일일 최대 급여 제한</p>
              <p className="text-5xl font-black text-accent tracking-tighter">{result.personalizedFeedingGuide?.maxUnitsPerDay || result.personalizedFeedingGuide?.dosage}</p>
              <p className="text-xs font-bold text-muted-foreground mt-2">{result.personalizedFeedingGuide?.dosageUnit}</p>
            </div>
          )}
          <p className="text-sm font-bold text-primary/70 bg-white/50 py-3 rounded-2xl border border-dashed border-primary/20">
            {result.personalizedFeedingGuide?.kcalInstruction || result.personalizedFeedingGuide?.ruleOf10PercentMsg || result.personalizedFeedingGuide?.sideEffectWarning}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderRiskAndTransition = () => (
    <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
      <CardContent className="p-10 space-y-8">
        <h3 className="text-2xl font-black flex items-center gap-3"><Clock className="text-primary"/> 제품 교체 & 리스크 관리</h3>
        
        <div className="space-y-4">
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest ml-1">7일 안전 급여 교체 스케줄</p>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {result.riskAndTransition?.transitionSchedule?.map((item: any, i: number) => (
              <div key={i} className="flex flex-col items-center p-3 bg-muted/20 rounded-2xl border border-muted/10">
                <span className="text-[10px] font-black text-muted-foreground mb-1">{item.day}</span>
                <span className="text-xs font-black text-primary">{item.ratio}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-orange-500/5 rounded-3xl border border-orange-500/10 space-y-2">
            <h4 className="font-black text-sm text-orange-600 flex items-center gap-2 mb-2"><AlertTriangle size={16}/> 알러지 & 성분 충돌</h4>
            <p className="text-sm font-bold leading-relaxed">{result.riskAndTransition?.allergySupplementAlert}</p>
          </div>
          <div className="p-6 bg-success/5 rounded-3xl border border-success/10 space-y-2">
            <h4 className="font-black text-sm text-success flex items-center gap-2 mb-2"><Activity size={16}/> 예상 배변 변화</h4>
            <p className="text-sm font-bold leading-relaxed">{result.riskAndTransition?.expectedStoolChanges}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-48 max-w-4xl mx-auto px-4">
      
      {!isPublicView && <AdBanner position="top" />}

      {isPublicView && (
        <Button variant="ghost" onClick={() => window.history.back()} className="rounded-full font-bold gap-2">
          <ArrowLeft size={18}/> 돌아가기
        </Button>
      )}

      <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] rounded-[4rem] bg-white overflow-hidden">
        <CardContent className="p-12 space-y-12">
          <div className="flex flex-col md:flex-row gap-12">
            {input.photoDataUri && (
              <div className="w-full md:w-[35%] shrink-0">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <img src={input.photoDataUri} alt="Product" className="relative z-10 rounded-[3rem] w-full h-auto object-cover aspect-[3/4] shadow-2xl border-[10px] border-muted/30 group-hover:scale-[1.02] transition-transform duration-500"/>
                </div>
              </div>
            )}
            <div className="flex flex-col justify-between flex-1">
                <div className="space-y-8">
                    <div className="flex justify-between items-start">
                      <Badge className={cn("px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm", mode === 'general' ? "bg-success" : "bg-primary")}>
                          {mode === 'general' ? 'TYPE A: PRODUCT AUDIT' : 'TYPE B: PERSONAL MATCHING'}
                      </Badge>
                      <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full h-12 w-12 border-muted hover:bg-muted/50 shadow-sm">
                        <Share2 size={20} className="text-muted-foreground" />
                      </Button>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] text-foreground break-keep">
                        {input.productName || result.productIdentity?.name}
                    </h1>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="font-bold text-sm bg-muted/50 text-muted-foreground px-4 py-1.5 rounded-xl">{result.productIdentity?.brand}</Badge>
                      <Badge variant="secondary" className="font-bold text-sm bg-muted/50 text-muted-foreground px-4 py-1.5 rounded-xl">{result.productIdentity?.category}</Badge>
                    </div>
                </div>
                
                {mode === 'custom' && (
                  <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 mt-10 flex items-center gap-5">
                    <div className="p-4 bg-white rounded-3xl shadow-md text-primary">
                      {input.petProfile?.petType === 'cat' ? <Cat size={32}/> : <Dog size={32}/>}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60 mb-1">Target Recipient</p>
                      <p className="font-black text-xl leading-none">{input.petProfile?.name} <span className="text-sm font-bold text-muted-foreground ml-1">({input.petProfile?.breed}, {input.petProfile?.weight}kg)</span></p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          <Separator className="opacity-50" />

          {mode === 'general' ? (
            <div className="space-y-16">
              {renderModeASummary()}
              {renderNutritionalRadar()}
            </div>
          ) : (
            <div className="space-y-16">
              {renderModeBSummary()}
              {renderFeedingGuide()}
            </div>
          )}
        </CardContent>
      </Card>

      {mode === 'general' && renderPhysicalAudit()}

      {mode === 'custom' && (
        <div className="space-y-12">
          <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-12 space-y-10">
            <div className="space-y-1">
              <h3 className="text-2xl font-black flex items-center gap-3"><Activity className="text-primary"/> 행동 및 섭취 예측</h3>
              <p className="text-sm font-medium text-muted-foreground">성분 분석을 통한 기호성 및 신체 변화 예측</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-10 bg-muted/20 rounded-[2.5rem] border border-muted/10 group hover:border-primary/20 transition-all">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3">입맛 적합도</p>
                <p className="text-6xl font-black text-primary tracking-tighter">{result.behavioralForecast?.palatabilityIndex?.probability}%</p>
              </div>
              <div className="text-center p-10 bg-muted/20 rounded-[2.5rem] border border-muted/10">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3">포만감 수준</p>
                <p className="text-2xl font-black text-foreground">{result.behavioralForecast?.giAndSatiety?.level}</p>
              </div>
              <div className="text-center p-10 bg-blue-500/5 rounded-[2.5rem] border border-blue-500/10">
                <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-3">필수 추가 음수량</p>
                <p className="text-5xl font-black text-blue-600 tracking-tighter">{result.behavioralForecast?.mandatoryWaterIntake?.ml}</p>
              </div>
            </div>
            <div className="p-8 bg-muted/10 rounded-3xl flex items-start gap-4">
              <Info size={20} className="text-muted-foreground shrink-0 mt-1" />
              <p className="text-sm font-medium text-muted-foreground leading-relaxed break-keep">
                {result.behavioralForecast?.palatabilityIndex?.reason} {result.behavioralForecast?.mandatoryWaterIntake?.reason}
              </p>
            </div>
          </Card>

          {renderRiskAndTransition()}
        </div>
      )}

      <Accordion type="multiple" defaultValue={["ing-audit"]} className="space-y-8">
        <AccordionItem value="ing-audit" className="border-none shadow-2xl rounded-[3.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-12 py-12 hover:no-underline">
            <div className="flex items-center gap-6 text-left">
              <div className="p-6 bg-primary/10 rounded-[2rem] text-primary"><Microscope size={36} /></div>
              <div>
                <h3 className="font-black text-2xl tracking-tight">전성분 100% 현미경 감사</h3>
                <p className="text-sm text-muted-foreground font-medium">안전성 및 영양 가치 신호등 시스템</p>
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
                  <div className={cn("mt-2.5 w-5 h-5 rounded-full shrink-0 shadow-lg", ing.category === 'positive' ? 'bg-success ring-4 ring-success/10' : ing.category === 'cautionary' ? 'bg-orange-500 ring-4 ring-orange-500/10' : 'bg-muted-foreground/50')} />
                  <div className="space-y-3">
                    <p className="font-black text-3xl group-hover:text-primary transition-colors tracking-tight">{ing.name}</p>
                    <p className="text-lg text-foreground/70 font-medium leading-relaxed break-keep">{ing.reason}</p>
                    {ing.safetyRating && <Badge variant="outline" className="font-black text-[10px] uppercase opacity-50 px-2 py-0">{ing.safetyRating}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/90 backdrop-blur-3xl border-t z-50 flex justify-center shadow-[0_-20px_60px_rgba(0,0,0,0.15)]">
        <div className="w-full max-w-4xl flex gap-6">
          <Button onClick={onReset} variant="outline" className="flex-1 h-20 rounded-[2rem] border-[3px] font-black text-primary text-xl hover:bg-primary/5 active:scale-95 transition-all">새로운 분석</Button>
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(input.productName || result.productIdentity?.name)}`, '_blank')} className="flex-[2] h-20 rounded-[2rem] text-2xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"><ShoppingBag size={28} className="mr-4" /> 최저가 검색하기</Button>
        </div>
      </div>
    </div>
  );
}
