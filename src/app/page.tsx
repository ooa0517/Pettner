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
    "hashtags": ["#생선살듬뿍", "#튼튼피부", "#활동량많은아이"]
  },
  "allIngredients": ["신선한 태평양 고등어", "신선한 태평양 청어", "신선한 태평양 아귀", "신선한 아카디안 레드피쉬", "신선한 가자미", "통 고등어(건조)", "통 청어(건조)", "대구(건조)", "청대구(건조)", "알래스카 명태(건조)", "해바라기유", "붉은 렌틸콩", "녹색 렌틸콩", "녹색 완두콩", "렌틸콩 섬유질", "병아리콩", "노란 완두콩", "강황", "치커리 뿌리", "민들레 뿌리", "주니퍼 베리", "사르사 뿌리", "로즈힙"],
  "pros": [
    "다양한 종류의 신선한 생선이 듬뿍 들어있어, 피부와 털을 반짝이게 만들어주는 오메가-3가 풍부해요.",
    "일반적인 감자나 곡물 대신 렌틸콩, 병아리콩 같은 GI 지수가 낮은 재료를 사용해서 혈당 관리에 도움을 줄 수 있어요.",
    "치커리 뿌리 같은 프리바이오틱스가 들어있어 장 속 좋은 균들의 먹이가 되어 장 건강과 소화에 도움을 줍니다."
  ],
  "cons": [
    "단백질 함량이 높아 신장이 약한 아이에게는 부담이 될 수 있으니 주의가 필요해요.",
    "다양한 종류의 생선이 사용되어, 특정 생선에 알러지가 있는 아이라면 원인을 찾기 어려울 수 있습니다.",
    "알갱이가 단단한 편이라 치아가 약한 노령견이나 소형견은 먹기 힘들어할 수 있어요."
  ],
  "radarChart": [
    { "attribute": "피부/모질", "score": 5 },
    { "attribute": "소화기 건강", "score": 4 },
    { "attribute": "체중 관리", "score": 3 },
    { "attribute": "관절 강화", "score": 3 },
    { "attribute": "활동 에너지", "score": 5 }
  ],
  "feedingGuide": {
    "adult": [
      { "weight": "5-10kg", "amount": "75-120g" },
      { "weight": "10-20kg", "amount": "120-200g" },
      { "weight": "20-30kg", "amount": "200-270g" }
    ],
    "puppy": [
      { "weight": "1-5kg", "amount": "90-150g" },
      { "weight": "5-10kg", "amount": "150-240g" },
      { "weight": "10-20kg", "amount": "240-360g" }
    ],
    "senior": [
      { "weight": "5-10kg", "amount": "60-100g" },
      { "weight": "10-20kg", "amount": "100-160g" },
      { "weight": "20-30kg", "amount": "160-220g" }
    ]
  },
  "expertInsight": {
    "proTip": "활동량이 아주 많은 아이가 아니라면, 권장량보다 10~20% 적게 시작해서 변 상태를 보며 양을 조절해주는 것이 좋아요. 물에 살짝 불려주면 소화 흡수에도 도움이 된답니다."
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
