'use server';

/**
 * @fileOverview [Pettner Core Engine v5.0] 
 * - Grounded Vision Analysis (No Hallucinations)
 * - Veterinary Calorie Math (RER/DER)
 * - Dashboard-optimized output
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).default('custom').describe('분석 모드'),
  productName: z.string().optional().describe('보호자가 입력한 제품명'),
  foodType: z.enum(['dry', 'wet', 'treat', 'supplement']).optional().describe('제품 유형'),
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
    healthConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string().describe('추출된 제품명 (모호하면 "알 수 없는 제품")'),
    brand: z.string().describe('추출된 브랜드 (모호하면 "정보 없음")'),
    category: z.string().describe('제품 카테고리')
  }),
  scoreCard: z.object({
    grade: z.enum(['S', 'A', 'B', 'C', 'D']),
    headline: z.string().describe('아이 상태와 제품의 궁합을 한 줄로 요약 (이모지 포함)'),
    match_score: z.number().min(0).max(100)
  }),
  feedingGuide: z.object({
    dailyKcal: z.string().describe('하루 필요 칼로리 (kcal)'),
    dailyAmount: z.string().describe('하루 권장 급여량 (g)'),
    perMealAmount: z.string().describe('1회 급여량 (g)'),
    visualGuide: z.string().describe('종이컵 기준 가이드 (예: 약 1.5컵)')
  }),
  ingredientCheck: z.object({
    positive: z.array(z.object({ name: z.string(), effect: z.string() })).describe('추천 성분 (최대 3개)'),
    cautionary: z.array(z.object({ name: z.string(), risk: z.string() })).describe('주의 성분 (최대 2개)')
  }),
  advancedNutrition: z.object({
    dm_protein: z.string().describe('DM 단백질'),
    dm_fat: z.string().describe('DM 지방'),
    dm_carbs: z.string().describe('DM 탄수화물'),
    benchmarks: z.object({
      protein: z.object({ position: z.number() }),
      fat: z.object({ position: z.number() }),
      carbs: z.object({ position: z.number() }),
    })
  }),
  expertVerdict: z.object({
    whyMatch: z.string().describe('이 제품이 왜 아이에게 맞는지/안맞는지 설명'),
    proTip: z.string().describe('수의학적 조언 (불렛 포인트 활용)')
  })
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `당신은 반려동물 영양학 전문가입니다. 제공된 정보와 사진을 바탕으로 정밀 리포트를 작성하십시오.

# 엄격한 식별 원칙 (Grounded Vision)
1. {{#if photoDataUri}}제공된 사진({{media url=photoDataUri}})에서{{else}}입력된 정보에서{{/if}} 보이는 텍스트만 추출하십시오. 절대 브랜드를 추측하거나 지며내지 마십시오.
2. 브랜드가 불분명하면 "정보 없음", 제품명이 불분명하면 "알 수 없는 제품"으로 표기하십시오.
3. 분석할 타겟 제품 유형: {{{foodType}}}

# 수의학적 급여량 계산 (Scientific Math)
1. RER(휴지기 에너지 요구량) = 70 * (체중^{0.75}) 공식을 사용하십시오.
2. DER(일일 에너지 요구량) 계산 시 다음 계수를 적용하십시오:
   - 중성화 완료: 1.6 | 미완료: 1.8
   - BCS 4(통통): 1.2 | BCS 5(비만): 1.0 (체중 감량 모드)
   - 활동량 높음: 2.0 | 낮음: 1.4
3. 사료의 칼로리 정보가 사진에 없으면 표준 사료 칼로리(3.5kcal/g)를 가상으로 적용하여 계산하십시오.

# 출력 스타일
- 모든 소견은 간결한 불렛 포인트와 적절한 이모지를 사용하십시오.
- 영양 성분은 DM(건물 기준, 수분을 제외한 실제 영양 밀도)으로 환산하여 수의학적 적합성을 판별하십시오.
- 출력 언어: {{{language}}}`,
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