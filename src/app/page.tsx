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

// Mock data for previewing the analysis result page
const mockAnalysisResult: AnalyzePetFoodIngredientsOutput = {
  productName: "내추럴 코어 유기농 에코 2",
  brandName: "내추럴 코어",
  petType: "dog",
  lifeStage: "전연령용",
  specialClaims: ["Grain-Free", "Organic", "Human-Grade"],
  summaryHeadline: "가수분해 단백질을 사용하여 알러지 반응을 최소화하고 소화 흡수율을 높인 유기농 사료입니다.",
  keyTakeaways: [
    "주 단백질원으로 가수분해 닭고기를 사용하여 식이 알러지 발생 가능성이 매우 낮습니다.",
    "‘전연령용’이지만 성장기 기준에 맞춰져 있어, 성견이나 노령견의 경우 비만 방지를 위한 급여량 조절이 필수적입니다.",
    "인공 화학 첨가물(보존제, 색소, 향료)이 전혀 사용되지 않아 안심하고 급여할 수 있습니다."
  ],
  ingredients: {
    positive: [
      { name: "가수분해 닭고기", reason: "단백질을 아미노산 단위로 잘게 쪼개어 알러지 반응을 최소화하고 소화 흡수율을 극대화합니다." },
      { name: "유기농 통귀리", reason: "정제되지 않은 통곡물로, 풍부한 식이섬유와 베타글루칸을 함유하여 장 건강과 면역력 증진에 도움을 줍니다." },
      { name: "연어 오일", reason: "오메가-3 지방산(EPA, DHA)이 풍부하여 피부 장벽 강화, 모질 개선 및 심혈관 건강에 긍정적인 영향을 줍니다." }
    ],
    cautionary: [
      { name: "감자", reason: "일부 반려동물에게 알러지 반응을 유발할 수 있으며, 높은 GI 지수로 인해 혈당을 급격히 상승시킬 수 있습니다." },
      { name: "완두콩 단백질", reason: "육류 단백질에 비해 필수 아미노산 조성이 불완전하며, 과도하게 함유될 경우 신장에 부담을 줄 수 있습니다." }
    ]
  },
  nutritionalAnalysis: {
    estimatedCalories: "~3,640 kcal/kg",
    insights: [
      "전연령용 사료는 성장기(자견)의 높은 영양 요구량을 충족하도록 설계되어, 활동량이 적은 성견이나 노령견에게는 칼로리가 높을 수 있습니다. 급여량 조절이 중요합니다.",
      "성장기 강아지에게는 충분한 에너지를 공급하지만, 인(phosphorus) 함량에 따라 노령견에게는 신장 부담을 줄 수 있으므로 주의가 필요할 수 있습니다.",
      "칼슘과 인의 비율이 약 1.2:1로 AAFCO 기준에 부합하여 뼈 성장과 유지에 적합한 균형을 보입니다."
    ]
  },
  hiddenInsights: [
    "본 제품은 단일 가수분해 단백질을 사용하여 식이 민감성이 있는 반려동물에게 특히 추천됩니다.",
    "유기농 원료 함량이 70% 이상으로, 잔류 농약이나 화학 비료에 대한 걱정을 덜 수 있습니다."
  ],
  recommendations: {
    introduction: "이 세상에 완벽한 사료는 없습니다. 아래 내용은 현재 식단을 보완하고 더 나은 선택을 돕기 위한 수의 영양학적 제안입니다.",
    supplementaryIngredients: [
      { name: "프로바이오틱스", reason: "장내 유익균의 균형을 맞추어 소화 기능 개선 및 면역 체계 강화에 도움을 줄 수 있습니다." },
      { name: "글루코사민 & 콘드로이틴", reason: "관절 연골의 구성 성분으로, 관절 건강 유지 및 관절염 예방에 기여할 수 있습니다." }
    ],
    alternativeProductTypes: [
      { type: "곤충 단백질 기반 사료", reason: "가금류 단백질에 알러지 반응을 보이는 경우, 새로운 단백질원인 곤충 단백질을 시도해볼 수 있습니다." }
    ]
  }
};


export default function Home() {
  const { language, t } = useLanguage();
  
  // Set initial state to show the result page for preview
  const [analysisResult, setAnalysisResult] = useState<AnalyzePetFoodIngredientsOutput | null>(mockAnalysisResult);
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
          if (user && db) {
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
