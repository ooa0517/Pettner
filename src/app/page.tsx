
'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import type { AnalyzePetFoodIngredientsInput, AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { getAnalysis } from '@/app/actions';
import AnalysisResult from '@/components/analysis-result';
import ScannerHome from '@/components/scanner-home';
import AnalysisLoading from '@/components/analysis-loading';
import OnboardingSurvey from '@/components/onboarding-survey';
import LandingPage from '@/components/landing-page';
import UsageLimitModal from '@/components/usage-limit-modal';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { saveAnalysisToHistory } from '@/lib/history';
import { useLanguage } from '@/contexts/language-context';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

function generateProductId(productName: string = ''): string {
  return productName.trim().toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-');
}

function HomeContent() {
  const { language, t } = useLanguage();
  const { user } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'landing' | 'survey' | 'input' | 'loading' | 'result'>('landing');
  const [analysisResult, setAnalysisResult] = useState<AnalyzePetFoodIngredientsOutput | null>(null);
  const [resultInput, setResultInput] = useState<AnalyzePetFoodIngredientsInput | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      setStep('landing');
      setAnalysisResult(null);
      setResultInput(null);
    }
  }, [searchParams]);

  // 사용자의 결제 상태 및 오늘 이용 횟수 체크
  const checkUsageLimit = useCallback(async () => {
    if (!user || !db) return true; // 비로그인 시에도 분석은 허용하되 저장은 안 됨 (사용성 고려)

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      
      if (!userSnap.exists()) return true;

      const userData = userSnap.data();
      
      // [중요] 평생권(isPremium) 소지자는 모든 한도 체크를 건너뜁니다.
      if (userData.isPremium === true) {
        console.log("Premium User Detected: Bypassing limits.");
        return true;
      }

      const today = new Date().toISOString().split('T')[0];
      // 무료 사용자는 하루 5회로 제한
      if (userData.lastUsageDate === today && userData.dailyUsageCount >= 5) {
        return false; 
      }
      return true;
    } catch (e) {
      console.error("Usage limit check error:", e);
      return true; // 오류 발생 시 사용자 경험을 위해 허용
    }
  }, [user, db]);

  const handleAnalysis = async (formData: any) => {
    const canAnalyze = await checkUsageLimit();
    if (!canAnalyze) {
      setShowLimitModal(true);
      return;
    }

    setStep('loading');
    
    const isCustom = formData.analysisMode === 'custom';
    const analysisInput: AnalyzePetFoodIngredientsInput = {
        petType: formData.petType,
        analysisMode: formData.analysisMode,
        productName: formData.productName,
        foodType: formData.foodType,
        language: language,
        petProfile: isCustom ? {
          name: formData.petProfile?.name,
          breed: formData.petProfile?.breed,
          age: parseFloat(formData.petProfile?.age) || undefined,
          weight: parseFloat(formData.petProfile?.weight) || undefined,
          neutered: formData.petProfile?.neutered,
          bcs: formData.petProfile?.bcs,
          healthConditions: formData.petProfile?.healthConditions,
          allergies: formData.petProfile?.allergies,
        } : undefined
    };

    try {
      const productId = generateProductId(analysisInput.productName);
      let finalResult: AnalyzePetFoodIngredientsOutput | null = null;
      let isCached = false;

      // 일반 분석 모드일 때만 캐시 확인
      if (db && productId && analysisInput.analysisMode === 'general') {
        const productSnap = await getDoc(doc(db, 'products', productId));
        if (productSnap.exists()) {
          finalResult = productSnap.data() as AnalyzePetFoodIngredientsOutput;
          isCached = true;
        }
      }

      if (!finalResult) {
        const file = formData.image?.[0];
        if (file) {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          analysisInput.photoDataUri = await base64Promise;
        }
        
        const actionResponse = await getAnalysis(analysisInput);
        if (actionResponse.error) {
           throw new Error(t(String(actionResponse.error)));
        }
        finalResult = actionResponse.data || null;

        // 결과 캐싱 (일반 모드인 경우)
        if (finalResult && db && productId && analysisInput.analysisMode === 'general') {
           setDoc(doc(db, 'products', productId), finalResult).catch(console.error);
        }
      }

      if (finalResult) {
        setAnalysisResult(finalResult);
        setResultInput(analysisInput);
        
        // 데이터베이스 업데이트 (기록 저장 및 카운트)
        if (user && db) {
          saveAnalysisToHistory(db, user.uid, analysisInput, finalResult);
          
          const today = new Date().toISOString().split('T')[0];
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            // 프리미엄 유저가 아닐 때만 카운트를 올립니다.
            if (!userData.isPremium) {
              if (userData.lastUsageDate === today) {
                updateDoc(userDocRef, { dailyUsageCount: increment(1) });
              } else {
                updateDoc(userDocRef, { lastUsageDate: today, dailyUsageCount: 1 });
              }
            }
          }
        }

        setStep('result');
        toast({ title: isCached ? "검증 데이터 로드 완료" : t('homePage.analysisCompleteTitle') });
      }
    } catch (error: any) {
      console.error(error);
      setStep('input');
      toast({ variant: "destructive", title: t('homePage.analysisFailedTitle'), description: error.message });
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4 md:p-8 bg-muted/20">
      <div className="w-full max-w-4xl">
        {step === 'landing' && <LandingPage onStart={() => setStep('survey')} />}
        {step === 'survey' && <OnboardingSurvey onComplete={() => setStep('input')} />}
        {step === 'input' && <ScannerHome onAnalyze={handleAnalysis} />}
        {step === 'loading' && <AnalysisLoading />}
        {step === 'result' && analysisResult && resultInput && (
          <AnalysisResult result={analysisResult} input={resultInput} onReset={() => setStep('input')} />
        )}
      </div>
      <UsageLimitModal open={showLimitModal} onOpenChange={setShowLimitModal} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
