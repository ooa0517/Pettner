
'use client';

import { useEffect } from 'react';
import { Microscope, ArrowRight, History, PlusCircle, Crown, Zap, ChevronRight, Cat, Dog, HeartPulse, FileSearch, Sparkles, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';

interface DashboardProps {
  userData: any;
  onStartAnalysis: () => void;
}

export default function Dashboard({ userData, onStartAnalysis }: DashboardProps) {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  useEffect(() => {
    if (user && db && userData) {
      const today = new Date().toISOString().split('T')[0];
      if (userData.lastUsageDate !== today) {
        updateDoc(doc(db, 'users', user.uid), {
          dailyUsageCount: 0,
          lastUsageDate: today
        }).catch(console.error);
      }
    }
  }, [user, db, userData]);

  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'analysisHistory'), orderBy('createdAt', 'desc'), limit(3));
  }, [db, user]);
  const { data: recentHistory } = useCollection(historyQuery);

  const petsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'pets');
  }, [db, user]);
  const { data: pets } = useCollection(petsQuery);

  const isPremium = userData?.isPremium || false;
  const dailyCount = userData?.dailyUsageCount || 0;
  const maxFree = 5;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-headline tracking-tighter">
            반가워요, <span className="text-primary">{user?.displayName || '집사'}님</span>!
          </h1>
          <p className="text-muted-foreground font-medium">오늘도 우리 아이의 건강한 한 끼를 챙겨볼까요?</p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="border-none shadow-lg bg-white rounded-2xl px-6 py-3 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-muted-foreground uppercase">Daily Usage</p>
              <p className="text-sm font-bold">
                {isPremium ? 'UNLIMITED' : `${dailyCount} / ${maxFree}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Zap size={20} className={cn(dailyCount >= maxFree && !isPremium ? "text-destructive" : "text-primary")} />
            </div>
          </Card>
          {!isPremium && (
            <Button onClick={() => router.push('/account')} size="sm" className="rounded-2xl h-12 px-6 font-black bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 active:scale-95 transition-all">
              <Crown className="mr-2 h-4 w-4" /> PREMIUM
            </Button>
          )}
        </div>
      </div>

      <div className="relative group">
        <Card 
          onClick={onStartAnalysis}
          className="group cursor-pointer transition-all hover:scale-[1.01] active:scale-95 border-none shadow-2xl rounded-[3.5rem] bg-primary text-white overflow-hidden"
        >
          <CardContent className="p-12 md:p-16 flex flex-col md:flex-row items-center gap-10">
            <div className="p-8 bg-white/20 rounded-[2.5rem] text-white backdrop-blur-xl border border-white/30 shadow-inner">
              <Target size={64} className="animate-pulse" />
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <Badge className="bg-white/20 text-white border-none px-4 py-1.5 rounded-full font-black text-xs tracking-widest uppercase">
                Veterinary 1:1 Master
              </Badge>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-none">우리 아이 맞춤 진단</h3>
              <p className="text-xl text-white/80 font-medium leading-relaxed">
                아이의 건강 상태와 식품 성분을 1:1로 매칭하여<br className="hidden md:block"/>
                수의사가 설계한 정밀 처방 리포트를 생성합니다.
              </p>
              <div className="flex items-center gap-3 font-black text-2xl pt-2">
                분석 시작하기 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="absolute -top-4 -right-4 bg-amber-500 text-white p-4 rounded-3xl shadow-xl transform rotate-12 animate-bounce">
          <Sparkles />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-black flex items-center gap-2">
              <HeartPulse className="text-primary" /> 나의 반려동물
            </h3>
            <Button variant="ghost" onClick={() => router.push('/account')} className="font-bold text-primary hover:bg-primary/5 active:scale-95 transition-all">
              관리하기 <ChevronRight size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pets && pets.length > 0 ? (
              pets.map(pet => (
                <Card key={pet.id} className="border-none shadow-md rounded-[2rem] bg-white overflow-hidden hover:shadow-xl transition-all cursor-pointer group active:scale-95" onClick={onStartAnalysis}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                      {pet.petType === 'cat' ? <Cat size={28} /> : <Dog size={28} />}
                    </div>
                    <div>
                      <p className="font-black text-lg">{pet.name}</p>
                      <p className="text-xs text-muted-foreground font-bold">{pet.breed} · {pet.ageYears}살 {pet.ageMonths}개월</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-2 border-dashed border-muted rounded-[2rem] bg-transparent col-span-full">
                <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-muted/20 rounded-full text-muted-foreground"><PlusCircle size={32} /></div>
                  <div className="space-y-1">
                    <p className="font-black">등록된 아이가 없습니다</p>
                    <p className="text-xs text-muted-foreground font-medium">프로필을 등록하면 1초 만에 맞춤 분석이 가능합니다.</p>
                  </div>
                  <Button onClick={() => router.push('/account')} variant="outline" className="rounded-full font-bold px-6">아이 등록하기</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-black flex items-center gap-2">
              <History className="text-primary" /> 분석 기록
            </h3>
            <Button variant="ghost" onClick={() => router.push('/history')} className="font-bold text-muted-foreground active:scale-95 transition-all">
              전체보기
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentHistory && recentHistory.length > 0 ? (
              recentHistory.map(item => (
                <Card 
                  key={item.id} 
                  onClick={() => router.push(`/history/${item.id}`)}
                  className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md cursor-pointer transition-all group active:scale-95"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                      <div>
                        <p className="font-bold text-sm truncate max-w-[120px]">{item.userInput?.productInfo?.productName || '1:1 진단 리포트'}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{item.createdAt?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black">MASTER</Badge>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-8 text-center space-y-4 bg-primary/5 rounded-[2rem] border border-dashed border-primary/20">
                <div className="p-3 bg-white rounded-2xl inline-block shadow-sm">
                  <FileSearch className="text-primary h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black">아직 분석 기록이 없네요!</p>
                  <p className="text-[10px] text-muted-foreground font-medium">실제 리포트가 어떻게 나오는지 궁금하신가요?</p>
                </div>
                <Button variant="link" onClick={() => router.push('/sample-report')} className="text-xs font-black text-primary p-0 h-auto underline decoration-2 active:scale-95 transition-all">
                  샘플 리포트 먼저 확인하기 →
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
