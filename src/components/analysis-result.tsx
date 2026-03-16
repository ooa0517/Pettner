
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
  Share2
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

  const renderPhysicalAudit = () => (
    <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
      <CardContent className="p-10 space-y-8">
        <h3 className="text-2xl font-black flex items-center gap-3"><UtensilsCrossed className="text-primary"/> 물리적 스펙 & 태생 분석</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.physicalOriginAudit?.originRiskMap?.map((item: any, i: number) => (
            <div key={i} className="p-4 bg-muted/20 rounded-2xl flex justify-between items-center">
              <div className="space-y-0.5">
                <p className="font-black text-sm">{item.ingredient}</p>
                <p className="text-[10px] text-muted-foreground font-bold">{item.origin}</p>
              </div>
              <Badge className={cn("text-[10px] font-black", item.riskLevel === 'safe' ? "bg-success text-white" : "bg-orange-500 text-white")}>
                {item.riskLevel === 'safe' ? '안전' : '주의'}
              </Badge>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-primary/5 rounded-3xl space-y-2">
            <p className="font-black text-xs text-primary uppercase tracking-widest">가공 공법</p>
            <p className="font-black text-lg">{result.physicalOriginAudit?.processingAnalysis?.method}</p>
            <p className="text-xs text-muted-foreground font-medium">{result.physicalOriginAudit?.processingAnalysis?.nutrientLossNote}</p>
          </div>
          <div className="p-6 bg-muted/30 rounded-3xl space-y-3">
            <p className="font-black text-xs uppercase tracking-widest text-muted-foreground">Kibble 특성</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white border-none shadow-sm font-bold">{result.physicalOriginAudit?.kibbleSpecs?.texture}</Badge>
              <Badge variant="outline" className="bg-white border-none shadow-sm font-bold">{result.physicalOriginAudit?.kibbleSpecs?.size}</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{result.physicalOriginAudit?.kibbleSpecs?.digestibilityNote}</p>
          </div>
        </div>
      </CardContent>
    </Card>
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
            <span className="text-5xl font-black text-primary">{result.matchingReport?.matchScore}</span>
            <span className="text-[10px] font-black text-muted-foreground uppercase">Matching Score</span>
          </div>
        </div>
        <Badge className="bg-primary text-white font-black px-6 py-2 rounded-full text-lg shadow-lg">
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

  const renderNutritionalRadar = () => {
    if (category !== 'food' || !result.nutritionalAnalysis?.radarData) return null;
    const chartConfig = {
      value: { label: "제품 함량", color: "hsl(var(--primary))" },
      standard: { label: "AAFCO 표준", color: "hsl(var(--muted-foreground))" }
    };
    return (
      <div className="space-y-6">
        <h3 className="font-black text-2xl flex items-center gap-2"><TrendingUp className="text-primary"/> 영양 밸런스 헥사곤</h3>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig}>
            <ChartRadarChart data={result.nutritionalAnalysis.radarData}>
              <ChartPolarGrid />
              <ChartPolarAngleAxis dataKey="nutrient" />
              <ChartRadar name="standard" dataKey="standard" stroke="var(--color-standard)" fill="var(--color-standard)" fillOpacity={0.1} />
              <ChartRadar name="value" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.5} />
            </ChartRadarChart>
          </ChartContainer>
        </div>
      </div>
    );
  };

  const renderFeedingGuide = () => (
    <div className="space-y-6">
      <h3 className="font-black text-2xl flex items-center gap-2"><Scale className="text-primary"/> 정밀 배식 처방</h3>
      <Card className="border-none shadow-xl bg-primary/5 rounded-[2.5rem]">
        <CardContent className="p-8 space-y-6 text-center">
          {category === 'food' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm"><p className="text-xs font-bold text-muted-foreground">1일 권장량</p><p className="text-3xl font-black text-primary">{result.personalizedFeedingGuide?.dailyGrams}</p></div>
              <div className="bg-white p-6 rounded-3xl shadow-sm"><p className="text-xs font-bold text-muted-foreground">1회 권장량</p><p className="text-3xl font-black text-primary">{result.personalizedFeedingGuide?.perMealGrams}</p></div>
            </div>
          )}
          {category === 'treat' && <p className="text-4xl font-black text-orange-500">{result.personalizedFeedingGuide?.maxUnitsPerDay}</p>}
          <p className="text-sm font-bold text-primary/70">{result.personalizedFeedingGuide?.kcalInstruction || result.personalizedFeedingGuide?.ruleOf10PercentMsg}</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-48 max-w-4xl mx-auto px-4">
      
      {!isPublicView && <AdBanner position="top" />}

      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardContent className="p-10 space-y-10">
          <div className="flex flex-col md:flex-row gap-8">
            {input.photoDataUri && (
              <div className="w-full md:w-1/3">
                <img src={input.photoDataUri} alt="Product" className="rounded-3xl w-full h-auto object-cover aspect-[3/4] shadow-lg border-4 border-white"/>
              </div>
            )}
            <div className="flex flex-col justify-between flex-1">
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-wrap gap-2">
                          <Badge className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase", mode === 'general' ? "bg-success" : "bg-primary")}>
                              {mode === 'general' ? 'TYPE A: PRODUCT AUDIT' : 'TYPE B: PERSONAL MATCHING'}
                          </Badge>
                      </div>
                      <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full text-muted-foreground">
                        <Share2 size={20} />
                      </Button>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter leading-tight">
                        {input.productName || result.productIdentity?.name}
                    </h1>
                    <p className="text-lg text-muted-foreground font-bold">{result.productIdentity?.brand} · {result.productIdentity?.category}</p>
                </div>
                
                {mode === 'custom' && (
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mt-4">
                    <p className="text-xs font-black text-primary uppercase mb-1">Target Pet</p>
                    <p className="font-bold text-sm">{input.petProfile?.name} ({input.petProfile?.breed}, {input.petProfile?.weight}kg)</p>
                  </div>
                )}
            </div>
          </div>

          <Separator />

          {mode === 'general' ? (
            <div className="space-y-10">
              {renderModeASummary()}
              {renderNutritionalRadar()}
            </div>
          ) : (
            <div className="space-y-10">
              {renderModeBSummary()}
              {renderFeedingGuide()}
            </div>
          )}
        </CardContent>
      </Card>

      {mode === 'general' && renderPhysicalAudit()}

      {mode === 'custom' && (
        <div className="space-y-10">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 space-y-8">
            <h3 className="text-2xl font-black flex items-center gap-3"><Activity className="text-primary"/> 행동 및 섭취 예측</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-muted/20 rounded-3xl"><p className="text-[10px] font-black uppercase">기호성</p><p className="text-4xl font-black text-primary">{result.behavioralForecast?.palatabilityIndex?.probability}%</p></div>
              <div className="text-center p-6 bg-muted/20 rounded-3xl"><p className="text-[10px] font-black uppercase">포만감</p><p className="text-2xl font-black">{result.behavioralForecast?.giAndSatiety?.level}</p></div>
              <div className="text-center p-6 bg-primary/5 rounded-3xl"><p className="text-[10px] font-black uppercase">강제 음수량</p><p className="text-3xl font-black text-blue-600">{result.behavioralForecast?.mandatoryWaterIntake?.ml}</p></div>
            </div>
          </Card>
        </div>
      )}

      <Accordion type="multiple" defaultValue={["ing-audit"]} className="space-y-6">
        <AccordionItem value="ing-audit" className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-8 py-8 hover:no-underline">
            <div className="flex items-center gap-4 text-left">
              <div className="p-4 bg-primary/10 rounded-[1.5rem] text-primary"><Microscope size={28} /></div>
              <div><h3 className="font-black text-2xl">전성분 100% 분석</h3><p className="text-sm text-muted-foreground font-medium">안전성 및 영양 가치 평가</p></div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-8 pb-10 pt-4 space-y-8">
            <div className="relative"><Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="성분 검색..." className="pl-14 rounded-2xl h-14 bg-muted/20" value={ingSearch} onChange={(e) => setIngSearch(e.target.value)} /></div>
            <div className="divide-y divide-muted/30 max-h-[400px] overflow-y-auto pr-3">
              {filteredIngredients.map((ing: any, i: number) => (
                <div key={i} className="py-6 flex items-start gap-5">
                  <div className={cn("mt-2 w-3 h-3 rounded-full shrink-0", ing.category === 'positive' ? 'bg-success' : ing.category === 'cautionary' ? 'bg-orange-500' : 'bg-muted-foreground')} />
                  <div className="space-y-1"><p className="font-black text-xl">{ing.name}</p><p className="text-sm text-foreground/80 font-medium">{ing.reason}</p></div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-2xl border-t z-50 flex justify-center shadow-2xl">
        <div className="w-full max-w-4xl flex gap-4">
          <Button onClick={onReset} variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-black text-primary">새로운 분석 시작</Button>
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(input.productName || result.productIdentity?.name)}`, '_blank')} className="flex-[2] h-16 rounded-2xl text-xl font-black shadow-xl"><ShoppingBag size={24} className="mr-3" /> 최저가 구매</Button>
        </div>
      </div>
    </div>
  );
}
