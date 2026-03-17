'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, Mail, Lock, Loader2, LogIn, UserPlus, 
  ShieldCheck, Microscope, Zap, ChevronRight
} from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'signup';

/**
 * Pettner Ultra-Premium Auth Screen v26.1
 * - SaaS Luxury Style Layout
 * - Glassmorphism effects and value-driven UI
 */
export default function AuthScreen() {
  const auth = useAuth();
  const { toast } = useToast();
  const [mode, setAuthMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const BENEFITS = [
    { icon: Microscope, title: "5,000+ 논문 데이터", desc: "수의 영양학적 근거 기반 분석" },
    { icon: ShieldCheck, title: "주의 성분 200종 필터링", desc: "알러지 유발 물질 실시간 탐지" },
    { icon: Zap, title: "1초 정밀 매칭", desc: "아이의 건강 상태와 1:1 상성 산출" }
  ];

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast({ title: "반가워요!", description: "성공적으로 인증되었습니다." });
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
        toast({ title: "환영합니다", description: "성공적으로 로그인되었습니다." });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "가입 완료", description: "Pettner의 정밀 리포트 서비스를 시작합니다." });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "오류 발생", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8F9FF] overflow-hidden">
      {/* Left Hero Section (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-20 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 space-y-12 max-w-lg animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black uppercase tracking-widest">Pettner Precision v26.1</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-[1.1]">
              먹거리 한 입의 <br/>과학적 진실.
            </h1>
            <p className="text-xl text-white/80 font-medium leading-relaxed">
              가입 즉시 5,000편 이상의 수의 영양학 데이터가 당신의 아이를 위해 작동하기 시작합니다.
            </p>
          </div>

          <div className="space-y-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-start gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all group">
                <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <b.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg">{b.title}</h4>
                  <p className="text-sm text-white/60 font-medium">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Auth Action Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <div className="lg:hidden mb-10 text-center space-y-2">
           <div className="bg-primary p-4 rounded-3xl inline-block shadow-2xl shadow-primary/20 mb-4 animate-bounce">
             <Sparkles className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-3xl font-black tracking-tight">Pettner</h2>
           <p className="text-muted-foreground font-medium">수의사가 설계한 영양 분석 시스템</p>
        </div>

        <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[3rem] bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <CardContent className="p-8 md:p-12 space-y-10">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-3xl font-black tracking-tight text-foreground">
                {mode === 'login' ? "다시 만나서 반가워요!" : "반가워요, 집사님!"}
              </h3>
              <p className="text-muted-foreground font-medium">
                {mode === 'login' ? "아이의 건강 리포트가 기다리고 있어요." : "지금 가입하고 정밀 리포트를 무료로 받아보세요."}
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleGoogleLogin} 
                variant="outline"
                disabled={loading}
                className="w-full h-16 rounded-2xl bg-white border-2 border-muted hover:bg-muted/50 hover:border-primary/20 text-foreground font-black flex items-center justify-center gap-3 transition-all shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Google 계정으로 계속하기
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-4 text-muted-foreground font-black tracking-widest">Or login with Email</span>
                </div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-5">
                <div className="space-y-2">
                  <Label className="ml-1 font-black text-[10px] uppercase tracking-widest text-muted-foreground opacity-70">이메일</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com" 
                      className="h-14 pl-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground opacity-70">비밀번호</Label>
                    {mode === 'login' && <button type="button" className="text-[10px] font-black text-primary hover:underline">비밀번호 찾기</button>}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                    <Input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="h-14 pl-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold" 
                      required 
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-16 rounded-[1.5rem] text-lg font-black shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] active:scale-95 transition-all">
                  {loading ? <Loader2 className="animate-spin" /> : (
                    mode === 'login' ? <><LogIn className="mr-2 h-5 w-5" /> 로그인</> : <><UserPlus className="mr-2 h-5 w-5" /> 무료 회원가입</>
                  )}
                </Button>
              </form>
            </div>

            <div className="text-center pt-2">
              <button 
                onClick={() => setAuthMode(mode === 'login' ? 'signup' : 'login')}
                className="group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                {mode === 'login' ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}
                <span className="text-primary font-black flex items-center">
                  {mode === 'login' ? "회원가입" : "로그인"}
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-12 text-[10px] text-muted-foreground font-medium text-center max-w-xs leading-relaxed opacity-50">
          가입 시 Pettner의 이용약관 및 개인정보 처리방침에 동의하게 됩니다. <br/>
          © 2024 Pettner Precision Team.
        </p>
      </div>
    </div>
  );
}
