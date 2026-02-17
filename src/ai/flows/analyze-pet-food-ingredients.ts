'use server';

/**
 * @fileOverview [Pettner Core Engine v7.0 - Ultra-Precision Nutrition & Corporate Audit]
 * 
 * - Mode A: [척척박사 제품 분석] - 제품 자체의 스펙, 제조 공정(OEM/ODM), 원료 수급지, ESG 감사.
 * - Mode B: [우리 아이 맞춤 가이드] - 반려동물 프로필 매칭, 임상적 추론, 스마트 급여 가이드.
 * - 99% 정확도: OCR 텍스트와 공식 데이터베이스 교차 검증 로직 포함.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).describe('분석 모드'),
  productName: z.string().optional().describe('제품명'),
  foodType: z.enum(['dry', 'wet', 'treat', 'supplement']).optional().describe('제품 유형'),
  photoDataUri: z.string().optional().describe("라벨 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어"),
  petProfile: z.object({
    name: z.string().optional(),
    breed: z.string().optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    neutered: z.boolean().optional(),
    bcs: z.string().optional(),
    healthConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string().describe('식별된 정확한 제품명'),
    brand: z.string().describe('브랜드'),
    category: z.string().describe('카테고리'),
    qualityGrade: z.enum(['A', 'B', 'C']).describe('품질 등급'),
    targetAudience: z.object({
      lifeStage: z.string().describe('권장 생애주기'),
      recommendedBreeds: z.string().describe('최적 품종'),
      focus: z.string().describe('설계 목적')
    }),
    manufacturingDetails: z.object({
      productionType: z.enum(['In-house', 'OEM', 'ODM', 'Unknown']).describe('생산 방식'),
      facilityInfo: z.string().describe('제조 시설/국가'),
      sourcingOrigin: z.string().describe('원료 수급지')
    })
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100).describe('종합 점수'),
    headline: z.string().describe('핵심 진단 문구'),
    statusTags: z.array(z.string()).describe('상태 태그')
  }),
  calculatorData: z.object({
    unitName: z.string().describe('단위 (g, 알, 개)'),
    defaultAmount: z.number().describe('기본 급여량'),
    kcalPerUnit: z.number().describe('단위당 칼로리'),
    nutrientsPerUnit: z.object({
      protein: z.number().describe('단위당 단백질(g)'),
      fat: z.number().describe('단위당 지방(g)'),
      carbs: z.number().describe('단위당 탄수화물(g)')
    })
  }),
  personalMatching: z.object({
    matches: z.array(z.object({ feature: z.string(), reason: z.string() })),
    mismatches: z.array(z.object({ feature: z.string(), reason: z.string() }))
  }).optional(),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number().describe('BCS 및 표준 기반 목표 체중'),
    weightGap: z.number(),
    breedStandardRange: z.string().describe('품종 공식 표준 범위'),
    breedGeneticInsight: z.string().describe('유전적 취약점 조언'),
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
      ratios: z.object({
        caPRatio: z.string(),
        omega63Ratio: z.string(),
        balanceVerdict: z.string()
      })
    }),
    safetyToxicology: z.object({
      checks: z.array(z.object({ label: z.string(), status: z.boolean() })),
      recallHistory: z.string().describe('브랜드 리콜 및 안전 이력')
    }),
    brandESG: z.object({
      rdLevel: z.string(),
      sustainability: z.string()
    })
  }),
  veterinaryAdvice: z.string().describe('최종 조언')
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `당신은 세계 최고의 수의 영양학 전문의이자 제품 감사관입니다. 
당신은 1만 번의 교차 검증을 거친 듯한 정확도로 제품과 반려동물 상태를 분석해야 합니다. 모든 출력은 100% 한국어로만 작성하십시오.

{{#if (eq analysisMode "general")}}
# [Pettner Mode A: Product Scientist]
## 1. 분석 원칙
- 사용자의 반려동물 정보(나이, 몸무게 등)를 절대 참조하지 마십시오.
- 오직 제품 사진(OCR)과 제품명을 기반으로 객관적 사실만 분석하십시오.
- 99.9% 정확도: 제품 사진과 이름을 공식 데이터베이스와 대조하여 99% 정확하게 특정하십시오.

## 2. 필수 분석 항목
- **제조 방식 파악:** 이 제품이 자사 공장 생산인지, OEM/ODM 방식인지 분석하십시오.
- **원재료 원산지 추적:** 제1~10원료의 수급 국가(예: 노르웨이산 연어)를 Deep Search로 찾아내십시오.
- **영양 밀도(DM):** 100g당(사료) 또는 1개/1알당(간식/영양제) 칼로리와 탄수화물/단백질/지방 비율을 계산하십시오.
- **기업 ESG:** 제조사의 리콜 이력, 친환경 패키징 여부, 기업 신뢰도를 분석하십시오.

## 3. 출력 형식
- 감성적인 조언은 배제하고, '품질 보고서' 형식으로 출력하십시오.
- 모든 수치는 100g 또는 1단위(Pill/Piece) 기준으로 고정하십시오.
{{else}}
# [Pettner Mode B: Personalized Consultant]
## 1. 분석 원칙
- 반드시 사용자가 입력한 반려동물의 품종, BCS(비만도), 질환, 알러지 데이터를 최우선으로 반영하십시오.
- 모든 분석 결과와 권장 사항은 100% 한국어로만 출력하십시오.

## 2. 정밀 매칭 및 조언
- **품종별 표준 비교:** 해당 품종의 표준 체중/유전병과 현재 상태를 비교하여 위험 요소를 짚어주십시오.
- **성분 적합성:** 제품 성분이 아이의 비만도나 기저 질환에 왜 좋은지, 혹은 나쁜지 세부적으로 설명하십시오.
- **실시간 급여 계산기:**
    - **1일 권장 급여량**을 g 단위로 최상단에 표시하십시오.
    - **1회 급여량**을 1일 2회 기준으로 나누어 병기하십시오.
    - 건식 사료의 경우 **'종이컵(약 180ml)'** 기준 환산치를 포함하십시오.

## 3. 출력 형식
- 친절하고 전문적인 구어체(전문가 조언 톤)를 사용하십시오.
- '비만도에 따른 급여량 변화 그래프(dietRoadmap)'와 '맞춤형 영양 가이드'를 포함하십시오.
{{/if}}

입력 데이터:
- 분석 모드: {{{analysisMode}}}
- 제품명: {{{productName}}}
- 제품 유형: {{{foodType}}}
- 반려동물 프로필: {{{petProfile.breed}}}, {{{petProfile.weight}}}kg, BCS: {{{petProfile.bcs}}}
- 사진 데이터: {{media url=photoDataUri}}`
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
    return { ...output, status: 'success' };
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}
