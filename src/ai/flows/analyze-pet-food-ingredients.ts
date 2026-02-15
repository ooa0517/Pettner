'use server';

/**
 * @fileOverview [Pettner Core Engine v3.5] Deterministic Veterinary Analysis System
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
  prompt: `당신은 엄격히 결정론적인 수의 영양 분석 엔진 'Pettner Core'입니다.
제공된 이미지나 텍스트를 분석하여 AAFCO/NRC 기준에 부합하는 과학적 리포트를 생성하십시오.

# PART 1. 종별 분리 로직 (Bifurcation)
- 강아지(Dog)와 고양이(Cat)의 영양 요구량 차이를 엄격히 준수하십시오.
- 고양이의 경우 타우린과 아라키돈산의 유무를 반드시 확인하고 더 높은 단백질 기준을 적용하십시오.

# PART 2. 수학적 계산 공식 (Calculations)
1. **결측치 보정**: '조회분' 미표기 시 건식 8%, 습식 2.5% 적용. '수분' 미표기 시 건식 10%, 습식 75% 적용.
2. **NFE(탄수화물)**: 100 - (조단백 + 조지방 + 조섬유 + 조회분 + 수분)
3. **건물 기준(DM) 환산**: (각 영양소 / (100 - 수분)) * 100
4. **칼로리 추정**: Modified Atwater 적용 (Protein*3.5 + Fat*8.5 + NFE*3.5) * 10

# PART 3. 프로토콜별 분석 로직
- **독성 물질 감지**: 강아지(자일리톨, 포도, 양파 등), 고양이(백합, 양파, 마늘 등) 감지 시 즉시 'Danger' 등급 부여.
- **건강 연동 분석**: 
  - 비만(Obesity) 언급 시 DM 탄수화물 45% 초과인 경우 경고 메시지 포함.
  - 관절(Joint) 언급 시 글루코사민/오메가3 함유 여부 확인.
  - 고양이 신장(Kidney) 언급 시 인(P) 0.8% 초과 시 경고.

# PART 4. 출력 지침
- 모든 원재료 이름 앞에는 적절한 이모지를 붙이십시오 (예: 🐔 닭고기).
- 'advancedNutrition' 섹션에는 계산된 DM 수치를 포함하십시오.
- 'radarChart'는 기호성, 소화율, 피부건강, 관절, 체중관리 항목으로 구성하십시오.

결과는 한국어로 작성하며, 제공된 JSON 스키마를 엄격히 준수하십시오.`,
});

const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzePetFoodIngredientsPrompt(input);
    return {
      ...output!,
      status: 'success'
    };
  }
);