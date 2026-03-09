
'use client';

import { 
  Bot, 
  ThumbsUp, 
  Scale, 
  ShieldCheck, 
  Factory, 
  Soup, 
  Sparkles, 
  ArrowRight, 
  HeartPulse, 
  AlertCircle,
  CheckCircle2,
  Gavel
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { cn } from '@/lib/utils';

export default function LandingPage({ onStart }: { onStart?: () => void }) {
  const coreBenefits = [
    {
      icon: <Scale className="text-primary" />,
      title: "개인화된 영양 매칭",
      desc: "반려동물 상태(예: 노령견 관절 건강)에 맞춰 영양 데이터 비교. 논문 기반 점수화."
    },
    {
      icon: <ShieldCheck className="text-success" />,
      title: "건강 리스크 최소화",
      desc: "알레르기/질환 상태 입력 시 주의 재료 하이라이트. 대체 단백질 추천."
    },
    {
      icon: <Factory className="text-orange-500" />,
      title: "제조 투명성 확인",
      desc: "회사 직접 재료 선정 vs OEM 저가 생산 구분. 리콜 이력 및 인증 포함."
    },
    {
      icon: <Soup className="text-amber-500" />,
      title: "쉬운 급여 가이드",
      desc: "체중/상태별 Kg당 급여량 + 총 Kcal 계산. 과식 방지 팁 제공."
    }
  ];

  const screenshots = [
    { url: "https://picsum.photos/seed/screen1/600/1000", caption: "초정밀 프로필 입력" },
    { url: "https://picsum.photos/seed/screen2/600/1000", caption: "AI 매칭 분석 결과" },
    { url: "https://picsum.photos/seed/screen3/600/1000", caption: "맞춤 사료 추천 리스트" },
    { url: "https://picsum.photos/seed/screen4/600/1000", caption: "상세 영양 비교 그래프" },
    { url: "https://picsum.photos/seed/screen5/600/1000", caption: "제조사 신뢰도 감사" }
  ];

  return (
    <div className="flex flex-col items-center space-y-24 py-16 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <div className="text-center space-y-8 px-4 max-w-4xl">
        <Badge className="bg-primary/10 text-primary border-none px-4 py-2 rounded-full font-black text-[10px] tracking-widest uppercase">
          AI Matching Engine v19.2
        </Badge>
        <div className="space-y-4">
          <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter text-foreground leading-tight">
            우리 아이를 위한<br/><span className="text-primary">1:1 맞춤 영양</span> 매칭
          </h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            단순 성분 분석을 넘어, 아이의 나이, 체중, 건강 고민에 딱 맞는 사료인지 수의학 논문 기반으로 판별합니다.
          </p>
        </div>

        <div className="w-full max-w-sm mx-auto pt-6">
          <Button 
            onClick={onStart} 
            size="lg"
            className="w-full h-20 text-2xl font-bold rounded-[2.5rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all"
          >
            <Sparkles className="mr-3 h-7 w-7" />
            우리 아이 맞춤 분석 시작
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
          <p className="text-xs text-muted-foreground font-bold mt-4">50만 반려인이 선택한 초개인화 영양 솔루션</p>
        </div>
      </div>

      {/* 1. AI Matching Analysis Section */}
      <div className="w-full max-w-5xl px-4 space-y-12">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="p-4 bg-primary/10 rounded-3xl w-fit">
              <Bot className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-4xl font-black tracking-tight">AI 정밀 매칭 분석</h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              논문을 기반으로 원재료 적합도(알러지), 영양 균형(AAFCO), 급여량(Kcal), 제조 과정까지 4단계로 분석합니다.
              <br/><br/>
              <span className="text-foreground font-bold">"이 제품은 당신의 고양이에게 92% 적합합니다. 관절 지원 성분이 매우 우수합니다."</span>
            </p>
          </div>
          
          <div className="flex-1 bg-white p-10 rounded-[3rem] shadow-2xl border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Bot size={120} />
            </div>
            <div className="space-y-8 relative z-10">
               <div className="flex items-center justify-center">
                  <div className="relative h-40 w-40">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/20" />
                      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={440} strokeDashoffset={440 - (440 * 92) / 100}
                        className="text-primary transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-primary">92%</span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase">MATCH</span>
                    </div>
                  </div>
               </div>
               <div className="space-y-3">
                 <div className="flex items-center gap-2 text-success font-black text-sm">
                   <CheckCircle2 size={16} /> Pros: 관절 지원 강점 (글루코사민 800mg)
                 </div>
                 <div className="flex items-center gap-2 text-orange-500 font-black text-sm">
                   <AlertCircle size={16} /> Cons: 고단백 포뮬러 (신장 주의 필요)
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Recommendation Section */}
      <div className="w-full max-w-5xl px-4 py-16 bg-primary/5 rounded-[4rem] border border-primary/10">
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-6 text-right md:text-left">
            <div className="p-4 bg-white rounded-3xl w-fit ml-auto md:ml-0 shadow-sm">
              <ThumbsUp className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-4xl font-black tracking-tight">전문가 추천 및 주의사항</h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              아이의 상태에 맞는 실질적인 조언을 제공합니다. 
              단순히 좋다는 말 대신, <span className="text-primary font-bold">"비만 고양이에게는 지방이 과다하니 15% 줄여 급여하세요"</span>와 같은 구체적인 가이드를 드립니다.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 gap-4">
             {[
               { title: "비만 관리 식단", status: "제한 급여 권장", note: "지방 함량 18%로 높음", color: "bg-orange-500" },
               { title: "관절 케어 최적화", status: "적합도 우수", note: "천연 콘드로이친 포함", color: "bg-success" }
             ].map((card, i) => (
               <div key={i} className="bg-white p-6 rounded-3xl shadow-xl flex items-center justify-between group hover:-translate-y-1 transition-transform">
                 <div className="space-y-1">
                   <h4 className="font-black text-lg">{card.title}</h4>
                   <p className="text-xs text-muted-foreground font-bold">{card.note}</p>
                 </div>
                 <Badge className={cn("rounded-full font-black px-4 py-1 text-white", card.color)}>
                   {card.status}
                 </Badge>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* 3. Core Benefits Grid */}
      <div className="w-full max-w-5xl px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black">왜 Pettner 맞춤 분석인가?</h2>
          <p className="text-muted-foreground font-medium">데이터가 말해주는 우리 아이 건강 리포트</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreBenefits.map((f, i) => (
            <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white group hover:bg-primary/5 transition-colors text-center overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <div className="p-5 bg-muted rounded-3xl group-hover:bg-white transition-colors inline-block">
                  {f.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-lg">{f.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. App Screenshot Carousel */}
      <div className="w-full max-w-5xl px-4 space-y-12">
         <div className="text-center space-y-2">
            <h2 className="text-3xl font-black">사진 한 장으로 모든 걸 알 수 있어요!</h2>
            <p className="text-muted-foreground font-medium">실제 사용 예시: 고양이 피부 문제 해결 사료 매칭!</p>
         </div>
         
         <div className="relative px-12">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {screenshots.map((s, i) => (
                  <CarouselItem key={i} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3">
                    <div className="space-y-4">
                      <div className="aspect-[9/16] bg-muted rounded-[2.5rem] shadow-2xl border-4 border-white overflow-hidden relative group">
                        <img src={s.url} alt={s.caption} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                           <p className="text-white font-black text-sm">{s.caption}</p>
                        </div>
                      </div>
                      <p className="text-center text-xs font-bold text-muted-foreground">{s.caption}</p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 h-12 w-12 bg-white shadow-xl border-none" />
              <CarouselNext className="right-0 h-12 w-12 bg-white shadow-xl border-none" />
            </Carousel>
         </div>
      </div>

      {/* Footer / Legal */}
      <div className="space-y-4 max-w-lg pt-10 text-center px-4">
        <div className="flex items-center justify-center gap-1.5 opacity-40">
           <Gavel className="w-3 h-3 text-muted-foreground" />
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Legal Notice</p>
        </div>
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
          Pettner는 AI 기술을 활용한 영양 정보 분석 도구이며, 전문 수의사의 진단을 대신할 수 없습니다. 모든 최종 결정은 반드시 전문 수의사의 상담을 거쳐야 합니다. AAFCO 준수 및 수의 영양학자 검수를 완료했습니다.
        </p>
      </div>
    </div>
  );
}
