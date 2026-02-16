'use server';

/**
 * @fileOverview [Pettner Core Engine v7.0] 
 * - Strict Obesity Algorithm (Ideal Weight based RER)
 * - Breed Standard Weight Gap Analysis
 * - Diet Roadmap Data Generation
 * - Veterinary-grade Ingredient Matching
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
    statusTags: z.array(z.string()).describe('상태 태그 (예: 비만 경고, 관절 케어 필요)')
  }),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number().describe('공식에 의한 목표 체중'),
    weightGap: z.number().describe('감량 필요한 킬로그램'),
    breedStandardRange: z.string().describe('품종 표준 체중 범위 (예: 3~8kg)'),
    overweightPercentage: z.number().describe('표준 대비 초과 비율 (%)'),
    verdict: z.string().describe('체중 상태에 대한 수의학적 판단 문구')
  }),
  dietRoadmap: z.array(z.object({
    weight: z.number().describe('기준 몸무게'),
    grams: z.number().describe('해당 몸무게 시점의 일일 권장 급여량'),
    phase: z.string().describe('단계 명칭 (급속 감량기, 안정기, 유지기 등)')
  })).describe('체중 변화에 따른 급여량 로드맵 데이터'),
  advancedNutrition: z.object({
    carbs_nfe_dm: z.number().describe('DM 기준 탄수화물 함량 (%)'),
    protein_dm: z.number().describe('DM 기준 단백질 함량 (%)'),
    fat_dm: z.number().describe('DM 기준 지방 (%)'),
    isHighCarb: z.boolean().describe('탄수화물 40% 초과 여부'),
    caloriesPerGram: z.number().describe('제품의 g당 칼로리 (없으면 3.5kcal/g 적용)')
  }),
  veterinaryDiagnosis: z.object({
    criticalMismatch: z.string().optional().describe('비만 등 특정 상태에 부적합한 결정적 이유'),
    positivePoints: z.array(z.string()).describe('아이 상태와 매칭되는 긍정 성분 및 이유'),
    cautionaryPoints: z.array(z.string()).describe('주의가 필요한 성분 및 이유'),
    vetAdvice: z.string().describe('수의학적 종합 조언')
  }),
  feedingSummary: z.object({
    lossAmountGrams: z.number().describe('현재 시점 감량 권장 급여량'),
    cupGuide: z.string().describe('종이컵 기준 가이드 (예: 약 0.8컵)')
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
  prompt: `당신은 세계적인 수의 영양학 전문가입니다. 제공된 정보와 사진을 바탕으로 '메디컬 진단서' 수준의 리포트를 작성하십시오.

# 엄격한 비만 알고리즘 (Strict Obesity Algorithm)
아이의 BCS(Body Condition Score)가 4 이상인 경우 다음 공식을 반드시 적용하십시오:
1. 목표 체중(Ideal Weight) = 현재 체중 * (100 - (BCS - 3) * 10) / 100
   - 예: 12.6kg, BCS 5 -> 12.6 * (100 - 20) / 100 = 10.08kg
2. 감량 필요한 킬로그램 = 현재 체중 - 목표 체중
3. 감량 목표 칼로리(Target Kcal) = (70 * (목표 체중^0.75)) * 1.0 (비만인 경우 보존 계수 1.0 적용)
4. 유지 칼로리(Maintenance Kcal) = (70 * (현재 체중^0.75)) * (중성화 완료: 1.6 | 미완료: 1.8 | 비만인 경우 1.2~1.4)

# 다이어트 로드맵 데이터 생성
현재 체중에서 목표 체중까지의 여정을 3~4개 데이터 포인트로 생성하십시오.
- Phase 1 (급속 감량기): 현재 체중 시점, 가장 낮은 급여량 (감량 목표 칼로리 기준)
- Phase 2 (안정기): 목표 체중으로 가는 중간 시점, 급여량을 아주 조금씩 증량
- Phase 3 (유지기): 목표 체중 도달 시점, 유지 칼로리(Maintenance)를 적용하여 다시 급여량이 올라가는 형태

# 품종 표준 분석
- {{{petProfile.breed}}}의 표준 체중 범위를 데이터베이스에서 확인하십시오.
- 현재 체중이 표준 범위 상단 대비 몇 % 초과하는지 계산하십시오.

# 영양 및 성분 매칭 (Deep Analysis)
1. 탄수화물(NFE) DM 기준 계산: 100 - (조단백 + 조지방 + 조섬유 + 조회분 + 수분) / (100 - 수분) * 100
2. 비만인 아이에게 탄수화물이 40%를 초과하면 'criticalMismatch'에 명시하고 점수를 대폭 감점하십시오.
3. {{{petProfile.healthConditions}}} 및 {{{petProfile.allergies}}}를 원료 리스트와 대조하십시오.
   - 예: 관절 고민이 있는데 글루코사민이 있으면 긍정 포인트.
   - 예: 닭 알러지가 있는데 닭고기 지방이 있으면 주의 포인트.

# 출력 스타일
- 냉철하고 전문적인 수의학적 어조를 유지하십시오.
- 불필요한 미사여구를 빼고 데이터와 팩트 중심으로 작성하십시오.
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
