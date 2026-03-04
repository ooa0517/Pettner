
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || '결제 도중 오류가 발생했습니다.';
  const code = searchParams.get('code') || 'UNKNOWN_ERROR';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/20 text-center">
      <Card className="max-w-md w-full rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
        <div className="bg-destructive p-12 text-white flex flex-col items-center space-y-6">
          <div className="bg-white/20 p-6 rounded-full">
            <AlertCircle size={64} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter">결제 실패</h1>
        </div>
        <CardContent className="p-10 space-y-8">
          <div className="space-y-2">
            <p className="text-xl font-black text-foreground">{message}</p>
            <p className="text-sm text-muted-foreground font-medium">에러 코드: {code}</p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => router.push('/account')} 
              size="lg" 
              className="w-full h-16 rounded-2xl text-xl font-black shadow-xl"
            >
              <RefreshCw className="mr-2 h-5 w-5" /> 다시 시도하기
            </Button>
            <Button 
              variant="ghost"
              onClick={() => router.push('/')} 
              className="w-full font-bold text-muted-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> 메인으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
