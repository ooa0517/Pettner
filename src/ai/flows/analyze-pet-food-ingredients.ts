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

If the product is identified as being for cats, you must apply a different, more stringent set of criteria due to their unique physiology as obligate carnivores. Pay special attention to:
- Taurine: Explicitly check for and comment on the presence and source of taurine, as it is an essential amino acid for cats.
- Protein Source: Prioritize and evaluate the quality of animal-based proteins over plant-based ones. Note the specific types of meat (e.g., muscle meat vs. by-products).
- Carbohydrates: Assess the level and type of carbohydrates, noting that cats have limited ability to digest them.
- Harmful Ingredients: Actively look for and flag ingredients that are toxic or inappropriate for cats, such as certain essential oils, propylene glycol, and excessive plant matter.
- Urinary Health: Consider how the overall formulation might impact urinary pH and urinary tract health.

The output must be precise, professional, and in a structured JSON format as follows:

{
  "productName": "추정된 제품명",
  "brandName": "브랜드명",
  "petType": "대상 반려동물 (예: 강아지, 고양이)",
  "lifeStage": "대상 연령 (예: 퍼피, 어덜트, 시니어)",
  "specialClaims": ["특별한 주장 (예: 그레인프리, 유기농, 관절 건강)"],
  "summaryHeadline": "핵심적인 과학적 사실 기반의 한 줄 요약",
  "ingredients": {
    "positive": [{"name": "성분명", "reason": "유전학적 및 생화학적 관점을 포함한 상세한 분석"}],
    "cautionary": [{"name": "성분명", "reason": "유전학적 및 생화학적 관점을 포함한 상세한 분석과 잠재적 우려 사항"}]
  },
  "nutritionalAnalysis": {
    "estimatedCalories": "추정 칼로리 (해당 시)",
    "insights": ["생체 이용률, 대사 경로, 영양소 상호작용을 고려한 전문가 코멘트"]
  },
  "hiddenInsights": ["성분 배합의 의도, 잠재적 장기 영향 등 수의학적 심층 분석"]
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
