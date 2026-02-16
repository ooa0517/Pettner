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
    
    // Calculate Age precisely
    let finalAge: number | undefined;
    if (formData.petProfile.dontKnowBirth) {
      finalAge = parseFloat(formData.petProfile.ageYears) || undefined;
    } else if (formData.petProfile.birthDate) {
      const birth = new Date(formData.petProfile.birthDate);
      const today = new Date();
      // Age in decimal years
      finalAge = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      finalAge = Math.round(finalAge * 10) / 10; // Round to 1 decimal place
    }

    const analysisInput: AnalyzePetFoodIngredientsInput = {
        petType: formData.petType,
        analysisMode: formData.analysisMode,
        productName: formData.productName,
        foodType: formData.foodType,
        language: language,
        petProfile: formData.analysisMode === 'custom' ? {
          name: formData.petProfile.name,
          breed: formData.petProfile.breed,
          age: finalAge,
          weight: parseFloat(formData.petProfile.weight) || undefined,
          neutered: (formData.petProfile.genderStatus || '').includes('neutered'),
          activityLevel: formData.petProfile.activityLevel,
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

        // Cache Check (Simple client-side cache for speed if needed)
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
            if (db && productId && productId.length > 5 && finalResult.status === 'success' && input.analysisMode === 'general') {
              setDoc(doc(db, 'products', productId), finalResult).catch(e => console.error("Global cache save failed:", e));
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
            title: isCached ? "기존 분석 리포트 확인" : t('homePage.analysisCompleteTitle'),
            description: isCached ? "이미 검증된 제품 데이터로 리포트를 불러왔습니다." : t('homePage.analysisCompleteDescription'),
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
