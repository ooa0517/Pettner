'use server';

/**
 * @fileOverview [Pettner Core Engine v8.0] 
 * - Deep Ingredient Anatomy Algorithm
 * - First 5 Quality Tiering System
 * - GI (Glycemic Index) Impact Analysis
 * - Functional Additive Matching
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
    totalScore: z.number().min(0).max(100).describe('현재 아이 상태 대비 적합성 점수'),
    grade: z.string().describe('점수 기반 등급 (S~D)'),
    headline: z.string().describe('아이 상태와 제품의 궁합 한 줄 요약'),
    statusTags: z.array(z.string()).describe('상태 태그 (예: 비만 경고, 다이어트 필요)')
  }),
  weightDiagnosis: {
    currentWeight: z.number(),
    idealWeight: z.number(),
    weightGap: z.number(),
    breedStandardRange: z.string(),
    overweightPercentage: z.number(),
    verdict: z.string()
  },
  dietRoadmap: z.array(z.object({
    weight: z.number(),
    grams: z.number(),
    phase: z.string()
  })),
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
      tier: z.enum(['Fresh Meat', 'Meal', 'By-product', 'Grain', 'Fiber', 'Unknown']),
      tierLabel: z.string().describe('품질 등급 라벨 (예: 🥩 생육)'),
      description: z.string().describe('수의학적 품질 설명')
    })).describe('상위 5개 원료 정밀 분석'),
    functionalBoosters: z.array(z.object({
      name: z.string(),
      benefit: z.string(),
      description: z.string()
    })).describe('아이 상태와 매칭되는 기능성 성분'),
    safetyFilter: z.object({
      noArtificialPreservatives: z.boolean(),
      noArtificialColors: z.boolean(),
      allergyWarning: z.string().optional()
    })
  }),
  veterinaryAdvice: z.string().describe('종합 수의학적 조언')
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `당신은 세계적인 수의 영양학 전문가입니다. 제공된 정보와 사진을 바탕으로 '수의학적 정밀 진단 리포트'를 작성하십시오.

# 엄격한 비만 알고리즘
1. 목표 체중(Ideal Weight) = 현재 체중 * (100 - (BCS - 3) * 10) / 100
2. 비만인 아이(BCS 4 이상)의 경우:
   - Target Kcal = (70 * (목표 체중^0.75)) * 1.0 (감량 계수 적용)
   - 탄수화물(NFE)이 40%를 초과하면 강력한 경고를 생성하십시오.

# 원재료 정밀 분석 (Deep Ingredient Anatomy)
1. 제1~5원료 분석: 상위 5개 원료의 품질을 구분하십시오.
   - Fresh Meat: 🥩 생육 (가공되지 않은 신선육)
   - Meal: ⚠️ 건조 분말 (농축 단백질)
   - By-product: 🚨 부산물
   - Grain: 고혈당 원료 (옥수수, 밀, 쌀 등)
2. 기능성 성분 매칭: {{{petProfile.healthConditions}}} 및 비만 여부를 고려하여 L-카르니틴, 글루코사민, 오메가-3 등의 포함 여부를 분석하십시오.
3. GI 임팩트: 비만인 아이에게 옥수수/밀 등은 혈당을 빠르게 올리는 부정적 요인으로 서술하십시오.

# 다이어트 로드맵
현재 체중에서 목표 체중까지 3단계(급속 감량기 -> 안정기 -> 유지기) 급여 로드맵을 생성하십시오. 유지기 시점에는 감량 칼로리가 아닌 유지 칼로리를 적용하여 급여량이 다시 약간 올라가야 합니다.

제품 정보: {{{productName}}} ({{{foodType}}})
아이 정보: {{{petProfile.name}}} ({{{petProfile.breed}}}, {{{petProfile.weight}}}kg, BCS {{{petProfile.bcs}}})
라벨 사진: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}사진 없음{{/if}}`,
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
