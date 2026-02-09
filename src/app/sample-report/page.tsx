
'use client';

import AnalysisResult from '@/components/analysis-result';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SampleReportPage() {
  // 사용자가 요청한 데이터 기반의 초고도화 가상 분석 결과
  const mockResult: AnalyzePetFoodIngredientsOutput = {
    status: 'success',
    productInfo: {
      name: "인스팅트 오리지널 그레인프리 치킨",
      brand: "인스팅트 (Instinct)",
      type: "건식 사료"
    },
    matchingScore: {
      score: 82,
      clinicalReason: "AAFCO 2024 영양 가이드라인 기준, 성견에게 필요한 필수 아미노산 프로필을 완벽히 충족합니다. 다만, '나무'가 보이는 '발핥음' 증상은 전형적인 식이 알러지 반응일 가능성이 높으며, 본 제품의 주 단백질원인 닭고기는 가장 흔한 알러지 유발원 중 하나입니다. 임상적으로 알러지 배제 식이(Elimination Diet)가 필요한 시점입니다.",
      geneticInsight: "말티푸(Maltipoo)는 유전적으로 슬개골 탈구와 누관(눈물 자국) 관리에 취약합니다. 나무의 현재 체중(12.6kg)은 말티푸 평균 대비 과체중 혹은 대형 개체에 해당하며, 이는 관절에 무리를 줄 수 있습니다. 본 사료의 높은 단백질은 근육 유지에 좋으나, 칼로리 밀도가 높아 정밀한 급여량 조절이 필수적입니다.",
      complexConditionAdvice: "발핥음(알러지)과 과체중(12.6kg)이 공존하는 복합 상태입니다. 알러지 반응을 줄이기 위해 2주간 급여 후 발핥음 횟수를 체크하십시오. 또한 높은 기호성으로 인해 과식할 위험이 있으므로, 매일 1시간의 산책량을 유지하되 사료 양은 RER(휴지기 에너지 요구량)의 0.9배로 제한할 것을 권장합니다."
    },
    summary: {
      headlines: [
        "고단백 육류 위주의 정통 그레인프리 사료",
        "알러지 유발 가능성이 있는 닭고기 베이스 주의",
        "관절 건강을 위한 콘드로이친/글루코사민 포함"
      ],
      hashtags: ["#고단백", "#그레인프리", "#생식코팅", "#말티푸맞춤관리", "#관절주의"]
    },
    ingredientsAnalysis: {
      positive: [
        { name: "생닭고기", effect: "제1원료로서 생체 이용률이 매우 높은 양질의 동물성 단백질 공급" },
        { name: "닭고기 밀", effect: "농축된 단백질원으로 필수 아미노산 밸런스 유지에 기여" },
        { name: "동결건조 닭고기", effect: "효소와 영양소 파괴를 최소화한 생식 코팅으로 기호성 및 소화율 증대" }
      ],
      cautionary: [
        { name: "닭고기 지방", effect: "에너지원은 좋으나 알러지가 있는 아이에겐 교차 반응 위험 존재" },
        { name: "타피오카 전형", effect: "곡물은 없으나 탄수화물 밀도가 높아 비만 관리에 주의 필요" }
      ],
      hiddenInsights: "본 제품은 'Grain-Free'를 강조하지만, 타피오카와 완두콩을 통해 탄수화물을 보충합니다. 이는 당지수(GI)를 높일 수 있어 나무처럼 체중 관리가 필요한 아이에게는 정량 급여가 무엇보다 중요합니다."
    },
    radarChart: [
      { attribute: "소화기 건강", score: 5 },
      { attribute: "피부/모질", score: 2 },
      { attribute: "체중 관리", score: 3 },
      { attribute: "관절 강화", score: 4 },
      { attribute: "활동 에너지", score: 5 }
    ],
    feedingGuide: {
      dailyCalories: "12.6kg 나무 기준: 약 680~720kcal (현재 산책량 반영)",
      recommendation: "일 2회 급여, 1회당 약 85g(종이컵 약 3/4컵)씩 급여하십시오. 발핥음이 심해질 경우 즉시 중단하고 수의사와 상담하십시오."
    },
    expertInsight: {
      proTip: "나무의 발핥음은 간식(특히 닭고기 베이스) 때문일 확률도 높습니다. 2주간 간식을 완전히 끊고 본 사료만 급여하며 반응을 살펴보는 '제한 식이'를 먼저 해보시길 권합니다.",
      scientificReferences: [
        "AAFCO Dog Food Nutrient Profiles for Maintenance (2024)",
        "Journal of Veterinary Internal Medicine: Adverse food reactions in dogs",
        "Maltipoo Breed Specific Health Concerns (Orthopedic Foundation for Animals)"
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
      <div className="max-w-4xl mx-auto space-y-4">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> 메인으로 돌아가기
          </Link>
        </Button>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8 text-yellow-700">
          <p className="font-bold">샘플 분석 리포트</p>
          <p className="text-sm">사용자님이 요청하신 '나무'의 데이터를 기반으로 한 초고도화 분석 예시입니다.</p>
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
