
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Loader2, ChevronRight, Star, HeartPulse, ClipboardCheck, CreditCard, Crown, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { Badge } from '@/components/ui/badge';
import PetProfileSurvey from '@/components/pet-profile-survey';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

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

  const handleProfileComplete = (data: any) => {
    console.log('Survey Data:', data);
    setShowSurvey(false);
    toast({
      title: "프로필 등록 완료!",
      description: "이제 아이의 상태에 맞춘 정밀 분석 리포트를 받아보실 수 있습니다.",
    });
  };

  const handleUpgrade = () => {
    toast({
      title: "베타 서비스 안내",
      description: "현재는 모든 기능을 무료로 이용하실 수 있습니다. 정식 버전에서 만나요!",
    });
  };

  return (
    <div className="flex-grow p-4 md:p-8 bg-muted/20">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black font-headline tracking-tight">내 정보</h1>
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-bold">일반 회원</Badge>
        </div>
        
        {/* 사용자 프로필 카드 */}
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

        {/* 구독 관리 섹션 (신규 추가) */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b bg-muted/5">
            <div className="flex justify-between items-center">
               <CardTitle className="flex items-center gap-2 text-xl font-black">
                 <Crown className="text-amber-500"/>
                 구독 서비스 관리
               </CardTitle>
               <Badge variant="outline" className="font-bold border-muted-foreground/30 text-muted-foreground">Free Plan</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="space-y-2">
                  <p className="text-lg font-bold">프리미엄 멤버십으로 업그레이드하세요</p>
                  <ul className="text-sm text-muted-foreground space-y-1 font-medium">
                    <li className="flex items-center gap-2"><Sparkles size={14} className="text-primary"/> AI 무제한 정밀 분석</li>
                    <li className="flex items-center gap-2"><Sparkles size={14} className="text-primary"/> 수의사 1:1 채팅 상담권</li>
                    <li className="flex items-center gap-2"><Sparkles size={14} className="text-primary"/> 프리미엄 사료 정기 배송 할인</li>
                  </ul>
               </div>
               <Button onClick={handleUpgrade} size="lg" className="rounded-2xl h-14 px-8 font-black text-lg shadow-lg hover:scale-105 transition-transform">
                 멤버십 가입하기
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* 반려동물 프로필 섹션 */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <HeartPulse className="text-primary"/>
              나의 반려동물 정밀 프로필
            </CardTitle>
            <CardDescription className="font-medium">
              아이의 건강 상태와 습관을 등록하면 맞춤 분석이 가능해집니다.
            </CardDescription>
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
                    <PetProfileSurvey onComplete={handleProfileComplete} />
                  </DialogContent>
                </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* 하단 퀵 메뉴 */}
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
    </div>
  );
}
