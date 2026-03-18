
'use client';

import AnalysisResult from '@/components/analysis-result';
import type { AnalyzeProductOnlyOutput } from '@/ai/flows/analyze-product-only';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

/**
 * Pettner V28.3 Forensic Sample Report
 * - Showcase: ANF Holistic (Type A Audit)
 * - Highlights: NFE Formula, Biometric Forecast, Risk Radar
 */
export default function SampleReportPage() {
  const { language } = useLanguage();

  const mockResult: AnalyzeProductOnlyOutput = {
    status: 'success',
    productIdentity: {
      name: "ANF 홀리스틱 닭고기와 쌀 (성견용)",
      brand: "ANF",
      category: "건식 사료 (Extruded)",
    },
    summary: {
      headline: "AAFCO 기준을 충족하는 안정적인 밸런스 식단이나, 실제 탄수화물 비중이 40%를 상회하여 체중 관리가 필요한 반려견에게는 급여량 조절이 필수적입니다.",
      expertOpinion: "고단백 마케팅을 표방하고 있으나, 주원료 중 쌀과 귀리의 비중이 상당히 높습니다. 이는 소화 흡수율 면에서는 유리할 수 있으나, 혈당 지수(GI) 관리가 필요한 노령견이나 비만견에게는 잠재적 리스크가 될 수 있습니다."
    },
    meatCarbRatio: {
      proteinPct: 28,
      carbPct: 42,
      commentary: "이 제품은 '고단백'을 강조하지만, 수학적 역산 결과 실제로는 곡물(탄수화물) 비중이 40%가 넘는 '탄수화물 중심' 사료입니다. 에너지의 절반 가까이가 당질에서 발생하므로 활동량이 적은 아이들에겐 주의가 필요합니다."
    },
    nutritionalAnalysis: {
      radarData: [
        { nutrient: "Protein", value: 28, standardAAFCO: 18, standardFEDIAF: 21 },
        { nutrient: "Fat", value: 15, standardAAFCO: 5.5, standardFEDIAF: 8.5 },
        { nutrient: "Fiber", value: 4, standardAAFCO: 2, standardFEDIAF: 2 },
        { nutrient: "Moisture", value: 10, standardAAFCO: 10, standardFEDIAF: 10 },
        { nutrient: "Ash", value: 8, standardAAFCO: 7, standardFEDIAF: 7 },
        { nutrient: "Carbs", value: 42, standardAAFCO: 30, standardFEDIAF: 35 }
      ],
      nutritionalDensityScore: 72,
    },
    wasteAndOdorForecast: {
      stoolCondition: "쌀과 귀리 기반의 풍부한 식이섬유 덕분에 형태가 매우 단단하고 안정적인 변 상태를 보일 확률이 90% 이상입니다.",
      odorLevel: "가수분해되지 않은 닭고기 단백질원을 사용하므로, 평소 닭고기 알러지가 있는 아이라면 변 냄새가 다소 강해지거나 눈물 자국이 늘어날 수 있습니다.",
      reasoning: "곡물 탄수화물과 가금류 지방의 조합은 장내 발효를 촉진하여 전형적인 건식 사료의 배변 특성을 나타냅니다."
    },
    ingredientAnalysis: [
      { name: "닭고기분 (Chicken Meal)", category: "positive", reason: "응축된 고품질 단백질 공급원이지만, 특정 개체에 따라 알러지 반응이 있을 수 있습니다.", allergyStat: "국내 반려견 알러지 발현율 1위 (약 32%)" },
      { name: "쌀 (Brewers Rice)", category: "neutral", reason: "소화가 매우 잘 되는 탄수화물원이지만, 혈당을 빠르게 올릴 수 있는 고혈당 원료입니다.", allergyStat: "알러지 위험 낮음 (약 4%)" },
      { name: "닭고기 지방", category: "positive", reason: "피부와 모질에 필수적인 오메가-6 지방산의 핵심 공급원입니다.", allergyStat: "안전" },
      { name: "비트 펄프", category: "cautionary", reason: "변의 형태를 인위적으로 단단하게 만드는 기능이 있어, 실제 장 건강을 오판하게 할 우려가 있습니다.", allergyStat: "주의 성분" }
    ],
    satietyIndex: {
      level: "NORMAL",
      durationLabel: "약 4~6시간 지속",
      analysis: "부피 대비 에너지가 적절히 배분된 표준형 제품입니다. 급여 후 아이가 금방 배고파한다면 야채 토핑을 추가하여 부피감을 늘려주는 것이 좋습니다."
    },
    marketAndRisk: {
      priceEfficiency: "1kg당 약 11,500원 (글로벌 프리미엄 브랜드 중 상위 30% 수준의 합리적 가격)",
      manufacturerTrust: "ANF (미국) 전용 시설 생산. 위생 관리 및 원료 투명성 매우 높음.",
      globalRiskRadar: "최근 5년간 중대한 안전 관련 리콜 이력이 확인되지 않은 'Clean Mark' 등급 제조사입니다. 2024년 기준 북미 시장에서도 안정적인 신뢰도를 유지 중입니다.",
      cleanMark: true,
    }
  };

  const mockInput = {
    analysisMode: 'general',
    productName: 'ANF 홀리스틱 닭고기와 쌀',
    productCategory: 'food',
    language: language
  };

  return (
    <div className="flex-grow p-4 md:p-8 bg-muted/20">
      <div className="max-w-4xl mx-auto space-y-8 pb-32">
        <div className="flex items-center justify-between">
            <Button asChild variant="ghost" className="hover:bg-primary/5 rounded-full font-bold">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> 대시보드로 돌아가기
                </Link>
            </Button>
            <div className="flex items-center gap-2 text-primary font-black text-xs tracking-widest bg-white px-4 py-2 rounded-full shadow-sm border">
                <ShieldCheck className="w-4 h-4" />
                <span>VETERINARY FORENSIC SAMPLE</span>
            </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-blue-600 text-white p-10 rounded-[3rem] shadow-2xl shadow-primary/20 flex flex-col md:flex-row items-center gap-8 border-4 border-white/20">
          <div className="p-6 bg-white/20 rounded-[2rem] backdrop-blur-xl border border-white/30 shadow-inner">
            <span className="text-5xl">🕵️‍♂️</span>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl font-black tracking-tight leading-tight">수의학적 "수사 리포트" (예시)</h2>
            <p className="text-primary-foreground/90 font-medium text-lg leading-relaxed">
              사료 회사가 표기하지 않는 잉여 탄수화물과<br/>신체 변화 예측 데이터까지 한눈에 확인하세요.
            </p>
          </div>
        </div>

        <AnalysisResult 
          result={mockResult} 
          input={mockInput} 
          onReset={() => window.location.href = '/'} 
          isPublicView={true}
        />
      </div>
    </div>
  );
}
