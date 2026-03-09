
'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import type { AnalyzePetFoodIngredientsInput, AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { getAnalysis } from '@/app/actions';
import AnalysisResult from '@/components/analysis-result';
import ScannerHome from '@/components/scanner-home';
import AnalysisLoading from '@/components/analysis-loading';
import UsageLimitModal from '@/components/usage-limit-modal';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { saveAnalysisToHistory } from '@/lib/history';
import { useLanguage } from '@/contexts/language-context';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function HomeContent() {
  const { language, t } = useLanguage();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  // 로그인한 사용자는 바로 분석 입력 단계('input')에서 시작
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [analysisResult, setAnalysisResult] = useState<AnalyzePetFoodIngredientsOutput | null>(null);
  const [resultInput, setResultInput] = useState<AnalyzePetFoodIngredientsInput | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // 🔐 Auth Wall: 로그인하지 않은 경우 즉시 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const resetParam = searchParams.get('reset');
    if (resetParam === 'true') {
      setStep('input');
      setAnalysisResult(null);
      setResultInput(null);
    }
  }, [searchParams]);

  const checkUsageLimit = useCallback(async () => {
    if (!user || !db) return true;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.isPremium) return true;
        
        const today = new Date().toISOString().split('T')[0];
        if (userData.lastUsageDate === today && (userData.dailyUsageCount || 0) >= 5) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return true;
    }
  }, [user, db]);

  const handleAnalysis = async (formData: any) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const canAnalyze = await checkUsageLimit();
    if (!canAnalyze) {
      setShowLimitModal(true);
      return;
    }

    setStep('loading');
    
    const isCustom = formData.analysisMode === 'custom';
    const ageNum = parseFloat(formData.petProfile?.age);
    const weightNum = parseFloat(formData.petProfile?.weight);

    const analysisInput: AnalyzePetFoodIngredientsInput = {
        petType: formData.petType,
        analysisMode: formData.analysisMode,
        productName: formData.productName,
        productCategory: formData.productCategory,
        detailedProductType: formData.detailedProductType,
        language: language,
        petProfile: isCustom ? {
          name: formData.petProfile?.name,
          gender: formData.petProfile?.gender,
          breed: formData.petProfile?.breed,
          age: isNaN(ageNum) ? 0 : ageNum,
          weight: isNaN(weightNum) ? 0 : weightNum,
          neutered: formData.petProfile?.neutered,
          bcs: formData.petProfile?.bcs,
          activityLevel: formData.petProfile?.activityLevel,
          walkingTime: formData.petProfile?.walkingTime,
          livingEnvironment: formData.petProfile?.livingEnvironment,
          healthConditions: formData.petProfile?.healthConditions,
          allergies: formData.petProfile?.allergies,
          waterIntake: formData.petProfile?.waterIntake,
          stoolCondition: formData.petProfile?.stoolCondition,
          medications: formData.petProfile?.medications,
        } : { gender: 'unknown', neutered: 'unknown' }
    };

    try {
      if (formData.image?.[0]) {
        const reader = new FileReader();
        analysisInput.photoDataUri = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(formData.image[0]);
        });
      }
      
      const actionResponse = await getAnalysis(analysisInput);
      if (actionResponse.error) {
         throw new Error(t(String(actionResponse.error)));
      }
      const finalResult = actionResponse.data || null;

      if (finalResult) {
        setAnalysisResult(finalResult);
        setResultInput(analysisInput);
        
        if (user && db) {
          saveAnalysisToHistory(db, user.uid, analysisInput, finalResult);
          const today = new Date().toISOString().split('T')[0];
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists() && !userSnap.data().isPremium) {
            if (userSnap.data().lastUsageDate === today) {
              updateDoc(userDocRef, { dailyUsageCount: increment(1) });
            } else {
              updateDoc(userDocRef, { lastUsageDate: today, dailyUsageCount: 1 });
            }
          }
        }
        setStep('result');
      } else {
         throw new Error("Analysis returned no result.");
      }
    } catch (error: any) {
      setStep('input');
      toast({ variant: "destructive", title: t('homePage.analysisFailedTitle'), description: error.message });
    }
  };
  
  const handleReset = () => {
    setStep('input');
    setAnalysisResult(null);
    setResultInput(null);
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 로그인하지 않은 상태면 아무것도 렌더링하지 않음 (useEffect가 리디렉션 처리)
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4 md:p-8 bg-muted/20">
      <div className="w-full max-w-4xl">
        {step === 'input' && <ScannerHome onAnalyze={handleAnalysis} />}
        {step === 'loading' && <AnalysisLoading />}
        {step === 'result' && analysisResult && resultInput && (
          <AnalysisResult result={analysisResult} input={resultInput} onReset={handleReset} />
        )}
      </div>
      <UsageLimitModal open={showLimitModal} onOpenChange={setShowLimitModal} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
