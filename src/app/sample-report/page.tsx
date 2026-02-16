'use client';

import AnalysisResult from '@/components/analysis-result';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SampleReportPage() {
  // 나무(말티푸, 12.6kg, BCS 5)를 위한 초정밀 분석 데이터
  const mockResult: AnalyzePetFoodIngredientsOutput = {
    status: 'success',
    productIdentity: {
      name: "인스팅트 오리지널 그레인프리 치킨",
      brand: "인스팅트 (Instinct)",
      category: "건식 사료"
    },
    scoreCard: {
      totalScore: 58,
      grade: "C+ (다이어트 필요)",
      headline: "나무의 건강을 위해 탄수화물 함량이 더 낮은 식단으로 교체하는 것을 권장합니다.",
      statusTags: ["🔴 비만 경고", "📉 다이어트 시급", "🦴 관절 보호 필요"]
    },
    weightDiagnosis: {
      currentWeight: 12.6,
      idealWeight: 10.08,
      weightGap: 2.52,
      breedStandardRange: "3~8kg",
      overweightPercentage: 57.5,
      verdict: "말티푸 평균 몸무게 상단(8kg) 대비 약 57% 초과된 상태로, 관절 및 심혈관 질환 위험이 매우 높습니다."
    },
    dietRoadmap: [
      { weight: 12.6, grams: 85, phase: "급속 감량기" },
      { weight: 11.3, grams: 95, phase: "안정기" },
      { weight: 10.1, grams: 110, phase: "유지기 도달" }
    ],
    advancedNutrition: {
      carbs_nfe_dm: 42.5,
      protein_dm: 35.0,
      fat_dm: 18.0,
      isHighCarb: true,
      caloriesPerGram: 3.8
    },
    veterinaryDiagnosis: {
      criticalMismatch: "본 제품의 탄수화물 함량은 42.5%로, 비만 관리가 필요한 나무에게는 다소 높습니다. 특히 고혈당을 유발하는 타피오카 성분이 포함되어 있어 체지방 감량 속도가 더딜 수 있습니다.",
      positivePoints: [
        "글루코사민과 콘드로이친이 함유되어 과체중으로 인한 나무의 슬개골 및 관절 부담을 완화해줍니다.",
        "오메가-3 지방산이 풍부하여 비만으로 인한 만성 염증 억제에 도움을 줍니다."
      ],
      cautionaryPoints: [
        "타피오카 전분: 높은 당지수로 인해 인슐린 분비를 자극, 지방 축적을 촉진할 수 있습니다.",
        "닭고기 지방: 칼로리 밀도가 높아 정해진 급여량을 엄격히 준수해야 합니다."
      ],
      vetAdvice: "현재 나무는 심각한 과체중 상태입니다. 사료를 즉시 변경하기 어렵다면 현재 급여량에서 15%를 줄여서 시작하시고, 간식은 일체 중단하십시오. 2주 뒤 체중 변화를 보고 급여량을 미세 조정해야 합니다."
    },
    feedingSummary: {
      lossAmountGrams: 85,
      cupGuide: "종이컵 약 0.8컵"
    }
  };

  const mockInput: AnalyzePetFoodIngredientsInput = {
    petType: 'dog',
    productName: '인스팅트 오리지널 그레인프리 치킨',
    petProfile: {
      name: '나무',
      breed: '말티푸',
      age: 4,
      weight: 12.6,
      bcs: '5',
      healthConditions: ['발핥음'],
      activityLevel: 'HIGH'
    }
  };

  return (
    <div className="flex-grow p-4 md:p-8 bg-muted/20">
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        <div className="flex items-center justify-between">
            <Button asChild variant="ghost" className="hover:bg-primary/5">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> 메인으로
                </Link>
            </Button>
            <div className="flex items-center gap-2 text-primary font-bold">
                <Sparkles className="w-5 h-5" />
                <span>VETERINARY MEDICAL REPORT</span>
            </div>
        </div>

        <div className="bg-primary text-white p-6 rounded-3xl shadow-xl shadow-primary/20 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
            <span className="text-4xl">🔬</span>
          </div>
          <div>
            <h2 className="text-2xl font-black">초정밀 수의학 진단 리포트 (예시)</h2>
            <p className="text-primary-foreground/80 font-medium">말티푸 나무(12.6kg, 비만)를 위한 맞춤형 분석 결과입니다.</p>
          </div>
        </div>

        <AnalysisResult 
          result={mockResult} 
          input={mockInput} 
          onReset={() => window.location.href = '/'} 
        />
      </div>
    </div>
  );
}
