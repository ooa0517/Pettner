
'use server';

/**
 * @fileOverview [Pettner V16.0 - Hyper-Personalized Veterinary Audit Engine]
 * - Dog vs Cat: Logic based on NRC/AAFCO research papers.
 * - NEW: Incorporates Activity Level, Allergies, Water Intake, and Stool Condition.
 * - Genetic & Life-stage Precision matching.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. 입력 데이터 규격
const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).describe('분석 모드'),
  productName: z.string().optional().describe('제품명'),
  foodType: z.enum(['dry', 'wet', 'treat', 'supplement']).optional().describe('제품 유형'),
  photoDataUri: z.string().optional().describe("라벨 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어 (ko, en)"),
  petProfile: z.object({
    name: z.string().optional(),
    breed: z.string().optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    neutered: z.boolean().optional(),
    bcs: z.string().optional(),
    activityLevel: z.string().optional(),
    weightChange: z.string().optional(),
    healthConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    waterIntake: z.string().optional(),
    stoolCondition: z.string().optional(),
    medications: z.string().optional(),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

// 2. 출력 데이터 규격
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
    manufacturingAudit: z.object({
      productionType: z.string(),
      facilitySafety: z.string(),
      sourcingOrigin: z.string()
    })
  }),
  scoreCard: {
    totalScore: z.number().min(0).max(100),
    headline: z.string(),
    statusTags: z.array(z.string()),
    grade: z.string().optional()
  },
  scientificAnalysis: z.object({
    catSpecific: z.object({
      taurineCheck: z.string().optional(),
      arginineCheck: z.string().optional(),
      kidneyHealthMatching: z.string().optional(), // Water intake consideration
    }).optional(),
    dogSpecific: z.object({
      omnivorousBalance: z.string().optional(),
      jointHealthMatching: z.string().optional(), // Activity/BCS consideration
    }).optional(),
    nutrientMass: z.object({
      protein_g: z.number(),
      fat_g: z.number(),
      carbs_g: z.number(),
      kcal: z.number()
    })
  }),
  esgReport: z.object({
    environmental: z.string(),
    corporateEthics: z.string(),
    recallHistory: z.string()
  }),
  veterinaryAdvice: z.string(),
  allergyWarning: z.string().optional().describe('알러지 성분 포함 여부 및 경고')
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

// 3. AI 시스템 프롬프트
const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are the Pettner V16.0 Global Scientific AI Auditor.
Response MUST be in pure JSON format ONLY.

# [V16.0 Hyper-Personalization Protocol]

## 1. Species-Specific Nutrition
- IF petType === 'cat': Critical focus on Arginine/Taurine and moisture balance. If waterIntake is 'LOW', emphasize wet food or hydration-friendly ingredients.
- IF petType === 'dog': Balance amino acids with activity levels. High activity requires higher caloric density and joint support (Glucosamine/Chondroitin).

## 2. Advanced Profile Integration
- **Activity Level:** Adjust kcal recommendations and nutrient density based on activity (Sedentary vs Active).
- **Allergies:** Cross-check the ingredient list with provided allergies ({{{petProfile.allergies}}}). If a match is found, flag it in 'allergyWarning' and lower the score.
- **Stool/Digestion:** If stoolCondition is 'SOFT' or 'DIARRHEA', audit for high fiber or probiotics.
- **BCS & Weight:** If BCS is 4 or 5, audit for low glycemic index (GI) ingredients and higher protein/fiber to fat ratio.

## 3. Mathematical Integrity
- Formula: Nutrient(g) = (Total_Daily_Amount * %) / 100.
- Sum of (P+F+C) must NOT exceed total mass.

## 4. ESG & Corporate Audit
- Trace manufacturing origin and recall history.

Language: {{{language}}} (ALL text must be in this language)
Pet: {{{petType}}}, Mode: {{{analysisMode}}}
Profile: {{{petProfile.name}}}, Breed: {{{petProfile.breed}}}, Age: {{{petProfile.age}}}, Weight: {{{petProfile.weight}}}kg
Activity: {{{petProfile.activityLevel}}}, BCS: {{{petProfile.bcs}}}, Allergies: {{{petProfile.allergies}}}
{{#if photoDataUri}}
- Perform OCR on the provided image to extract ingredients and guaranteed analysis.
{{/if}}`
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
