
'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AnalysisResult from '@/components/analysis-result';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type AnalysisRecord = {
  id: string;
  type: 'A' | 'B';
  createdAt: Timestamp;
  analysisOutput: any;
  userInput: any;
};

export default function HistoryDetailPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const params = useParams();
  const { analysisId } = params;

  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

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
            setError("기록을 찾을 수 없습니다.");
          }
        } catch (err) {
          console.error("Error fetching record: ", err);
          setError("데이터를 불러오는 도중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchRecord();
    } else if (!isUserLoading) {
      setIsLoading(false);
    }
  }, [user, db, analysisId, isUserLoading]);

  if (isUserLoading || isLoading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !record) {
    return (
       <div className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Link>
          </Button>
          <Alert variant="destructive" className="rounded-3xl">
            <AlertTitle>오류 발생</AlertTitle>
            <AlertDescription>{error || "데이터가 존재하지 않습니다."}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // AnalysisResult 컴포넌트가 기대하는 input 형식으로 변환
  const inputForComponent = {
    ...record.userInput,
    analysisMode: record.type === 'A' ? 'general' : 'custom',
    language: language,
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4 md:p-8 bg-muted/20">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
            <Button asChild variant="ghost" className="rounded-full font-bold gap-2">
                <Link href="/history"><ArrowLeft size={18}/> 분석 기록 목록</Link>
            </Button>
        </div>
        <AnalysisResult 
          result={record.analysisOutput} 
          input={inputForComponent}
          onReset={() => router.push('/')}
          isPublicView={true}
        />
      </div>
    </div>
  );
}
