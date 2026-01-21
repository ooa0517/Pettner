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
const mockInput: AnalyzePetFoodIngredientsInput = {
  petType: 'dog',
  productName: '오리젠 6피쉬 독',
  brandName: '오리젠',
  ingredientsText: '신선한 태평양 고등어, 신선한 태평양 청어, 신선한 태평양 아귀, 신선한 아카디안 레드피쉬, 신선한 가자미, 통 고등어(건조), 통 청어(건조), 대구(건조), 청대구(건조), 알래스카 명태(건조), 해바라기유, 붉은 렌틸콩, 녹색 렌틸콩, 녹색 완두콩, 렌틸콩 섬유질, 병아리콩, 노란 완두콩, 강황, 치커리 뿌리, 민들레 뿌리, 주니퍼 베리, 사르사 뿌리, 로즈힙',
  photoDataUri: 'https://picsum.photos/seed/petfoodlabel/400/600',
  language: 'ko'
};

const mockResult: AnalyzePetFoodIngredientsOutput = {
  "status": "success",
  "productInfo": {
    "name": "오리젠 6피쉬 독 (전연령용)",
    "brand": "오리젠"
  },
  "summary": {
    "headline": "높은 동물성 단백질 함량과 신선한 생선 원료가 돋보이는 전연령 사료",
    "safetyRating": "Green"
  },
  "ingredientsAnalysis": {
    "topIngredients": ["신선한 태평양 고등어", "신선한 태평양 청어", "신선한 태평양 아귀", "신선한 아카디안 레드피쉬", "신선한 가자미"],
    "positive": [
      {
        "name": "다양한 신선한 생선 (고등어, 청어, 아귀 등)",
        "benefit": "다양한 종류의 신선한 생선을 제1~5원료로 사용하여 필수 아미노산과 오메가-3 지방산(EPA, DHA)이 풍부합니다. 이는 피부와 모질 건강, 염증 반응 완화에 도움을 줍니다."
      },
      {
        "name": "렌틸콩, 병아리콩",
        "benefit": "혈당 지수(GI)가 낮은 복합 탄수화물원으로, 급격한 혈당 상승을 막고 안정적인 에너지를 공급하는 데 도움을 줍니다."
      },
      {
        "name": "강황, 치커리 뿌리",
        "benefit": "강황은 천연 항염증제 역할을 할 수 있으며, 치커리 뿌리는 프리바이오틱스로 작용하여 장내 유익균 증식을 도와 소화기 건강에 긍정적인 영향을 줄 수 있습니다."
      }
    ],
    "caution": [
      {
        "name": "높은 단백질 함량 (38% 이상)",
        "risk": "활동량이 매우 많거나 성장기 강아지에게는 훌륭한 단백질 공급원이지만, 활동량이 적은 성견이나 노령견, 특히 신장 기능이 저하된 반려견에게는 신장에 부담을 줄 수 있습니다."
      },
      {
        "name": "다양한 어류 단백질원",
        "risk": "여러 종류의 생선이 사용되어 특정 어류에 알러지가 있는 반려견의 경우 원인 파악이 어려울 수 있습니다. 새로운 사료를 급여할 때는 알러지 반응이 없는지 주의 깊은 관찰이 필요합니다."
      }
    ]
  },
  "nutritionFacts": {
    "estimatedCalories": "약 3940 kcal/kg",
    "protein": "38.0% 이상",
    "fat": "18.0% 이상",
    "fiber": "4.0% 이하",
    "ash": "8.0% 이하",
    "moisture": "12.0% 이하",
    "comment": "전연령 사료로, 영양 요구량이 높은 성장기 기준에 맞춰져 있어 단백질과 지방 함량이 매우 높은 편입니다. 활동량이 적은 성견이나 노령견의 경우, 비만 및 관련 대사 질환 예방을 위해 급여량을 정밀하게 조절해야 합니다."
  },
  "expertInsight": "전체적으로 AAFCO 기준을 충족하는 우수한 성분 구성의 제품입니다. 특히 신선한 원료와 그레인프리 설계는 대부분의 건강한 반려견에게 훌륭한 선택이 될 수 있습니다. 다만 '전연령용' 사료의 특성상 영양 밀도가 높으므로, 반려견의 생애주기(성장기, 성견, 노령견), 활동량, 건강 상태에 맞춰 급여량을 정밀하게 조절하는 것이 비만 및 신장 부담 예방의 핵심입니다. 예를 들어, 중성화한 실내 성견의 경우 권장 급여량보다 10~20% 적게 시작하는 것을 고려해볼 수 있습니다."
};


export default function Home() {
  const { language, t } = useLanguage();
  
  // Set analysisResult to mockResult initially to show the result page
  const [analysisResult, setAnalysisResult] = useState<AnalyzePetFoodIngredientsOutput | null>(mockResult);
  const [resultInput, setResultInput] = useState<AnalyzePetFoodIngredientsInput | null>(mockInput);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAnalysis = async (formData: AnalysisFormData) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setResultInput(null);

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
          setResultInput(input); // Store the input used for this result
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
    setResultInput(null);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4 md:p-8">
      <div className="w-full max-w-4xl">
        {isLoading ? (
          <AnalysisLoading />
        ) : analysisResult && resultInput ? (
          <AnalysisResult result={analysisResult} input={resultInput} onReset={handleReset} />
        ) : (
          <ScannerHome onAnalyze={handleAnalysis} />
        )}
      </div>
    </div>
  );
}
