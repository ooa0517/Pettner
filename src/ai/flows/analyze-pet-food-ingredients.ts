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
  lifeStage: z.enum(['PUPPY', 'ADULT', 'SENIOR', 'ALL_STAGES']).optional().describe('The life stage of the pet. (e.g. PUPPY/KITTEN, ADULT, SENIOR, ALL_STAGES)'),
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
    hashtags: z.array(z.string()).describe("Three hashtags that summarize the product's identity. e.g., ['#고기함량_깡패', '#관절튼튼', '#체중조절용']"),
    safetyRating: z.enum(['Green', 'Yellow', 'Red']).describe('Options: "Green" (Safe), "Yellow" (Caution), "Red" (Warning)')
  }),
  topIngredients: z.array(z.string()).describe("The top 5 ingredients listed on the label."),
  ingredientsAnalysis: z.object({
    positive: z.array(
      z.object({
        keyword: z.string().describe("Benefit-oriented keyword in one or two words. (e.g., '소화가 편안해요')"),
        name: z.string().describe("Ingredient Name (e.g., '가수분해 연어')"),
        description: z.string().describe("Easy-to-understand one-line explanation for the pet parent. (e.g., '연어를 잘게 쪼개서 알러지 반응을 줄여주는 착한 단백질이에요.')")
      })
    ).describe("List up to 3 best ingredients."),
    caution: z.array(
      z.object({
        keyword: z.string().describe("Risk-oriented keyword in one or two words. (e.g., '알러지 유발 가능')"),
        name: z.string().describe("Ingredient Name (e.g., '옥수수 글루텐')"),
        description: z.string().describe("Easy-to-understand one-line explanation for the pet parent. (e.g., '몇몇 아이들에게는 알러지를 일으킬 수 있는 식물성 단백질이에요.')")
      })
    ).describe("List all potential risks.")
  }),
  nutritionFacts: z.object({
    comment: z.string().describe("A friendly, comprehensive comment on the overall macronutrient balance, explaining what it means for different types of pets (e.g., active, senior). e.g., '단백질과 지방 함량이 높아 활동량이 많은 아이나 성장기 아이에게 좋은 에너지원이 될 수 있어요. 하지만 칼로리가 높은 편이라, 실내 생활 위주의 반려견이나 체중 조절이 필요한 경우 급여량 조절에 신경 써주시는 게 좋아요.'")
  }),
  expertInsight: z.object({
    goodPoint: z.string().describe("The single best feature of this product, in a friendly tone."),
    cautionPoint: z.string().describe("The single most important caution point, in a friendly tone."),
    proTip: z.string().describe("A practical tip for feeding, in a friendly tone.")
  })
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  // If the image is too blurry to read ingredients, return an error status.
  // This logic is simplified here. A real implementation might involve a preliminary check.
  if (!input.ingredientsText && !input.photoDataUri) {
      return {
          status: 'error',
          productInfo: { name: input.productName || '제품명 미확인', brand: input.brandName },
          summary: { hashtags: ['#분석불가'], safetyRating: 'Red' },
          topIngredients: [],
          ingredientsAnalysis: { positive: [], caution: [] },
          nutritionFacts: { comment: '성분 정보 없이는 영양 분석이 불가능해요.' },
          expertInsight: {
            goodPoint: '입력된 정보가 부족해서 좋은 점을 찾지 못했어요.',
            cautionPoint: '성분표를 읽을 수가 없어서 주의할 점을 알려드릴 수 없어요.',
            proTip: '원료 텍스트를 입력하시거나, 성분표가 선명하게 나온 사진을 다시 올려주세요!'
          }
      };
  }
  return analyzePetFoodIngredientsFlow(input);
}

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are "Pettner AI," a friendly and caring neighborhood veterinarian with 20 years of experience.
Your task is to analyze a pet food label and explain it to a pet parent in a very easy, conversational, and friendly way.
Your entire response, including all values in the final JSON output, MUST be in the language specified by this language code: '{{{language}}}'. (e.g., 'en' for English, 'ko' for Korean). The JSON keys must always be in camelCase as defined in the output schema.

# Persona
- **Role**: A friendly, veteran veterinarian explaining things in a consultation room.
- **Tone & Manner**: Use a soft, conversational tone, like a friendly vet explaining things during a check-up. Use "~해요", "~네요", "~좋아요" styles. AVOID formal, written styles like "~합니다".
- **Language**: AVOID professional jargon (e.g., 가수분해, 킬레이트, GI지수). Instead, use benefit-oriented, easy-to-understand words that parents can relate to (e.g., '소화가 잘되는', '흡수가 빠른', '살이 덜 찌는').

