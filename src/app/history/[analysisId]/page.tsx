'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Loader2, ArrowLeft, Share2 } from 'lucide-react';
import AnalysisResult from '@/components/analysis-result';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type AnalysisRecord = {
  id: string;
  type: string;
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
  const { language } = useLanguage();

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
            setError("해당 분석 리포트를 찾을 수 없습니다.");
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
      <div className="flex items-center justify-center min-h-screen bg-muted/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="font-black text-muted-foreground animate-pulse">리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
       <div className="flex-grow p-4 md:p-8 flex items-center justify-center bg-muted/20 min-h-screen">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white p-12 rounded-[3rem] shadow-xl space-y-6">
            <div className="p-6 bg-rose-500/10 rounded-full w-fit mx-auto text-rose-500">
              <Share2 size={48} />
            </div>
            <h2 className="text-2xl font-black">접근 오류</h2>
            <p className="text-muted-foreground font-medium">{error || "기록이 존재하지 않습니다."}</p>
            <Button asChild className="w-full h-14 rounded-2xl font-black">
              <Link href="/history">목록으로 돌아가기</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8 pb-32">
        <div className="flex items-center justify-between">
            <Button asChild variant="ghost" className="rounded-full font-bold gap-2 hover:bg-white px-6">
                <Link href="/history"><ArrowLeft size={18}/> 기록 목록</Link>
            </Button>
            <div className="text-right">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Analysis Date</p>
              <p className="font-black text-sm">{record.createdAt?.toDate().toLocaleDateString()}</p>
            </div>
        </div>
        
        <AnalysisResult 
          result={record.analysisOutput} 
          input={{ ...record.userInput, language }}
          onReset={() => router.push('/')}
          isPublicView={true}
        />
      </div>
    </div>
  );
}
