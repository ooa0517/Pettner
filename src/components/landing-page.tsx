'use client';

import { Mail, Sparkles, ArrowRight, Gavel, ShieldCheck, Microscope, Zap, Scale, HeartPulse, ShoppingBag, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage({ onStart }: { onStart?: () => void }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const { isUserLoading } = useUser();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    if (!auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication service unavailable.' });
        return;
    }
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: t('loginPage.loginSuccessTitle'), description: t('loginPage.loginSuccessDescription') });
      if (onStart) onStart();
    } catch (error: any) {
      console.error('Google Login Error:', error);
      toast({ 
        variant: 'destructive', 
        title: t('loginPage.loginFailedTitle'), 
        description: t('loginPage.googleLoginFailed') 
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const features = [
    {
      icon: <Zap className="text-amber-500" />,
      title: "정밀 점수화 알고리즘",
      desc: "AAFCO 기준 + 5,000편 이상의 수의학 논문을 기반으로 100점 만점의 과학적 등급을 산출합니다."
    },
    {
      icon: <ShoppingBag className="text-primary" />,
      title: "원재료 100% 전수 감사",
      desc: "제품 뒷면 스캔 한 번으로 모든 재료의 출처, 안전성, 영양 가치를 논문 기반으로 평가합니다."
    },
    {
      icon: <Scale className="text-success" />,
      title: "맞춤형 급여량 계산",
      desc: "체중 및 활동량에 따른 일일 권장 칼로리와 급여량을 AVMA 가이드라인에 맞춰 계산합니다."
    },
    {
      icon: <Factory className="text-orange-500" />,
      title: "제조 투명성 감사",
      desc: "브랜드의 직접 소싱 여부, ISO/HACCP 인증, 리콜 이력을 추적하여 안전성을 검증합니다."
    }
  ];

  return (
    <div className="flex flex-col items-center space-y-20 py-16 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="text-center space-y-8 px-4">
        <Badge className="bg-primary/10 text-primary border-none px-4 py-2 rounded-full font-black text-[10px] tracking-widest uppercase">
          5,000+ Veterinary Papers Analyzed
        </Badge>
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-foreground leading-tight">
            내 아이가 먹는 것,<br/><span className="text-primary">과학</span>으로 증명하세요
          </h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Pettner는 단순한 성분 나열이 아닙니다. 수천 편의 학술 논문을 학습한 AI 수의사가 우리 아이 식단의 모든 것을 분석합니다.
          </p>
        </div>

        <div className="w-full max-w-sm mx-auto pt-6 space-y-4">
          <Button 
            onClick={onStart} 
            size="lg"
            className="w-full h-20 text-2xl font-bold rounded-[2.5rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all"
          >
            <Sparkles className="mr-3 h-7 w-7" />
            무료 정밀 분석 시작
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
          <p className="text-xs text-muted-foreground font-bold">50만+ 반려인이 신뢰하는 초정밀 분석 엔진</p>
        </div>
      </div>

      {/* Trust Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-4">
        {[
          { label: "분석 논문", val: "5,000+" },
          { label: "활성 사용자", val: "50만+" },
          { label: "평균 평점", val: "4.9/5" },
          { label: "DB 업데이트", val: "Daily" }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-xl text-center border-none">
            <p className="text-3xl font-black text-primary mb-1">{s.val}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Feature Section */}
      <div className="w-full space-y-12 px-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black">왜 Pettner인가?</h2>
          <p className="text-muted-foreground font-medium">데이터가 말해주는 우리 아이 건강 리포트</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:bg-primary/5 transition-colors">
              <CardContent className="p-8 flex items-start gap-6">
                <div className="p-4 bg-muted rounded-3xl group-hover:bg-white transition-colors">
                  {f.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-xl">{f.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Demo Section Hint */}
      <div className="w-full max-w-4xl px-4 py-12 bg-muted/30 rounded-[3rem] text-center space-y-8">
        <h3 className="text-2xl font-black">사진 한 장으로 모든 걸 알 수 있어요!</h3>
        <div className="grid grid-cols-3 gap-4">
           {[1, 2, 3].map(i => (
             <div key={i} className="aspect-[9/16] bg-white rounded-[2rem] shadow-lg flex items-center justify-center border-4 border-white overflow-hidden">
                <img src={`https://picsum.photos/seed/demo-${i}/400/700`} alt="Demo" className="object-cover w-full h-full opacity-40" />
             </div>
           ))}
        </div>
        <p className="text-sm font-bold text-muted-foreground">"사료 선택 스트레스 끝! 논문 기반이라 믿음 가요." – 지수맘</p>
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
