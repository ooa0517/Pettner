
'use client';

import AnalysisResult from '@/components/analysis-result';
import type { AnalyzeMasterOutput } from '@/ai/flows/analyze-master';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

/**
 * Pettner V29.1 Unified Master Sample Report
 * - Showcase: ANF Holistic Master Diagnosis
 * - Highlights: NFE Formula, Biometric Forecast, Risk Radar
 */
export default function SampleReportPage() {
  const { language } = useLanguage();

  const mockResult: AnalyzeMasterOutput = {
    language: 'ko',
    report_type: 'PETTNER_1_ON_1_MASTER',
    result_data: {
      "1_matching_insight": {
        "match_score": 88,
        "clinical_comment": "AAFCO 기준을 완벽히 충족하는 영양 밸런스이나, 탄수화물(NFE) 비중이 40%를 상회하여 체중 관리가 필요한 반려견에게는 급여량 조절이 필수적인 '준고수준' 식단입니다."
      },
      "2_strict_prescription": {
        "target_weight": 5.0,
        "daily_amount_g": 115,
        "amount_per_meal_cup": "종이컵 약 0.7컵 (1일 2회 급여 기준)",
        "water_intake_guide": "약 350ml (사료 수분량 제외 필수 음수량)"
      },
      "3_risk_and_synergy": {
        "allergy_disease_red_flag": "주원료인 닭고기분에 대한 알러지 반응 유무를 확인하십시오. 신장 질환 초기인 아이에게는 단백질 수치가 다소 높을 수 있습니다.",
        "supplement_collision": "이미 함유된 오메가-3 함량이 충분하므로, 추가 영양제 급여 시 지용성 비타민 과잉 섭취를 주의하십시오."
      },
      "4_fact_check_and_nutrition": {
        "real_meat_vs_carb": "단백질 28% : 잉여 탄수화물 42% (NFE 역산 결과, 곡물 에너지원이 단백질보다 높게 측정되었습니다.)",
        "nutrition_radar": {
          "aafco_fediaf_met": true,
          "comment": "글로벌 5대 영양 표준을 모두 충족하며, 칼슘과 인의 비율이 1.2:1로 매우 이상적입니다."
        }
      },
      "5_physical_and_prediction": {
        "kibble_and_eating_habit": "지름 10mm의 표준 크기로 '오독오독' 씹어먹는 아이에게 치석 제거 효과를 극대화할 수 있는 물리적 구조입니다.",
        "satiety_index": "중간 (약 4~5시간 지속). 식이섬유 비중이 적절하여 급격한 허기를 유발하지 않습니다.",
        "stool_and_odor": "비트펄프 함유로 인해 매우 단단하고 형태가 잘 잡힌 '맛동산' 변을 볼 확률이 90% 이상입니다."
      },
      "6_ingredient_audit": [
        { "name": "닭고기분 (Chicken Meal)", "grade": "green", "reason": "수분이 제거된 농축 단백질원으로 효율적인 에너지 공급이 가능합니다." },
        { "name": "현미 (Brown Rice)", "grade": "yellow", "reason": "훌륭한 식이섬유원이지만 GI 지수가 낮지 않아 비만견은 주의가 필요합니다." },
        { "name": "비트 펄프", "grade": "yellow", "reason": "변의 형태를 인위적으로 단단하게 할 수 있어 실제 장 건강을 오판하게 할 우려가 있습니다." },
        { "name": "가수분해 연어", "grade": "green", "reason": "알러지 반응을 최소화한 고품질 단백질 공급원입니다." }
      ],
      "7_economics_and_plan_b": {
        "days_to_consume": 45,
        "cost_per_day": 1250,
        "manufacturer_trust": "최근 5년간 북미 및 국내 리콜 이력 없음 (Clean Mark 등급 유지)",
        "plan_b_recommendation": "만약 변이 너무 딱딱해진다면 식이섬유가 더 보강된 '인섹트 독' 라인이나 습식 토핑을 추천합니다."
      }
    }
  };

  const mockInput = {
    petProfile: { name: '나무', breed: '말티즈' },
    productName: 'ANF 홀리스틱 닭고기와 쌀',
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
                <span>VETERINARY MASTER SAMPLE</span>
            </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-blue-600 text-white p-10 rounded-[3rem] shadow-2xl shadow-primary/20 flex flex-col md:flex-row items-center gap-8 border-4 border-white/20">
          <div className="p-6 bg-white/20 rounded-[2rem] backdrop-blur-xl border border-white/30 shadow-inner">
            <span className="text-5xl">🕵️‍♂️</span>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl font-black tracking-tight leading-tight">통합 1:1 맞춤 진단서 (예시)</h2>
            <p className="text-primary-foreground/90 font-medium text-lg leading-relaxed">
              아이의 프로필과 제품 성분을 실시간 대조하여<br/>수의사가 옆에서 말해주는 듯한 정밀 처방을 제공합니다.
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
