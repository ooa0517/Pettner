
'use server';

/**
 * @fileOverview [Pettner V19.2 - Full Medical Integration]
 * - Added: gender, neutered, walkingTime, livingEnvironment, waterIntake, stoolCondition, medications to InputSchema.
 * - Updated: Prompt to perform deep metabolic and interaction analysis.
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
    walkingTime: z.string().optional().describe('산책 시간(강아지)'),
    livingEnvironment: z.string().optional().describe('생활 환경(고양이)'),
    healthConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    waterIntake: z.string().optional(),
    stoolCondition: z.string().optional(),
    medications: z.string().optional().describe('복용 중인 약물/영양제 직접 입력'),
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
    match_score: z.number().optional().describe('아이의 건강 상태와 제품의 적합도 점수'),
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
  veterinaryAdvice: z.string().describe('사용자를 위한 수의학적 조언'),
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
Your goal is to provide a highly professional veterinary nutrition report based on the provided input.

# [Metabolic Profile]
- Gender: {{{petProfile.gender}}}
- Neutered: {{{petProfile.neutered}}}
- Breed: {{{petProfile.breed}}}
- Age: {{{petProfile.age}}} years
- Weight: {{{petProfile.weight}}} kg
- BCS: {{{petProfile.bcs}}} (1: Thin, 3: Ideal, 5: Obese)
- Activity: {{{petProfile.walkingTime}}} (dog) / {{{petProfile.livingEnvironment}}} (cat)
- Health Concerns: {{#each petProfile.healthConditions}}{{{this}}}, {{/each}}
- Allergies: {{#each petProfile.allergies}}{{{this}}}, {{/each}}
- Current Medications/Supplements: {{{petProfile.medications}}}
- Stool/Water: {{{petProfile.stoolCondition}}} / {{{petProfile.waterIntake}}}

# [Diagnostic Protocol]
1. **Caloric Calculation**: Use RER/DER adjusted by neutered status and activity level.
2. **Medical Interaction**: If medications/supplements are provided (text or photo), check for interactions with food ingredients (e.g., sodium levels vs heart meds).
3. **Weight Diagnosis**: Based on breed, age, and weight, provide an ideal weight and diet roadmap.
4. **Allergy Check**: Match identified ingredients with the pet's allergy list.
5. **Score Card**: totalScore (General quality) vs match_score (Personalized suitability for THIS pet).

Response MUST be in pure JSON format ONLY. 
Language: {{{language}}}

{{#if photoDataUri}}Food Photo: {{media url=photoDataUri}}{{/if}}
{{#if prescriptionPhotoDataUri}}Prescription/Supplement Photo: {{media url=prescriptionPhotoDataUri}}{{/if}}`
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
