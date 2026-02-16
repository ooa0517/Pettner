
'use server';

/**
 * @fileOverview [Pettner Core Engine v4.0] 
 * - Deterministic Veterinary Analysis System
 * - Advanced Feeding Guide & Breed Standard Logic
 * - Species-specific health mapping
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).default('custom').describe('분석 모드'),
  productName: z.string().optional().describe('보호자가 입력한 제품명'),
  brandName: z.string().optional().describe('브랜드명'),
  foodType: z.string().optional().describe('제품 유형 (건식/습식/화식/간식/영양제)'),
  ingredientsText: z.string().optional().describe('라벨의 원재료 텍스트'),
  photoDataUri: z.string().optional().describe("라벨 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어"),
  petProfile: z.object({
    name: z.string().optional(),
    breed: z.string().optional(),
    isMix: z.boolean().optional(),
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
  petSummary: z.object({
    description: z.string().describe('아이의 현재 상태 요약 (나이, 체중, 특징 등)'),
    idealWeightRange: z.string().describe('품종 및 나이 대비 표준 적합 체중 범위'),
    statusMessage: z.string().describe('현재 상태에 대한 수의학적 코멘트')
  }),
  productIdentity: z.object({
    name: z.string().describe('식별된 정확한 제품명'),
    brand: z.string().optional().describe('식별된 브랜드명'),
    category: z.string().describe('제품 카테고리')
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
  scoreCard: z.object({
    grade: z.enum(['S', 'A', 'B', 'C', 'D']),
    headline: z.string().describe('아이의 상태와 제품의 궁합을 한 줄로 요약'),
    match_score: z.number().min(0).max(100)
  }),
  advancedNutrition: z.object({
    moisture: z.string(),
    dm_protein: z.string(),
    dm_fat: z.string(),
    dm_carbs: z.string(),
    calories_per_kg: z.string(),
    calcium_phosphorus_ratio: z.string(),
    benchmarks: z.object({
      protein: z.object({ position: z.number(), label: z.string() }),
      fat: z.object({ position: z.number(), label: z.string() }),
      carbs: z.object({ position: z.number(), label: z.string() }),
    })
  }),
  feedingGuide: z.object({
    dailyKcal: z.string().describe('하루 필요 칼로리'),
    dailyAmount: z.string().describe('하루 권장 급여량 (g)'),
    perMealAmount: z.string().describe('1회 급여량 (g)'),
    visualGuide: z.string().describe('시각적 급여 가이드')
  }),
  ingredientCheck: z.object({
    positive: z.array(z.object({ name: z.string(), effect: z.string() })),
    cautionary: z.array(z.object({ name: z.string(), risk: z.string() })),
    allergy_hit: z.boolean(),
    detected_allergens: z.array(z.string())
  }),
  expertVerdict: z.object({
    whyMatch: z.string().describe('아이의 상태와 연관지은 상세 분석 소견'),
    proTip: z.string().describe('수의학적 조언')
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
  prompt: `당신은 반려동물의 건강을 책임지는 'Pettner AI 수의 영양 엔진'입니다.
사용자가 입력한 제품 정보를 최우선으로 하여, 사진에 나타난 정보와 결합해 '가장 정확한 제품'을 분석하십시오.

# 제품 식별 명령 (CRITICAL)
1. 사용자가 입력한 제품명: "{{{productName}}}"
2. 만약 사진({{media url=photoDataUri}})이 제공되었다면, 사진 속의 브랜드와 제품명을 정확히 추출하십시오.
3. 입력된 제품명과 사진 속 제품 정보가 일치하는지 확인하고, 일치하지 않더라도 사용자가 분석하고자 하는 '타겟 제품'을 임의로 변경하지 마십시오. 절대 다른 유명 브랜드로 착각하여 분석하지 마십시오.

# 분석 지침
1. **아이 상태 분석**: 나이({{{petProfile.age}}}), 체중({{{petProfile.weight}}}), 중성화({{{petProfile.neutered}}}), 품종({{{petProfile.breed}}})을 바탕으로 RER/DER을 먼저 계산하십시오.
2. **품종별 유전적 특성**: {{{petProfile.breed}}}의 특이성(예: 슬개골, 심장, 신장 등)을 고려하여 제품의 성분이 도움이 되는지 해가 되는지 판별하십시오.
3. **영양 농도(DM)**: 수분을 제외한 실제 영양 농도를 계산하여 AAFCO 기준과 대조하십시오.
4. **급여 가이드**: 계산된 DER과 사료의 칼로리를 바탕으로 정확한 하루 급여량(g)을 산출하십시오.

# 출력 언어: {{{language}}} (모든 텍스트는 이 언어로 출력하십시오)`,
});

const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzePetFoodIngredientsPrompt(input);
    if (!output) throw new Error('AI 분석에 실패했습니다.');
    return {
      ...output,
      status: 'success'
    };
  }
);