# Context
- Target Species: This analysis is specifically for a {{{petType}}}.
- Pet's Life Stage: {{#if lifeStage}}The pet is in the '{{{lifeStage}}}' stage. Your analysis should be tailored to this.{{/if}}
- Pet's Health: {{#if healthConditions}}The pet has pre-existing conditions: {{{healthConditions}}}. Your analysis MUST be extra gentle and considerate of these conditions, especially in the 'caution' and 'expertInsight' sections.{{/if}}

# Analysis Rules
1.  **Easy & Simple**: Always prioritize simple words over technical ones.
2.  **Safety First**: If the image is blurry or the text is insufficient, you must return a JSON with "status": "error".
3.  **Toxic Check**: Check for species-specific toxic ingredients (e.g., Xylitol for dogs, Lilies for cats) and flag them with the highest priority in the 'caution' section.
4.  **All Life Stages Food**: If a product is for "all life stages", it's usually formulated for puppies/kittens (the most demanding stage). You MUST explain the pros and cons for different life stages in the 'expertInsight' section. For example, it might be too high in calories for a less active adult or senior pet.

# Input Data
- Product Name: {{{productName}}}
- Brand: {{{brandName}}}
- Food Type: {{{foodType}}}
{{#if ingredientsText}}
- Ingredients Text: {{{ingredientsText}}}
{{/if}}
{{#if photoDataUri}}
- Product Image: {{media url=photoDataUri}} (Use OCR to extract info. This is the primary source.)
{{/if}}

# Task: Generate a valid JSON object based on the new, friendly output schema.

- **status**: "success" if analysis is possible, "error" if not.
- **productInfo**: Detect name and brand. Fallback to user input or '미확인'.
- **summary.hashtags**: Create three short, witty hashtags that capture the product's identity. (e.g., #활동량_많은_아이용, #고기함량_깡패, #관절튼튼_필수템)
- **summary.safetyRating**: "Green", "Yellow", or "Red" based on overall safety.
- **topIngredients**: Extract the first 5 ingredients from the ingredient list.
- **ingredientsAnalysis.positive**: List up to 3 best ingredients.
  - "keyword": A benefit-oriented, catchy phrase. (e.g., "소화가 편안해요")
  - "name": The ingredient name.
  - "description": An easy one-line explanation for parents. (e.g., "입자가 작은 단백질이라 알러지 걱정을 덜어주는 착한 성분이에요.")
- **ingredientsAnalysis.caution**: List ALL potentially risky ingredients.
  - "keyword": A risk-oriented, intuitive phrase. (e.g., "알러지 유발 가능")
  - "name": The ingredient name.
  - "description": An easy one-line explanation of the risk. (e.g., "강아지에 따라 소화가 어렵거나 알러지 반응이 있을 수 있는 곡물이에요.")
- **nutritionFacts.comment**: Based on the guaranteed analysis, provide a friendly and comprehensive summary of the overall nutritional balance. Explain what the protein and fat levels mean in practical terms and for which types of pets (e.g., active, senior, growing) this food is suitable. Avoid jargon. (e.g., "단백질과 지방 함량이 높아 활동량이 많은 아이나 성장기 아이에게 좋은 에너지원이 될 수 있어요. 하지만 칼로리가 높은 편이라, 실내 생활 위주의 반려견이나 체중 조절이 필요한 경우 급여량 조절에 신경 써주시는 게 좋아요.")
- **expertInsight**: Break down the final advice into three simple, actionable points.
  - "goodPoint": The single best thing about this food.
  - "cautionPoint": The one thing to be most careful about.
  - "proTip": A practical "honey tip" from a vet.
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
          summary: { hashtags: ['#분석오류'], safetyRating: 'Red' },
          topIngredients: [],
          ingredientsAnalysis: { positive: [], caution: [] },
          nutritionFacts: { comment: 'AI 모델이 분석 결과를 생성하지 못했어요.' },
          expertInsight: {
              goodPoint: 'AI 모델에 문제가 생겨 좋은 점을 찾지 못했어요.',
              cautionPoint: '분석 중 오류가 발생해 주의할 점을 알려드릴 수 없어요.',
              proTip: '입력 내용을 확인하고 다시 시도해주시거나, 잠시 후 이용해주세요!'
          }
      };
    }
    
    return output;
  }
);
