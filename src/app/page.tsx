'use client';

import { useState } from 'react';
import type { AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { getAnalysis } from '@/app/actions';
import AnalysisResult from '@/components/analysis-result';
import ScannerHome from '@/components/scanner-home';
import AnalysisLoading from '@/components/analysis-loading';
import { useToast } from '@/hooks/use-toast';

// Mock data for the example
const exampleAnalysis: AnalyzePetFoodIngredientsOutput = {
  productName: "내추럴 코어 유기농 에코 2",
  brandName: "내추럴 코어",
  petType: "강아지",
  lifeStage: "전연령",
  specialClaims: ["유기농", "관절 건강"],
  summaryHeadline: "유기농 원료 기반의 균형 잡힌 사료이나, 일부 반려견에게 알레르기 반응을 유발할 수 있는 성분이 포함되어 있습니다.",
  ingredients: {
    positive: [
      {
        name: "유기농 닭고기",
        reason: "고품질 단백질원으로, 근육 발달과 유지에 필수적이며 알레르기 반응이 적은 편입니다."
      },
      {
        name: "글루코사민",
        reason: "관절 연골의 구성 성분으로, 관절 건강 및 이동성 개선에 도움을 줄 수 있습니다."
      },
      {
        name: "고구마",
        reason: "복합 탄수화물과 식이섬유가 풍부하여 건강한 소화를 돕고 안정적인 에너지 공급원입니다."
      }
    ],
    cautionary: [
      {
        name: "완두콩 단백질",
        reason: "식물성 단백질원으로, 일부 연구에서 장기 급여 시 심장 질환(DCM)과의 연관성 가능성이 제기되고 있습니다."
      }
    ]
  },
  nutritionalAnalysis: {
    estimatedCalories: "350 kcal / 100g",
    insights: [
      "단백질 함량이 활동적인 반려견에게 적합합니다.",
      "오메가-3와 오메가-6 지방산의 비율이 피부 및 모질 건강에 긍정적인 영향을 줄 수 있습니다."
    ]
  },
  hiddenInsights: [
    "주요 단백질원으로 닭고기 외에 다양한 식물성 단백질이 사용되어 실제 동물성 단백질 비율은 예상보다 낮을 수 있습니다.",
    "'그레인프리'이지만 완두콩, 렌틸콩 등 다른 콩류가 다량 포함되어 탄수화물 함량이 낮지 않습니다."
  ]
};

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzePetFoodIngredientsOutput | null>(exampleAnalysis);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageAnalysis = async (file: File) => {
    setIsLoading(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const imageDataUri = reader.result as string;
      try {
        const result = await getAnalysis(imageDataUri);
        if (result.error) {
          throw new Error(result.error);
        }
        setAnalysisResult(result.data);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "분석 실패",
          description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.",
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
        title: "파일 읽기 실패",
        description: "이미지를 읽는 중 오류가 발생했습니다. 다른 파일을 선택해 주세요.",
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
