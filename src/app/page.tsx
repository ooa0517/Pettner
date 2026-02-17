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

function generateProductId(productName: string = ''): string {
  return productName.trim().toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-');
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
    if (searchParams.get('reset') === 'true') {
      setStep('landing');
      setAnalysisResult(null);
      setResultInput(null);
    }
  }, [searchParams]);

  const handleAnalysis = async (formData: any) => {
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

      // Mode A일 때만 캐시 활용
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
        if (actionResponse.error) throw new Error(t(actionResponse.error));
        finalResult = actionResponse.data || null;

        if (finalResult && db && productId && analysisInput.analysisMode === 'general') {
           setDoc(doc(db, 'products', productId), finalResult).catch(console.error);
        }
      }

      if (finalResult) {
        setAnalysisResult(finalResult);
        setResultInput(analysisInput);
        if (user && db) saveAnalysisToHistory(db, user.uid, analysisInput, finalResult);
        setStep('result');
        toast({ title: isCached ? "검증 데이터 로드" : t('homePage.analysisCompleteTitle') });
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
