
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Sparkles } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AuthScreen() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast({ title: "로그인 성공", description: "Pettner에 오신 것을 환영합니다!" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "로그인 실패", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/20">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <div className="bg-primary p-12 text-center text-white space-y-4">
          <div className="bg-white/20 p-4 rounded-3xl inline-block backdrop-blur-md">
            <Sparkles className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter">Pettner 시작하기</CardTitle>
          <CardDescription className="text-white/70 font-medium">
            분석 기록을 저장하고 우리 아이 맞춤 리포트를 받으세요.
          </CardDescription>
        </div>
        <CardContent className="p-10 space-y-6">
          <Button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full h-16 rounded-2xl bg-white border-2 border-muted hover:bg-muted text-foreground font-black flex items-center justify-center gap-3 shadow-sm transition-all"
          >
            <Mail className="text-primary" /> Google로 시작하기
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/login')}
            className="w-full h-12 font-bold text-muted-foreground"
          >
            이메일로 로그인하기
          </Button>
          <p className="text-[10px] text-center text-muted-foreground">
            로그인 시 Pettner의 이용 약관 및 개인정보 처리 방침에 동의하게 됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
