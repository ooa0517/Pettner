'use client';

import { useState } from 'react';
import type { AnalyzePetFoodIngredientsInput, AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { getAnalysis } from '@/app/actions';
import AnalysisResult from '@/components/analysis-result';
import ScannerHome from '@/components/scanner-home';
import AnalysisLoading from '@/components/analysis-loading';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { saveAnalysisToHistory } from '@/lib/history';
import { useLanguage } from '@/contexts/language-context';

type AnalysisFormData = {
  petType: 'dog' | 'cat';
  productName: string;
  brandName: string;
  foodType: string;
  ingredientsText: string;
  healthConditions: string;
  image?: FileList;
};

// Mock data for immediate result display for review
const mockResult: AnalyzePetFoodIngredientsOutput = {
  "status": "success",
  "productInfo": {
    "name": "오리젠 6피쉬 독",
    "brand": "오리젠"
  },
  "summary": {
    "headline": "높은 동물성 단백질 함량과 신선한 생선 원료가 돋보이는 제품",
    "safetyRating": "Green"
  },
  "ingredientsAnalysis": {
    "positive": [
      {
        "name": "신선한 고등어, 청어, 아귀",
        "benefit": "다양한 종류의 신선한 생선을 제1~3원료로 사용하여 필수 아미노산과 오메가-3 지방산(EPA, DHA)이 풍부합니다."
      },
      {
        "name": "렌틸콩, 병아리콩",
        "benefit": "혈당 지수(GI)가 낮은 복합 탄수화물원으로, 급격한 혈당 상승을 막고 안정적인 에너지를 공급합니다."
      },
      {
        "name": "강황, 치커리 뿌리",
        "benefit": "강황은 천연 항염증제 역할을 하며, 치커리 뿌리는 프리바이오틱스로 작용하여 장내 유익균 증식을 돕습니다."
      }
    ],
    "caution": [
      {
        "name": "높은 단백질 함량 (38% 이상)",
        "risk": "활동량이 매우 많은 개나 성장기 강아지에게는 훌륭한 단백질 공급원이지만, 활동량이 적거나 노령견, 신장 기능이 저하된 반려견에게는 부담이 될 수 있습니다."
      },
      {
        "name": "다양한 생선 종류",
        "risk": "여러 종류의 생선이 사용되어 특정 어류에 알러지가 있는 반려견은 원인 파악이 어려울 수 있으므로 급여 시 주의 깊은 관찰이 필요합니다."
      }
    ]
  },
  "nutritionFacts": {
    "estimatedCalories": "약 3940 kcal/kg",
    "comment": "조단백과 조지방 함량이 모두 높아 에너지 밀도가 높은 편입니다. 활동량이 적은 실내견의 경우 체중 증가에 유의하며 급여량을 조절해야 합니다."
  },
  "expertInsight": "전체적으로 AAFCO 기준을 충족하는 우수한 성분 구성의 제품입니다. 특히 신선한 원료와 그레인프리 설계는 대부분의 건강한 반려견에게 훌륭한 선택이 될 수 있습니다. 다만, 높은 영양 밀도를 고려하여 반려견의 활동량, 나이, 건강 상태에 맞춰 급여량을 정밀하게 조절하는 것이 비만 및 신장 부담 예방의 핵심입니다."
};


export default function Home() {
  const { language, t } = useLanguage();
  
  // Set analysisResult to mockResult initially to show the result page
  const [analysisResult, setAnalysisResult] = useState<AnalyzePetFoodIngredientsOutput | null>(mockResult);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAnalysis = async (formData: AnalysisFormData) => {
    setIsLoading(true);
    setAnalysisResult(null);

    const file = formData.image?.[0];
    
    const analysisInput: AnalyzePetFoodIngredientsInput = {
        petType: formData.petType,
        productName: formData.productName,
        brandName: formData.brandName,
        foodType: formData.foodType,
        ingredientsText: formData.ingredientsText,
        healthConditions: formData.healthConditions,
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
          if (user && db && result.data.status === 'success') {
            const userInputForHistory = {
                petType: formData.petType,
                productName: formData.productName,
                brandName: formData.brandName || '',
                foodType: formData.foodType || '',
                ingredientsText: formData.ingredientsText || '',
                healthConditions: formData.healthConditions || '',
                photoProvided: !!file,
            };
            saveAnalysisToHistory(db, user.uid, userInputForHistory, result.data);
            toast({
              title: t('homePage.analysisCompleteTitle'),
              description: t('homePage.analysisCompleteDescription'),
            });
          }
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: t('homePage.analysisFailedTitle'),
          description: error instanceof Error ? error.message : t('homePage.analysisFailedDescriptionUnknown'),
        });
      } finally {
        setIsLoading(false);
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
        setIsLoading(false);
      };
    } else {
        await processAndAnalyze(analysisInput);
    }
  };
  
  const handleReset = () => {
    setAnalysisResult(null);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4 md:p-8">
      <div className="w-full max-w-4xl">
        {isLoading ? (
          <AnalysisLoading />
        ) : analysisResult ? (
          <AnalysisResult result={analysisResult} onReset={handleReset} />
        ) : (
          <ScannerHome onAnalyze={handleAnalysis} />
        )}
      </div>
    </div>
  );
}
