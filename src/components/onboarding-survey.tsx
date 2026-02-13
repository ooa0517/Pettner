
'use client';

import { Sparkles, CheckCircle2, ShieldCheck, Microscope, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function OnboardingSurvey({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="space-y-4">
        <Badge variant="outline" className="px-4 py-1.5 border-primary/30 text-primary bg-primary/5 rounded-full font-bold">
           PETTNER AI VETERINARY NUTRITION
        </Badge>
        <h2 className="text-4xl font-black font-headline leading-tight tracking-tight">
          반갑습니다!<br/>정밀 분석을 시작할까요?
        </h2>
        <p className="text-muted-foreground text-lg px-6 max-w-lg mx-auto leading-relaxed">
          Pettner는 단순한 성분 나열이 아닌, 전 세계 수의 영양학 가이드라인을 기반으로 우리 아이에게 <strong>"진짜 맞는 먹거리"</strong>인지 판별합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl px-4">
         {[
           { icon: Microscope, title: "글로벌 표준 준수", desc: "AAFCO / NRC 기준 적용" },
           { icon: ShieldCheck, title: "위험 성분 필터링", desc: "주의 성분 200여종 대조" },
           { icon: Sparkles, title: "초개인화 리포트", desc: "유전 및 건강 상태 반영" }
         ].map((item, i) => (
           <Card key={i} className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
             <CardContent className="p-6 flex flex-col items-center gap-3">
               <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                 <item.icon className="w-6 h-6" />
               </div>
               <div className="space-y-1">
                 <p className="font-bold text-sm">{item.title}</p>
                 <p className="text-[11px] text-muted-foreground">{item.desc}</p>
               </div>
             </CardContent>
           </Card>
         ))}
      </div>

      <div className="w-full max-w-md px-4 space-y-4">
        <Button 
          onClick={onComplete} 
          size="lg" 
          className="w-full h-20 text-xl font-bold rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
        >
          예, 전문적인 분석을 시작하겠습니다
          <ArrowRight className="w-6 h-6" />
        </Button>
        <p className="text-[11px] text-muted-foreground px-10">
          분석 시작 시 Pettner의 이용 약관 및 개인정보 처리 방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
