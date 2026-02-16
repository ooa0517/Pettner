'use server';

/**
 * @fileOverview [Pettner Core Engine v20.0 - Veterinary Precision]
 * - Strict V-Curve Feeding Logic: Weight loss phase (1.0x RER) vs Maintenance phase (1.4-1.6x RER)
 * - 5-Point Roadmap: Forces exactly 5 data points for the diet plan.
 * - Breed Standard DB: Accurate lookup for breed weights (e.g., Maltipoo: 3-8kg).
 * - Ideal Weight Calculation: Uses standard Vet formula based on BCS.
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
    idealWeight: z.number().describe('BCS 기반 계산된 이상적 체중'),
    weightGap: z.number().describe('현재와 목표 사이의 차이 (kg)'),
    breedStandardRange: z.string().describe('품종 표준 체중 범위'),
    breedGeneticInsight: z.string().describe('품종별 유전적 취약점 및 건강 조언'),
    overweightPercentage: z.number().describe('표준 범위 상단 대비 초과 비율 (%)'),
    verdict: z.string().describe('체중 판정 결론')
  }).optional(),
  dietRoadmap: z.array(z.object({
    weight: z.number().describe('단계별 몸무게 (kg)'),
    grams: z.number().describe('해당 단계에서의 하루 권장 급여량 (g)'),
    phase: z.string().describe('단계 이름 (예: 감량 시작, 유지기 진입 등)')
  })).min(5).max(5).optional().describe('반드시 5개의 포인트로 구성된 로드맵'),
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
  prompt: `당신은 세계적인 수의 영양학 전문의입니다. [Pettner V20.0 초정밀 엔진]을 사용하여 리포트를 생성하십시오.

# [V20.0 체중 연산 및 급여 로직]
1. Ideal Weight 산출:
   - Ideal_Weight = Current_Weight * (100 - (BCS - 3) * 10) / 100
   - 품종별 표준 체중(예: 말티푸 3-8kg)을 검색하여 이 수치와 비교하십시오.
2. 5-Point Diet Roadmap 생성 (가장 중요):
   - 현재 체중에서 목표 체중까지 5개의 균등한 몸무게 포인트를 생성하십시오.
   - 급여량(g) 계산 시 '감량기(Phase 1)'에는 칼로리를 제한(RER * 1.0)하여 급여량을 산출합니다.
   - '유지기(Phase 5)' 즉, 목표 체중에 도달했을 때는 요요 방지를 위해 급여량을 늘립니다(RER * 1.4~1.6).
   - 결과적으로 그래프는 초기에 낮았다가 목표 달성 시 다시 높아지는 'V-Curve' 형태를 띠어야 합니다.
3. 품종 유전적 인사이트:
   - petProfile의 품종을 분석하여 유전적으로 취약한 질병(슬개골 탈구, 심장병 등)을 언급하고 현재 비만 상태와의 위험 연계성을 설명하십시오.
4. 원재료 감사:
   - 상위 10개 원료를 Tier 1~3으로 엄격히 분류하십시오.
   - 비만견에게 타피오카, 감자 등 고혈당 원료가 포함되었는지(High GI) 판정하십시오.

입력 데이터:
- 사진: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}없음{{/if}}
- 제품: {{{productName}}} ({{{foodType}}})
- 반려동물: 이름:{{{petProfile.name}}}, 품종:{{{petProfile.breed}}}, 나이:{{{petProfile.age}}}, 체중:{{{petProfile.weight}}}kg, BCS:{{{petProfile.bcs}}}, 건강고민:{{{petProfile.healthConditions}}}`
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
