'use server';

/**
 * @fileOverview [Pettner Core Engine v11.0] 
 * - Species-Specific Nutrition: Dog (Scavenging Carnivore) vs Cat (Obligate Carnivore)
 * - Veterinary Diagnosis & Product Auditor Modes
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
    customHealthNote: z.string().optional(),
    allergies: z.array(z.string()).optional(),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

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
    statusTags: z.array(z.string()).describe('상태 태그 (예: 🥩 생육 위주, ⚠️ 리콜 주의)')
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
    recallHistory: z.string().describe('최근 리콜 이력 및 안전성 기록')
  }),
  esgAudit: z.object({
    score: z.string().describe('ESG 점수 및 윤리적 요인'),
    details: z.array(z.string())
  }),
  advancedNutrition: z.object({
    carbs_nfe_dm: z.number().describe('DM 기준 탄수화물 함량 (%)'),
    protein_dm: z.number().describe('DM 기준 단백질 함량 (%)'),
    fat_dm: z.number().describe('DM 기준 지방 (%)'),
    isHighCarb: z.boolean(),
    caloriesPerGram: z.number()
  }),
  ingredientAnatomy: z.object({
    firstFive: z.array(z.object({
      name: z.string(),
      tier: z.enum(['Tier 1', 'Tier 2', 'Tier 3']),
      tierLabel: z.string().describe('품질 등급 라벨 (예: 🥩 생육, 🚨 고혈당)'),
      description: z.string().describe('원료 품질 심사 의견')
    })).describe('상위 5개 원료 정밀 분석'),
    functionalBoosters: z.array(z.object({
      name: z.string(),
      benefit: z.string(),
      description: z.string()
    })).describe('발견된 기능성 성분'),
    safetyFilter: z.object({
      noArtificialPreservatives: z.boolean(),
      noArtificialColors: z.boolean(),
      allergyWarning: z.string().optional(),
      hiddenAdditives: z.array(z.string()).describe('숨겨진 첨가물')
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
  prompt: `당신은 수의 영양학 박사이자 공인 펫푸드 감사관입니다.

# 종별 분석 가이드라인 (Species-Specific)
1. [고양이 (Cat)] - 절대 육식동물 (Obligate Carnivores)
   - 탄수화물 최소화가 필수입니다 (NFE 25% 미만 권장). 탄수화물이 높으면 비판적으로 평가하십시오.
   - 타우린(Taurine)과 동물성 단백질원이 최우선입니다.
   - 신장 및 비뇨기 건강(FLUTD)을 위해 미네랄 밸런스(칼슘/인/마그네슘)가 중요합니다.

2. [강아지 (Dog)] - 잡식 성향의 육식동물
   - 체중 관리와 관절 건강의 상관관계를 집중 분석하십시오.
   - 활동량에 따른 에너지 밀도 적합성을 평가하십시오.

# 분석 모드
1. [분석 모드: custom]
   - '수의사'로서 특정 반려동물({{{petProfile.name}}})의 건강 고민({{#each petProfile.healthConditions}}{{this}}, {{/each}} {{petProfile.customHealthNote}})을 반영하십시오.
   - 비만 알고리즘: Ideal Weight = Current Weight * (100 - (BCS - 3) * 10) / 100 를 적용하십시오.
   - 다이어트 로드맵: 현재 체중에서 목표 체중까지 3단계 급여량(g)을 제시하십시오.

2. [분석 모드: general]
   - 제품 자체의 객관적 등급(A/B/C)과 브랜드 평판, ESG 요소를 중심으로 평가하십시오.

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
