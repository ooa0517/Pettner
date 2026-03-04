
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, CheckCircle2, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type PaymentMethod = 'CARD' | 'TOSSPAY' | 'KAKAOPAY' | 'APPLEPAY';

export default function PaymentModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "로그인이 필요합니다",
        description: "결제를 진행하려면 먼저 로그인해주세요.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // @ts-ignore: TossPayments is loaded globally via Script tag in layout
      const clientKey = 'test_ck_D5ya AdvZdA0R8V996O8V270GjYrj'; // 테스트용 키 (실전 시 변경 필요)
      // @ts-ignore
      const tossPayments = window.TossPayments(clientKey);

      const orderId = `order_${user.uid.substring(0, 8)}_${Date.now()}`;
      
      // 실제 결제창 호출
      await tossPayments.requestPayment(method === 'CARD' ? '카드' : method, {
        amount: 4990,
        orderId: orderId,
        orderName: 'Pettner 평생 무제한 패스',
        customerName: user.displayName || 'Pettner User',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
      
    } catch (error: any) {
      console.error("Payment Request Error:", error);
      setIsProcessing(false);
      if (error.code !== 'USER_CANCEL') {
        toast({
          variant: "destructive",
          title: "결제 요청 실패",
          description: error.message || "결제창을 불러오지 못했습니다.",
        });
      }
    }
  };

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
                { id: 'CARD', name: '신용/체크카드', icon: CreditCard },
                { id: 'TOSSPAY', name: '토스페이', icon: Zap },
                { id: 'KAKAOPAY', name: '카카오페이', icon: Smartphone },
                { id: 'APPLEPAY', name: '애플페이', icon: Smartphone },
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
