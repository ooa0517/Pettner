
'use server';

/**
 * @fileOverview [Pettner V19.2 - Gender Integration]
 * - Added: gender in petProfile for hormonal metabolic analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).describe('분석 모드'),
  productName: z.string().optional().describe('제품명'),
  productCategory: z.enum(['food', 'treat', 'supplement']).describe('제품 대분류'),
  detailedProductType: z.string().optional().describe('세부 유형'),
  
  photoDataUri: z.string().optional().describe("사료 라벨 사진 데이터 URI"),
  prescriptionPhotoDataUri: z.string().optional().describe("처방전 또는 영양제 라벨 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어"),
  petProfile: z.object({
    name: z.string().optional(),
    gender: z.enum(['male', 'female', 'unknown']).optional().describe('성별'),
    breed: z.string().optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    neutered: z.enum(['yes', 'no', 'unknown']).optional().describe('중성화 여부'),
    bcs: z.string().optional(),
    activityLevel: z.string().optional(),
    walkingTime: z.string().optional(),
    livingEnvironment: z.enum(['INDOOR', 'OUTDOOR', 'BOTH', 'UNKNOWN']).optional(),
    healthConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    waterIntake: z.string().optional(),
    stoolCondition: z.string().optional(),
    medications: z.string().optional(),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string(),
    brand: z.string(),
    category: z.string(),
    pettnerCompliance: z.object({
      isCompliant: z.boolean(),
      reason: z.string()
    }),
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100),
    headline: z.string(),
    statusTags: z.array(z.string()),
    grade: z.string().optional()
  }),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number(),
    weightGap: z.number(),
    breedStandardRange: z.string(),
    overweightPercentage: z.number(),
    verdict: z.string()
  }).optional(),
  dietRoadmap: z.array(z.object({
    weight: z.number(),
    grams: z.number(),
    phase: z.string()
  })).optional(),
  scientificAnalysis: z.object({
    nutrientMass: z.object({
      protein_g: z.number(),
      fat_g: z.number(),
      carbs_g: z.number(),
      kcal: z.number()
    }),
    catSpecific: z.object({
      taurineCheck: z.string().optional(),
    }).optional(),
    dogSpecific: z.object({
      breedRiskMatching: z.string().optional(),
    }).optional()
  }),
  veterinaryAdvice: z.string(),
  esgReport: z.object({
    environmental: z.string(),
    corporateEthics: z.string(),
    recallHistory: z.string()
  })
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are the Pettner V19.2 Medical Diagnostic AI Auditor.
Response MUST be in pure JSON format ONLY.

# [Metabolic Profile]
- Gender: {{{petProfile.gender}}}
- Neutered: {{{petProfile.neutered}}}
- Breed: {{{petProfile.breed}}}
- Activity: {{{petProfile.walkingTime}}} in {{{petProfile.livingEnvironment}}} environment.

# [Diagnostic Protocol]
- Analyze the synergy between food ingredients and current pet status.
- Consider interaction with identified medications if prescription image is provided.
- Adjust RER/DER based on hormonal status (gender + neutered).

Language: {{{language}}}
{{#if photoDataUri}}Food Photo: {{media url=photoDataUri}}{{/if}}
{{#if prescriptionPhotoDataUri}}Prescription Photo: {{media url=prescriptionPhotoDataUri}}{{/if}}`
});

const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async (input) => {
    const response = await analyzePetFoodIngredientsPrompt(input);
    if (!response || !response.output) {
      throw new Error('AI failed to return valid analysis JSON.');
    }
    return { ...response.output, status: 'success' as const };
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}
