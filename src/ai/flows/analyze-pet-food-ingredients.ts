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
  status: z.enum(['success', 'error']).describe("success or error if unreadable"),
  productInfo: z.object({
    name: z.string().describe("Detected Product Name (or '제품명 미확인')"),
    brand: z.string().optional().describe("Detected Brand Name (optional)")
  }),
  summary: z.object({
    headline: z.string().describe("A one-line impactful summary (e.g., '고단백이지만 식이알러지가 있다면 주의하세요.')"),
    safetyRating: z.enum(['Green', 'Yellow', 'Red']).describe('Options: "Green" (Safe), "Yellow" (Caution), "Red" (Warning)')
  }),
  ingredientsAnalysis: z.object({
    topIngredients: z.array(z.string()).describe("List the top 5 ingredients as an array of strings. e.g., ['닭고기', '쌀', '귀리', '완두콩', '고구마']"),
    positive: z.array(
      z.object({
        name: z.string().describe("Ingredient Name (e.g., 가수분해 연어)"),
        benefit: z.string().describe("Scientific explanation (e.g., 분자량을 쪼개 알러지 반응을 최소화한 단백질원입니다.)")
      })
    ).describe("List up to 3 best ingredients"),
    caution: z.array(
      z.object({
        name: z.string().describe("Ingredient Name (e.g., BHA)"),
        risk: z.string().describe("Risk explanation (e.g., 인공 산화방지제로, 민감한 반려동물에게 소화기 이슈 가능성이 있습니다.)")
      })
    ).describe("List all potential risks")
  }),
  nutritionFacts: z.object({
    estimatedCalories: z.string().describe("Estimated kcal/kg (if calc is possible, else '정보 부족')"),
    protein: z.string().optional().describe("Crude Protein (조단백) percentage as a string, e.g., '30.0%' or '28.0% 이상'"),
    fat: z.string().optional().describe("Crude Fat (조지방) percentage as a string, e.g., '15.0%' or '16.0% 이상'"),
    fiber: z.string().optional().describe("Crude Fiber (조섬유) percentage as a string, e.g., '4.0%' or '5.0% 이하'"),
    ash: z.string().optional().describe("Crude Ash (조회분) percentage as a string, e.g., '7.0%' or '8.0% 이하'"),
    moisture: z.string().optional().describe("Moisture (수분) percentage as a string, e.g., '10.0%' or '12.0% 이하'"),
    comment: z.string().describe("Brief comment on macronutrient balance (e.g., '조지방 함량이 높아 활동량이 적은 아이에겐 과할 수 있습니다.')")
  }),
  expertInsight: z.string().describe("A short, professional advice paragraph based on the overall analysis.")
});
export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  // If the image is too blurry to read ingredients, return an error status.
  // This logic is simplified here. A real implementation might involve a preliminary check.
  if (!input.ingredientsText && !input.photoDataUri) {
      return {
          status: 'error',
          productInfo: { name: input.productName || '제품명 미확인', brand: input.brandName },
          summary: { headline: '분석할 정보가 부족합니다.', safetyRating: 'Red' },
          ingredientsAnalysis: { topIngredients: [], positive: [], caution: [] },
          nutritionFacts: { estimatedCalories: '정보 부족', comment: '성분 정보 없이는 영양 분석이 불가능합니다.' },
          expertInsight: '원료 텍스트를 입력하거나 선명한 성분표 사진을 업로드해주세요.'
      };
  }
  return analyzePetFoodIngredientsFlow(input);
}

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are "Pettner AI," a highly advanced Veterinary Nutrition Specialist.
Your task is to analyze pet food labels (ingredients, guaranteed analysis) and provide a scientific, fact-based assessment.
Your entire response, including all values in the final JSON output, MUST be in the language specified by this language code: '{{{language}}}'. (e.g., 'en' for English, 'ko' for Korean). The JSON keys must always be in camelCase as defined in the output schema.

