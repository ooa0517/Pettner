'use server';

/**
 * @fileOverview [Pettner Core Engine v10.0] 
 * - Dual Mode: Veterinary Diagnosis (Custom) & Product Auditor (General)
 * - Strict Separation of Logic and Output Schema
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
  // Custom Mode Only (Optional in General)
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
  // General Mode Enhancements
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
  prompt: `당신은 '공인 펫푸드 감사관(Certified Pet Food Auditor)'이자 수의 영양학 전문가입니다.

# 분석 모드에 따른 역할 (분리 필수)
1. [분석 모드: custom]
   - '수의사 주치의'로서 특정 반려동물({{{petProfile.name}}})의 상태에 맞춘 정밀 진단과 다이어트 솔루션을 제공합니다.
   - 비만 알고리즘: Ideal Weight = Current Weight * (100 - (BCS - 3) * 10) / 100 를 적용하여 감량 수치를 계산하십시오.
   - 다이어트 로드맵: 현재 체중에서 목표 체중까지 3단계(급속 감량기, 안정기, 유지기)의 몸무게별 급여량(g)을 생성하십시오.
   - 제품의 성분이 아이의 건강 고민(건강 태그)에 얼마나 적합한지 위주로 설명하십시오.

2. [분석 모드: general]
   - '제품 품질 심사관'으로서 반려동물 정보 없이 '제품 자체의 품질과 브랜드 신뢰도'만을 객관적으로 평가합니다.
   - 개인화된 조언 대신 원료 티어, 리콜 이력, 브랜드 평판, ESG 요소를 중심으로 보고서를 작성하십시오.
   - 급여 로드맵이나 몸무게 진단은 생략하십시오.

# 원재료 심사 프레임워크
- First 5 분석: 상위 5개 원료의 품질을 티어별로 구분(Tier 1: 생육, Tier 2: 명확한 분말, Tier 3: 불명확한 부산물).
- GI 임팩트: 비만견의 경우 옥수수, 밀 등을 '🚨 고혈당' 리스크로 분류하십시오.

제품 정보: {{{productName}}} ({{{foodType}}})
아이 정보: {{#if petProfile.name}}{{{petProfile.name}}} ({{{petProfile.breed}}}, BCS {{{petProfile.bcs}}}){{else}}없음 (객관적 품질 심사){{/if}}
사진 데이터: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}사진 없음 (텍스트 기반 분석){{/if}}`,
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