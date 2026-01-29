'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, FileText, Clock, Cat, Dog } from 'lucide-react';
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

type StoredUserInput = Omit<AnalyzePetFoodIngredientsInput, 'language' | 'photoDataUri' | 'ingredientsText' | 'brandName' | 'foodType' | 'healthConditions' | 'lifeStage'> & { 
    ingredientsText?: string; 
    brandName?: string;
    foodType?: string;
    healthConditions?: string;
    lifeStage?: 'PUPPY' | 'ADULT' | 'SENIOR' | 'ALL_STAGES';
    photoProvided: boolean;
};

type AnalysisRecord = {
  id: string;
  createdAt: Timestamp;
  analysisOutput: AnalyzePetFoodIngredientsOutput;
  userInput: StoredUserInput;
};

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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
            .filter(item => item.analysisOutput && item.analysisOutput.productInfo); // Filter out malformed data
          setHistory(historyData);
        } catch (err) {
          console.error("Error fetching history: ", err);
          setError(t('historyPage.fetchError'));
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    } else if (!authLoading) {
        setIsLoading(false);
    }
  }, [user, authLoading, t]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-grow p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold font-headline">{t('historyPage.title')}</h1>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {history.length === 0 && !error ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>{t('historyPage.noHistoryTitle')}</CardTitle>
              <CardDescription>{t('historyPage.noHistoryDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const PetIcon = item.userInput.petType === 'cat' ? Cat : Dog;
              return (
              <Link href={`/history/${item.id}`} key={item.id}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <PetIcon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-lg">{item.analysisOutput.productInfo.name}</p>
                        <p className="text-sm text-muted-foreground">{item.analysisOutput.productInfo.brand}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {item.createdAt?.toDate().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
