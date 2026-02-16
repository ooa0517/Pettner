'use server';

/**
 * @fileOverview [Pettner Core Engine v18.0] 
 * - Ultra-Precision Nutrition Algorithm
 * - Corrected Diet Roadmap (5-Point Step Logic)
 * - Strict Ingredient Audit (Fats, Oils, and Proteins)
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
    grade: z.string().describe('점수 기반 등급 (예: A, B+, C)'),
    headline: z.string().describe('핵심 진단 문구'),
    statusTags: z.array(z.string()).describe('상태 태그')
  }),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number(),
    weightGap: z.number(),
    breedStandardRange: z.string().describe('해당 품종의 표준 체중 범위'),
    breedGeneticInsight: z.string().describe('해당 품종의 유전적 취약점 및 비만 위험성 조언'),
    overweightPercentage: z.number().describe('표준 범위 상단 대비 초과 비율 (%)'),
    verdict: z.string().describe('비만 및 체중 상태 진단 총평')
  }).optional(),
  dietRoadmap: z.array(z.object({
    weight: z.number(),
    grams: z.number(),
    phase: z.string()
  })).min(5).max(5).optional().describe('5단계 체중 조절 로드맵 데이터 (반드시 5개 지점)'),
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
  prompt: `당신은 세계적인 수의 영양학 전문의이자 공인 펫푸드 감사관입니다. 
아래 데이터를 바탕으로 초정밀 영양 진단 리포트를 생성하십시오.

# 환자(반려동물) 프로필
- 이름/종/무게: {{{petProfile.name}}} ({{{petType}}}, {{{petProfile.breed}}}, {{{petProfile.weight}}}kg)
- BCS: {{{petProfile.bcs}}} (3: 이상적, 4: 과체중, 5: 비만)
- 체중변화: {{{petProfile.weightChange}}}, 산책: {{{petProfile.lifestyle}}}, 행동패턴: {{{petProfile.behaviorPattern}}}

# 분석 가이드라인 (엄격 준수)
1. [비만 진단]: BCS 4 이상인 경우 감량 목표를 산출하십시오.
   - Ideal_Weight = Current_Weight * (100 - (BCS - 3) * 10) / 100
   - breedGeneticInsight: {{{petProfile.breed}}}의 유전적 질환과 비만의 상관관계를 반드시 서술하십시오.

2. [5단계 다이어트 로드맵]: 
   - 현재 체중에서 목표 체중까지 **균등한 간격의 5개 지점(몸무게)**을 생성하십시오.
   - 지점 1(현재 체중): IW 기준 RER * 1.0 (감량 칼로리)
   - 지점 5(목표 체중): IW 기준 RER * 1.4 (유지 칼로리)
   - 중간 지점(2,3,4): 칼로리를 점진적으로 상향 조정하십시오.
   - **중요: 목표 체중으로 갈수록 일일 급여량(g)은 늘어납니다 (감량 칼로리 < 유지 칼로리).** 이 논리적 곡선을 dietRoadmap에 반영하십시오.

3. [원재료 감사]: 
   - Vegetable Oil, Animal Fat 등 모든 지방/오일류를 품질 티어에 따라 엄격히 심사하십시오. 
   - 식물성 유지(Vegetable Oil)는 육식동물에게 Tier 2~3로 분류하며, 비만견에게는 혈당 자극 가능성을 언급하십시오.

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
