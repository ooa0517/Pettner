'use server';

/**
 * @fileOverview [Pettner Core v3.3] 결정론적 수의 영양 분석 엔진
 * - 성분명 앞에 이모지 자동 매핑 기능 추가
 * - 수치 계산 일관성 강화
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
  productIdentity: z.object({
    name: z.string(),
    brand: z.string().optional(),
    category: z.string()
  }),
  scoreCard: z.object({
    grade: z.enum(['S', 'A', 'B', 'C', 'D']),
    headline: z.string(),
    tags: z.array(z.string()),
    matchingScore: z.number().min(0).max(100)
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
    positive: z.array(z.object({ name: z.string().describe('이모지가 포함된 성분명 (예: 🐔 닭고기)'), effect: z.string() })),
    cautionary: z.array(z.object({ name: z.string().describe('이모지가 포함된 성분명 (예: ⚠️ 보존제)'), risk: z.string() })),
    allergy_triggers: z.array(z.string())
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
  prompt: `당신은 세계 최고 수준의 결정론적 수의 영양 분석 엔진 'Pettner Core'입니다.

# 1. 성분 시각화 규칙
- 모든 원재료(positive, cautionary 리스트)의 이름 앞에 가장 적절한 이모지를 붙이십시오.
  - 닭고기 -> 🐔, 연어 -> 🐟, 야채 -> 🥬, 유산균 -> 🦠, 위험/화학성분 -> ⚠️, 오일 -> 💧 등

# 2. 계산 공식 (Strict Formulas)
1. **NFE (탄수화물)**: 100 - (조단백 + 조지방 + 조섬유 + 조회분 + 수분)
   - 조회분 미표기 시: 건식 7%, 습식 2.5%, 간식/화식 3% 고정 적용
2. **DM (Dry Matter) 환산**: (성분 % / (100 - 수분 %)) * 100
3. **칼로리 추정 (Modified Atwater)**: (Protein*3.5 + Fat*8.5 + NFE*3.5) * 10

# 3. 벤치마크 기준
제품 카테고리에 따라 다음 평균값을 기준으로 'position(0-100)'을 결정하십시오.
- **건사료(Dry)**: 단백질(DM) 28%, 지방(DM) 14%, 탄수화물(DM) 45%
- **습식(Wet)**: 단백질(DM) 40%, 지방(DM) 20%, 탄수화물(DM) 15%

# 입력 데이터
- 제품: {{{productName}}} ({{{brandName}}}) / {{{foodType}}}
- 반려동물: {{{petType}}} ({{{petProfile}}})
- 원재료/성분: {{{ingredientsText}}}

결과는 한국어로 작성하며, JSON 스키마를 엄격히 준수하십시오.`,
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
