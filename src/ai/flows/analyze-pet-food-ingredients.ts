'use server';

/**
 * @fileOverview [Pettner Core Engine v6.0 - Precision Nutrition & Audit System]
 * - Context Separation: Mode A (Product Only) vs Mode B (Pet + Product)
 * - Deep Searching AI: Ingredient Tiering, GI Index, and Brand ESG Audit.
 * - Manufacturing Intel: OEM/ODM check, Sourcing origin, Target life-stage.
 * - Accuracy: 99% Product identification target.
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
    name: z.string().describe('식별된 정확한 제품명 (99% 정확도 목표)'),
    brand: z.string().describe('추출된 브랜드'),
    category: z.string().describe('제품 카테고리'),
    qualityGrade: z.enum(['A', 'B', 'C']).describe('원료 기반 품질 등급'),
    oneLineVerdict: z.string().describe('제품 품질 한 줄 요약'),
    targetAudience: z.object({
      lifeStage: z.string().describe('권장 생애주기 (예: 전연령, 퍼피, 시니어)'),
      recommendedBreeds: z.string().describe('최적화된 품종군'),
      focus: z.string().describe('제품의 핵심 설계 목적 (예: 장 건강, 체중 조절)')
    }),
    manufacturingDetails: z.object({
      productionType: z.enum(['In-house', 'OEM', 'ODM', 'Unknown']).describe('생산 방식'),
      facilityInfo: z.string().describe('제조 시설 및 국가 정보'),
      sourcingOrigin: z.string().describe('주요 원재료 수급지 정보')
    })
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100).describe('종합 적합성/품질 점수'),
    grade: z.string().describe('점수 기반 등급 (예: A+)'),
    headline: z.string().describe('핵심 진단 문구'),
    statusTags: z.array(z.string()).describe('상태 태그')
  }),
  calculatorData: z.object({
    unitName: z.string().describe('급여 단위 (g, 알, 개)'),
    defaultAmount: z.number().describe('기본 권장 급여량'),
    kcalPerUnit: z.number().describe('단위당 칼로리 (kcal)'),
    nutrientsPerUnit: z.object({
      protein: z.number().describe('단위당 단백질 (g)'),
      fat: z.number().describe('단위당 지방 (g)'),
      carbs: z.number().describe('단위당 탄수화물 (g)')
    })
  }),
  personalMatching: z.object({
    matches: z.array(z.object({ feature: z.string(), reason: z.string() })),
    mismatches: z.array(z.object({ feature: z.string(), reason: z.string() }))
  }).optional(),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number().describe('품종 표준 및 BCS 기반 이상적 목표 체중'),
    weightGap: z.number(),
    breedStandardRange: z.string().describe('해당 품종의 공식 성견 표준 체중 범위'),
    breedGeneticInsight: z.string().describe('품종별 유전적 취약점 조언'),
    overweightPercentage: z.number(),
    verdict: z.string()
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
      checks: z.array(z.object({ label: z.string(), status: z.boolean(), comment: z.string() })),
      recallHistory: z.string().describe('브랜드 리콜 이력 상세')
    }),
    brandESG: z.object({
      facility: z.string(),
      rdLevel: z.string(),
      sustainability: z.string(),
      animalWelfare: z.string()
    })
  }),
  veterinaryAdvice: z.string().describe('최종 종합 수의학 코멘트')
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `당신은 엄격한 수의 영양학 전문의이자 글로벌 제품 감사관입니다.

# [모드별 핵심 가이드]
1. 분석 모드({{{analysisMode}}})가 'general'인 경우:
   - 제품 자체에 대한 '현미경 분석'을 수행하십시오.
   - 제조사 정보(자사/OEM), 원재료 수급지, 타겟 품종 및 생애주기를 수의학적 관점에서 철저히 분석하십시오.
   - 반려동물 매칭 및 체중 진단 섹션은 비워두십시오.
2. 분석 모드({{{analysisMode}}})가 'custom'인 경우:
   - 위 제품 데이터와 반려동물 프로필({{{petProfile}}})을 1:1로 매칭하십시오.
   - 비만 시 이상 체중 목표를 설정하고 유전적 취약점과의 궁합을 진단하십시오.

# [99% 정확도 식별 및 심층 분석]
- 사진과 제품명을 바탕으로 당신의 방대한 지식 베이스를 검색하여 제품을 99% 정확하게 특정하십시오.
- 공식 성분표(DM 환산)를 기반으로 영양 밀도를 계산하십시오.
- 제조 공정(OEM 여부) 및 원재료 원산지(Sourcing) 정보를 추론하여 명시하십시오.
- 리콜 이력 및 브랜드의 ESG(윤리적 경영) 점수를 상세히 반영하십시오.

입력 데이터:
- 모드: {{{analysisMode}}}
- 반려동물: {{{petProfile.breed}}}, {{{petProfile.weight}}}kg
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
