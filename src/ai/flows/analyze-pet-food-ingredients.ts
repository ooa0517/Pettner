'use server';

/**
 * @fileOverview [Pettner Core v3.0] 수의 영양 분석 엔진
 * - NFE(탄수화물) 계산 및 DM(건물 기준) 환산 로직 탑재
 * - AAFCO/FEDIAF 가이드라인 기반 정밀 분석
 * - 초개인화 건강 상태(비만, 알러지 등) 입체 매칭
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
  // [NEW] 사용자 요청 JSON 스키마 반영
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
    calcium_phosphorus_ratio: z.string().describe('칼슘:인 비율')
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
    geneticInsight: z.string().optional().describe('품종 특성 매칭'),
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
경쟁사 앱을 압도하는 과학적이고 객관적인 데이터를 산출하여 보호자에게 수의학적 리포트를 제공하세요.

# 1. 입력 처리 (Input Processing)
- 제공된 이미지/텍스트에서 '등록성분량(조단백, 조지방, 조섬유, 조회분, 수분)'과 '원료명'을 추출하세요.
- **조회분(Ash)** 수치가 없는 경우, 건식은 7%, 습식은 2.5%로 추정하여 탄수화물을 계산하세요.

# 2. 핵심 계산 로직 (Calculation Logic)
보고서 생성 전 반드시 내부적으로 다음 계산을 수행하세요:
1. **NFE (탄수화물)**: 100 - (단백질 + 지방 + 섬유 + 회분 + 수분)
2. **DM (건물 기준) 환산**: (성분 수치 / (100 - 수분)) * 100
3. **칼로리 추정**: 수정된 Atwater 계수 사용 (단백질*3.5 + 지방*8.5 + 탄수화물*3.5)

# 3. 분석 지침 (Guidelines)
- **객관성**: '프리미엄' 같은 모호한 표현 대신 숫자로 증명하세요.
- **임계값**: DM 기준 탄수화물이 50%를 초과하면 '비만 리스크'로 표시하세요.
- **안전**: 유해 성분(자일리톨, 양파, 포도 등) 검출 시 즉시 'D' 등급을 부여하세요.
- **초개인화**: 반려동물의 이름({{{petProfile.name}}}), 품종({{{petProfile.breed}}}), 체중({{{petProfile.weight}}}kg), 기저질환({{{petProfile.healthConditions}}})을 성분과 대조하여 적합도 점수를 산출하세요.

# 입력 데이터
- 제품: {{{productName}}} ({{{brandName}}}) / {{{foodType}}}
- 반려동물: {{{petType}}} ({{{petProfile.breed}}})
- 프로필: {{{petProfile}}}
- 원재료/성분: {{{ingredientsText}}}

모든 결과는 한국어로 작성하며, 수의 영양학적 근거(AAFCO, NRC 등)를 바탕으로 신뢰도 높은 리포트를 생성하세요.`,
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
