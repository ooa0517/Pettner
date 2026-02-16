'use server';

/**
 * @fileOverview [Pettner Core Engine v6.0] 
 * - Obesity Algorithm (Ideal Weight based RER)
 * - Medical Grade Nutrition Analysis
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
    name: z.string().describe('추출된 제품명'),
    brand: z.string().describe('추출된 브랜드'),
    category: z.string().describe('제품 카테고리')
  }),
  scoreCard: z.object({
    grade: z.enum(['S', 'A', 'B', 'C', 'D']),
    headline: z.string().describe('아이 상태와 제품의 궁합을 한 줄로 요약'),
    match_score: z.number().min(0).max(100),
    statusTags: z.array(z.string()).describe('상태 태그 (예: 비만 경고, 다이어트 필요)')
  }),
  feedingGuide: z.object({
    isObese: z.boolean().describe('비만 여부 (BCS 4 이상)'),
    idealWeight: z.number().describe('목표(이상적) 체중 (kg)'),
    weightLossGrams: z.number().describe('감량 식단 일일 급여량 (g)'),
    maintenanceGrams: z.number().describe('유지 식단 일일 급여량 (g)'),
    targetKcal: z.number().describe('감량 목표 칼로리 (kcal)'),
    maintenanceKcal: z.number().describe('유지 목표 칼로리 (kcal)'),
    visualGuide: z.string().describe('종이컵 기준 가이드 (감량 기준)')
  }),
  advancedNutrition: z.object({
    dm_protein: z.string().describe('DM 단백질'),
    dm_fat: z.string().describe('DM 지방'),
    dm_carbs: z.string().describe('DM 탄수화물'),
    protein_pct: z.number().describe('단백질 함량 (%)'),
    fat_pct: z.number().describe('지방 함량 (%)'),
    carbs_pct: z.number().describe('탄수화물 함량 (%)'),
    carbs_warning: z.boolean().describe('탄수화물 과다 여부 (40% 초과)'),
  }),
  ingredientAnalysis: z.object({
    positive: z.array(z.object({ tag: z.string(), reason: z.string() })),
    cautionary: z.array(z.object({ tag: z.string(), reason: z.string() })),
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
1. {{#if photoDataUri}}제공된 사진({{media url=photoDataUri}})에서{{else}}입력된 정보에서{{/if}} 보이는 텍스트만 추출하십시오. 절대 브랜드를 지며내지 마십시오.

# 비만 관리 알고리즘 (Obesity Algorithm)
아이의 BCS(Body Condition Score)가 4단계 이상인 경우 다음 공식을 반드시 적용하십시오:
1. 목표 체중(Ideal Weight) = 현재 체중 * (100 - (BCS - 3) * 10) / 100
2. 감량 목표 칼로리(Target Kcal) = (70 * (목표 체중^0.75)) * 1.0
3. 유지 목표 칼로리(Maintenance Kcal) = (70 * (현재 체중^0.75)) * 활동계수
   (중성화 완료: 1.6 | 미완료: 1.8 | BCS 4/5: 1.0~1.2)
4. 급여량 계산 시 사료의 칼로리 정보가 없으면 표준 3.5kcal/g을 적용하십시오.

# 영양 분석 (Nutrient Analysis)
1. 탄수화물(NFE) 계산: 100 - (조단백 + 조지방 + 조섬유 + 조회분 + 수분)
2. 탄수화물 함량이 40%를 초과(DM 기준)하고 아이가 비만인 경우, '탄수화물 과다 경고'를 활성화하고 빨간색 강조 지침을 내리십시오.
3. 모든 영양소는 DM(건물 기준)으로 환산하여 수의학적 적합성을 판별하십시오.

# 출력 스타일
- 미니멀한 메디컬 대시보드 스타일로 작성하십시오.
- 감정적인 아이콘 사용을 자제하고 전문적인 용어와 태그를 사용하십시오.
- 비만인 경우 "체중 조절 솔루션" 중심의 헤드라인을 작성하십시오.
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