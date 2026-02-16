'use server';

/**
 * @fileOverview [Pettner Core Engine v13.0] 
 * - Ultra-Precision Nutrition: Dog & Cat
 * - Integrated Bio-Behavioral Analysis
 * - Enhanced Nutritional Standards Comparison (AAFCO/NRC)
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
    bcs: z.string().optional(),
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
    breedStandardRange: z.string(),
    overweightPercentage: z.number(),
    verdict: z.string()
  }).optional(),
  dietRoadmap: z.array(z.object({
    weight: z.number(),
    grams: z.number(),
    phase: z.string()
  })).optional(),
  brandInsight: z.object({
    reputation: z.string().describe('브랜드 평판 정보'),
    recallHistory: z.string().describe('리콜 이력')
  }),
  esgAudit: z.object({
    score: z.string().describe('ESG 점수'),
    details: z.array(z.string())
  }),
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
아래의 데이터를 바탕으로 사료/간식/영양제를 초정밀 분석하십시오.

# 환자(반려동물) 프로필
- 이름/종/무게: {{{petProfile.name}}} ({{{petType}}}, {{{petProfile.breed}}}, {{{petProfile.weight}}}kg)
- 상태: BCS {{{petProfile.bcs}}}, 변상태 {{{petProfile.stoolCondition}}}, 음수량 {{{petProfile.waterIntake}}}
- 히스토리: 체중변화 {{{petProfile.weightChange}}}, 산책 {{{petProfile.lifestyle}}}, 행동패턴 {{{petProfile.behaviorPattern}}}
- 의료정보: 질환({{#each petProfile.healthConditions}}{{this}}, {{/each}}), 약물({{{petProfile.medications}}}), 알러지({{#each petProfile.allergies}}{{this}}, {{/each}})

# 분석 가이드라인
1. [영양 표준 대조]: AAFCO 및 NRC 기준을 바탕으로 해당 반려동물 종/생애주기에 따른 단백질, 지방, 탄수화물, 조섬유, 조회분의 '최적 DM 범위(minStd, maxStd)'를 설정하고 분석값과 대조하십시오.
2. [종별 특화]: 고양이는 타우린과 높은 단백질 농도, 탄수화물 제한(DM 25% 미만)을 엄격히 봅니다. 강아지는 활동량 대비 칼로리와 관절 보호 성분을 중점적으로 봅니다.
3. [비만 알고리즘]: BCS 4 이상일 경우 Ideal Weight를 공식(Current * (100 - (BCS-3)*10)/100)에 따라 계산하고 감량 로드맵을 제시하십시오.
4. [원재료 품질]: 제1~5원료를 분석하여 Tier 1(생육/통생선), Tier 2(명칭된 가공분말), Tier 3(부산물/익명분말)로 분류하십시오.

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