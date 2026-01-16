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
  prompt: `You are a world-class expert in veterinary medicine and pet nutrition. All analyses must be based on the latest scientific papers and reliable nutritional evidence (e.g., NRC, AAFCO guidelines).

Analyze the pet food ingredient list from the image and provide a detailed breakdown, including potential benefits, risks, nutritional information, and hidden details.

Output must be in a structured JSON format, as follows:
\n
{
  "productName": "추정된 제품명",
  "brandName": "브랜드명",
  "petType": "대상 반려동물 (예: 강아지, 고양이)",
  "lifeStage": "대상 연령 (예: 퍼피, 어덜트, 시니어)",
  "specialClaims": ["특별한 주장 (예: 그레인프리, 유기농)"],
  "summaryHeadline": "한 줄 과학적 요약",
  "ingredients": {
    "positive": [{"name": "성분명", "reason": "과학적 근거"}],
    "cautionary": [{"name": "성분명", "reason": "과학적 근거와 우려 사항"}]
  },
  "nutritionalAnalysis": {
    "estimatedCalories": "추정 칼로리",
    "insights": ["영양 밸런스 관련 전문가 코멘트"]
  },
  "hiddenInsights": ["일반인이 모르는 심층 정보"]
}

Analyze the following pet food ingredient list:

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
