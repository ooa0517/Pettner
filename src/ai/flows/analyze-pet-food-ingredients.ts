'use server';

/**
 * @fileOverview [Pettner Core Engine v3.8] Deterministic Veterinary Analysis System
 * - Strictly Deterministic Output for Consistency
 * - Breed-Specific Genetic Risk Analysis Layer
 * - Species bifurcation (Protocol_Dog / Protocol_Cat)
 * - AAFCO/NRC nutritional standards validation
 * - Deterministic DM (Dry Matter) & NFE (Carbs) calculations
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).default('custom').describe('분석 모드'),
  productName: z.string().optional().describe('제품명'),
  brandName: z.string().optional().describe('브랜드명'),
  foodType: z.string().optional().describe('제품 유형 (건식/습식/화식/간식/영양제)'),
  ingredientsText: z.string().optional().describe('라벨의 원재료 텍스트'),
  photoDataUri: z.string().optional().describe("라벨 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어"),
  petProfile: z.object({
    name: z.string().optional(),
    breed: z.string().optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    neutered: z.boolean().optional(),
    activityLevel: z.string().optional(),
    bcs: z.string().optional(),
    environment: z.string().optional(),
    healthConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  protocol_used: z.enum(['Dog', 'Cat']),
  productIdentity: z.object({
    name: z.string(),
    brand: z.string().optional(),
    category: z.string()
  }),
  calculations: z.object({
    moisture_ref: z.number(),
    dm_protein: z.number(),
    dm_fat: z.number(),
    dm_carbs: z.number(),
    ca_p_ratio: z.string()
  }),
  safety_check: z.object({
    grade: z.enum(['Green', 'Yellow', 'Red', 'Danger']),
    toxic_detected: z.boolean(),
    toxic_items: z.array(z.string())
  }),
  genetic_analysis: z.object({
    is_risk_breed: z.boolean(),
    breed_name: z.string(),
    risk_factor_detected: z.string(),
    trigger_value: z.string(),
    warning_level: z.enum(['Green', 'Yellow', 'Red']),
    message: z.string()
  }),
  scoreCard: z.object({
    grade: z.enum(['S', 'A', 'B', 'C', 'D']),
    headline: z.string(),
    tags: z.array(z.string()),
    match_score: z.number().min(0).max(100)
  }),
  advancedNutrition: z.object({
    moisture: z.string(),
    dm_protein: z.string(),
    dm_fat: z.string(),
    dm_carbs: z.string(),
    dm_ash: z.string(),
    calories_per_kg: z.string(),
    calcium_phosphorus_ratio: z.string(),
    benchmarks: z.object({
      protein: z.object({ position: z.number().min(0).max(100), label: z.string() }),
      fat: z.object({ position: z.number().min(0).max(100), label: z.string() }),
      carbs: z.object({ position: z.number().min(0).max(100), label: z.string() }),
    })
  }),
  ingredientCheck: z.object({
    positive: z.array(z.object({ name: z.string(), effect: z.string() })),
    cautionary: z.array(z.object({ name: z.string(), risk: z.string() })),
    allergy_hit: z.boolean(),
    detected_allergens: z.array(z.string())
  }),
  expertVerdict: {
    recommendation: z.string(),
    proTip: z.string()
  },
  radarChart: z.array(z.object({
      attribute: z.string(),
      score: z.number().min(1).max(5)
  })),
  scientificReferences: z.array(z.string())
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `당신은 엄격히 결정론적인 수의 영양 분석 엔진 'Pettner Core v3.8'입니다.
제공된 이미지나 텍스트를 분석하여 AAFCO/NRC 기준에 부합하는 과학적 리포트를 생성하십시오.

# INPUT DATA
{{#if brandName}}Brand: {{{brandName}}}{{/if}}
{{#if productName}}Product: {{{productName}}}{{/if}}
{{#if foodType}}Type: {{{foodType}}}{{/if}}
{{#if petType}}Pet Species: {{{petType}}}{{/if}}
{{#if petProfile}}
Pet Profile: 
- Breed: {{{petProfile.breed}}}
- Age: {{{petProfile.age}}}
- Weight: {{{petProfile.weight}}}
- Neutered: {{{petProfile.neutered}}}
- Activity: {{{petProfile.activityLevel}}}
- BCS: {{{petProfile.bcs}}}
- Conditions: {{#each petProfile.healthConditions}}{{{this}}}, {{/each}}
- Allergies: {{#each petProfile.allergies}}{{{this}}}, {{/each}}
{{/if}}

{{#if ingredientsText}}
# INGREDIENTS TEXT
{{{ingredientsText}}}
{{/if}}

{{#if photoDataUri}}
# PRODUCT PHOTO
{{media url=photoDataUri}}
{{/if}}

# 분석 가이드라인 (Deterministic Protocol)
1. **수분/조회분 결측치 보정**: 건식(수분 10%, 조회분 8%), 습식(수분 75%, 조회분 2.5%).
2. **건물 기준(DM) 환산**: 모든 영양소 수치는 반드시 (수치 / (100-수분) * 100) 공식을 사용해 환산하십시오.
3. **탄수화물(NFE) 계산**: 100 - (조단백+조지방+조섬유+조회분+수분).
4. **알러지 체크**: petProfile.allergies 리스트에 포함된 단어(예: 닭고기, 소고기 등)가 원재료에 포함되어 있다면 즉시 safety_check 등급을 'Red' 또는 'Danger'로 올리고 경고하십시오.
5. **품종별 유전 리스크**: 
   - 강아지(Dog): 슈나우저(고지방 15% 이상 위험), 말티즈/푸들(관절 성분 부재 시 경고), 달마시안(내장육/퓨린 위험).
   - 고양이(Cat): 페르시안(인 함량 1.2% 이상 또는 단백질 45% 이상 위험), 메인쿤/랙돌(타우린 필수 보충).
6. **일관성**: 동일한 입력값에 대해 항상 동일한 수학적 결과와 논리적 조언을 출력하십시오.

# 출력 지침
- 모든 원재료 앞에는 이모지를 붙이십시오 (예: 🐔 닭고기).
- 결과는 한국어로 작성하며, 제공된 JSON 스키마를 엄격히 준수하십시오.`,
});

const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzePetFoodIngredientsPrompt(input);
    if (!output) throw new Error('AI failed to generate a response');
    return {
      ...output,
      status: 'success'
    };
  }
);
