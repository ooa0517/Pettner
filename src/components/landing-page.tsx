
'use client';

import { PawPrint, Apple, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';

export default function LandingPage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: '로그인 실패', description: '다시 시도해주세요.' });
    }
  };

  const KakaoIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="#3C1E1E" viewBox="0 0 24 24">
        <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.872 1.884 5.391 4.712 6.845l-1.196 4.414c-.076.28.243.514.478.361l5.204-3.41c.264.026.533.04.802.04 5.523 0 10-3.582 10-8s-4.477-8-10-8z"/>
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-in fade-in zoom-in duration-700">
      <div className="space-y-4">
        <div className="inline-flex p-4 bg-primary rounded-3xl shadow-2xl shadow-primary/40 animate-bounce">
          <PawPrint className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-primary">
          Pettner
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          수의 영양학으로 더 건강해지는<br/>반려동물 사료 분석 서비스
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-14 text-lg rounded-2xl border-2 hover:bg-muted/50 transition-all">
          <Mail className="w-5 h-5 mr-2" />
          Google 계정으로 계속하기
        </Button>
        <Button onClick={() => toast({ title: '준비 중입니다' })} className="w-full h-14 text-lg rounded-2xl bg-black hover:bg-black/90 text-white transition-all">
          <Apple className="w-5 h-5 mr-2" />
          Apple 계정으로 계속하기
        </Button>
        <Button onClick={() => toast({ title: '준비 중입니다' })} className="w-full h-14 text-lg rounded-2xl bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] border-none transition-all">
          <KakaoIcon />
          카카오톡으로 계속하기
        </Button>
      </div>

      <p className="text-xs text-muted-foreground opacity-60">
        로그인 시 Pettner의 이용약관 및 개인정보 처리방침에<br/>동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}
