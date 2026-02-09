
'use server';

/**
 * @fileOverview 사료, 간식, 영양제의 성분을 분석하여 수의 영양학 기반의 리포트를 생성합니다.
 * AAFCO 및 NRC 가이드라인을 준수하며, 반려동물의 정밀 프로필과 매칭 분석을 수행합니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  productName: z.string().optional().describe('제품명'),
  brandName: z.string().optional().describe('브랜드명'),
  foodType: z.string().optional().describe('제품 유형'),
  ingredientsText: z.string().optional().describe('성분 텍스트'),
  photoDataUri: z.string().optional().describe("라벨 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어"),
  // 프리미엄/구독자 전용 정밀 데이터
  petProfile: z.object({
    breed: z.string().optional().describe('품종 (유전적 특성 반영용)'),
    lifeStage: z.enum(['PUPPY', 'ADULT', 'SENIOR', 'GERIATRIC', 'ALL_STAGES']).optional(),
    weight: z.number().optional().describe('몸무게 (kg)'),
    bcs: z.number().min(1).max(9).optional().describe('Body Condition Score'),
    healthConditions: z.array(z.string()).optional().describe('보유 질환 및 알러지'),
    stoolCondition: z.string().optional().describe('최근 변 상태'),
    activityLevel: z.enum(['LOW', 'NORMAL', 'HIGH']).optional().describe('활동량/산책량'),
    eatingHabit: z.string().optional().describe('식습관 (급하게 먹음, 까다로움 등)'),
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
  // 종별/개체별 맞춤 매칭 분석
  matchingScore: z.object({
    score: z.number().min(0).max(100).describe('우리 아이 맞춤 적합도 점수'),
    reason: z.string().describe('적합도 점수의 영양학적 근거 (논문 및 가이드라인 기반)')
  }),
  summary: z.object({
    hashtags: z.array(z.string())
  }),
  allIngredients: z.array(z.string()),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  radarChart: z.array(z.object({
      attribute: z.string().describe("속성명"),
      score: z.number().min(1).max(5).describe("적합도 점수")
  })),
  feedingGuide: z.object({
      recommendation: z.string().describe("개체별 맞춤 일일 권장 급여량 및 방법")
  }),
   expertInsight: z.object({
    proTip: z.string().describe("수의사의 한 줄 꿀팁")
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
  prompt: `당신은 세계적인 수의 영양학 전문가 'Pettner AI'입니다.
최신 수의학 논문과 AAFCO(미국사료관리협회), NRC(미국국립연구회의) 가이드라인을 기반으로 분석을 수행하세요.

# 분석 지침
1. **종별 생리학적 차이 엄격 적용**: 
   - 강아지: 잡식성 성향을 고려한 탄수화물 소화율 및 비타민 D 합성 능력 등 분석.
   - 고양이: 육식동물로서의 높은 단백질 요구량, 필수 타우린 함량, 낮은 탄수화물 내성 등을 분석.
2. **개체 맞춤형 매칭 (구독 서비스 핵심)**:
   - 입력된 품종(유전적 취약점), 질환, BCS, 산책량 등을 제품 성분과 대조하세요.
   - 예: 신장 질환이 있는 아이에게 인(P) 함량이 높은 제품은 낮은 적합도 점수를 부여.
   - 예: 활동량이 적은 아이에게 고열량 사료는 비만 위험 경고.
3. **과학적 근거**: 분석 결과의 'matchingScore.reason'에는 "AAFCO 기준 대비 ~" 혹은 "최신 영양학 논문에 따르면 ~" 과 같은 전문적인 근거를 포함하세요.
4. **데이터 부족 시**: 사진이나 텍스트가 부족할 경우, 일반적인 분석을 제공하되 '정밀 분석을 위해 선명한 사진이 필요하다'는 점을 명시하세요.

# 입력 정보
- 제품/브랜드: {{{productName}}} / {{{brandName}}}
- 반려동물 종류: {{{petType}}}
- 정밀 프로필 정보: {{#if petProfile}} {{{petProfile}}} {{else}} 정보 없음 (일반 분석 수행) {{/if}}
- 원료 정보: {{{ingredientsText}}}

모든 결과는 한국어로, 다정하면서도 전문적인 어조로 작성하세요.`,
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
