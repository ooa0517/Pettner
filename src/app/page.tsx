'use client';

import { useState, useMemo } from 'react';
import type { AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { getAnalysis } from '@/app/actions';
import AnalysisResult from '@/components/analysis-result';
import ScannerHome from '@/components/scanner-home';
import AnalysisLoading from '@/components/analysis-loading';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { saveAnalysisToHistory } from '@/lib/history';
import { useLanguage } from '@/contexts/language-context';

const exampleAnalysisKo: AnalyzePetFoodIngredientsOutput = {
  productName: "내추럴 코어 유기농 에코 2",
  brandName: "내추럴 코어",
  petType: "강아지",
  lifeStage: "전연령",
  specialClaims: ["유기농", "관절 건강"],
  keyTakeaways: [
    "이 제품은 '그레인프리'이지만, 렌틸콩, 완두콩 등 고탄수화물 콩류가 다량 함유되어 있어 혈당 관리가 필요한 반려견에게는 주의가 필요합니다.",
    "주 단백질원이 '닭고기'로 표시되어 있으나, 성분 목록 후반부에 '완두콩 단백질'이 위치하는 것으로 보아 실제 동물성 단백질의 비율은 기대보다 낮을 수 있습니다. 이는 필수 아미노산 프로필에 영향을 줄 수 있습니다."
  ],
  summaryHeadline: "유기농 원료 기반의 균형 잡힌 사료이나, 일부 반려견에게 알레르기 반응을 유발할 수 있는 성분이 포함되어 있습니다.",
  ingredients: {
    positive: [
      { name: "유기농 닭고기", reason: "고품질 단백질원으로, 근육 발달과 유지에 필수적이며 알레르기 반응이 적은 편입니다." },
      { name: "글루코사민", reason: "관절 연골의 구성 성분으로, 관절 건강 및 이동성 개선에 도움을 줄 수 있습니다." },
      { name: "고구마", reason: "복합 탄수화물과 식이섬유가 풍부하여 건강한 소화를 돕고 안정적인 에너지 공급원입니다." }
    ],
    cautionary: [
      { name: "완두콩 단백질", reason: "식물성 단백질원으로, 일부 연구에서 장기 급여 시 심장 질환(DCM)과의 연관성 가능성이 제기되고 있습니다." }
    ]
  },
  nutritionalAnalysis: {
    estimatedCalories: "350 kcal / 100g",
    insights: ["단백질 함량이 활동적인 반려견에게 적합합니다.", "오메가-3와 오메가-6 지방산의 비율이 피부 및 모질 건강에 긍정적인 영향을 줄 수 있습니다."]
  },
  hiddenInsights: [
    "주요 단백질원으로 닭고기 외에 다양한 식물성 단백질이 사용되어 실제 동물성 단백질 비율은 예상보다 낮을 수 있습니다.",
    "'그레인프리'이지만 완두콩, 렌틸콩 등 다른 콩류가 다량 포함되어 탄수화물 함량이 낮지 않습니다."
  ],
  recommendations: {
    introduction: "이 세상에 완벽한 사료는 없습니다. 아래 내용은 현재 식단을 보완하고 더 나은 선택을 돕기 위한 수의 영양학적 제안입니다.",
    supplementaryIngredients: [
      { name: "오메가-3 지방산 (피쉬 오일)", reason: "현재 사료의 오메가-6 대비 오메가-3 비율을 개선하여 피부 장벽 강화 및 염증 반응 감소에 도움을 줄 수 있습니다." },
      { name: "프로바이오틱스", reason: "장내 미생물 균형을 개선하여 소화기 건강을 증진시키고 면역 체계 강화에 기여할 수 있습니다." }
    ],
    alternativeProductTypes: [
      { type: "가수분해 단백질 사료", reason: "만약 현재 사료에 사용된 단백질원에 반려견이 알레르기 반응을 보인다면, 단백질을 잘게 쪼개어 면역 반응을 회피하는 가수분해 사료가 대안이 될 수 있습니다." },
      { type: "단일 단백질원 (L.I.D) 사료", reason: "여러 단백질원이 혼합된 사료보다 알레르기 원인을 파악하고 관리하기에 용이합니다." }
    ]
  }
};

const exampleAnalysisEn: AnalyzePetFoodIngredientsOutput = {
  productName: "Natural Core Organic Eco 2",
  brandName: "Natural Core",
  petType: "Dog",
  lifeStage: "All Life Stages",
  specialClaims: ["Organic", "Joint Health"],
  keyTakeaways: [
    "This product is 'grain-free', but contains high-carbohydrate legumes like lentils and peas, so caution is needed for dogs requiring blood sugar management.",
    "The main protein source is listed as 'chicken', but 'pea protein' appears later in the ingredient list, suggesting the actual animal protein ratio may be lower than expected. This can affect the essential amino acid profile."
  ],
  summaryHeadline: "A balanced food based on organic ingredients, but contains components that may cause allergic reactions in some dogs.",
  ingredients: {
    positive: [
      { name: "Organic Chicken", reason: "A high-quality protein source, essential for muscle development and maintenance, with a lower tendency for allergic reactions." },
      { name: "Glucosamine", reason: "A component of joint cartilage, which can help improve joint health and mobility." },
      { name: "Sweet Potato", reason: "Rich in complex carbohydrates and dietary fiber, it aids healthy digestion and is a stable energy source." }
    ],
    cautionary: [
      { name: "Pea Protein", reason: "A plant-based protein source; some studies have suggested a possible link to heart disease (DCM) with long-term feeding." }
    ]
  },
  nutritionalAnalysis: {
    estimatedCalories: "350 kcal / 100g",
    insights: ["The protein content is suitable for active dogs.", "The ratio of Omega-3 to Omega-6 fatty acids can have a positive effect on skin and coat health."]
  },
  hiddenInsights: [
    "In addition to chicken, various plant-based proteins are used, so the actual animal protein ratio may be lower than anticipated.",
    "Although 'grain-free', it contains a significant amount of other legumes like peas and lentils, so the carbohydrate content is not low."
  ],
  recommendations: {
    introduction: "No food is perfect. The recommendations below are veterinary nutritional suggestions to supplement the current diet and help make better choices.",
    supplementaryIngredients: [
      { name: "Omega-3 Fatty Acids (Fish Oil)", reason: "Can help improve the Omega-6 to Omega-3 ratio of the current food, strengthening the skin barrier and reducing inflammatory responses." },
      { name: "Probiotics", reason: "Can improve intestinal microbial balance, promoting digestive health and contributing to a stronger immune system." }
    ],
    alternativeProductTypes: [
      { type: "Hydrolyzed Protein Diet", reason: "If your dog shows an allergic reaction to the protein source in the current food, a hydrolyzed diet, which breaks down proteins to avoid an immune response, could be an alternative." },
      { type: "Limited Ingredient Diet (L.I.D.)", reason: "Easier to identify and manage allergy sources than a food with multiple mixed protein sources." }
    ]
  }
};

export default function Home() {
  const { language, t } = useLanguage();
  const exampleAnalysis = useMemo(() => language === 'ko' ? exampleAnalysisKo : exampleAnalysisEn, [language]);
  
  const [analysisResult, setAnalysisResult] = useState<AnalyzePetFoodIngredientsOutput | null>(exampleAnalysis);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleImageAnalysis = async (file: File, healthConditions: string) => {
    setIsLoading(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const imageDataUri = reader.result as string;
      try {
        const result = await getAnalysis({ photoDataUri: imageDataUri, healthConditions, language });
        if (result.error) {
          throw new Error(t(result.error));
        }
        if (result.data) {
          setAnalysisResult(result.data);
          if (user && db) {
            saveAnalysisToHistory(db, user.uid, result.data);
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
        setAnalysisResult(null);
      } finally {
        setIsLoading(false);
      }
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
          <ScannerHome onImageSelect={handleImageAnalysis} />
        )}
      </div>
    </div>
  );
}
