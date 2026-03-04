
'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Loader2, ChevronRight, HeartPulse, ClipboardCheck, CreditCard, Crown, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { Badge } from '@/components/ui/badge';
import PetProfileSurvey from '@/components/pet-profile-survey';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import PaymentModal from '@/components/payment-modal';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showSurvey, setShowSurvey] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (user && db) {
      const fetchUserData = async () => {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setIsPremium(snap.data().isPremium || false);
        }
      };
      fetchUserData();
    }
  }, [user, db]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const getInitials = (email: string | null) => {
    return email ? email.substring(0, 2).toUpperCase() : '..';
  }

  return (
    <div className="flex-grow p-4 md:p-8 bg-muted/20">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black font-headline tracking-tight">내 정보</h1>
          <Badge className={isPremium ? "bg-amber-500 text-white font-black px-3 py-1" : "bg-primary/10 text-primary border-primary/20 px-3 py-1 font-bold"}>
            {isPremium ? 'PREMIUM (Lifetime)' : 'FREE USER'}
          </Badge>
        </div>
        
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-6 p-8 space-y-0">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tight">{user.displayName || 'Pettner User'}</CardTitle>
              <CardDescription className="font-medium text-muted-foreground">{user.email}</CardDescription>
            </div>
          </CardHeader>
        </Card>

        {!isPremium && (
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden border-2 border-primary/20 animate-in zoom-in-95 duration-500">
            <CardHeader className="p-8 border-b bg-primary/5">
              <div className="flex justify-between items-center">
                 <CardTitle className="flex items-center gap-2 text-xl font-black">
                   <Crown className="text-amber-500"/>
                   한정 특가: 평생 무제한 패스
                 </CardTitle>
                 <Badge variant="outline" className="font-bold border-amber-500 text-amber-500">-50% OFF</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="space-y-2">
                    <p className="text-lg font-bold">4,990원으로 누리는 수의사의 눈</p>
                    <ul className="text-sm text-muted-foreground space-y-1 font-medium">
                      <li className="flex items-center gap-2"><Sparkles size={14} className="text-primary"/> AI 무제한 정밀 분석</li>
                      <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-primary"/> 모든 분석 광고 제거</li>
                      <li className="flex items-center gap-2"><Zap size={14} className="text-primary"/> 가장 빠른 최신 모델 분석 적용</li>
                    </ul>
                 </div>
                 <div className="text-center md:text-right space-y-2">
                    <p className="text-3xl font-black text-primary">4,990원</p>
                    <Button onClick={() => setShowPayment(true)} size="lg" className="rounded-2xl h-14 px-8 font-black text-lg shadow-lg hover:scale-105 transition-transform">
                      지금 구매하기
                    </Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isPremium && (
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-amber-50 to-white overflow-hidden border-2 border-amber-200">
            <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
               <div className="bg-amber-100 p-4 rounded-full text-amber-600">
                 <Crown size={40} />
               </div>
               <div>
                 <h3 className="text-2xl font-black text-amber-800">Premium Member</h3>
                 <p className="text-amber-700/70 font-bold">평생 무제한 패스를 이용 중입니다.</p>
               </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <HeartPulse className="text-primary"/>
              나의 반려동물 정밀 프로필
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="border-[3px] border-dashed border-muted rounded-[2rem] p-12 text-center bg-muted/5">
                <p className="text-muted-foreground font-bold mb-6 text-lg">아직 등록된 반려동물이 없습니다.</p>
                <Dialog open={showSurvey} onOpenChange={setShowSurvey}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="rounded-2xl h-14 px-8 font-black border-2 border-primary text-primary hover:bg-primary/5 transition-all">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      정밀 설문 시작하기
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                    <PetProfileSurvey onComplete={() => setShowSurvey(false)} />
                  </DialogContent>
                </Dialog>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 pb-12">
           <Button variant="ghost" className="justify-between h-16 bg-white shadow-xl rounded-2xl border-none p-6 group overflow-hidden" onClick={() => router.push('/history')}>
              <span className="flex items-center gap-3 font-black text-lg"><ClipboardCheck className="w-6 h-6 text-primary"/> 분석 기록</span>
              <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"/>
           </Button>
           <Button variant="ghost" className="justify-between h-16 bg-white shadow-xl rounded-2xl border-none p-6 group overflow-hidden">
              <span className="flex items-center gap-3 font-black text-lg"><CreditCard className="w-6 h-6 text-primary"/> 결제 수단</span>
              <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"/>
           </Button>
        </div>
      </div>

      <PaymentModal open={showPayment} onOpenChange={setShowPayment} />
    </div>
  );
}