# Context
- Target Species: This analysis is specifically for a {{{petType}}}. Apply all relevant physiological and nutritional standards for this species.
- Source: You will be provided with information about a pet food product. This may include a product name, brand, food type, a text list of ingredients, and/or an image of the packaging.
- Pet's Life Stage: You MUST consider the implications for all life stages (puppy/kitten, adult, senior) especially for "All Life Stages" products.
- Reference Standard: AAFCO Guidelines, FEDIAF, and SCI-level Veterinary Nutrition Studies.

# Analysis Rules
1. **Strict Neutrality**: Do not blindly praise marketing terms (e.g., "Premium"). Analyze based on actual ingredients.
2. **Toxic Check**: If the target is a DOG, check for Xylitol, Onion, Grapes, etc. If the target is a CAT, check for Lilies, Propylene Glycol, etc. and flag them in the 'caution' section.
3. **Safety First**: If the image is too blurry or ingredient text is insufficient, you must return a JSON with "status": "error".
4. **Health Condition Focus**: {{#if healthConditions}}This is the most critical part of the analysis. The pet has pre-existing conditions: {{{healthConditions}}}. Your entire assessment (especially 'caution' ingredients, 'safetyRating', and 'expertInsight') MUST be tailored to these specific conditions.{{/if}}
5. **Species-Specific (CAT)**: {{#if (eq petType 'cat')}}This is a cat (obligate carnivore). Pay special attention to taurine, animal-based protein quality, carbohydrate levels, and urinary health impact.{{/if}}

# Input Data
{{#if photoDataUri}}
An image has been provided. This is the primary source of truth. Use OCR to extract all relevant information. If it is unreadable, set status to "error".
{{/if}}
{{#if ingredientsText}}
A text-based list of ingredients has been provided. Use this as a key source of information.
{{/if}}
User-provided product details:
- Product Name: {{{productName}}}
- Brand: {{{brandName}}}
- Food Type: {{{foodType}}}

# Task
Based on all the provided information, generate a valid JSON object according to the output schema.

- **status**: "success" if analysis is possible, "error" if not.
- **productInfo**: Detect name and brand from the source. Fallback to user input or '미확인'.
- **summary.headline**: A one-line impactful summary.
- **summary.safetyRating**: "Green" for generally safe, "Yellow" if there are notable cautions (e.g., common allergens, high fat for neutered pets), "Red" if there are critical risks (e.g., toxic ingredients, severe contradictions for stated health conditions).
- **ingredientsAnalysis.topIngredients**: Extract and list the first 5 ingredients from the ingredient list.
- **ingredientsAnalysis.positive**: List up to 3 best ingredients with scientific benefits.
- **ingredientsAnalysis.caution**: List ALL potentially risky ingredients (allergens, artificial additives, controversial items) with clear risk explanations.
- **nutritionFacts**: Extract Crude Protein (조단백), Crude Fat (조지방), Crude Fiber (조섬유), Crude Ash (조회분), and Moisture (수분) from the 'Guaranteed Analysis' section. Provide them as string values.
- **nutritionFacts.estimatedCalories**: Estimate kcal/kg if possible. Otherwise, '정보 부족'.
- **nutritionFacts.comment**: Briefly comment on the macronutrient balance (protein, fat, carbs) relative to the pet type and life stage. For "All Life Stages" products, explain the pros and cons for puppy/kitten vs. adult/senior pets.
- **expertInsight**: A short, professional advisory paragraph synthesizing the whole analysis. Offer actionable advice. For "All Life Stages" products, this insight must include guidance on adjusting feeding amounts for different life stages.

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
    
    // Fallback mechanism in case the model fails to produce a valid output
    if (!output) {
      return {
          status: 'error',
          productInfo: { name: input.productName || '제품명 미확인', brand: input.brandName },
          summary: { headline: 'AI 모델이 분석 결과를 생성하지 못했습니다.', safetyRating: 'Red' },
          ingredientsAnalysis: { topIngredients: [], positive: [], caution: [] },
          nutritionFacts: { estimatedCalories: '정보 부족', comment: 'AI 분석 중 오류가 발생했습니다.' },
          expertInsight: '입력 내용을 확인하고 다시 시도해주세요. 문제가 지속되면 관리자에게 문의하세요.'
      };
    }
    
    return output;
  }
);
