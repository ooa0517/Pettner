'use server';

/**
 * @fileOverview [Pettner Core Engine v5.0 - Professional Auditor & Veterinarian]
 * - Dual Mode: Veterinary Diagnostic vs Product Quality Audit
 * - Deep Dive Logic: Ingredient Tiering (1-3), Nutritional Engineering (Ca:P, Omega), ESG Audit
 * - Strict 5-Point Diet Roadmap for Obese Pets
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionalMetricSchema = z.object({
  value: z.number().describe('분석된 DM 값 (%)'),
  minStd: z.number().describe('권장 최소 DM (%)'),
  maxStd: z.number().describe('권장 최대 DM (%)'),
  status: z.enum(['low', 'optimal', 'high']),
  verdict: z.string().describe('상태 판정 문구')
});

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
    weightChange: z.string().optional(),
    neutered: z.boolean().optional(),
    bcs: z.string().optional(),
    lifestyle: z.string().optional(),
    behaviorPattern: z.string().optional(),
    healthConditions: z.array(z.string()).optional(),
    customHealthNote: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    stoolCondition: z.string().optional(),
    medications: z.string().optional(),
    waterIntake: z.string().optional(),
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
    statusTags: z.array(z.string()).describe('상태 태그')
  }),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number(),
    weightGap: z.number(),
    breedStandardRange: z.string().describe('해당 품종의 표준 체중 범위'),
    breedGeneticInsight: z.string().describe('품종 유전적 취약점 조언'),
    overweightPercentage: z.number(),
    verdict: z.string()
  }).optional(),
  dietRoadmap: z.array(z.object({
    weight: z.number(),
    grams: z.number(),
    phase: z.string()
  })).optional(),
  deepDive: z.object({
    ingredientAudit: z.object({
      tiers: z.array(z.object({
        level: z.enum(['Tier 1', 'Tier 2', 'Tier 3']),
        ingredients: z.array(z.string()),
        comment: z.string()
      })),
      giIndex: z.enum(['Low', 'Moderate', 'High']),
      giComment: z.string()
    }),
    nutritionalEngineering: z.object({
      metrics: z.object({
        protein: NutritionalMetricSchema,
        fat: NutritionalMetricSchema,
        carbs: NutritionalMetricSchema,
        fiber: NutritionalMetricSchema,
        ash: NutritionalMetricSchema
      }),
      ratios: z.object({
        caPRatio: z.string().describe('칼슘:인 비율 (예: 1.2:1)'),
        omega63Ratio: z.string().describe('오메가 6:3 비율'),
        balanceVerdict: z.string()
      })
    }),
    safetyToxicology: z.object({
      checks: z.array(z.object({
        label: z.string(),
        status: z.boolean(),
        comment: z.string()
      })),
      riskAlert: z.string().optional(),
      recallHistory: z.string()
    }),
    brandESG: z.object({
      facility: z.string().describe('제조 시설 인증 현황'),
      rdLevel: z.string().describe('R&D 투자 수준'),
      sustainability: z.string().describe('친환경/패키징 평가'),
      animalWelfare: z.string().describe('동물 복지 및 윤리 평가')
    })
  }),
  veterinaryAdvice: z.string()
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `당신은 세계적인 수의 영양학 전문의이자 공인 펫푸드 감사관입니다. 
입력된 데이터를 바탕으로 [Pettner V5.0 Deep-Dive] 아키텍처에 따른 초정밀 리포트를 생성하십시오.

분석 모드: {{{analysisMode}}}

# [분석 대원칙]
1. 원재료 심층 해부: 상위 10개 원료를 Tier 1(생육/슈퍼푸드), Tier 2(농축분), Tier 3(부산물/필러)로 강제 분류하십시오.
2. 영양 엔지니어링: AAFCO/FEDIAF 기준을 바탕으로 칼슘:인 비율과 오메가 6:3 비율을 추론/계산하십시오.
3. 브랜드 감사: 최신 지식 베이스를 활용하여 해당 브랜드의 리콜 이력과 ESG 경영(친환경, 동물복지)을 심사하십시오.
4. 개인화 매칭 (Custom Mode 시): 
   - Ideal_Weight = Current_Weight * (100 - (BCS - 3) * 10) / 100
   - dietRoadmap: 현재에서 목표까지 5개 지점 생성. 목표에 가까워질수록 유지 칼로리(RER*1.4)를 반영하여 급여량이 늘어납니다.

# 출력 구조 (Hierarchical Disclosure)
- 상단 Summary: 결론, 점수, 한 줄 평, 급여 가이드.
- 하단 Deep-Dive: 아코디언 메뉴에 들어갈 상세 데이터 (ingredientAudit, nutritionalEngineering, safetyToxicology, brandESG).

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
    if (!output) throw new Error('AI 분석 실패: 데이터가 생성되지 않았습니다.');
    return {
      ...output,
      status: 'success'
    };
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}
