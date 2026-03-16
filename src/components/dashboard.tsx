'use client';

import { useEffect } from 'react';
import { Microscope, Target, ArrowRight, History, PlusCircle, Crown, Sparkles, Zap, ChevronRight, Cat, Dog, HeartPulse, FileSearch } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';

interface DashboardProps {
  userData: any;
  onSelectA: () => void;
  onSelectB: () => void;
}

export default function Dashboard({ userData, onSelectA, onSelectB }: DashboardProps) {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  // 날짜 변경 시 무료 사용량 리셋 체크
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
      {/* User Greeting & Status */}
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
            <Button onClick={() => router.push('/account')} size="sm" className="rounded-2xl h-12 px-6 font-black bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200">
              <Crown className="mr-2 h-4 w-4" /> PREMIUM
            </Button>
          )}
        </div>
      </div>

      {/* Main Analysis Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          onClick={onSelectA}
          className="group cursor-pointer transition-all hover:scale-[1.02] border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden"
        >
          <CardContent className="p-8 flex items-center gap-6">
            <div className="p-5 bg-muted rounded-[1.5rem] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Microscope size={32} />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-xl font-black">제품 객관적 분석</h3>
              <p className="text-sm text-muted-foreground font-medium">제품의 팩트 스펙만 빠르게 확인</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowRight size={20} />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={onSelectB}
          className="group cursor-pointer transition-all hover:scale-[1.02] border-none shadow-xl rounded-[2.5rem] bg-primary text-white overflow-hidden"
        >
          <CardContent className="p-8 flex items-center gap-6">
            <div className="p-5 bg-white/20 rounded-[1.5rem] text-white">
              <Target size={32} />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-xl font-black">1:1 밀착 맞춤 분석</h3>
              <p className="text-sm text-white/70 font-medium">아이의 상태에 따른 정밀 처방전</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center group-hover:scale-110 transition-all">
              <ArrowRight size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pets Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-black flex items-center gap-2">
              <HeartPulse className="text-primary" /> 나의 반려동물
            </h3>
            <Button variant="ghost" onClick={() => router.push('/account')} className="font-bold text-primary hover:bg-primary/5">
              관리하기 <ChevronRight size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pets && pets.length > 0 ? (
              pets.map(pet => (
                <Card key={pet.id} className="border-none shadow-md rounded-[2rem] bg-white overflow-hidden">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-primary">
                      {pet.petType === 'cat' ? <Cat size={28} /> : <Dog size={28} />}
                    </div>
                    <div>
                      <p className="font-black text-lg">{pet.name}</p>
                      <p className="text-xs text-muted-foreground font-bold">{pet.breed} · {pet.age}살</p>
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

        {/* Recent History & Sample Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-black flex items-center gap-2">
              <History className="text-primary" /> 분석 기록
            </h3>
            <Button variant="ghost" onClick={() => router.push('/history')} className="font-bold text-muted-foreground">
              전체보기
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentHistory && recentHistory.length > 0 ? (
              recentHistory.map(item => (
                <Card 
                  key={item.id} 
                  onClick={() => router.push(`/history/${item.id}`)}
                  className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md cursor-pointer transition-all group"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                      <div>
                        <p className="font-bold text-sm truncate max-w-[120px]">{item.analysisOutput?.productIdentity?.name || '제품 분석'}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{item.createdAt?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black">{item.type === 'A' ? 'Type A' : 'Type B'}</Badge>
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
                <Button variant="link" onClick={() => router.push('/sample-report')} className="text-xs font-black text-primary p-0 h-auto underline decoration-2">
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
