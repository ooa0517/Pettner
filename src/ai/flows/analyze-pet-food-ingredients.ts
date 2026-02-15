'use server';

/**
 * @fileOverview [Pettner Core Engine v3.6] Deterministic Veterinary Analysis System
 * - Breed-Specific Genetic Risk Analysis Layer added
 * - Species bifurcation (Protocol_Dog / Protocol_Cat)
 * - AAFCO/NRC nutritional standards validation
 * - Deterministic DM (Dry Matter) & NFE (Carbs) calculations
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
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
    healthConditions: z.array(z.string()).optional(),
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
  expertVerdict: z.object({
    recommendation: z.string(),
    proTip: z.string()
  }),
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
  prompt: `당신은 엄격히 결정론적인 수의 영양 분석 엔진 'Pettner Core v3.6'입니다.
제공된 이미지나 텍스트를 분석하여 AAFCO/NRC 기준에 부합하는 과학적 리포트를 생성하십시오.

# INPUT DATA
{{#if brandName}}Brand: {{{brandName}}}{{/if}}
{{#if productName}}Product: {{{productName}}}{{/if}}
{{#if foodType}}Type: {{{foodType}}}{{/if}}
{{#if petType}}Pet Species: {{{petType}}}{{/if}}
{{#if petProfile}}Pet Profile: {{{petProfile}}}{{/if}}

{{#if ingredientsText}}
# INGREDIENTS TEXT
{{{ingredientsText}}}
{{/if}}

{{#if photoDataUri}}
# PRODUCT PHOTO
{{media url=photoDataUri}}
{{/if}}

# PART 1. 품종별 유전 리스크 분석 (Genetic Analysis)
제공된 반려동물 프로필의 'Breed' 정보를 기반으로 유전적 취약점을 사료 성분과 대조하십시오.

## 🐶 강아지 프로토콜 (Dog Breed Risks)
1. **고지혈증/췌장염 그룹 (슈나우저, 셔틀랜드 쉽독 등)**: DM 지방 > 15% 시 "고지방 리스크" 경고.
2. **관절 질환 그룹 (말티즈, 푸들, 포메라니안, 리트리버 등)**: 원재료에 관절 보조 성분(글루코사민, 콘드로이친, 초록입홍합, MSM) 부재 시 "관절 케어 필요" 고지.
3. **요산 결석 그룹 (달마시안, 불독 등)**: 원재료에 내장육, 간, 정어리, 효모 포함 시 "고퓨린 리스크" 위험 경고.

## 🐱 고양이 프로토콜 (Cat Breed Risks)
1. **신장 질환 그룹 (페르시안, 엑조틱 등)**: DM 인(P) > 1.2% 또는 DM 단백질 > 45% 시 "신장 부담 리스크" 경고.
2. **심장 질환 그룹 (메인쿤, 랙돌 등)**: 원재료에 '타우린' 직접 추가 표기 부재 시 "심장 보조 필요" 경고.

# PART 2. 종별 분리 및 계산 로직
- 강아지(Dog)와 고양이(Cat) 영양 기준 엄격 분리.
- 결측치 보정: 조회분(건식 8%, 습식 2.5%), 수분(건식 10%, 습식 75%).
- NFE(탄수화물): 100 - (조단백+조지방+조섬유+조회분+수분).
- DM(건물기준): 영양소 / (100-수분) * 100.

# PART 3. 출력 지침
- 모든 원재료 이름 앞에는 적절한 이모지를 붙이십시오 (예: 🐔 닭고기).
- 'genetic_analysis' 섹션에 품종별 분석 결과를 상세히 포함하십시오.
- 결과는 한국어로 작성하며, JSON 스키마를 엄격히 준수하십시오.`,
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