
'use client';

import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, ArrowLeft, Share2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import AnalysisResult from '@/components/analysis-result';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PublicReportPage() {
  const db = useFirestore();
  const router = useRouter();
  const params = useParams();
  const { userId, analysisId } = params;

  const [record, setRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (db && userId && analysisId) {
      const fetchRecord = async () => {
        setIsLoading(true);
        try {
          const docRef = doc(db, 'users', userId as string, 'analysisHistory', analysisId as string);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setRecord(docSnap.data());
          } else {
            setError("리포트를 찾을 수 없습니다. 삭제되었거나 올바르지 않은 링크입니다.");
          }
        } catch (err) {
          console.error("Error fetching public record: ", err);
          setError("데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchRecord();
    }
  }, [db, userId, analysisId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-xl font-black">Pettner 리포트를 불러오는 중...</h1>
      </div>
    );
  }

  if (error) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-6">
          <div className="p-6 bg-destructive/10 rounded-full text-destructive">
             <AlertCircle size={64} />
          </div>
          <div className="space-y-2">
             <h1 className="text-2xl font-black">리포트 로드 실패</h1>
             <p className="text-muted-foreground font-medium">{error}</p>
          </div>
          <Button asChild className="rounded-2xl h-14 px-8 font-black">
             <Link href="/">Pettner 홈으로 가기</Link>
          </Button>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" className="hover:bg-primary/5">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Pettner 홈
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-primary font-bold">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs tracking-widest uppercase font-black">Shared Veterinary Report</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-xl border-none flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl text-white">
                 <Share2 size={24} />
              </div>
              <div>
                 <p className="text-sm font-bold text-muted-foreground">누군가가 리포트를 공유했습니다!</p>
                 <h2 className="text-xl font-black">초정밀 인공지능 분석 결과</h2>
              </div>
           </div>
        </div>

        <AnalysisResult 
          result={record.analysisOutput} 
          input={{ ...record.userInput, language: 'ko' } as any}
          onReset={() => router.push('/')}
          resetButtonText="나도 분석해보기"
          isPublicView={true}
        />
      </div>
    </div>
  );
}
