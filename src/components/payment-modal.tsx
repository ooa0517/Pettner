
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, CheckCircle2, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type PaymentMethod = 'card' | 'toss' | 'kakao' | 'apple';

export default function PaymentModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = async () => {
    if (!user || !db) {
      toast({
        variant: "destructive",
        title: "로그인이 필요합니다",
        description: "결제를 진행하려면 먼저 로그인해주세요.",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // [시뮬레이션] 실제 환경에서는 여기서 토스페이먼츠/포트원 SDK를 호출합니다.
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        // 기존 유저 정보 업데이트
        await updateDoc(userDocRef, { 
          isPremium: true,
          updatedAt: new Date().toISOString()
        });
      } else {
        // 유저 문서가 없는 경우 생성 (UserProfileSyncer가 실패했을 경우 대비)
        await setDoc(userDocRef, {
          id: user.uid,
          email: user.email,
          name: user.displayName || 'Pettner User',
          isPremium: true,
          dailyUsageCount: 0,
          createdAt: new Date().toISOString()
        });
      }
      
      setIsSuccess(true);
      toast({
        title: "평생권 활성화 완료!",
        description: "이제 Pettner의 모든 기능을 광고 없이 무제한으로 이용하실 수 있습니다.",
      });
      
      // 결제 성공 후 2초 뒤 모달을 닫고 상태 반영을 위해 페이지 새로고침 제안
      setTimeout(() => {
        onOpenChange(false);
        window.location.reload(); 
      }, 2000);
    } catch (error) {
      console.error("Payment update error:", error);
      toast({
        variant: "destructive",
        title: "권한 업데이트 실패",
        description: "결제는 완료되었으나 계정 정보 업데이트에 실패했습니다. 고객센터로 문의해주세요.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-12 text-center space-y-6 border-none shadow-2xl">
           <div className="bg-success/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-success animate-bounce">
             <CheckCircle2 size={48} />
           </div>
           <div className="space-y-2">
             <h2 className="text-3xl font-black">환영합니다!</h2>
             <p className="font-bold text-muted-foreground">평생 무제한 패스가 성공적으로 활성화되었습니다.</p>
           </div>
           <p className="text-sm text-muted-foreground animate-pulse">잠시 후 리포트로 돌아갑니다...</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[3rem] border-none p-0 overflow-hidden bg-white shadow-2xl">
        <div className="bg-primary p-10 text-white space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="bg-white/20 text-white border-none font-bold px-3 py-1">LIFETIME PASS</Badge>
            <ShieldCheck className="opacity-50" />
          </div>
          <DialogTitle className="text-3xl font-black text-white">4,990원 결제하기</DialogTitle>
          <p className="text-white/80 font-medium leading-tight">
            한 번의 결제로 평생 수의사의 눈을 가지세요.<br/>모든 기능 무제한 & 광고 제거 혜택.
          </p>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-black text-muted-foreground uppercase ml-2 tracking-widest">결제 수단 선택</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'card', name: '신용/체크카드', icon: CreditCard },
                { id: 'toss', name: '토스페이', icon: Zap },
                { id: 'kakao', name: '카카오페이', icon: Smartphone },
                { id: 'apple', name: '애플페이', icon: Smartphone },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMethod(item.id as PaymentMethod)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                    method === item.id ? "border-primary bg-primary/5" : "border-muted/50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                  )}
                >
                  <item.icon size={20} className={method === item.id ? "text-primary" : ""} />
                  <span className="text-[11px] font-black">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted/30 p-5 rounded-2xl flex justify-between items-center">
             <span className="font-bold text-sm">최종 결제 금액</span>
             <span className="text-2xl font-black text-primary">4,990원</span>
          </div>

          <Button 
            onClick={handlePayment} 
            disabled={isProcessing}
            className="w-full h-16 rounded-2xl text-xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
            결제하고 바로 시작하기
          </Button>
          
          <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
            결제 즉시 프리미엄 혜택이 적용되며 계정에 영구 귀속됩니다.<br/>
            디지털 콘텐츠 특성상 결제 후 사용 시 환불이 어려울 수 있습니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
