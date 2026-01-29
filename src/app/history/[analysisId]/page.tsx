'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import AnalysisResult from '@/components/analysis-result';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
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

export default function HistoryDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { analysisId } = params;

  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && db && analysisId) {
      const fetchRecord = async () => {
        setIsLoading(true);
        try {
          const docRef = doc(db, 'users', user.uid, 'analysisHistory', analysisId as string);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setRecord({ id: docSnap.id, ...docSnap.data() } as AnalysisRecord);
          } else {
            setError(t('historyDetailPage.notFound'));
          }
        } catch (err) {
          console.error("Error fetching record: ", err);
          setError(t('historyDetailPage.fetchError'));
        } finally {
          setIsLoading(false);
        }
      };
      fetchRecord();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, analysisId, t]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
       <div className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Button asChild variant="outline">
            <Link href="/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('historyDetailPage.backToHistory')}
            </Link>
          </Button>
          <Alert variant="destructive">
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
       <div className="flex items-center justify-center flex-grow p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const inputForComponent = {
    ...record.userInput,
    language: language,
  } as AnalyzePetFoodIngredientsInput;


  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <AnalysisResult 
          result={record.analysisOutput} 
          input={inputForComponent}
          onReset={() => router.push('/history')}
          resetButtonText={t('historyDetailPage.backToHistoryShort')}
        />
      </div>
    </div>
  );
}
