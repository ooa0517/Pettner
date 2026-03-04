
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUpdating, setIsUpdating] = useState(true);

  useEffect(() => {
    if (user && db && !isUserLoading) {
      const updatePremiumStatus = async () => {
        try {
          // 결제 정보 확인 (보안을 위해 실제 운영 시 서버 측 검증 필수)
          const paymentKey = searchParams.get('paymentKey');
          const orderId = searchParams.get('orderId');
          const amount = searchParams.get('amount');

          if (paymentKey && orderId) {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
              isPremium: true,
              premiumActivationDate: serverTimestamp(),
              lastPaymentInfo: { paymentKey, orderId, amount },
            });
          }
        } catch (error) {
          console.error("Premium activation failed:", error);
        } finally {
          setIsUpdating(false);
        }
      };

      updatePremiumStatus();
    }
  }, [user, db, isUserLoading, searchParams]);

  if (isUserLoading || isUpdating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-black">평생권을 활성화하고 있습니다...</h1>
        <p className="text-muted-foreground font-medium">잠시만 기다려주세요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/20">
      <Card className="max-w-md w-full rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white text-center">
        <div className="bg-success p-12 text-white flex flex-col items-center space-y-6">
          <div className="bg-white/20 p-6 rounded-full animate-bounce">
            <CheckCircle2 size={64} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">결제 성공!</h1>
        </div>
        <CardContent className="p-10 space-y-8">
          <div className="space-y-2">
            <p className="text-xl font-black text-foreground">프리미엄 회원이 되신 것을 축하합니다!</p>
            <p className="text-muted-foreground font-medium">이제 Pettner의 모든 기능을 광고 없이<br/>무제한으로 이용하실 수 있습니다.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 text-left">
             {[
               "일일 분석 횟수 제한 해제",
               "모든 광고 제거",
               "정밀 분석 리포트 무제한 저장",
               "수의 영양학 알고리즘 우선 적용"
             ].map((text, i) => (
               <div key={i} className="flex items-center gap-3 bg-success/5 p-4 rounded-2xl">
                 <Sparkles className="text-success h-5 w-5 shrink-0" />
                 <span className="font-bold text-sm text-success">{text}</span>
               </div>
             ))}
          </div>

          <Button 
            onClick={() => router.push('/')} 
            size="lg" 
            className="w-full h-16 rounded-2xl text-xl font-black shadow-xl"
          >
            지금 바로 시작하기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
