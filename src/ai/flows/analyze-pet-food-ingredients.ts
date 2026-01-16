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
  petType: z.enum(['dog', 'cat']).describe('The type of pet the food is for.'),
  productName: z.string().optional().describe('The name of the product, if provided by the user.'),
  brandName: z.string().optional().describe('The brand of the product, if provided by the user.'),
  foodType: z.string().optional().describe('The type of food (e.g., Dry Food, Wet Food, Cooked Food, Supplement, Treat), if provided by the user.'),
  ingredientsText: z.string().optional().describe('The list of ingredients, if provided as text by the user.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of the pet food ingredient list, as a data URI. Used for primary analysis or for verification if text is also provided. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  healthConditions: z.string().optional().describe('Any known pre-existing health conditions of the pet (e.g., "kidney disease, skin allergies").'),
  language: z.string().optional().default('ko').describe("The language for the analysis output, e.g., 'en' for English, 'ko' for Korean."),
}).refine(data => data.ingredientsText || data.photoDataUri, {
  message: 'Either ingredientsText or photoDataUri must be provided.',
});
export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  productName: z.string().describe('The estimated product name.'),
  brandName: z.string().describe('The brand name of the product.'),
  petType: z.string().describe('The target pet type (e.g., Dog, Cat).'),
  lifeStage: z.string().describe('The target life stage (e.g., Puppy, Adult, Senior).'),
  specialClaims: z.array(z.string()).describe('Any special claims made on the packaging (e.g., Grain-Free, Organic).'),
  keyTakeaways: z.array(z.string()).describe("The most critical scientific facts and essential information. Summarizes the 2-3 most important points from a veterinary perspective."),
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
    introduction: z.string().describe("A brief introduction explaining that no food is perfect and these are suggestions to improve the current diet."),
    supplementaryIngredients: z.array(
      z.object({
        name: z.string().describe("Recommended supplementary ingredient name (e.g., Omega-3 fatty acids)."),
        reason: z.string().describe("The scientific reason for recommending this ingredient."),
      })
    ).describe("List of recommended nutritional ingredients to supplement the current diet."),
    alternativeProductTypes: z.array(
      z.object({
        type: z.string().describe("An alternative product type to consider (e.g., Hydrolyzed protein diet)."),
        reason: z.string().describe("The reason for recommending this product type."),
      })
    ).describe("List of alternative product types to consider as an alternative to the current product."),
  }).describe("Improvement suggestions based on the analysis. Recommends supplementary ingredients or alternative product types.")
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

IMPORTANT: Your entire response, including all values in the final JSON output, MUST be in the language specified by this language code: '{{{language}}}'. (e.g., 'en' for English, 'ko' for Korean). The JSON keys must always be in camelCase as defined in the output schema.

This analysis is specifically for a {{{petType}}}. Apply all relevant physiological and nutritional standards for this species.

You will be provided with information about a pet food product (food, supplement, or treat). This may include a product name, brand, food type, a text list of ingredients, and/or an image of the packaging.

{{#if photoDataUri}}
An image has been provided. This image is the primary source of truth for the ingredient list and guaranteed analysis. Use your vision capabilities to extract all relevant information from it.
{{/if}}

{{#if ingredientsText}}
A text-based list of ingredients has been provided by the user. Use this as a key source of information.
{{/if}}

{{#if (and photoDataUri ingredientsText)}}
Both an image and text have been provided. The image serves as the definitive source for "2nd verification". Cross-reference the user-provided text with the information extracted from the image. If there are discrepancies, prioritize the information from the image.
{{/if}}

User-provided product details:
{{#if productName}}
- Product Name: {{{productName}}}
{{/if}}
{{#if brandName}}
- Brand: {{{brandName}}}
{{/if}}
{{#if foodType}}
- Food Type: {{{foodType}}}
{{/if}}

Your task is to analyze this product. Provide a highly detailed and professional breakdown. For each ingredient, analyze its biological impact at a cellular and systemic level. Consider potential interactions and effects on metabolic pathways. For cautionary ingredients, specify the biochemical mechanisms of concern.

Your analysis should also include considerations for genetic predispositions. For example, mention if certain ingredients are beneficial or risky for breeds with known genetic tendencies (e.g., copper storage disease in Bedlington Terriers, urolithiasis in Dalmatians).

{{#if healthConditions}}
IMPORTANT: The pet has the following pre-existing health conditions: {{{healthConditions}}}.
This is the most critical part of the analysis. Your entire assessment, especially the 'cautionary ingredients', 'keyTakeaways', and 'recommendations' sections, MUST be tailored to a pet with this specific combination of conditions. You must consider potential conflicts. For example, a high-protein diet might be good for an active dog but dangerous for one with kidney disease. If a user lists 'kidney disease, skin allergies', you must flag high phosphorus/protein AND identify potential allergens.
{{/if}}

{{#if (eq petType 'cat')}}
IMPORTANT: This is a cat. You must apply a different, more stringent set of criteria due to their unique physiology as an obligate carnivore. Pay special attention to:
- Taurine: Explicitly check for and comment on the presence and source of taurine, as it is an essential amino acid for cats.
- Protein Source: Prioritize and evaluate the quality of animal-based proteins over plant-based ones. Note the specific types of meat (e.g., muscle meat vs. by-products).
- Carbohydrates: Assess the level and type of carbohydrates, noting that cats have limited ability to digest them.
- Harmful Ingredients: Actively look for and flag ingredients that are toxic or inappropriate for cats, such as certain essential oils, propylene glycol, and excessive plant matter.
- Urinary Health: Consider how the overall formulation might impact urinary pH and urinary tract health.
{{/if}}

Crucially, since no single food is perfect, you must provide recommendations for improvement based on your analysis. This should include suggestions for supplementary ingredients (like specific vitamins, oils, or probiotics) and/or alternative types of products (e.g., "hydrolyzed protein food for allergies", "single protein source food") that could address any identified shortcomings.

Most importantly, you must provide a "keyTakeaways" section. This must contain the 2-3 most critical, evidence-based points from a veterinary perspective that a pet owner absolutely must know for the health and safety of their pet.

The final output must be a structured JSON object as defined in the schema.

Sources to analyze:
{{#if ingredientsText}}
User-provided text:
{{{ingredientsText}}}
{{/if}}

{{#if photoDataUri}}
Product image (for primary analysis or verification):
{{media url=photoDataUri}}
{{/if}}
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
