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
  lifeStage: 'PUPPY' | 'ADULT' | 'SENIOR' | 'ALL_STAGES';
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
  language: 'ko',
  lifeStage: 'ALL_STAGES'
};

const mockResult: AnalyzePetFoodIngredientsOutput = {
  "status": "success",
  "productInfo": {
    "name": "오리젠 6피쉬 독",
    "brand": "오리젠"
  },
  "summary": {
    "hashtags": ["#생선살듬뿍", "#튼튼피부", "#활동량많은아이"],
    "safetyRating": "Green"
  },
  "topIngredients": ["신선한 태평양 고등어", "신선한 태평양 청어", "신선한 태평양 아귀", "신선한 아카디안 레드피쉬", "신선한 가자미"],
  "ingredientsAnalysis": {
    "positive": [
      {
        "keyword": "오메가-3가 풍부해요",
        "name": "다양한 신선한 생선",
        "description": "피부와 모질을 반짝반짝하게 만들어주는 신선한 생선 오일이 가득 들어있어요."
      },
      {
        "keyword": "살이 덜 쪄요",
        "name": "렌틸콩, 병아리콩",
        "description": "혈당을 천천히 올려주는 착한 탄수화물이라, 먹고나서도 에너지가 오래 가고 비만 걱정도 덜어줘요."
      },
      {
        "keyword": "장 건강에 좋아요",
        "name": "치커리 뿌리",
        "description": "장 속에 사는 좋은 균들의 맛있는 밥이 되어, 소화와 응가를 편안하게 도와주는 성분이에요."
      }
    ],
    "caution": [
      {
        "keyword": "신장이 약하다면 주의!",
        "name": "높은 단백질 함량",
        "description": "건강한 아이에겐 근육을 튼튼하게 해주지만, 신장이 약한 친구에게는 부담이 될 수 있어요."
      },
      {
        "keyword": "알러지 확인 필수",
        "name": "다양한 어류 단백질",
        "description": "여러 생선이 섞여있어, 특정 생선에 알러지가 있다면 원인을 찾기 어려울 수 있으니 처음엔 조금씩만 줘보세요."
      }
    ]
  },
  "nutritionFacts": {
    "comment": "단백질과 지방 함량이 높아 활동량이 많은 아이나 성장기 아이에게 좋은 에너지원이 될 수 있어요. 하지만 칼로리가 높은 편이라, 실내 생활 위주의 반려견이나 체중 조절이 필요한 경우 급여량 조절에 신경 써주시는 게 좋아요."
  },
  "expertInsight": {
    "goodPoint": "신선한 생선이 듬뿍 들어가 있어서, 다른 사료보다 오메가-3 같은 좋은 지방산을 챙겨주기 정말 좋아요. 피부와 털 건강에 큰 도움이 될 거예요.",
    "cautionPoint": "단백질 함량이 높아 신장이 약한 아이에게는 부담이 될 수 있어요. 전연령용 사료는 영양 요구치가 가장 높은 성장기 기준에 맞춰져 있으니, 우리 아이의 나이와 활동량을 꼭 고려해주세요.",
    "proTip": "처음 먹일 땐 평소 주던 양보다 10% 정도 적게 시작해서, 아이의 몸무게와 활동량을 보며 조절해주세요. 특히 실내 생활을 많이 하는 아이라면 살이 찌지 않도록 신경 써주시는 게 좋아요."
  }
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
        lifeStage: formData.lifeStage,
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
                lifeStage: formData.lifeStage || '',
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
