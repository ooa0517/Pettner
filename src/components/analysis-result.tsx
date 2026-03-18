'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, AlertCircle, Stethoscope, Microscope, Scale, ThumbsUp, AlertTriangle,
  TrendingUp, Globe, UtensilsCrossed, Activity, Factory, Search, Share2, ArrowLeft,
  Droplets, Clock, ShieldCheck, Zap, Info, Cat, Dog, Battery, Wind, InfoIcon,
  ChevronDown, ChevronUp, Target, HeartPulse, CreditCard, Sparkles, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import {
  ChartContainer, ChartRadar, ChartRadarChart, ChartPolarGrid, ChartPolarAngleAxis,
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
  const { toast } = useToast();
  const data = result.result_data;

  if (!result || result.status === 'error' || !data) {
    return (
      <div className="space-y-8 py-20 text-center">
        <AlertCircle className="w-20 h-20 text-destructive mx-auto opacity-30"/>
        <h1 className="text-3xl font-black">진단 실패</h1>
        <p className="text-muted-foreground">데이터를 분석하는 도중 오류가 발생했습니다.</p>
        <Button onClick={onReset} className="rounded-full px-8">다시 시도</Button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Pettner - ${input.petProfile?.name} 맞춤 리포트`,
        text: `${input.petProfile?.name}를 위한 정밀 영양 리포트를 확인해보세요!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "링크 복사 완료" });
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-48 max-w-4xl mx-auto px-4">
      
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={isPublicView ? () => window.history.back() : onReset} className="rounded-full font-bold gap-2">
          <ArrowLeft size={18}/> {isPublicView ? '돌아가기' : '새로운 분석'}
        </Button>
        <Button variant="outline" size="icon" onClick={handleShare} className="rounded-full h-12 w-12 shadow-sm">
          <Share2 size={20} className="text-muted-foreground" />
        </Button>
      </div>

      {/* [Match] 1:1 영양 궁합 */}
      <Card className="border-none shadow-2xl rounded-[4rem] bg-white overflow-hidden">
        <CardContent className="p-12 space-y-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-muted/20" />
                <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="16" fill="transparent" 
                  strokeDasharray={628} strokeDashoffset={628 - (628 * (data["1_matching_insight"].match_score)) / 100}
                  className="text-primary transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-7xl font-black text-primary tracking-tighter">{data["1_matching_insight"].match_score}</span>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Match Score</span>
              </div>
            </div>
            <div className="space-y-4">
              <Badge className="bg-primary text-white font-black px-6 py-2 rounded-full text-lg shadow-xl shadow-primary/20">
                {input.petProfile?.name} 1:1 맞춤 리포트
              </Badge>
              <div className="p-8 rounded-[2.5rem] bg-primary/5 border-l-8 border-primary text-left">
                <h3 className="text-xl font-black flex items-center gap-2 text-primary mb-3"><Stethoscope size={24}/> 수의학적 총평</h3>
                <p className="text-2xl font-black leading-tight tracking-tight text-foreground/90 break-keep">
                  "{data["1_matching_insight"].clinical_comment}"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* [Prescription] 정밀 급여 처방 */}
      <Card className="border-none shadow-xl bg-white rounded-[3.5rem] overflow-hidden">
        <CardContent className="p-12 space-y-8">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <span className="p-2 bg-primary/10 rounded-xl text-primary"><Scale size={24} /></span>
            정밀 급여 처방
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-primary/5 rounded-[2.5rem] text-center space-y-2">
              <p className="text-xs font-black text-muted-foreground uppercase">1일 권장 급여량</p>
              <p className="text-4xl font-black text-primary tracking-tighter">{data["2_strict_prescription"].daily_amount_g}g</p>
              <p className="text-sm font-bold text-primary/60">({data["2_strict_prescription"].amount_per_meal_cup})</p>
            </div>
            <div className="p-8 bg-blue-500 rounded-[2.5rem] text-white text-center space-y-2">
              <p className="text-xs font-black opacity-70 uppercase">1일 필수 음수량</p>
              <p className="text-4xl font-black tracking-tighter">{data["2_strict_prescription"].water_intake_guide}</p>
              <p className="text-sm font-medium opacity-80">목표 체중: {data["2_strict_prescription"].target_weight}kg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* [Risk & Synergy] 리스크 철벽 방어 */}
      <Card className="border-none shadow-xl bg-rose-500 text-white rounded-[3.5rem] overflow-hidden">
        <CardContent className="p-12 space-y-8">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <ShieldCheck size={28} /> 리스크 철벽 방어
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white/10 rounded-3xl border border-white/20 space-y-3">
              <p className="text-xs font-black uppercase opacity-70">질환/알러지 주의</p>
              <p className="text-lg font-bold leading-relaxed">{data["3_risk_and_synergy"].allergy_disease_red_flag}</p>
            </div>
            <div className="p-6 bg-white/10 rounded-3xl border border-white/20 space-y-3">
              <p className="text-xs font-black uppercase opacity-70">영양제 충돌 여부</p>
              <p className="text-lg font-bold leading-relaxed">{data["3_risk_and_synergy"].supplement_collision}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* [Fact Check] 제품의 민낯 */}
      <Card className="border-none shadow-xl rounded-[3.5rem] bg-white overflow-hidden">
        <CardContent className="p-12 space-y-10">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 rounded-xl text-amber-500"><Microscope size={24} /></span>
            제품의 민낯 (Fact Check)
          </h3>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-2 px-4">
              <div className="text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase">REAL MEAT</p>
                <p className="text-2xl font-black text-rose-500">단백질</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase">HIDDEN SUGARS</p>
                <p className="text-2xl font-black text-amber-500">탄수화물</p>
              </div>
            </div>
            <div className="relative h-8 w-full bg-muted rounded-full overflow-hidden flex shadow-inner">
              <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${data["4_fact_check_and_nutrition"].protein_pct || 30}%` }} />
              <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${data["4_fact_check_and_nutrition"].carb_pct || 40}%` }} />
            </div>
            <p className="text-lg font-bold text-center text-foreground/80">{data["4_fact_check_and_nutrition"].real_meat_vs_carb}</p>
          </div>

          <div className="p-8 bg-muted/30 rounded-[2.5rem] border border-dashed space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={data["4_fact_check_and_nutrition"].nutrition_radar.aafco_fediaf_met ? "success" : "destructive"}>
                {data["4_fact_check_and_nutrition"].nutrition_radar.aafco_fediaf_met ? "글로벌 기준 충족" : "기준 미달"}
              </Badge>
              <span className="font-black text-sm">영양 밸런스 헥사곤</span>
            </div>
            <p className="text-sm font-bold text-muted-foreground">{data["4_fact_check_and_nutrition"].nutrition_radar.comment}</p>
          </div>
        </CardContent>
      </Card>

      {/* [Prediction] 현실 팩트 폭격 */}
      <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[3.5rem] overflow-hidden">
        <CardContent className="p-12 space-y-10">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <Zap className="text-amber-400" /> 현실 팩트 폭격
          </h3>
          <div className="grid gap-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-white/10 rounded-2xl"><UtensilsCrossed size={32} /></div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase text-amber-400">식습관 & 알갱이 매칭</p>
                <p className="text-lg font-bold leading-relaxed">{data["5_physical_and_prediction"].kibble_and_eating_habit}</p>
              </div>
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-start gap-6">
              <div className="p-4 bg-white/10 rounded-2xl"><Battery size={32} /></div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase text-amber-400">포만감 지수</p>
                <p className="text-lg font-bold leading-relaxed">{data["5_physical_and_prediction"].satiety_index}</p>
              </div>
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-start gap-6">
              <div className="p-4 bg-white/10 rounded-2xl"><Footprints size={32} /></div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase text-amber-400">배변 & 냄새 예측</p>
                <p className="text-lg font-bold leading-relaxed">{data["5_physical_and_prediction"].stool_and_odor}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* [Ingredient] 100% 원재료 감사 */}
      <Accordion type="multiple" defaultValue={["ing-audit"]} className="space-y-8">
        <AccordionItem value="ing-audit" className="border-none shadow-xl rounded-[3.5rem] bg-white overflow-hidden">
          <AccordionTrigger className="px-12 py-12 hover:no-underline">
            <div className="flex items-center gap-6 text-left">
              <div className="p-6 bg-primary/10 rounded-[2rem] text-primary"><Microscope size={36} /></div>
              <div>
                <h3 className="font-black text-2xl tracking-tight">전성분 100% 현미경 감사</h3>
                <p className="text-sm text-muted-foreground font-medium">원료별 안전 등급 및 대중 통계 대조</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-12 pb-16 pt-4 space-y-8">
            <div className="divide-y divide-muted/30">
              {data["6_ingredient_audit"].map((ing: any, i: number) => (
                <div key={i} className="py-8 flex items-start gap-6 group">
                  <div className={cn(
                    "mt-1.5 w-4 h-4 rounded-full shrink-0 shadow-lg",
                    ing.grade === 'green' ? 'bg-success' : ing.grade === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                  )} />
                  <div className="space-y-2">
                    <p className="font-black text-2xl group-hover:text-primary transition-colors">{ing.name}</p>
                    <p className="text-base text-foreground/70 font-medium leading-relaxed break-keep">{ing.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* [Economics] 구매 결정 & Plan B */}
      <Card className="border-none shadow-2xl rounded-[3.5rem] bg-gradient-to-br from-primary to-blue-600 text-white overflow-hidden">
        <CardContent className="p-12 space-y-10">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <CreditCard /> 경제성 및 대안 분석
            </h3>
            <Badge className="bg-white/20 text-white border-none">PLAN B SYSTEM</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase opacity-70">1포장 소진 기간</p>
              <p className="text-3xl font-black">{data["7_economics_and_plan_b"].days_to_consume}일</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-black uppercase opacity-70">제조사 신뢰도</p>
              <p className="text-lg font-bold">{data["7_economics_and_plan_b"].manufacturer_trust}</p>
            </div>
          </div>
          <div className="p-8 bg-white/10 rounded-3xl border border-white/20">
            <p className="text-xs font-black uppercase opacity-70 mb-2">Pettner 추천 대안 (Plan B)</p>
            <p className="text-lg font-bold leading-relaxed">{data["7_economics_and_plan_b"].plan_b_recommendation}</p>
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/90 backdrop-blur-3xl border-t z-50 flex justify-center shadow-[0_-20px_60px_rgba(0,0,0,0.15)]">
        <div className="w-full max-w-4xl flex gap-6">
          <Button onClick={onReset} variant="outline" className="flex-1 h-20 rounded-[2rem] border-[3px] font-black text-primary text-xl hover:bg-primary/5 active:scale-95 transition-all">새로운 분석</Button>
          <Button onClick={() => window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(input.productName || '반려동물 사료')}`, '_blank')} className="flex-[2] h-20 rounded-[2rem] text-2xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"><ShoppingBag size={28} className="mr-4" /> 최저가 검색하기</Button>
        </div>
      </div>
    </div>
  );
}
