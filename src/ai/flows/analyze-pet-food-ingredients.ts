'use server';

/**
 * @fileOverview [Pettner Core Engine v21.0 - Breed Standard Precision]
 * - AI Knowledge Augmentation: Breed-specific weight range lookup.
 * - Strict Ideal Weight Calculation: Based on breed standard + BCS formula.
 * - Removed Diet Roadmap for clarity.
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
    weightChange: z.string().optional(),
    neutered: z.boolean().optional(),
    bcs: z.string().optional(),
    lifestyle: z.string().optional(),
    behaviorPattern: z.string().optional(),
    healthConditions: z.array(z.string()).optional(),
    customHealthNote: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    stoolCondition: z.string().optional(),
    medications: z.string().optional(),
    waterIntake: z.string().optional(),
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
    statusTags: z.array(z.string()).describe('상태 태그 (예: 🔴 비만경고, ✅ 글루텐프리)')
  }),
  personalMatching: z.object({
    matches: z.array(z.object({
      feature: z.string().describe('맞춤 항목'),
      reason: z.string().describe('맞춤 이유')
    })),
    mismatches: z.array(z.object({
      feature: z.string().describe('부적합 항목'),
      reason: z.string().describe('부적합 이유')
    }))
  }).optional(),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number().describe('BCS 및 품종 표준 기반 계산된 최종 목표 체중'),
    weightGap: z.number().describe('현재와 목표 사이의 차이 (kg)'),
    breedStandardRange: z.string().describe('품종별 실제 표준 체중 범위 (예: 3~8kg)'),
    breedGeneticInsight: z.string().describe('품종별 유전적 취약점 및 건강 조언'),
    overweightPercentage: z.number().describe('표준 범위 상단 대비 초과 비율 (%)'),
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
  prompt: `당신은 세계적인 수의 영양학 전문의입니다. [Pettner V21.0 품종 표준 엔진]을 사용하여 리포트를 생성하십시오.

# [V21.0 핵심 지침: 품종 표준 및 체중 진단]
1. 품종 표준 검색:
   - 입력된 품종({{{petProfile.breed}}})의 전 세계적인 성견 표준 몸무게 범위를 당신의 지식 베이스에서 검색하십시오. 
   - 이 범위를 weightDiagnosis.breedStandardRange에 명시하십시오.
2. 이상 체중(Ideal Weight) 산출:
   - 다음 공식을 우선 적용하십시오: Ideal_Weight = Current_Weight * (100 - (BCS - 3) * 10) / 100
   - 산출된 이상 체중이 해당 품종의 표준 범위와 크게 어긋나는 경우, 수의학적 판단에 따라 최적의 목표 체중을 결정하십시오.
3. 비만율 계산:
   - 품종 표준 범위의 상단값을 기준으로 현재 체중이 얼마나 초과되었는지 계산하십시오.
4. 품종 유전적 인사이트:
   - 해당 품종의 유전적 취약 질병(예: 말티푸의 슬개골, 리트리버의 고관절 등)을 언급하고, 현재 체중 상태와의 위험 연계성을 설명하십시오.

# [Deep Dive 섹션 구성]
- Ingredient Audit: 원료를 Tier 1(생육), Tier 2(농축), Tier 3(부산물)로 분류.
- Nutritional Engineering: 건물(DM) 기준 5대 영양소 분석 및 칼슘:인 비율 산출.
- Safety & Brand: 리콜 이력 및 제조사 신뢰도 감사.

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
