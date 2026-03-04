
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsageLimitModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const router = useRouter();

  const handlePurchase = () => {
    onOpenChange(false);
    router.push('/account'); // 계정 페이지로 이동하여 결제 유도
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2.5rem] border-none p-0 overflow-hidden bg-white shadow-2xl">
        <div className="bg-primary p-8 text-center text-white space-y-4">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-md">
            <Crown size={32} />
          </div>
          <DialogTitle className="text-2xl font-black">무료 분석 횟수 도달</DialogTitle>
          <p className="text-white/80 font-medium leading-tight">
            일일 무료 분석(5회)을 모두 소진하셨습니다.<br/>평생 무제한 패스로 더 자유롭게 이용하세요!
          </p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-4">
             {[
               "AI 정밀 분석 횟수 평생 무제한",
               "수의학 1:1 리포트 무제한 저장",
               "광고 없이 쾌적한 분석 환경"
             ].map((text, i) => (
               <div key={i} className="flex items-center gap-3">
                 <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                 <span className="font-bold text-sm text-foreground">{text}</span>
               </div>
             ))}
          </div>

          <div className="bg-muted/30 p-4 rounded-2xl flex justify-between items-center">
             <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase">Lifetime Pass</p>
                <p className="text-xl font-black text-primary">4,990원 <span className="text-xs font-medium text-muted-foreground line-through ml-1">9,900원</span></p>
             </div>
             <Zap className="text-amber-500 fill-amber-500" />
          </div>

          <Button onClick={handlePurchase} className="w-full h-16 rounded-2xl text-lg font-black shadow-xl hover:scale-[1.02] transition-transform">
            평생 무제한 패스 구매하기
          </Button>
          
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full font-bold text-muted-foreground">
            나중에 하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
