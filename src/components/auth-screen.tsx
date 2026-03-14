
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Sparkles, LogIn, UserPlus } from 'lucide-react';
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
          <CardTitle className="text-3xl font-black tracking-tighter leading-tight">
            똑똑한 집사의 <br/>필수 앱, Pettner
          </CardTitle>
          <CardDescription className="text-white/70 font-medium">
            로그인하여 우리 아이를 위한 <br/>맞춤 영양 리포트를 관리하세요.
          </CardDescription>
        </div>
        <CardContent className="p-10 space-y-6">
          <div className="grid gap-3">
            <Button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-white border-2 border-muted hover:bg-muted text-foreground font-black flex items-center justify-center gap-3 shadow-sm transition-all"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Google로 시작하기
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.push('/login')}
                className="h-16 rounded-2xl font-black border-2 gap-2"
              >
                <LogIn size={18} /> 로그인
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/signup')}
                className="h-16 rounded-2xl font-black border-2 gap-2"
              >
                <UserPlus size={18} /> 회원가입
              </Button>
            </div>
          </div>
          
          <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
            계속 진행함으로써 Pettner의 <span className="underline">이용 약관</span> 및 <span className="underline">개인정보 처리 방침</span>에 동의하게 됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
