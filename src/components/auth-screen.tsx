'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Mail, Lock, Loader2, LogIn, UserPlus } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'signup';

export default function AuthScreen() {
  const auth = useAuth();
  const { toast } = useToast();
  const [mode, setAuthMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast({ title: "로그인 성공", description: "Pettner에 오신 것을 환영합니다!" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "인증 실패", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email || !password) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "로그인 성공" });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "회원가입 성공", description: "이제 분석을 시작할 수 있습니다." });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "오류 발생", description: e.message });
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

        <CardContent className="p-10 space-y-8">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label className="ml-1 font-bold text-xs uppercase tracking-widest text-muted-foreground">이메일 주소</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="h-14 pl-12 rounded-2xl bg-muted/20 border-none font-bold" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="ml-1 font-bold text-xs uppercase tracking-widest text-muted-foreground">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-14 pl-12 rounded-2xl bg-muted/20 border-none font-bold" 
                  required 
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-16 rounded-2xl text-lg font-black shadow-xl">
              {loading ? <Loader2 className="animate-spin" /> : (
                mode === 'login' ? <><LogIn className="mr-2 h-5 w-5" /> 로그인</> : <><UserPlus className="mr-2 h-5 w-5" /> 회원가입</>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-4 text-muted-foreground font-black tracking-widest">Or Continue With</span>
            </div>
          </div>

          <Button 
            onClick={handleGoogleLogin} 
            variant="outline"
            disabled={loading}
            className="w-full h-16 rounded-2xl bg-white border-2 border-muted hover:bg-muted text-foreground font-black flex items-center justify-center gap-3 transition-all"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Google 계정으로 시작
          </Button>

          <div className="text-center">
            <button 
              onClick={() => setAuthMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm font-bold text-primary hover:underline underline-offset-4"
            >
              {mode === 'login' ? "계정이 없으신가요? 회원가입하기" : "이미 계정이 있으신가요? 로그인하기"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
