
'use server';

/**
 * @fileOverview 사료, 간식, 영양제의 성분을 분석하여 수의 영양학 기반의 리포트를 생성합니다.
 *
 * - analyzePetFoodIngredients - 메인 분석 함수
 * - AnalyzePetFoodIngredientsInput - 입력 스키마
 * - AnalyzePetFoodIngredientsOutput - 출력 스키마
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
      "라벨 사진 데이터 URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
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
  allIngredients: z.array(z.string()).describe("라벨에서 추출된 전체 원재료 목록"),
  pros: z.array(z.string()).describe("제품의 주요 장점 및 기대 효과"),
  cons: z.array(z.string()).describe("주의해야 할 점 및 아쉬운 점"),
  radarChart: z.array(z.object({
      attribute: z.string().describe("속성명"),
      score: z.number().min(1).max(5).describe("적합도 점수 (1-5)")
  })).describe("방사형 차트 데이터 (한국어 속성: '피부/모질', '소화기 건강', '체중 관리', '관절 강화', '활동 에너지')"),
  feedingGuide: z.object({
      puppy: z.array(z.object({
          weight: z.string().describe("몸무게 범위, 예: '1-5kg'"),
          amount: z.string().describe("권장 급여량, 예: '80-120g'"),
      })).optional(),
      adult: z.array(z.object({
          weight: z.string().describe("몸무게 범위"),
          amount: z.string().describe("권장 급여량"),
      })).optional(),
      senior: z.array(z.object({
          weight: z.string().describe("몸무게 범위"),
          amount: z.string().describe("권장 급여량"),
      })).optional(),
      geriatric: z.array(z.object({
          weight: z.string().describe("몸무게 범위"),
          amount: z.string().describe("권장 급여량"),
      })).optional()
  }).describe("체중 및 생애주기별 권장 급여 가이드"),
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
  prompt: `당신은 20년 경력의 다정한 'Pettner AI 수의사'입니다.
사용자가 올린 반려동물 먹거리(사료, 간식, 영양제 중 하나)의 라벨을 분석하여, 보호자에게 아주 쉽고 친절하게 설명해 주세요.

# 생애주기별 분석 지침 (매우 중요)
1. **PUPPY (성장기, 1살 미만)**: 골격 형성과 뇌 발달을 위한 고단백, 고칼로리 성분에 집중하세요.
2. **ADULT (성숙기, 1-7살 미만)**: 에너지 균형과 기초 건강 유지, 근육량 보존에 집중하세요.
3. **SENIOR (노령기, 7-12살 미만)**: 노화 방지 항산화제, 관절 건강, 장기 기능 보호에 집중하세요.
4. **GERIATRIC (초고령기, 12살 이상)**: 장수 반려동물을 위해 낮은 인(phosphorus) 함량, 높은 소화 흡수율, 신장 건강 및 치매 예방 영양소에 특별히 더 집중하세요.

# 분석 지침
1. **제품 유형 구분**: 입력된 정보나 사진을 바탕으로 이 제품이 '사료'인지, '간식'인지, '영양제'인지 먼저 판단하세요.
2. **맞춤형 분석**: 사료/간식/영양제 각각의 목적에 맞게 영양 밸런스를 분석하세요.
3. **위험 성분 체크**: {{{petType}}}에게 해로운 성분(예: 포도, 양파, 백합 등)이 있는지 반드시 체크하세요.
4. **어투**: "~해요", "~네요"와 같은 다정한 수의사 선생님의 말투를 사용하세요.

# 입력 데이터
- 제품명: {{{productName}}}
- 브랜드: {{{brandName}}}
- 유형: {{{foodType}}}
- 반려동물: {{{petType}}} (생애주기: {{{lifeStage}}})
- 기저질환: {{{healthConditions}}}
{{#if ingredientsText}} - 원료 텍스트: {{{ingredientsText}}} {{/if}}
{{#if photoDataUri}} - 제품 이미지: {{media url=photoDataUri}} {{/if}}

# 결과 생성
JSON 형식으로 생성하며, 모든 설명 문구는 한국어로 작성하세요.
feedingGuide에 GERIATRIC(초고령기)용 데이터도 반드시 포함해 주세요.
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
    
    if (!output) {
      throw new Error("분석 결과를 생성할 수 없습니다.");
    }
    
    return output;
  }
);
