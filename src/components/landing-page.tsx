
'use client';

import { PawPrint, Apple, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
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
      let description = '로그인 중 오류가 발생했습니다.';
      if (error.code === 'auth/popup-closed-by-user') {
        description = '로그인 창이 닫혔습니다.';
      } else if (error.code === 'auth/operation-not-allowed') {
        description = 'Firebase 콘솔에서 설정을 확인해주세요.';
      }
      toast({ variant: 'destructive', title: '로그인 실패', description });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAppleLogin = async () => {
    if (!auth) {
        toast({ variant: 'destructive', title: '오류', description: '인증 서비스를 사용할 수 없습니다.' });
        return;
    }
    setIsLoggingIn(true);
    const provider = new OAuthProvider('apple.com');
    try {
      await signInWithPopup(auth, provider);
      toast({ title: '로그인 성공', description: '반갑습니다!' });
      if (onStart) onStart();
    } catch (error: any) {
      console.error('Apple Login Error:', error);
      toast({ variant: 'destructive', title: '로그인 실패', description: 'Apple 로그인 중 오류가 발생했습니다.' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-in fade-in zoom-in duration-700">
      <div className="space-y-4">
        <div className="inline-flex p-4 bg-primary rounded-3xl shadow-2xl shadow-primary/40 animate-bounce">
          <span className="text-white text-4xl">🐾</span>
        </div>
        <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-primary">
          Pettner
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          수의 영양학으로 더 건강해지는<br/>반려동물 먹거리 분석 서비스
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* 로그인 없이 시작하는 메인 버튼 */}
        <Button 
          onClick={onStart} 
          size="lg"
          className="w-full h-16 text-xl rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform"
        >
          <Sparkles className="mr-2 h-6 w-6" />
          로그인 없이 바로 시작하기
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              또는 SNS 계정으로 기록 저장하기
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
            onClick={handleAppleLogin} 
            className="h-14 rounded-2xl bg-black text-white"
            disabled={isUserLoading || isLoggingIn}
          >
            {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <Apple className="w-5 h-5 mr-2" />}
            Apple
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground opacity-60">
        로그인하시면 분석 기록을 언제든 다시 볼 수 있습니다.
      </p>
    </div>
  );
}
