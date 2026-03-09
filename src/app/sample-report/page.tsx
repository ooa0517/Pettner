
'use client';

import AnalysisResult from '@/components/analysis-result';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SampleReportPage() {
  // 나무(말티푸, 12.6kg, BCS 5)를 위한 초정밀 분석 데이터 V19.2 규격
  const mockResult: AnalyzePetFoodIngredientsOutput = {
    status: 'success',
    productIdentity: {
      name: "인스팅트 오리지널 그레인프리 치킨",
      brand: "인스팅트 (Instinct)",
      category: "건식 사료",
      pettnerCompliance: {
        isCompliant: true,
        reason: "AAFCO 영양 기준을 충족하며, 고품질 육류 단백질을 주원료로 사용합니다."
      }
    },
    scoreCard: {
      totalScore: 88,
      grade: "A (우수)",
      headline: "나무의 건강 상태를 고려할 때 매우 우수한 단백질 공급원이지만, 체중 관리를 위해 급여량 조절이 필요합니다.",
      statusTags: ["✅ 고단백", "✅ 그레인프리", "⚠️ 칼로리 밀도 높음"],
      scoringBasis: "단백질 품질(30%), 지방 균형(20%), 원재료 안전성(20%), 미네랄/비타민(15%), 칼로리 적합성(15%) 기준에 따라 산출되었습니다. (J Vet Nutr, 2023)"
    },
    ingredientAnalysis: {
      ingredientList100: [
        { name: "닭고기", category: "positive", reason: "고품질 동물성 단백질원으로 필수 아미노산이 풍부합니다. (Pet Food Sci J, 2024)", safetyRating: "High Quality" },
        { name: "닭고기 지방", category: "positive", reason: "에너지원 및 오메가-6 지방산 공급원입니다.", safetyRating: "Safe" },
        { name: "타피오카 전분", category: "cautionary", reason: "높은 당지수로 인해 과체중 아이의 혈당 조절에 영향을 줄 수 있습니다.", safetyRating: "Allergy Risk Low" }
      ],
      suitabilityAudit: {
        suitableFor: ["성견", "활동량 많은 개", "곡물 알러지 견"],
        notSuitableFor: ["비만 견(제한 급여 필요)", "고양이"],
        unsuitableReasons: "높은 지방 함량으로 인해 엄격한 체중 관리가 필요한 경우 주의가 필요합니다."
      }
    },
    scientificAnalysis: {
      nutrientMass: {
        protein_g: 35.0,
        fat_g: 18.0,
        carbs_g: 22.0,
        kcal: 3800
      },
      comparativeChart: [
        { nutrient: "조단백질", productValue: 35.0, standardMin: 18.0, standardMax: 30.0 },
        { nutrient: "조지방", productValue: 18.0, standardMin: 5.5, standardMax: 20.0 }
      ],
      aafcoComparison: [
        { nutrient: "Protein", unit: "%", productValue: 35.0, aafcoMin: 18.0, status: "optimal" },
        { nutrient: "Fat", unit: "%", productValue: 18.0, aafcoMin: 5.5, status: "pass" }
      ]
    },
    feedingGuide: {
      productPurpose: "성견의 근육 유지 및 일상적인 에너지 공급을 목적으로 하는 프리미엄 식단입니다.",
      feedingTable: [
        { weightRange: "10-15kg", lowActivityGrams: "150g", highActivityGrams: "200g", totalKcalRange: "570-760kcal" }
      ]
    },
    esgReport: {
      transparencyStatus: "DIRECT",
      environmental: "지속 가능한 원료 소싱 및 친환경 패키징을 실천하고 있습니다.",
      recallHistory: "최근 5년간 중대한 안전 관련 리콜 이력이 없습니다.",
      certifications: ["ISO 9001", "HACCP"]
    },
    veterinaryAdvice: "나무는 현재 과체중 상태이므로 제품 권장 급여량의 하단(150g)부터 시작하시고, 운동량을 서서히 늘리는 것을 권장합니다."
  };

  const mockInput: AnalyzePetFoodIngredientsInput = {
    petType: 'dog',
    analysisMode: 'custom',
    productName: '인스팅트 오리지널 그레인프리 치킨',
    productCategory: 'food',
    detailedProductType: '건식 사료',
    petProfile: {
      name: '나무',
      breed: '말티푸',
      age: 4,
      weight: 12.6,
      bcs: '5',
      healthConditions: ['비만'],
      activityLevel: 'NORMAL'
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
