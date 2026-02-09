
'use server';

/**
 * @fileOverview [초고도화 버전] 반려동물 정밀 영양 분석 AI 에이전트
 * - 글로벌 표준(AAFCO, FEDIAF, NRC) 기반 성분 분석
 * - 품종별 유전적 취약점 및 복합 기저질환(비만+알러지 등) 입체 매칭
 * - 정밀 수의학 리포트 생성
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  productName: z.string().optional().describe('제품명'),
  brandName: z.string().optional().describe('브랜드명'),
  foodType: z.string().optional().describe('제품 유형 (건식/습식/화식/간식/영양제)'),
  ingredientsText: z.string().optional().describe('라벨의 원재료 텍스트'),
  photoDataUri: z.string().optional().describe("라벨 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어"),
  petProfile: z.object({
    name: z.string().optional(),
    breed: z.string().optional().describe('품종 (유전적 소인 분석용)'),
    age: z.number().optional(),
    weight: z.number().optional(),
    bcs: z.number().min(1).max(9).optional().describe('신체 조건 점수'),
    healthConditions: z.array(z.string()).optional().describe('기저질환 및 알러지'),
    activityLevel: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
    eatingHabit: z.string().optional(),
    stoolCondition: z.string().optional(),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productInfo: z.object({
    name: z.string(),
    brand: z.string().optional(),
    type: z.string().optional()
  }),
  // 초개인화 적합도 분석
  matchingScore: z.object({
    score: z.number().min(0).max(100),
    clinicalReason: z.string().describe('수의학적 근거 (글로벌 가이드라인 및 논문 참조)'),
    geneticInsight: z.string().describe('품종 특성 및 유전적 취약점 매칭 분석'),
    complexConditionAdvice: z.string().describe('비만+알러지 등 복합 상황에 대한 정밀 조언')
  }),
  summary: z.object({
    headlines: z.array(z.string()).describe('전문가 시각의 핵심 요약'),
    hashtags: z.array(z.string())
  }),
  ingredientsAnalysis: z.object({
    positive: z.array(z.object({ name: z.string(), effect: z.string() })),
    cautionary: z.array(z.object({ name: z.string(), risk: z.string() })),
    hiddenInsights: z.string().describe('라벨에 숨겨진 제조사의 의도나 주의할 점')
  }),
  radarChart: z.array(z.object({
      attribute: z.string().describe("영양 지표"),
      score: z.number().min(1).max(5)
  })),
  feedingGuide: z.object({
      dailyCalories: z.string().describe("RER/DER 기반 일일 권장 칼로리"),
      recommendation: z.string().describe("급여 방법 및 시간대 추천")
  }),
  expertInsight: z.object({
    proTip: z.string().describe("임상 수의사의 한 줄 통찰"),
    scientificReferences: z.array(z.string()).describe("참고한 영양 표준 및 논문 출처")
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
  prompt: `당신은 세계 최고 수준의 수의 영양학 전문의이자 임상 수의사 'Pettner AI'입니다.
사용자가 제공한 반려동물의 초개인화 데이터와 제품 성분을 대조하여, 동물병원보다 더 정밀하고 객관적인 리포트를 작성하세요.

# 분석 프레임워크 (Global Standards)
1. **AAFCO (미국)**: 최소/최대 영양 수치 준수 여부 분석
2. **FEDIAF (유럽)**: 에너지 요구량 및 미량 영양소 밸런스 분석
3. **NRC (국제)**: 생애주기별 필수 영양소 대사 분석
4. **최신 수의학 논문**: 원재료의 생체 이용률 및 임상적 효능 검증

# 초고도화 분석 지침
1. **복합 상황 분석 (Core)**: 
   - 예: "알러지가 있어 가수분해 단백질은 좋지만, 비만 상태이므로 현재 제품의 높은 탄수화물 함량은 체중 관리에 치명적일 수 있습니다."와 같이 상충되는 지점을 정확히 짚어내세요.
2. **품종 유전학 (Genetic Insight)**:
   - 품종이 입력된 경우, 해당 종의 유전적 취약점(예: 슬개골, 심장, 신장 등)을 성분과 연결하세요. 
3. **전문적 용어 사용**: 
   - '좋아요' 대신 '생체 이용률이 높음', '신장 여과 부하 완화', '오메가3:6 밸런스 최적화' 등의 전문 용어를 사용하여 신뢰도를 높이되, 설명은 다정하게 하세요.
4. **객관적 데이터**: 분석 근거에는 반드시 "AAFCO 2024 가이드라인 기준" 또는 "최신 영양 논문에 근거하여"라는 표현을 포함하세요.

# 입력 데이터
- 제품: {{{productName}}} ({{{brandName}}})
- 유형: {{{foodType}}}
- 반려동물: {{{petType}}} ({{{petProfile.breed}}})
- 프로필: {{{petProfile}}}
- 원재료: {{{ingredientsText}}}

모든 결과는 한국어로 작성하며, 보호자가 "아, 우리 아이 상태가 이래서 이 제품이 맞구나!"라고 무릎을 탁 칠 정도의 깊이 있는 통찰을 제공하세요.`,
});

const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzePetFoodIngredientsPrompt(input);
    return output!;
  }
);
