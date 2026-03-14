
'use client';

import { Microscope, Target, ArrowRight, ShoppingBag, HeartPulse } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ModeSelector({ onSelectA, onSelectB }: { onSelectA: () => void, onSelectB: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-black text-xs">Pettner Core v22.0</Badge>
        <h1 className="text-5xl font-black tracking-tighter leading-tight">분석 타입을 선택해주세요</h1>
        <p className="text-muted-foreground font-medium text-lg">어떤 정보가 필요하신가요?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <ModeCard 
          icon={<Microscope className="h-12 w-12" />}
          title="Analyzer_A"
          subtitle="제품 객관적 분석"
          desc="제품의 AAFCO 준수 여부, 원재료 등급, 제조사 투명성을 팩트 위주로 분석합니다."
          badges={["성분 감사", "품질 등급", "투명성 감사"]}
          onClick={onSelectA}
        />
        <ModeCard 
          icon={<Target className="h-12 w-12" />}
          title="Analyzer_B"
          subtitle="우리 아이 맞춤 분석"
          desc="아이의 증상(눈물, 슬개골 등)과 알러지를 기반으로 제품과의 1:1 상성을 매칭합니다."
          badges={["상성 점수", "알러지 체크", "맞춤 급여량"]}
          highlight
          onClick={onSelectB}
        />
      </div>
    </div>
  );
}

function ModeCard({ icon, title, subtitle, desc, badges, highlight = false, onClick }: any) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border-none shadow-2xl rounded-[3.5rem] overflow-hidden group",
        highlight ? "bg-primary text-white" : "bg-white text-foreground"
      )}
    >
      <CardContent className="p-12 space-y-8">
        <div className={cn("p-5 rounded-3xl inline-block", highlight ? "bg-white/20" : "bg-muted")}>
          {icon}
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest opacity-60">{title}</span>
            <Badge variant="outline" className={cn("rounded-full border-none px-2 py-0 text-[10px]", highlight ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>Recommended</Badge>
          </div>
          <h3 className="text-3xl font-black">{subtitle}</h3>
          <p className={cn("text-lg font-medium leading-relaxed opacity-80", highlight ? "text-white/80" : "text-muted-foreground")}>
            {desc}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((b: string) => (
            <Badge key={b} variant="outline" className={cn("rounded-full px-4 py-1.5 font-bold border-2", highlight ? "border-white/20 text-white" : "border-primary/10 text-primary")}>
              {b}
            </Badge>
          ))}
        </div>
        <div className="pt-4 flex items-center gap-2 font-black text-lg">
          시작하기 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
        </div>
      </CardContent>
    </Card>
  );
}
