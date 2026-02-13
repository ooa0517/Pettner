
'use client';

import AnalysisResult from '@/components/analysis-result';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SampleReportPage() {
  // 나무(말티푸, 12.6kg, 발핥음)를 위한 초고도화 가상 분석 데이터
  const mockResult: AnalyzePetFoodIngredientsOutput = {
    status: 'success',
    productInfo: {
      name: "인스팅트 오리지널 그레인프리 치킨",
      brand: "인스팅트 (Instinct)",
      type: "건식 사료"
    },
    matchingScore: {
      score: 82,
      clinicalReason: "AAFCO 2024 영양 가이드라인 기준, 성견에게 필요한 필수 아미노산 프로필을 완벽히 충족합니다. 다만, 나무가 보이는 '발핥음' 증상은 전형적인 식이 알러지 반응일 가능성이 높으며, 본 제품의 주 단백질원인 닭고기는 알러지 유발 빈도가 높은 원료입니다. 임상적으로 알러지 배제 식이(Elimination Diet)가 필요한 시점입니다.",
      geneticInsight: "말티푸(Maltipoo)는 유전적으로 슬개골 탈구와 심장 건강 관리에 취약합니다. 나무의 현재 체중(12.6kg)은 과체중 상태로 보이며, 이는 관절에 무리를 줄 수 있습니다. 본 제품은 관절 보조 성분(글루코사민)을 함유하고 있어 긍정적이나, 높은 칼로리 밀도 때문에 정밀한 급여량 조절이 필수적입니다.",
      complexConditionAdvice: "발핥음(알러지)과 과체중(12.6kg)이 공존하는 복합 상태입니다. 알러지 반응을 줄이기 위해 2주간 간식을 완전히 중단하고 본 사료만 급여하며 발핥음 횟수를 체크하십시오. 또한, 현재 체중 감량을 위해 RER(휴지기 에너지 요구량) 기준의 0.9배로 급여량을 조절할 것을 권장합니다."
    },
    summary: {
      headlines: [
        "고단백 육류 위주의 프리미엄 그레인프리 식단",
        "알러지 유발 가능성이 있는 닭고기 베이스 주의 필요",
        "관절 및 연골 건강을 위한 콘드로이친 함유"
      ],
      hashtags: ["#고단백", "#그레인프리", "#생식코팅", "#말티푸맞춤관리", "#관절케어"]
    },
    ingredientsAnalysis: {
      positive: [
        { name: "생닭고기", effect: "제1원료로서 생체 이용률이 매우 높은 양질의 동물성 단백질 공급" },
        { name: "닭고기 밀", effect: "농축된 단백질원으로 근육 유지 및 필수 아미노산 밸런스 유지" },
        { name: "동결건조 닭고기", effect: "영양소 파괴를 최소화한 생식 코팅으로 기호성 및 소화율 극대화" }
      ],
      cautionary: [
        { name: "닭고기 지방", effect: "에너지원은 좋으나 닭고기 알러지가 있는 경우 교차 반응 위험" },
        { name: "타피오카 전분", effect: "곡물은 없으나 탄수화물 밀도가 높아 비만 관리 시 급여량 주의" }
      ],
      hiddenInsights: "본 제품은 'Grain-Free'를 표방하지만, 타피오카와 완두콩을 통해 탄수화물을 보충합니다. 이는 당지수(GI)를 고려해야 하는 나무와 같은 과체중 아이에게는 정량 급여가 무엇보다 중요함을 시사합니다."
    },
    radarChart: [
      { attribute: "소화기 건강", score: 5 },
      { attribute: "피부/모질", score: 2 },
      { attribute: "체중 관리", score: 3 },
      { attribute: "관절 강화", score: 4 },
      { attribute: "활동 에너지", score: 5 }
    ],
    feedingGuide: {
      dailyCalories: "12.6kg 나무 기준: 약 680kcal (체중 감량 모드)",
      recommendation: "일 2회 급여, 1회당 약 80g(종이컵 약 3/4컵 미만)씩 급여하십시오. 발핥음이 심해질 경우 육류 단백질원을 변경(연어, 토끼 등)하는 것을 고려하십시오."
    },
    expertInsight: {
      proTip: "나무의 발핥음은 식이 알러지일 확률이 80% 이상입니다. 사료 변경 시 반드시 7~10일에 걸쳐 천천히 섞어서 교체하시고, 이 기간 동안 단 하나의 간식도 주지 않는 것이 핵심입니다.",
      scientificReferences: [
        "AAFCO Dog Food Nutrient Profiles for Maintenance (2024)",
        "Journal of Veterinary Internal Medicine: Food Allergy in Dogs",
        "NRC Nutrient Requirements of Dogs and Cats"
      ]
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
                <span>ULTRA-PREMIUM REPORT</span>
            </div>
        </div>

        <div className="bg-primary text-white p-6 rounded-3xl shadow-xl shadow-primary/20 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
            <span className="text-4xl">🐕</span>
          </div>
          <div>
            <h2 className="text-2xl font-black">나무를 위한 초정밀 분석 예시</h2>
            <p className="text-primary-foreground/80 font-medium">실제 데이터(말티푸, 12.6kg, 발핥음)를 기반으로 생성된 결과화면입니다.</p>
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
