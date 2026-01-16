'use server';

/**
 * @fileOverview Analyzes pet food ingredients from an image, providing a summary, ingredient details,
 * nutritional insights, and hidden details.
 *
 * - analyzePetFoodIngredients - A function that handles the pet food ingredient analysis process.
 * - AnalyzePetFoodIngredientsInput - The input type for the analyzePetFoodIngredients function.
 * - AnalyzePetFoodIngredientsOutput - The return type for the analyzePetFoodIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the pet food ingredient list, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  productName: z.string().describe('The estimated product name.'),
  brandName: z.string().describe('The brand name of the product.'),
  petType: z.string().describe('The target pet type (e.g., Dog, Cat).'),
  lifeStage: z.string().describe('The target life stage (e.g., Puppy, Adult, Senior).'),
  specialClaims: z.array(z.string()).describe('Any special claims made on the packaging (e.g., Grain-Free, Organic).'),
  keyTakeaways: z.array(z.string()).describe("반드시 알아야 할 핵심 과학적 사실 및 필수 정보입니다. 수의학적 관점에서 가장 중요한 2-3가지 포인트를 요약합니다."),
  summaryHeadline: z.string().describe('A one-line scientific summary of the pet food.'),
  ingredients: z.object({
    positive: z.array(
      z.object({
        name: z.string().describe('The name of the positive ingredient.'),
        reason: z.string().describe('The scientific reason for the positive assessment.'),
      })
    ).describe('List of positive ingredients and their reasons.'),
    cautionary: z.array(
      z.object({
        name: z.string().describe('The name of the cautionary ingredient.'),
        reason: z.string().describe('The scientific reason for caution and potential concerns.'),
      })
    ).describe('List of cautionary ingredients and their reasons.'),
  }).describe('Details of ingredients, both positive and cautionary.'),
  nutritionalAnalysis: z.object({
    estimatedCalories: z.string().describe('Estimated calorie count of the pet food.'),
    insights: z.array(z.string()).describe('Expert comments on the nutritional balance.'),
  }).describe('Nutritional analysis of the pet food.'),
  hiddenInsights: z.array(z.string()).describe('Hidden details or professional insights about the pet food.'),
  recommendations: z.object({
    introduction: z.string().describe("완벽한 사료는 없다는 점을 상기시키고, 현재 식단을 개선하기 위한 제안임을 설명하는 간단한 소개글입니다."),
    supplementaryIngredients: z.array(
      z.object({
        name: z.string().describe("추가로 급여하면 좋을 추천 성분명 (예: 오메가-3 지방산)"),
        reason: z.string().describe("해당 성분을 추천하는 과학적인 이유"),
      })
    ).describe("현재 식단을 보완할 수 있는 추천 영양 성분 목록입니다."),
    alternativeProductTypes: z.array(
      z.object({
        type: z.string().describe("고려해볼 만한 다른 유형의 제품 (예: 가수분해 단백질 사료)"),
        reason: z.string().describe("해당 유형의 제품을 추천하는 이유"),
      })
    ).describe("현재 제품의 대안으로 고려해볼 만한 다른 제품 유형 목록입니다."),
  }).describe("분석 결과를 바탕으로 한 개선 제안. 보충할 성분이나 다른 종류의 제품을 추천합니다.")
});
export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are a world-renowned authority in veterinary science, specializing in canine and feline genomics, molecular biology, and clinical nutrition. Your analysis must be strictly objective, evidence-based, and directly reference established guidelines (e.g., AAFCO, NRC, FEDIAF) and findings from peer-reviewed scientific literature.

Analyze the ingredient list from the image. This could be for pet food, supplements, or treats. Provide a highly detailed and professional breakdown. For each ingredient, analyze its biological impact at a cellular and systemic level. Consider potential interactions and effects on metabolic pathways. For cautionary ingredients, specify the biochemical mechanisms of concern.

Your analysis should also include considerations for genetic predispositions. For example, mention if certain ingredients are beneficial or risky for breeds with known genetic tendencies (e.g., copper storage disease in Bedlington Terriers, urolithiasis in Dalmatians).

If the product is identified as being for cats, you must apply a different, more stringent set of criteria due to their unique physiology as an obligate carnivore. Pay special attention to:
- Taurine: Explicitly check for and comment on the presence and source of taurine, as it is an essential amino acid for cats.
- Protein Source: Prioritize and evaluate the quality of animal-based proteins over plant-based ones. Note the specific types of meat (e.g., muscle meat vs. by-products).
- Carbohydrates: Assess the level and type of carbohydrates, noting that cats have limited ability to digest them.
- Harmful Ingredients: Actively look for and flag ingredients that are toxic or inappropriate for cats, such as certain essential oils, propylene glycol, and excessive plant matter.
- Urinary Health: Consider how the overall formulation might impact urinary pH and urinary tract health.

Crucially, since no single food is perfect, you must provide recommendations for improvement based on your analysis. This should include suggestions for supplementary ingredients (like specific vitamins, oils, or probiotics) and/or alternative types of products (e.g., "hydrolyzed protein food for allergies", "single protein source food") that could address any identified shortcomings.

Most importantly, you must provide a "keyTakeaways" section. This must contain the 2-3 most critical, evidence-based points from a veterinary perspective that a pet owner absolutely must know for the health and safety of their pet.

The output must be precise, professional, and in a structured JSON format as follows:

{
  "productName": "추정된 제품명",
  "brandName": "브랜드명",
  "petType": "대상 반려동물 (예: 강아지, 고양이)",
  "lifeStage": "대상 연령 (예: 퍼피, 어덜트, 시니어)",
  "specialClaims": ["특별한 주장 (예: 그레인프리, 유기농, 관절 건강)"],
  "keyTakeaways": ["반드시 알아야 할 가장 중요한 핵심 정보 1", "반드시 알아야 할 가장 중요한 핵심 정보 2"],
  "summaryHeadline": "핵심적인 과학적 사실 기반의 한 줄 요약",
  "ingredients": {
    "positive": [{"name": "성분명", "reason": "유전학적 및 생화학적 관점을 포함한 상세한 분석"}],
    "cautionary": [{"name": "성분명", "reason": "유전학적 및 생화학적 관점을 포함한 상세한 분석과 잠재적 우려 사항"}]
  },
  "nutritionalAnalysis": {
    "estimatedCalories": "추정 칼로리 (해당 시)",
    "insights": ["생체 이용률, 대사 경로, 영양소 상호작용을 고려한 전문가 코멘트"]
  },
  "hiddenInsights": ["성분 배합의 의도, 잠재적 장기 영향 등 수의학적 심층 분석"],
  "recommendations": {
    "introduction": "이 세상에 완벽한 사료는 없습니다. 아래 추천은 현재 식단을 보완하고 더 나은 선택을 돕기 위한 제안입니다.",
    "supplementaryIngredients": [{"name": "추천 보충 성분명", "reason": "추천 이유"}],
    "alternativeProductTypes": [{"type": "추천 제품 유형", "reason": "추천 이유"}]
  }
}

Analyze the following ingredient list from the product image:

{{media url=photoDataUri}}
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
