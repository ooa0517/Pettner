'use client';

import { useState, useEffect, Suspense } from 'react';
import type { AnalyzePetFoodIngredientsInput, AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { getAnalysis } from '@/app/actions';
import AnalysisResult from '@/components/analysis-result';
import ScannerHome from '@/components/scanner-home';
import AnalysisLoading from '@/components/analysis-loading';
import OnboardingSurvey from '@/components/onboarding-survey';
import LandingPage from '@/components/landing-page';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { saveAnalysisToHistory } from '@/lib/history';
import { useLanguage } from '@/contexts/language-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

/**
 * 제품 아이디(슬러그) 생성
 */
function generateProductId(brandName: string = '', productName: string = ''): string {
  const combined = `${brandName.trim()}-${productName.trim()}`.toLowerCase();
  return combined.replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-');
}

function HomeContent() {
  const { language, t } = useLanguage();
  const { user } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState<'landing' | 'survey' | 'input' | 'loading' | 'result'>('landing');
  const [analysisResult, setAnalysisResult] = useState<AnalyzePetFoodIngredientsOutput | null>(null);
  const [resultInput, setResultInput] = useState<AnalyzePetFoodIngredientsInput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const reset = searchParams.get('reset');
    if (reset === 'true') {
      setStep('landing');
      setAnalysisResult(null);
      setResultInput(null);
    }
  }, [searchParams]);

  const handleAnalysis = async (formData: any) => {
    setStep('loading');
    
    // V7.0: 모드 격리 로직
    // general 모드일 경우 petProfile을 완전히 비웁니다.
    const isCustom = formData.analysisMode === 'custom';
    
    const analysisInput: AnalyzePetFoodIngredientsInput = {
        petType: formData.petType,
        analysisMode: formData.analysisMode,
        productName: formData.productName,
        foodType: formData.foodType,
        language: language,
        petProfile: isCustom ? {
          name: formData.petProfile.name,
          breed: formData.petProfile.breed,
          age: parseFloat(formData.petProfile.age) || undefined,
          weight: parseFloat(formData.petProfile.weight) || undefined,
          neutered: (formData.petProfile.genderStatus || '').includes('neutered'),
          bcs: formData.petProfile.bcs,
          healthConditions: formData.petProfile.healthConditions,
          allergies: formData.petProfile.allergies,
        } : undefined
    };

    const processAndAnalyze = async (input: AnalyzePetFoodIngredientsInput) => {
      try {
        const productId = generateProductId('', input.productName);
        let finalResult: AnalyzePetFoodIngredientsOutput | null = null;
        let isCached = false;

        // V7.0: 단순 제품 분석일 경우에만 글로벌 캐시 참조 (개인화 데이터 오염 방지)
        if (db && productId && productId.length > 5 && input.analysisMode === 'general') {
          const productRef = doc(db, 'products', productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            finalResult = productSnap.data() as AnalyzePetFoodIngredientsOutput;
            isCached = true;
          }
        }

        if (!finalResult) {
          const actionResponse = await getAnalysis(input);
          if (actionResponse.error) throw new Error(t(actionResponse.error));
          if (actionResponse.data) {
            finalResult = actionResponse.data;
            
            // V7.0: 성공적인 단순 제품 분석 결과만 캐시에 저장
            if (db && productId && productId.length > 5 && finalResult.status === 'success' && input.analysisMode === 'general') {
              setDoc(doc(db, 'products', productId), finalResult).catch(e => console.error("Cache save failed:", e));
            }
          }
        }

        if (finalResult) {
          setAnalysisResult(finalResult);
          setResultInput(input);
          
          if (user && db && finalResult.status === 'success') {
            saveAnalysisToHistory(db, user.uid, input, finalResult);
          }
          
          setStep('result');
          toast({
            title: isCached ? "검증된 제품 데이터 로드" : t('homePage.analysisCompleteTitle'),
            description: isCached ? "이미 검증된 Pettner 데이터베이스의 리포트를 불러왔습니다." : t('homePage.analysisCompleteDescription'),
          });
        }
      } catch (error) {
        console.error("Analysis Error:", error);
        setStep('input');
        toast({
          variant: "destructive",
          title: t('homePage.analysisFailedTitle'),
          description: error instanceof Error ? error.message : t('homePage.analysisFailedDescriptionUnknown'),
        });
      }
    };
    
    const file = formData.image?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        analysisInput.photoDataUri = reader.result as string;
        await processAndAnalyze(analysisInput);
      };
    } else {
        await processAndAnalyze(analysisInput);
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
