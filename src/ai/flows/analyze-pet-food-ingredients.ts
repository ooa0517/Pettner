'use server';

/**
 * @fileOverview [Pettner Core Engine v16.0] 
 * - Ultra-Precision Nutrition Algorithm
 * - Corrected Diet Roadmap (Loss vs Maintenance Calorie Logic)
 * - Breed Genetic Insight Integration
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
  prompt: `당신은 세계적인 수의 영양학 전문의이자 공인 펫푸드 감사관입니다. 
아래 데이터를 바탕으로 초정밀 영양 진단 리포트를 생성하십시오.

# 환자(반려동물) 프로필 (맞춤 진단 시에만 사용)
- 이름/종/무게: {{{petProfile.name}}} ({{{petType}}}, {{{petProfile.breed}}}, {{{petProfile.weight}}}kg)
- BCS: {{{petProfile.bcs}}} (3: 이상적, 4: 과체중, 5: 비만)
- 체중변화: {{{petProfile.weightChange}}}, 산책/라이프스타일: {{{petProfile.lifestyle}}}, 행동패턴: {{{petProfile.behaviorPattern}}}
- 변상태: {{{petProfile.stoolCondition}}}, 음수량: {{{petProfile.waterIntake}}}

# 분석 알고리즘 가이드라인 (엄격 준수)
1. [비만 및 목표 체중]: BCS 4 이상인 경우 다음 공식을 엄격히 적용하십시오.
   - Ideal_Weight = Current_Weight * (100 - (BCS - 3) * 10) / 100
   - weightGap = Current_Weight - Ideal_Weight
   - breedGeneticInsight: {{{petProfile.breed}}}의 유전적 취약점(예: 슬개골, 심장 등)과 현재 비만이 해당 질환에 미치는 악영향을 서술하십시오.

2. [급여량 로드맵 - 중요 로직]: 
   - 감량기(Phase 1, 현재 체중): 감량을 위해 매우 적은 칼로리(IW 기준 RER * 1.0)를 급여합니다.
   - 유지기(Phase 3, 목표 체중 도달 시): 건강 유지를 위해 다시 정상 칼로리(IW 기준 RER * 1.4~1.6)를 급여합니다.
   - **결과적으로 몸무게가 줄어들어 목표 체중에 가까워질수록 일일 급여량(g)은 감량기보다 늘어나는 것이 정상입니다.** (감량 칼로리 < 유지 칼로리)
   - 이 'V자형' 또는 '점진적 상승' 로직을 dietRoadmap 데이터에 반영하십시오.

3. [영양 밀도(DM)]: 수분을 제외한 건물 기준(DM)으로 분석하십시오.
   - 비만견인 경우 탄수화물(NFE) DM 40% 초과 시 'isHighCarb'를 true로 설정하고 강력 경고하십시오.

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
