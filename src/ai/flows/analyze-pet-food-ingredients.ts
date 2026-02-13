'use server';

/**
 * @fileOverview [Pettner Core v3.1] 수의 영양 분석 엔진
 * - NFE(탄수화물) 계산 및 DM(건물 기준) 환산 로직 탑재
 * - 시장 평균 대비 상대적 비교 데이터(Benchmark) 생성 로직 추가
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
    breed: z.string().optional().describe('품종 (유전적 소인 분석용)'),
    age: z.number().optional(),
    weight: z.number().optional(),
    bcs: z.number().min(1).max(9).optional().describe('신체 조건 점수'),
    healthConditions: z.array(z.string()).optional().describe('기저질환 및 알러지'),
    activityLevel: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
    eatingHabit: z.string().optional(),
    stoolCondition: z.string().optional(),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string(),
    brand: z.string().optional(),
    category: z.string()
  }),
  scoreCard: z.object({
    grade: z.enum(['S', 'A', 'B', 'C', 'D']),
    headline: z.string().describe('핵심 이점/리스크를 강조하는 한 줄 요약'),
    tags: z.array(z.string()),
    matchingScore: z.number().min(0).max(100).describe('반려동물 프로필 대비 적합도')
  }),
  advancedNutrition: z.object({
    moisture: z.string().describe('라벨 표기 수분 %'),
    dm_protein: z.string().describe('DM 기준 단백질 %'),
    dm_fat: z.string().describe('DM 기준 지방 %'),
    dm_carbs: z.string().describe('DM 기준 탄수화물 % (NFE)'),
    dm_ash: z.string().describe('실제 또는 추정된 조회분 %'),
    calories_per_kg: z.string().describe('kcal/kg 추정치'),
    calcium_phosphorus_ratio: z.string().describe('칼슘:인 비율'),
    benchmarks: z.object({
      protein: z.object({ position: z.number().min(0).max(100), label: z.string() }),
      fat: z.object({ position: z.number().min(0).max(100), label: z.string() }),
      carbs: z.object({ position: z.number().min(0).max(100), label: z.string() }),
    }).describe('시장 평균 대비 위치 (0-100, 50이 평균)')
  }),
  ingredientCheck: z.object({
    first_ingredient_type: z.string().describe('Meat / Meal / Grain / Veggie'),
    meat_source_quality: z.string().describe('High (Fresh/Whole) or Low (By-product/Meal)'),
    allergy_triggers: z.array(z.string()).describe('검출된 알러지 유발 물질 목록'),
    positive: z.array(z.object({ name: z.string(), effect: z.string() })),
    cautionary: z.array(z.object({ name: z.string(), risk: z.string() }))
  }),
  expertVerdict: z.object({
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    recommendation: z.string().describe('계산된 수치를 바탕으로 한 구체적 급여 조언'),
    proTip: z.string().describe('임상 수의사의 한 줄 통찰')
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
  prompt: `당신은 세계 최고 수준의 수의 영양 분석 엔진 'Pettner Core'입니다.

# 1. 입력 처리 (Input Processing)
- 이미지/텍스트에서 '등록성분량'과 '원료명'을 추출하세요.
- 조회분이 없으면 건식 7%, 습식 2.5%로 추정하세요.

# 2. 핵심 계산 및 비교 로직
1. **NFE (탄수화물)**: 100 - (단백질 + 지방 + 섬유 + 회분 + 수분)
2. **DM (건물 기준) 환산**: (성분 / (100 - 수분)) * 100
3. **시장 평균 비교 (Benchmarks)**: 
   - 제품군(건식/습식/간식 등)의 일반적인 평균치와 비교하세요.
   - 예: 건사료 평균 단백질 25% 대비 이 제품이 35%라면 position을 70~80으로 설정.
   - 평균인 경우 50으로 설정하세요.

# 3. 분석 지침
- 객관적 수치로 증명하세요.
- DM 탄수화물 50% 초과 시 '비만 리스크'로 표시하세요.
- 유해 성분 검출 시 즉시 'D' 등급을 부여하세요.

# 입력 데이터
- 제품: {{{productName}}} ({{{brandName}}}) / {{{foodType}}}
- 반려동물 프로필: {{{petProfile}}}
- 원재료/성분: {{{ingredientsText}}}

결과는 한국어로 작성하며, JSON 스키마를 엄격히 준수하세요.`,
});

const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzePetFoodIngredientsPrompt(input);
    return output!;
  }
);
