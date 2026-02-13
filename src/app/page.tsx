'use client';

import { useState } from 'react';
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

export default function Home() {
  const { language, t } = useLanguage();
  const { user } = useUser();
  const db = useFirestore();
  
  const [step, setStep] = useState<'landing' | 'survey' | 'input' | 'loading' | 'result'>('landing');
  const [analysisResult, setAnalysisResult] = useState<AnalyzePetFoodIngredientsOutput | null>(null);
  const [resultInput, setResultInput] = useState<AnalyzePetFoodIngredientsInput | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async (formData: any) => {
    setStep('loading');
    setAnalysisResult(null);
    setResultInput(null);

    const file = formData.image?.[0];
    
    const analysisInput: AnalyzePetFoodIngredientsInput = {
        petType: formData.petType,
        productName: formData.productName,
        brandName: formData.brandName,
        foodType: formData.foodType,
        ingredientsText: formData.ingredientsText,
        language: language,
    };

    const processAndAnalyze = async (input: AnalyzePetFoodIngredientsInput) => {
      try {
        const result = await getAnalysis(input);
        if (result.error) {
          throw new Error(t(result.error));
        }
        if (result.data) {
          setAnalysisResult(result.data);
          setResultInput(input);
          
          if (user && db && result.data.status === 'success') {
            const userInputForHistory = {
                petType: formData.petType,
                productName: formData.productName || result.data.productIdentity.name,
                brandName: formData.brandName || result.data.productIdentity.brand || '',
                foodType: formData.foodType || result.data.productIdentity.category || 'dry',
                lifeStage: 'ADULT' as any,
                ingredientsText: formData.ingredientsText || '',
                healthConditions: '',
                photoProvided: !!file,
            };
            saveAnalysisToHistory(db, user.uid, userInputForHistory, result.data);
          }
          
          setStep('result');
          toast({
            title: result.isCached ? "기존 분석 리포트 확인" : t('homePage.analysisCompleteTitle'),
            description: result.isCached ? "이미 검증된 제품 데이터로 리포트를 불러왔습니다." : t('homePage.analysisCompleteDescription'),
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
    
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const imageDataUri = reader.result as string;
        analysisInput.photoDataUri = imageDataUri;
        await processAndAnalyze(analysisInput);
      };
      reader.onerror = (error) => {
        console.error("FileReader error: ", error);
        toast({
          variant: "destructive",
          title: t('homePage.fileReadFailedTitle'),
          description: t('homePage.fileReadFailedDescription'),
        });
        setStep('input');
      };
    } else {
        await processAndAnalyze(analysisInput);
    }
  };
  
  const handleReset = () => {
    setAnalysisResult(null);
    setResultInput(null);
    setStep('input');
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4 md:p-8">
      <div className="w-full max-w-4xl">
        {step === 'landing' && <LandingPage onStart={() => setStep('survey')} />}
        {step === 'survey' && <OnboardingSurvey onComplete={() => setStep('input')} />}
        {step === 'input' && <ScannerHome onAnalyze={handleAnalysis} />}
        {step === 'loading' && <AnalysisLoading />}
        {step === 'result' && analysisResult && resultInput && (
          <AnalysisResult result={analysisResult} input={resultInput} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
