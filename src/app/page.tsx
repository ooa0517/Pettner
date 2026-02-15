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
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * 제품 아이디(슬러그) 생성
 */
function generateProductId(brandName: string = '', productName: string = ''): string {
  const combined = `${brandName.trim()}-${productName.trim()}`.toLowerCase();
  return combined.replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-');
}

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
        const productId = generateProductId(input.brandName, input.productName);
        let finalResult: AnalyzePetFoodIngredientsOutput | null = null;
        let isCached = false;

        // 1. 클라이언트 측 캐시 확인
        if (db && productId && productId.length > 5) {
          const productRef = doc(db, 'products', productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            finalResult = productSnap.data() as AnalyzePetFoodIngredientsOutput;
            isCached = true;
          }
        }

        // 2. 캐시가 없으면 서버 액션으로 AI 분석 실행
        if (!finalResult) {
          const actionResponse = await getAnalysis(input);
          if (actionResponse.error) {
            throw new Error(t(actionResponse.error));
          }
          if (actionResponse.data) {
            finalResult = actionResponse.data;
            
            // 글로벌 캐시에 저장 (비동기)
            if (db && productId && productId.length > 5 && finalResult.status === 'success') {
              setDoc(doc(db, 'products', productId), finalResult).catch(e => console.error("Global cache save failed:", e));
            }
          }
        }

        if (finalResult) {
          setAnalysisResult(finalResult);
          setResultInput(input);
          
          // 사용자 히스토리에 저장
          if (user && db && finalResult.status === 'success') {
            const userInputForHistory = {
                petType: formData.petType,
                productName: formData.productName || finalResult.productIdentity.name,
                brandName: formData.brandName || finalResult.productIdentity.brand || '',
                foodType: formData.foodType || finalResult.productIdentity.category || 'dry',
                lifeStage: 'ADULT' as any,
                ingredientsText: formData.ingredientsText || '',
                healthConditions: '',
                photoProvided: !!file,
            };
            saveAnalysisToHistory(db, user.uid, userInputForHistory, finalResult);
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