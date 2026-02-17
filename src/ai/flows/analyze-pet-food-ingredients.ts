'use server';

/**
 * @fileOverview [Pettner Core Engine v6.0 - Precision Nutrition & Audit System]
 * - Context Separation: Mode A (Product Only) vs Mode B (Pet + Product)
 * - Deep Searching AI: Ingredient Tiering, GI Index, and Brand ESG Audit.
 * - Personalized Matching: Genetic risk mapping and BCS-aware ideal weight calculation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionalMetricSchema = z.object({
  value: z.number().describe('분석된 건물(DM) 기준 값 (%)'),
  minStd: z.number().describe('AAFCO/NRC 권장 최소 DM (%)'),
  maxStd: z.number().describe('AAFCO/NRC 권장 최대 DM (%)'),
  status: z.enum(['low', 'optimal', 'high']),
  verdict: z.string().describe('상태 판정 문구')
});

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).describe('분석 모드 (단순 제품 분석 vs 우리 아이 맞춤 가이드)'),
  productName: z.string().optional().describe('제품명'),
  foodType: z.enum(['dry', 'wet', 'treat', 'supplement']).optional().describe('제품 유형'),
  photoDataUri: z.string().optional().describe("라벨 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어"),
  petProfile: z.object({
    name: z.string().optional(),
    breed: z.string().optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    neutered: z.boolean().optional(),
    bcs: z.string().optional(),
    healthConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string().describe('추출된 제품명'),
    brand: z.string().describe('추출된 브랜드'),
    category: z.string().describe('제품 카테고리'),
    qualityGrade: z.enum(['A', 'B', 'C']).describe('원료 기반 품질 등급'),
    oneLineVerdict: z.string().describe('제품 품질 한 줄 요약')
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100).describe('종합 적합성/품질 점수'),
    grade: z.string().describe('점수 기반 등급 (예: A+)'),
    headline: z.string().describe('핵심 진단 문구'),
    statusTags: z.array(z.string()).describe('상태 태그')
  }),
  calculatorData: z.object({
    unitName: z.string().describe('급여 단위 (사료=g, 영양제=알, 간식=개/g)'),
    defaultAmount: z.number().describe('기본 권장 급여량 (1회 기준)'),
    kcalPerUnit: z.number().describe('단위당 칼로리 (kcal)'),
    nutrientsPerUnit: z.object({
      protein: z.number().describe('단위당 단백질 (g)'),
      fat: z.number().describe('단위당 지방 (g)'),
      carbs: z.number().describe('단위당 탄수화물 (g)')
    })
  }).describe('실시간 영양 계산기용 데이터'),
  personalMatching: z.object({
    matches: z.array(z.object({
      feature: z.string(),
      reason: z.string()
    })),
    mismatches: z.array(z.object({
      feature: z.string(),
      reason: z.string()
    }))
  }).optional(),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number().describe('품종 표준 및 BCS 기반 이상적 목표 체중'),
    weightGap: z.number().describe('현재와 목표 사이의 차이 (kg)'),
    breedStandardRange: z.string().describe('해당 품종의 공식 성견 표준 체중 범위'),
    breedGeneticInsight: z.string().describe('품종별 유전적 취약점 및 건강 조언'),
    overweightPercentage: z.number().describe('표준 대비 초과 비율 (%)'),
    verdict: z.string().describe('체중 판정 결론')
  }).optional(),
  deepDive: z.object({
    ingredientAudit: z.object({
      tiers: z.array(z.object({
        level: z.enum(['Tier 1', 'Tier 2', 'Tier 3']),
        ingredients: z.array(z.string()),
        comment: z.string()
      })),
      giIndex: z.enum(['Low', 'Moderate', 'High']),
      giComment: z.string()
    }),
    nutritionalEngineering: z.object({
      metrics: z.object({
        protein: NutritionalMetricSchema,
        fat: NutritionalMetricSchema,
        carbs: NutritionalMetricSchema,
        fiber: NutritionalMetricSchema,
        ash: NutritionalMetricSchema
      }),
      ratios: z.object({
        caPRatio: z.string(),
        omega63Ratio: z.string(),
        balanceVerdict: z.string()
      })
    }),
    safetyToxicology: z.object({
      checks: z.array(z.object({
        label: z.string(),
        status: z.boolean(),
        comment: z.string()
      })),
      recallHistory: z.string().describe('브랜드 리콜 이력 상세')
    }),
    brandESG: z.object({
      facility: z.string().describe('제조 시설 인증 현황'),
      rdLevel: z.string().describe('R&D 투자 수준'),
      sustainability: z.string().describe('친환경 패키징/지속가능성'),
      animalWelfare: z.string().describe('동물 복지 기여도')
    })
  }),
  veterinaryAdvice: z.string().describe('최종 종합 수의학 코멘트')
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `당신은 엄격한 수의 영양학 전문의이자 제품 감사관입니다.

# [분석 모드 핵심 가이드]
1. 분석 모드({{{analysisMode}}})가 'general'인 경우:
   - 오직 제품 자체의 품질, 원재료 티어링, 기업의 ESG 및 신뢰도 분석에만 집중하십시오.
   - 반려동물 매칭 및 체중 진단 섹션은 비워두거나 생성하지 마십시오.
2. 분석 모드({{{analysisMode}}})가 'custom'인 경우:
   - 입력된 반려동물 프로필({{{petProfile}}})과 제품을 1:1로 매칭하십시오.
   - 품종 표준 체중을 지식 베이스에서 검색하여 BCS 기반 이상적 체중을 산출하십시오.

# [초정밀 AI 감사 (Deep Dive)]
- 원재료 등급제: 상위 10개 원료를 Tier 1(생육/슈퍼푸드), Tier 2(농축분), Tier 3(부산물/필러)로 엄격히 분류하십시오.
- GI 지수: 원료의 혈당 부하를 평가하여 비만 위험도를 진단하십시오.
- 기업 ESG: 해당 브랜드의 리콜 이력, HACCP 인증, 친환경 패키징, 동물 실험 여부를 지식 베이스에서 검색하여 반영하십시오.

# [실시간 영양 계산기 데이터]
- 제품 유형({{{foodType}}})에 따라 최적의 단위(g, 알, 개)를 설정하십시오.
- 1회 급여량 당 칼로리와 영양소 무게를 정밀하게 계산하십시오.

입력 데이터:
- 모드: {{{analysisMode}}}
- 반려동물: 품종:{{{petProfile.breed}}}, 체중:{{{petProfile.weight}}}kg, BCS:{{{petProfile.bcs}}}
- 제품: {{{productName}}} ({{{foodType}}})`
});

const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzePetFoodIngredientsPrompt(input);
    if (!output) throw new Error('AI 분석 실패');
    return {
      ...output,
      status: 'success'
    };
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}
