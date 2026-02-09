'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import { Loader2, FileText, Clock, Cat, Dog, ChevronRight, Search, LayoutGrid } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type StoredUserInput = Omit<AnalyzePetFoodIngredientsInput, 'language' | 'photoDataUri' | 'ingredientsText' | 'brandName' | 'foodType' | 'healthConditions' | 'lifeStage'> & { 
    ingredientsText?: string; 
    brandName?: string;
    foodType?: string;
    healthConditions?: string;
    lifeStage?: 'PUPPY' | 'ADULT' | 'SENIOR' | 'GERIATRIC' | 'ALL_STAGES';
    photoProvided: boolean;
};

type AnalysisRecord = {
  id: string;
  createdAt: Timestamp;
  analysisOutput: AnalyzePetFoodIngredientsOutput;
  userInput: StoredUserInput;
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
            .filter(item => item.analysisOutput && item.analysisOutput.productInfo);
          setHistory(historyData);
        } catch (err) {
          console.error("Error fetching history: ", err);
          setError(t('historyPage.fetchError'));
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    } else if (!isUserLoading) {
        setIsLoading(false);
    }
  }, [user, isUserLoading, db, t]);

  const filteredHistory = history.filter(item => 
    item.analysisOutput.productInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.analysisOutput.productInfo.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isUserLoading || isLoading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-grow p-4 md:p-8 bg-muted/20">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black font-headline tracking-tight">{t('historyPage.title')}</h1>
            <p className="text-muted-foreground mt-1">지금까지 분석한 우리 아이들의 먹거리 리포트입니다.</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="제품명 검색..." 
              className="pl-10 bg-white" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {filteredHistory.length === 0 ? (
          <Card className="text-center py-20 border-2 border-dashed bg-white">
            <CardHeader>
              <div className="mx-auto bg-muted p-6 rounded-full w-fit mb-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">{searchTerm ? "검색 결과가 없습니다" : t('historyPage.noHistoryTitle')}</CardTitle>
              <CardDescription className="text-lg">
                {searchTerm ? "다른 검색어를 입력해 보세요." : t('historyPage.noHistoryDescription')}
              </CardDescription>
            </CardHeader>
            {!searchTerm && (
              <CardContent>
                <Link href="/">
                  <Button size="lg" className="rounded-full px-8 shadow-lg">새로운 제품 분석하기</Button>
                </Link>
              </CardContent>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredHistory.map((item) => {
              const PetIcon = item.userInput.petType === 'cat' ? Cat : Dog;
              const score = item.analysisOutput.matchingScore?.score;
              
              return (
              <Link href={`/history/${item.id}`} key={item.id}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-none shadow-md overflow-hidden group">
                  <div className="flex h-full">
                    <div className={cn("w-2 bg-primary transition-all group-hover:w-4", 
                      score && score >= 90 ? "bg-success" : 
                      score && score >= 70 ? "bg-primary" : "bg-yellow-400"
                    )} />
                    <CardContent className="p-6 flex flex-1 justify-between items-center bg-white">
                      <div className="flex items-center gap-6">
                        <div className="p-3 bg-muted rounded-2xl group-hover:scale-110 transition-transform">
                          <PetIcon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <p className="font-black text-xl text-foreground leading-none">{item.analysisOutput.productInfo.name}</p>
                             {score && (
                               <Badge variant="outline" className="font-bold text-primary border-primary/20 bg-primary/5">
                                 {score}점 적합
                               </Badge>
                             )}
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">
                            {item.analysisOutput.productInfo.brand || '브랜드 정보 없음'} · {item.analysisOutput.productInfo.type || '분석 유형'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {item.createdAt?.toDate().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
