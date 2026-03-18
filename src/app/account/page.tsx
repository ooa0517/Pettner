
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
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
import { PlusCircle, Loader2, ChevronRight, HeartPulse, ClipboardCheck, CreditCard, Crown, Sparkles, Zap, ShieldCheck, Cat, Dog, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { Badge } from '@/components/ui/badge';
import PetProfileSurvey from '@/components/pet-profile-survey';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, collection, deleteDoc } from 'firebase/firestore';
import PaymentModal from '@/components/payment-modal';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showSurvey, setShowSurvey] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const petsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'pets');
  }, [db, user]);

  const { data: pets, isLoading: isPetsLoading } = useCollection(petsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (user && db) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setUserData(snap.data());
      });
    }
  }, [user, db]);

  const handleDeletePet = async (petId: string) => {
    if (!db || !user) return;
    if (!confirm("정말 이 프로필을 삭제하시겠습니까?")) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'pets', petId));
      toast({ title: "프로필 삭제 완료" });
    } catch (e) {
      toast({ variant: "destructive", title: "삭제 실패" });
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPremium = userData?.isPremium || false;
  
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
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tight">{user.displayName || 'Pettner User'}</CardTitle>
              <CardDescription className="font-medium text-muted-foreground">{user.email}</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <HeartPulse className="text-primary"/>
              나의 반려동물 프로필
            </CardTitle>
            <Dialog open={showSurvey} onOpenChange={setShowSurvey}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl border-primary text-primary font-bold">
                  <PlusCircle className="mr-2 h-4 w-4" /> 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-white rounded-[2.5rem]">
                <DialogHeader className="sr-only">
                  <DialogTitle>반려동물 프로필 등록</DialogTitle>
                  <DialogDescription>아이의 신체 정보와 식습관을 입력하여 정밀 분석을 준비합니다.</DialogDescription>
                </DialogHeader>
                <PetProfileSurvey onComplete={() => setShowSurvey(false)} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {isPetsLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary"/></div>
            ) : pets && pets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pets.map(pet => (
                  <div key={pet.id} className="p-6 bg-muted/30 rounded-3xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm">
                        {pet.petType === 'cat' ? <Cat className="text-primary"/> : <Dog className="text-primary"/>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-lg">{pet.name}</p>
                          <Badge variant="ghost" className="text-[10px] p-0 font-bold opacity-50">
                            {pet.gender === 'male' ? '남아' : pet.gender === 'female' ? '여아' : ''}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-bold">
                          {pet.breed} · {pet.ageYears}살 {pet.ageMonths}개월 · {pet.weight}kg · {pet.isNeutered ? '중성화O' : '중성화X'}
                        </p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10" onClick={() => handleDeletePet(pet.id)}>
                      <Trash2 size={18}/>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-[3px] border-dashed border-muted rounded-[2rem] p-12 text-center bg-muted/5">
                <p className="text-muted-foreground font-bold mb-4">등록된 반려동물이 없습니다.</p>
                <p className="text-xs text-muted-foreground">아이의 정보를 미리 저장하고 1초 만에 분석을 받아보세요.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {!isPremium && (
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-white overflow-hidden border-2 border-primary/10">
            <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-4 text-center md:text-left">
                  <Badge className="bg-amber-500 text-white font-black">LIFETIME OFFER</Badge>
                  <h3 className="text-3xl font-black leading-tight">평생 무제한 패스<br/>지금 4,990원</h3>
                  <p className="text-muted-foreground font-medium">광고 제거 + 무제한 분석 + 정밀 영양 리포트 저장</p>
               </div>
               <Button onClick={() => setShowPayment(true)} size="lg" className="rounded-2xl h-16 px-10 font-black text-xl shadow-xl hover:scale-105 transition-transform">
                 지금 구매하기
               </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-4 pb-12">
           <Button variant="ghost" className="justify-between h-16 bg-white shadow-xl rounded-2xl border-none p-6 group overflow-hidden" onClick={() => router.push('/history')}>
              <span className="flex items-center gap-3 font-black text-lg"><ClipboardCheck className="w-6 h-6 text-primary"/> 분석 기록</span>
              <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"/>
           </Button>
           <Button variant="ghost" className="justify-between h-16 bg-white shadow-xl rounded-2xl border-none p-6 group overflow-hidden">
              <span className="flex items-center gap-3 font-black text-lg"><CreditCard className="w-6 h-6 text-primary"/> 결제 관리</span>
              <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"/>
           </Button>
        </div>
      </div>

      <PaymentModal open={showPayment} onOpenChange={setShowPayment} />
    </div>
  );
}
