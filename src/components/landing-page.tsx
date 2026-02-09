
'use client';

import { Apple, Mail, Sparkles, ArrowRight, Info, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
        description: 'Firebase 콘솔의 Authorized Domains 설정을 확인해주세요.' 
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-in fade-in zoom-in duration-700 p-4">
      <div className="space-y-4">
        <div className="inline-flex p-4 bg-primary rounded-3xl shadow-2xl shadow-primary/40 animate-bounce">
          <span className="text-white text-4xl">🐾</span>
        </div>
        <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-primary">
          Pettner
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          수의 영양학으로 더 건강해지는<br/>반려동물 먹거리 통합 분석 서비스
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button 
          onClick={onStart} 
          size="lg"
          className="w-full h-16 text-xl rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform"
        >
          <Sparkles className="mr-2 h-6 w-6" />
          로그인 없이 바로 시작
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="text-xs text-muted-foreground underline">
              <Info className="w-3 h-3 mr-1"/> 핸드폰 테스트 시 401 오류가 뜨나요?
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs rounded-2xl">
            <DialogHeader>
              <DialogTitle>📱 모바일 테스트 안내</DialogTitle>
              <DialogDescription className="text-left space-y-4 pt-4 text-sm">
                <p>1. 현재 미리보기 URL은 보안상 개발자 본인만 접근 가능하여 401 오류가 발생할 수 있습니다.</p>
                <p>2. 해결을 위해 <strong>Firebase App Hosting</strong>으로 정식 배포가 필요합니다.</p>
                <p>3. 자세한 방법은 프로젝트 루트의 <strong>README.md</strong>를 확인해 주세요!</p>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              분석 기록 저장을 위해 로그인하기
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={handleGoogleLogin} 
            variant="outline" 
            className="h-14 rounded-2xl border-2" 
            disabled={isUserLoading || isLoggingIn}
          >
            {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="w-5 h-5 mr-2" />}
            Google
          </Button>
          
          <Button 
            className="h-14 rounded-2xl bg-black text-white"
            onClick={() => toast({ title: "준비 중", description: "애플 로그인은 현재 준비 중입니다." })}
          >
            <Apple className="w-5 h-5 mr-2" />
            Apple
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-w-lg">
        <div className="flex items-center justify-center gap-1.5 opacity-60">
           <Gavel className="w-3 h-3 text-muted-foreground" />
           <p className="text-[10px] text-muted-foreground">Legal Notice & Disclaimer</p>
        </div>
        <p className="text-[9px] text-muted-foreground/60 leading-relaxed text-center px-4">
          Pettner는 AI 기술을 활용한 영양 정보 분석 도구이며, 어떠한 경우에도 전문 수의사의 의학적 진단이나 처방을 대신할 수 없습니다. 
          제공되는 정보는 공신력 있는 기관(AAFCO, NRC 등)의 기준을 따르나, 실제 제품 성분 및 제조 환경에 따라 차이가 있을 수 있습니다. 
          반려동물의 급여 및 건강 관리에 대한 모든 최종 결정은 반드시 전문 수의사의 상담을 거쳐야 합니다.
        </p>
      </div>
    </div>
  );
}
