'use server';

/**
 * @fileOverview [Pettner Core Engine v24.0 - Ultra Precision]
 * - Dual Analysis Core: Veterinary (Custom) vs Auditor (General)
 * - Strict 5-Point Weight Roadmap Logic
 * - Genetic Insight & Brand Recall Integration
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionalMetricSchema = z.object({
  value: z.number().describe('분석된 DM 값 (%)'),
  minStd: z.number().describe('권장 최소 DM (%)'),
  maxStd: z.number().describe('권장 최대 DM (%)'),
  status: z.enum(['low', 'optimal', 'high']),
  verdict: z.string().describe('상태 판정 문구')
});

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).default('custom').describe('분석 모드'),
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
    totalScore: z.number().min(0).max(100).describe('적합성/품질 점수'),
    grade: z.string().describe('점수 기반 등급'),
    headline: z.string().describe('핵심 진단 문구'),
    statusTags: z.array(z.string()).describe('상태 태그')
  }),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number(),
    weightGap: z.number(),
    breedStandardRange: z.string().describe('해당 품종의 표준 체중 범위'),
    breedGeneticInsight: z.string().describe('품종 유전적 취약점 및 비만 위험성 수의학 조언'),
    overweightPercentage: z.number().describe('표준 범위 상단 대비 초과 비율 (%)'),
    verdict: z.string().describe('비만 및 체중 상태 진단 총평')
  }).optional(),
  dietRoadmap: z.array(z.object({
    weight: z.number(),
    grams: z.number(),
    phase: z.string()
  })).min(5).max(5).optional().describe('5단계 체중 조절 로드맵'),
  advancedNutrition: z.object({
    protein: NutritionalMetricSchema,
    fat: NutritionalMetricSchema,
    carbs: NutritionalMetricSchema,
    fiber: NutritionalMetricSchema,
    ash: NutritionalMetricSchema,
    isHighCarb: z.boolean(),
    caloriesPerGram: z.number()
  }),
  ingredientAnatomy: z.object({
    firstFive: z.array(z.object({
      name: z.string(),
      tier: z.enum(['Tier 1', 'Tier 2', 'Tier 3']),
      tierLabel: z.string(),
      description: z.string()
    })),
    functionalBoosters: z.array(z.object({
      name: z.string(),
      benefit: z.string(),
      description: z.string()
    })),
    safetyFilter: z.object({
      noArtificialPreservatives: z.boolean(),
      noArtificialColors: z.boolean(),
      allergyWarning: z.string().optional(),
      hiddenAdditives: z.array(z.string())
    })
  }),
  brandInsight: z.object({
    reputation: z.string().describe('브랜드 평판'),
    recallHistory: z.string().describe('리콜 이력 요약 (최신 데이터 기반)'),
    esgScore: z.string().describe('환경 및 윤리성 점수/평가')
  }),
  veterinaryAdvice: z.string().describe('종합 심사 의견')
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `당신은 세계적인 수의 영양학 전문의이자 공인 펫푸드 감사관입니다. 
입력된 데이터를 바탕으로 초정밀 분석 리포트를 생성하십시오.

{{#if (eq analysisMode "custom")}}
# [MODE: 수의사 정밀 진단]
- 당신의 페르소나: 아이의 주치의
- 목표: 아이의 개별 건강 데이터({{{petProfile.name}}}, {{{petType}}}, {{{petProfile.breed}}})와 제품 성분의 매칭률 진단.

# 비만 진단 가이드라인
1. Ideal_Weight = Current_Weight * (100 - (BCS - 3) * 10) / 100
2. dietRoadmap (반드시 5개 지점):
   - 지점 1(현재): 감량 칼로리 (RER * 1.0) 기준 급여량(g)
   - 지점 5(목표): 유지 칼로리 (RER * 1.4) 기준 급여량(g)
   - 중간(2,3,4): 칼로리를 점진적으로 상향 조정. **목표에 가까워질수록 급여량은 늘어납니다.**
3. Breed Insight: {{{petProfile.breed}}}의 유전적 질환과 비만의 상관관계를 인터넷 서칭급 지식으로 설명하십시오.

{{else}}
# [MODE: 공인 감사관 제품 심사]
- 당신의 페르소나: 객관적 펫푸드 감사관
- 목표: 아이 정보 없이 제품 자체의 품질, 브랜드 신뢰도, 원료 등급만 심사.
- 조언: 급여 조언 대신 제품의 객관적 장단점과 리콜 이력을 중심으로 기술하십시오.
{{/if}}

# 원재료 심사 기준 (엄격)
- Tier 1: Fresh Meat / Whole Fish
- Tier 2: Named Meals (Chicken Meal 등)
- Tier 3: By-products / Unspecified Fats (Vegetable Oil 등)
- 비만견에게는 곡물(Corn, Wheat, Rice)을 High GI로 플래그하십시오.

사진 데이터: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}사진 없음{{/if}}`,
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
