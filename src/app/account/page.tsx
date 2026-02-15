
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
import { PlusCircle, Loader2, ChevronRight, Star, HeartPulse, ClipboardCheck } from 'lucide-react';
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

  return (
    <div className="flex-grow p-4 md:p-8 bg-muted/20">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline">마이 페이지</h1>
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">일반 회원</Badge>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Avatar className="h-20 w-20 border-4 border-white shadow-md">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.displayName || '사용자'}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-headline">
              <HeartPulse className="text-primary"/>
              나의 반려동물 정밀 프로필
            </CardTitle>
            <CardDescription>
              아이의 건강 상태와 습관을 등록하면 맞춤 분석이 가능해집니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-2xl p-10 text-center bg-muted/10">
                <p className="text-muted-foreground mb-4">아직 등록된 반려동물이 없습니다.</p>
                <Dialog open={showSurvey} onOpenChange={setShowSurvey}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-full">
                      <PlusCircle className="mr-2 h-4 w-4" />
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

        <div className="grid grid-cols-2 gap-4">
           <Button variant="ghost" className="justify-between h-14 bg-white shadow-sm border" onClick={() => router.push('/history')}>
              <span className="flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-primary"/> 분석 기록</span>
              <ChevronRight className="w-4 h-4 opacity-30"/>
           </Button>
           <Button variant="ghost" className="justify-between h-14 bg-white shadow-sm border">
              <span className="flex items-center gap-2"><Star className="w-4 h-4 text-primary"/> 즐겨찾기</span>
              <ChevronRight className="w-4 h-4 opacity-30"/>
           </Button>
        </div>
      </div>
    </div>
  );
}
