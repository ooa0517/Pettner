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
  petSummary: z.object({
    description: z.string().describe('아이의 현재 상태 요약 (나이, 체중, 특징 등)'),
    idealWeightRange: z.string().describe('품종 및 나이 대비 표준 적합 체중 범위'),
    statusMessage: z.string().describe('현재 상태에 대한 수의학적 코멘트 (예: "성장이 중요한 시기입니다")')
  }),
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
    visualGuide: z.string().describe('종이컵 등으로 환산한 시각적 가이드 (예: 종이컵 3/4컵)')
  }),
  ingredientCheck: z.object({
    positive: z.array(z.object({ name: z.string(), effect: z.string() })),
    cautionary: z.array(z.object({ name: z.string(), risk: z.string() })),
    allergy_hit: z.boolean(),
    detected_allergens: z.array(z.string())
  }),
  expertVerdict: z.object({
    whyMatch: z.string().describe('왜 이 사료가 아이에게 좋은지/나쁜지 상태와 연관지어 설명'),
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
  prompt: `당신은 반려동물의 건강 상태를 최우선으로 생각하는 'Pettner Core v4.0' 엔진입니다.
보호자가 잘 모를 수 있는 부분까지 AI가 미리 짚어주는 친절하고 전문적인 수의 영양 분석을 제공하십시오.

# 핵심 가이드라인
1. **아이 상태 우선**: 리포트 시작 시 사료보다 '아이의 현재 상태'와 '품종 표준'을 먼저 분석하십시오. 나이와 몸무게를 통해 현재 성장이 완료되었는지(Puppy/Kitten), 성묘/성견인지, 노령인지 판단하십시오.
2. **급여량 계산 (RER/DER)**:
   - 계산 공식: RER = 70 * (체중)^0.75
   - 활동계수 적용: 
     - 강아지: 중성화됨(1.6), 중성화안됨(1.8), 자견(3.0), 비만(1.0~1.2), 노령(1.4)
     - 고양이: 중성화됨(1.2), 중성화안됨(1.4), 자묘(2.5), 비만(0.8~1.0), 노령(1.1)
   - DER = RER * 활동계수
   - 사료의 칼로리(kcal/kg)를 바탕으로 정확한 일일 급여량(g)을 산출하십시오.
3. **용어의 친숙함**: '건물 기준(DM)'을 언급할 때는 반드시 "수분을 제외한 실제 영양 농도"임을 함께 설명하십시오.
4. **품종별 매칭**: 입력된 품종의 유전적 취약점(예: 말티즈의 슬개골, 슈나우저의 췌장염, 페르시안의 신장)과 제품 성분을 강력하게 연동하십시오.
5. **성분 이모지**: 원재료 이름 앞에 적절한 이모지를 붙이십시오 (예: 🐔 닭고기, 🐟 연어, 🥬 완두콩).

# INPUT DATA
{{#if petProfile}}
Pet: {{{petProfile.name}}} ({{{petType}}}, {{{petProfile.breed}}}, {{{petProfile.age}}}세, {{{petProfile.weight}}}kg)
- 중성화: {{{petProfile.neutered}}}
- 활동량: {{{petProfile.activityLevel}}}
- 고민: {{#each petProfile.healthConditions}}{{{this}}}, {{/each}}
- 알러지: {{#each petProfile.allergies}}{{{this}}}, {{/each}}
{{/if}}

# 분석 결과 작성 지침
- 'petSummary' 섹션에서 해당 품종의 표준 체중과 비교하여 현재 아이가 과체중인지, 정상인지 명확히 알려주십시오. 나이가 어린 경우 '성장기'임을 강조하십시오.
- 'expertVerdict.whyMatch' 섹션에서 "이 사료는 ~성분이 들어있어 현재 ~고민이 있는 {{{petProfile.name}}}에게 ~한 이유로 추천합니다/주의가 필요합니다"라고 구체적으로 서술하십시오.
- 모든 수치는 수의학적 근거(AAFCO/NRC)를 바탕으로 결정론적으로 계산하십시오.`,
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
