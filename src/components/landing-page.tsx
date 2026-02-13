'use client';

import { Apple, Mail, Sparkles, ArrowRight, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function LandingPage({ onStart }: { onStart?: () => void }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const { isUserLoading } = useUser();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    if (!auth) {
        toast({ variant: 'destructive', title: '오류', description: '인증 서비스를 사용할 수 없습니다.' });
        return;
    }
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: '로그인 성공', description: '반갑습니다!' });
      if (onStart) onStart();
    } catch (error: any) {
      console.error('Google Login Error:', error);
      toast({ 
        variant: 'destructive', 
        title: '로그인 실패', 
        description: '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.' 
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-16 animate-in fade-in zoom-in duration-700 p-4">
      <div className="space-y-6">
        <div className="inline-flex p-5 bg-primary rounded-[2rem] shadow-2xl shadow-primary/40 animate-bounce">
          <span className="text-white text-5xl">🐾</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-black font-headline tracking-tighter text-primary">
            Pettner
          </h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            수의 영양학으로 더 건강해지는<br/>반려동물 먹거리 통합 분석 서비스
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button 
          onClick={onStart} 
          size="lg"
          className="w-full h-20 text-2xl font-bold rounded-3xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Sparkles className="mr-3 h-7 w-7" />
          분석 시작하기
          <ArrowRight className="ml-3 h-6 w-6" />
        </Button>

        <div className="relative py-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground font-medium">
              분석 기록 저장을 위해 로그인하기
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleGoogleLogin} 
            variant="outline" 
            className="h-16 rounded-2xl border-2 hover:bg-muted/50" 
            disabled={isUserLoading || isLoggingIn}
          >
            {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="w-5 h-5 mr-2" />}
            Google
          </Button>
          
          <Button 
            className="h-16 rounded-2xl bg-black text-white hover:bg-black/90"
            onClick={() => toast({ title: "준비 중", description: "애플 로그인은 현재 준비 중입니다." })}
          >
            <Apple className="w-5 h-5 mr-2" />
            Apple
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-w-lg pt-10">
        <div className="flex items-center justify-center gap-1.5 opacity-40">
           <Gavel className="w-3 h-3 text-muted-foreground" />
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Legal Notice</p>
        </div>
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed text-center px-8">
          Pettner는 AI 기술을 활용한 영양 정보 분석 도구이며, 전문 수의사의 진단을 대신할 수 없습니다. 
          반려동물의 건강 관리에 대한 모든 최종 결정은 반드시 전문 수의사의 상담을 거쳐야 합니다.
        </p>
      </div>
    </div>
  );
}
