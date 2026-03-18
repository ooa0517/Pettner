
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import { Loader2, FileText, Clock, Cat, Dog, ChevronRight, Search, ShieldCheck, Microscope } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AnalysisRecord = {
  id: string;
  type: 'A' | 'B';
  createdAt: Timestamp;
  analysisOutput: any;
  userInput: any;
};

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (user && db) {
      const fetchHistory = async () => {
        setIsLoading(true);
        try {
          const historyCollectionRef = collection(db, 'users', user.uid, 'analysisHistory');
          const q = query(historyCollectionRef, orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          const historyData = querySnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
            } as AnalysisRecord))
            .filter(item => item.analysisOutput && (item.analysisOutput.productIdentity || item.analysisOutput.productInfo));
          setHistory(historyData);
        } catch (err) {
          console.error("Error fetching history: ", err);
          setError("기록을 불러오는 중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    } else if (!isUserLoading) {
        setIsLoading(false);
    }
  }, [user, isUserLoading, db]);

  const filteredHistory = history.filter(item => {
    const name = item.analysisOutput.productIdentity?.name || item.userInput.productName || item.userInput.productInfo?.productName || "";
    const brand = item.analysisOutput.productIdentity?.brand || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || brand.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isUserLoading || isLoading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-grow p-4 md:p-8 bg-muted/20">
      <div className="max-w-4xl mx-auto space-y-8 pb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black font-headline tracking-tight">분석 히스토리</h1>
            <p className="text-muted-foreground mt-1 font-medium">지금까지 분석한 우리 아이들의 정밀 리포트입니다.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="제품명 또는 브랜드 검색..." 
              className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm font-bold" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-3xl border-none shadow-lg">
            <AlertTitle>오류 발생</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {filteredHistory.length === 0 ? (
          <Card className="text-center py-24 border-none shadow-xl rounded-[3rem] bg-white">
            <CardHeader>
              <div className="mx-auto bg-muted/50 p-8 rounded-full w-fit mb-6">
                <FileText className="h-16 w-16 text-muted-foreground opacity-20" />
              </div>
              <CardTitle className="text-2xl font-black">{searchTerm ? "검색 결과가 없습니다" : "아직 분석 기록이 없습니다"}</CardTitle>
              <CardDescription className="text-lg font-medium">
                {searchTerm ? "다른 검색어를 입력해 보세요." : "첫 번째 제품을 분석하고 전문 리포트를 소장하세요!"}
              </CardDescription>
            </CardHeader>
            {!searchTerm && (
              <CardContent>
                <Link href="/">
                  <Button size="lg" className="h-16 rounded-2xl px-10 font-black text-lg shadow-xl shadow-primary/20">지금 바로 시작하기</Button>
                </Link>
              </CardContent>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredHistory.map((item) => {
              const productName = item.analysisOutput.productIdentity?.name || item.userInput.productName || item.userInput.productInfo?.productName || "제품 정보 없음";
              const brandName = item.analysisOutput.productIdentity?.brand || "브랜드 미식별";
              const isTypeA = item.type === 'A';
              
              return (
              <Link href={`/history/${item.id}`} key={item.id}>
                <Card className="hover:shadow-2xl transition-all duration-500 cursor-pointer border-none shadow-md overflow-hidden group rounded-[2rem] bg-white">
                  <div className="flex h-full min-h-[120px]">
                    <div className={cn("w-3 transition-all group-hover:w-5", 
                      isTypeA ? "bg-success" : "bg-primary"
                    )} />
                    <CardContent className="p-6 flex flex-1 justify-between items-center">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "p-4 rounded-2xl transition-all group-hover:scale-110 shadow-inner",
                          isTypeA ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                        )}>
                          {isTypeA ? <ShieldCheck size={32} /> : <Microscope size={32} />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                             <p className="font-black text-2xl text-foreground leading-none tracking-tight">{productName}</p>
                             <Badge variant="outline" className={cn(
                               "font-black text-[10px] tracking-widest px-2 py-0.5 rounded-full border-none",
                               isTypeA ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                             )}>
                               {isTypeA ? 'TYPE A: AUDIT' : 'TYPE B: DIAGNOSIS'}
                             </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-bold">
                            {brandName} · {item.createdAt?.toDate().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                           <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">View Report</span>
                           <ChevronRight className="h-6 w-6 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
