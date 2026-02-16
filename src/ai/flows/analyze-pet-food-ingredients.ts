'use server';

/**
 * @fileOverview [Pettner Core Engine v15.0] 
 * - Ultra-Precision Nutrition: Dog & Cat
 * - Strict Breed Standard & Obesity Algorithm
 * - Deep Ingredient Anatomy & GI Impact Analysis
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).default('custom').describe('분석 모드'),
  productName: z.string().optional().describe('제품명'),
  foodType: z.enum(['dry', 'wet', 'treat', 'supplement']).optional().describe('제품 유형'),
  photoDataUri: z.string().optional().describe("라벨 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어"),
  petProfile: z.object({
    name: z.string().optional(),
    breed: z.string().optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    weightChange: z.string().optional().describe('최근 3개월 체중 변화'),
    neutered: z.boolean().optional(),
    bcs: z.string().optional().describe('BCS (1-5)'),
    activityLevel: z.string().optional(),
    lifestyle: z.string().optional().describe('라이프스타일/산책시간'),
    behaviorPattern: z.string().optional().describe('평소 행동 패턴'),
    environment: z.string().optional().describe('고양이: 생활 환경'),
    healthConditions: z.array(z.string()).optional(),
    customHealthNote: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    stoolCondition: z.string().optional().describe('변 상태'),
    medications: z.string().optional().describe('복용 중인 약물'),
    pickiness: z.string().optional().describe('입맛 까다로운 정도'),
    preferredTexture: z.string().optional().describe('선호 제형'),
    waterIntake: z.string().optional().describe('평소 음수량'),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const NutritionalMetricSchema = z.object({
  value: z.number().describe('분석된 DM 값 (%)'),
  minStd: z.number().describe('권장 최소 DM (%)'),
  maxStd: z.number().describe('권장 최대 DM (%)'),
  status: z.enum(['low', 'optimal', 'high']),
  verdict: z.string().describe('상태 판정 문구')
});

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string().describe('추출된 제품명'),
    brand: z.string().describe('추출된 브랜드'),
    category: z.string().describe('제품 카테고리'),
    qualityGrade: z.enum(['A', 'B', 'C']).describe('원료 기반 품질 등급'),
    oneLineVerdict: z.string().describe('제품 품질 한 줄 요약')
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100).describe('적합성/품질 점수'),
    grade: z.string().describe('점수 기반 등급'),
    headline: z.string().describe('핵심 진단 문구'),
    statusTags: z.array(z.string()).describe('상태 태그')
  }),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number(),
    weightGap: z.number(),
    breedStandardRange: z.string().describe('해당 품종의 표준 체중 범위 (예: 3~8kg)'),
    overweightPercentage: z.number().describe('표준 범위 상단 대비 초과 비율 (%)'),
    verdict: z.string().describe('비만 및 체중 상태 진단 총평')
  }).optional(),
  dietRoadmap: z.array(z.object({
    weight: z.number(),
    grams: z.number(),
    phase: z.string()
  })).optional(),
  advancedNutrition: z.object({
    protein: NutritionalMetricSchema,
    fat: NutritionalMetricSchema,
    carbs: NutritionalMetricSchema,
    fiber: NutritionalMetricSchema,
    ash: NutritionalMetricSchema,
    isHighCarb: z.boolean(),
    caloriesPerGram: z.number()
  }),
  ingredientAnatomy: z.object({
    firstFive: z.array(z.object({
      name: z.string(),
      tier: z.enum(['Tier 1', 'Tier 2', 'Tier 3']),
      tierLabel: z.string(),
      description: z.string()
    })),
    functionalBoosters: z.array(z.object({
      name: z.string(),
      benefit: z.string(),
      description: z.string()
    })),
    safetyFilter: z.object({
      noArtificialPreservatives: z.boolean(),
      noArtificialColors: z.boolean(),
      allergyWarning: z.string().optional(),
      hiddenAdditives: z.array(z.string())
    })
  }),
  brandInsight: z.object({
    reputation: z.string().describe('브랜드 평판'),
    recallHistory: z.string().describe('리콜 이력 요약')
  }).optional(),
  veterinaryAdvice: z.string().describe('종합 심사 의견')
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `당신은 세계적인 수의 영양학 전문의이자 펫푸드 감사관입니다. 
아래 데이터를 바탕으로 제품 품질 감사 또는 환자 맞춤형 진단 리포트를 생성하십시오.

# 환자(반려동물) 프로필 (맞춤 진단 시에만 사용)
- 이름/종/무게: {{{petProfile.name}}} ({{{petType}}}, {{{petProfile.breed}}}, {{{petProfile.weight}}}kg)
- BCS: {{{petProfile.bcs}}} (3: 이상적, 4: 과체중, 5: 비만)
- 체중변화: {{{petProfile.weightChange}}}, 산책/라이프스타일: {{{petProfile.lifestyle}}}, 행동패턴: {{{petProfile.behaviorPattern}}}
- 변상태: {{{petProfile.stoolCondition}}}, 음수량: {{{petProfile.waterIntake}}}

# 분석 알고리즘 가이드라인
1. [품종 표준 데이터]: {{{petProfile.breed}}}의 성견 표준 체중 범위를 반드시 검색하여 적용하십시오. (예: 말티푸 3~8kg)
2. [비만 진단]: BCS 4 이상인 경우 다음 공식을 엄격히 적용하십시오.
   - Ideal_Weight = Current_Weight * (100 - (BCS - 3) * 10) / 100
   - overweightPercentage = ((Current_Weight - 표준범위상단) / 표준범위상단) * 100
   - 비만견의 경우 감량 로드맵(dietRoadmap)을 반드시 3단계(급속감량, 안정기, 유지기)로 생성하십시오.
3. [원재료 심층 해부]: 
   - 제1~5원료 분석: Tier 1(생육/통생선), Tier 2(명칭된 분말), Tier 3(부산물/익명원료)로 분류.
   - GI Impact: 비만견의 경우 옥수수, 밀, 쌀 등을 '고혈당(High GI)' 유발 원료로 명시하십시오.
   - 기능성 매칭: 글루코사민, L-카르니틴, 오메가-3 등을 아이의 건강 태그와 매칭하십시오.
4. [영양 표준]: AAFCO/NRC 기준에 따른 DM(건물 기준) 분석을 수행하십시오. 
   - 비만견인 경우 탄수화물(NFE) DM 40% 초과 시 강력 경고하십시오.

사진 데이터: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}사진 없음{{/if}}`,
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