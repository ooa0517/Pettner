
'use server';

/**
 * @fileOverview Analyzes pet food ingredients from an image, providing a comprehensive, user-friendly report.
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
    hashtags: z.array(z.string()).describe("Three hashtags that summarize the product's identity. e.g., ['#고기함량_깡패', '#관절튼튼', '#체중조절용']")
  }),
  allIngredients: z.array(z.string()).describe("A complete list of all ingredients found on the label."),
  pros: z.array(z.string()).describe("A list of key benefits of this product, explained in an easy-to-understand way."),
  cons: z.array(z.string()).describe("A list of potential drawbacks or points of caution for this product, explained in an easy-to-understand way."),
  radarChart: z.array(z.object({
      attribute: z.string().describe("The attribute being scored."),
      score: z.number().min(1).max(5).describe("A score from 1 (Not suitable) to 5 (Highly suitable).")
  })).describe("Data for a radar chart. You MUST provide scores for these 5 exact attributes in Korean: '피부/모질', '소화기 건강', '체중 관리', '관절 강화', '활동 에너지'."),
  feedingGuide: z.object({
      puppy: z.array(z.object({
          weight: z.string().describe("Weight range in kg, e.g., '1-5kg'"),
          amount: z.string().describe("Recommended daily amount in grams, e.g., '80-120g'"),
      })).optional(),
      adult: z.array(z.object({
          weight: z.string().describe("Weight range in kg, e.g., '5-10kg'"),
          amount: z.string().describe("Recommended daily amount in grams, e.g., '100-150g'"),
      })).optional(),
      senior: z.array(z.object({
          weight: z.string().describe("Weight range in kg, e.g., '5-10kg'"),
          amount: z.string().describe("Recommended daily amount in grams, e.g., '90-130g'"),
      })).optional()
  }).describe("A guide for daily feeding amounts based on life stage and weight. Calculate based on estimated calories and general pet needs if not explicitly on the label. Provide at least 3 weight ranges per life stage."),
   expertInsight: z.object({
    proTip: z.string().describe("A practical tip for feeding, in a friendly tone.")
  })
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  if (!input.ingredientsText && !input.photoDataUri) {
      return {
          status: 'error',
          productInfo: { name: input.productName || '제품명 미확인', brand: input.brandName },
          summary: { hashtags: ['#분석불가'] },
          allIngredients: [],
          pros: [],
          cons: ["입력된 정보가 부족하여 분석할 수 없습니다."],
          radarChart: [],
          feedingGuide: {},
          expertInsight: {
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
- IMPORTANT: If the target is a DOG, check for ingredients like chocolate, xylitol, grapes, onions. If the target is a CAT, check for lilies, onions, garlic, excess phosphorus.
- Pet's Life Stage: {{#if lifeStage}}The pet is in the '{{{lifeStage}}}' stage. Your analysis should be tailored to this.{{/if}}
- Pet's Health: {{#if healthConditions}}The pet has pre-existing conditions: {{{healthConditions}}}. Your analysis MUST be extra gentle and considerate of these conditions.{{/if}}

# Analysis Rules
1.  **Safety First**: If the image is blurry or the text is insufficient, you must return a JSON with "status": "error".
2.  **All Ingredients**: You MUST extract and list ALL ingredients found on the label in 'allIngredients' field. Do not skip anything.
3.  **Toxic Check**: Check for species-specific toxic ingredients and list them in the 'cons' section.
4.  **All Life Stages Food**: If a product is for "all life stages", it's usually formulated for puppies/kittens. You MUST explain the pros and cons for different life stages in your analysis.

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
- **allIngredients**: List ALL ingredients extracted from the label, in the order they appear.
- **pros**: List 2-4 key benefits. Explain them simply. (e.g., "신선한 생선이 듬뿍 들어있어, 피부와 털을 반짝이게 하는 오메가3가 풍부해요.")
- **cons**: List 2-4 potential drawbacks. Explain them simply. (e.g., "단백질 함량이 높아 신장이 약한 아이에게는 부담이 될 수 있어요.")
- **radarChart**: Provide a score from 1 (not suitable) to 5 (highly suitable) for the following 5 attributes IN KOREAN: '피부/모질', '소화기 건강', '체중 관리', '관절 강화', '활동 에너지'. Your scoring should be based on the ingredients and nutritional profile.
- **feedingGuide**: Provide a daily feeding guide. If not on the label, estimate it. Provide at least 3 weight ranges for each life stage (puppy, adult, senior) if applicable.
- **expertInsight.proTip**: A single, practical "honey tip" from a vet.
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
          summary: { hashtags: ['#분석오류'] },
          allIngredients: [],
          pros: [],
          cons: ["AI 모델이 분석 결과를 생성하지 못했습니다."],
          radarChart: [],
          feedingGuide: {},
          expertInsight: {
            proTip: '입력 내용을 확인하고 다시 시도해주시거나, 잠시 후 이용해주세요!'
          }
      };
    }
    
    return output;
  }
);
