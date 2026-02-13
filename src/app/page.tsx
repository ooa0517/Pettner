
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
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

/**
 * Pettner 메인 페이지 컴포넌트
 */
export default function Home() {
  const { language, t } = useLanguage();
  const { user, isUserLoading } = useUser();
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
                productName: formData.productName || result.data.productInfo.name,
                brandName: formData.brandName || result.data.productInfo.brand || '',
                foodType: formData.foodType || result.data.productInfo.type || 'dry',
                lifeStage: 'ADULT' as any,
                ingredientsText: formData.ingredientsText || '',
                healthConditions: '',
                photoProvided: !!file,
            };
            saveAnalysisToHistory(db, user.uid, userInputForHistory, result.data);
          }
          
          setStep('result');
          toast({
            title: t('homePage.analysisCompleteTitle'),
            description: user ? t('homePage.analysisCompleteDescription') : "분석이 완료되었습니다!",
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

  if (isUserLoading && step === 'landing') {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        
        {/* 개발 및 테스트용 샘플 리포트 링크 (사용자 확인용) */}
        {step === 'landing' && (
          <div className="mt-8 text-center animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
            <Button asChild variant="ghost" className="text-primary/60 hover:text-primary hover:bg-primary/5 rounded-full">
              <Link href="/sample-report">
                <Sparkles className="w-4 h-4 mr-2" />
                분석 결과 리포트 샘플 보기 (나무)
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
