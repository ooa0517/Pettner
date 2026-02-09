
'use server';

/**
 * @fileOverview 사료, 간식, 영양제의 성분을 분석하여 수의 영양학 기반의 리포트를 생성합니다.
 *
 * - analyzePetFoodIngredients - 메인 분석 함수
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류 (강아지/고양이)'),
  productName: z.string().optional().describe('제품명'),
  brandName: z.string().optional().describe('브랜드명'),
  foodType: z.string().optional().describe('제품 유형 (건식 사료, 습식 사료, 간식, 영양제 등)'),
  ingredientsText: z.string().optional().describe('성분 텍스트'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "라벨 사진 데이터 URI."
    ),
  healthConditions: z.string().optional().describe('기저질환'),
  language: z.string().optional().default('ko').describe("출력 언어"),
  lifeStage: z.enum(['PUPPY', 'ADULT', 'SENIOR', 'GERIATRIC', 'ALL_STAGES']).optional().describe('성장 단계'),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']).describe("분석 성공 여부"),
  productInfo: z.object({
    name: z.string().describe("감지된 제품명"),
    brand: z.string().optional().describe("감지된 브랜드명"),
    type: z.string().optional().describe("감지된 제품 유형")
  }),
  summary: z.object({
    hashtags: z.array(z.string()).describe("제품 성격을 나타내는 3개의 해시태그")
  }),
  allIngredients: z.array(z.string()).describe("추출된 전체 원재료 목록"),
  pros: z.array(z.string()).describe("제품의 주요 장점"),
  cons: z.array(z.string()).describe("주의해야 할 점"),
  radarChart: z.array(z.object({
      attribute: z.string().describe("속성명"),
      score: z.number().min(1).max(5).describe("적합도 점수")
  })),
  feedingGuide: z.object({
      adult: z.array(z.object({
          weight: z.string(),
          amount: z.string(),
      })).optional(),
  }).describe("기본 급여 가이드"),
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
최신 수의학 논문과 AAFCO 가이드라인을 기반으로 제품 성분을 정밀 분석하세요.

# 분석 대상
- 제품명: {{{productName}}}
- 브랜드: {{{brandName}}}
- 반려동물: {{{petType}}}
{{#if lifeStage}} - 생애주기: {{{lifeStage}}} {{/if}}
{{#if healthConditions}} - 기저질환: {{{healthConditions}}} {{/if}}
{{#if ingredientsText}} - 원료 텍스트: {{{ingredientsText}}} {{/if}}
{{#if photoDataUri}} - 사진 데이터 포함됨 {{/if}}

# 분석 지침
1. **논문 기반 분석**: 원재료 중 유해하거나 유익한 성분을 과학적 근거에 따라 분류하세요.
2. **맞춤형 분석**: 강아지와 고양이의 생리학적 차이를 엄격히 구분하세요 (예: 고양이 타우린, 강아지 소화율 등).
3. **비즈니스 가이드**: 만약 생애주기(lifeStage)나 기저질환(healthConditions) 정보가 구체적이지 않다면, 일반적인 분석을 제공하되 "맞춤형 정밀 분석을 위해 펫 프로필 등록이 필요하다"는 뉘앙스의 멘트를 proTip에 포함하세요.
4. **다정한 어조**: 보호자에게 신뢰감을 주면서도 따뜻한 말투를 사용하세요.

결과는 한국어로 작성하며 JSON 형식을 유지하세요.
`,
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
