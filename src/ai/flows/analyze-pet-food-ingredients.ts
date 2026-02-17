'use server';

/**
 * @fileOverview [Pettner Core Engine v22.0 - Precision Nutrition Calculator]
 * - AI Knowledge Augmentation: Breed-specific weight range & Product calorie density.
 * - Interactive Feeding Calculator: Dynamic scaling based on user-defined quantity.
 * - Hierarchical Deep Dive: Ingredient tiering, GI index, Safety filters, and Brand ESG.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionalMetricSchema = z.object({
  value: z.number().describe('분석된 건물(DM) 기준 값 (%)'),
  minStd: z.number().describe('권장 최소 DM (%)'),
  maxStd: z.number().describe('권장 최대 DM (%)'),
  status: z.enum(['low', 'optimal', 'high']),
  verdict: z.string().describe('상태 판정 문구')
});

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).default('custom').describe('분석 모드 (맞춤진단 vs 단순심사)'),
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
    unitName: z.string().describe('급여 단위 (예: g, 알, 개, 컵)'),
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
    idealWeight: z.number().describe('BCS 및 품종 표준 기반 계산된 최종 목표 체중'),
    weightGap: z.number().describe('현재와 목표 사이의 차이 (kg)'),
    breedStandardRange: z.string().describe('품종별 실제 표준 체중 범위'),
    breedGeneticInsight: z.string().describe('품종별 유전적 취약점 조언'),
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
      riskAlert: z.string().optional(),
      recallHistory: z.string()
    }),
    brandESG: z.object({
      facility: z.string(),
      rdLevel: z.string(),
      sustainability: z.string(),
      animalWelfare: z.string()
    })
  }),
  veterinaryAdvice: z.string().describe('수의학적 최종 종합 코멘트')
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `당신은 세계적인 수의 영양학 전문의이자 엄격한 사료 감사관입니다. [Pettner V22.0 초정밀 엔진]을 사용하여 초개인화 리포트를 생성하십시오.

# [핵심 지침: 실시간 계산기 데이터 산출]
1. 제품의 등록성분량(As-fed)과 칼로리 밀도를 분석하여 calculatorData를 정확히 채우십시오.
2. 단위(unitName)는 제품 유형({{{foodType}}})에 따라 가장 적절한 것(사료=g, 영양제=알, 간식=개/g)을 선택하십시오.
3. 1단위당 실제 단백질/지방/탄수화물의 무게(g)를 계산하십시오. 사진에 정보가 부족하면 해당 제품의 표준 영양 밀도를 지식 베이스에서 검색하십시오.

# [품종 표준 및 체중 진단]
1. 입력된 품종({{{petProfile.breed}}})의 성견 표준 체중 범위를 지식 베이스에서 검색하여 weightDiagnosis.breedStandardRange에 명시하십시오.
2. 이상 체중 산출 공식: Ideal_Weight = Current_Weight * (100 - (BCS - 3) * 10) / 100
3. 품종별 유전적 취약점과 현재 상태를 연계하여 breedGeneticInsight를 작성하십시오.

# [사진에 없는 정보까지 분석]
1. 식별된 제품명({{{productName}}})을 바탕으로 제조 시설, 리콜 이력, 브랜드의 R&D 수준을 당신의 지식 베이스에서 검색하여 포함하십시오. "정보 없음" 대신 최신 데이터를 바탕으로 분석하십시오.
2. deepDive 객체의 모든 필드를 누락 없이 작성하십시오. 특히 ingredientAudit의 tiers는 상위 원료를 등급별로 분류해야 합니다.

입력 데이터:
- 반려동물: 품종:{{{petProfile.breed}}}, 현재체중:{{{petProfile.weight}}}kg, BCS:{{{petProfile.bcs}}}, 건강고민:{{{petProfile.healthConditions}}}
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
