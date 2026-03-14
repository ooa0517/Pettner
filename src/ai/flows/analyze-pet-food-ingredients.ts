
'use server';

/**
 * @fileOverview [Pettner Core Engine v21.0 - Deterministic Analysis Mode]
 * - Provides consistent scoring and matching based on AAFCO/NRC standards.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).describe('분석 모드: 일반 분석 vs 맞춤 분석'),
  productName: z.string().optional().describe('제품명'),
  productCategory: z.enum(['food', 'treat', 'supplement']).optional().describe('제품 카테고리'),
  detailedProductType: z.string().optional().describe('세부 제품 유형'),
  photoDataUri: z.string().optional().describe("라벨 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어"),
  petProfile: z.object({
    name: z.string().optional(),
    gender: z.enum(['male', 'female', 'unknown']).optional(),
    breed: z.string().optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    neutered: z.enum(['yes', 'no', 'unknown']).optional(),
    bcs: z.string().optional(),
    activityLevel: z.string().optional(),
    walkingTime: z.string().optional(),
    livingEnvironment: z.string().optional(),
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
    })
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100),
    grade: z.string(),
    headline: z.string(),
    statusTags: z.array(z.string()),
    scoringBasis: z.string(),
  }),
  matchingReport: z.object({
    matchScore: z.number().min(0).max(100).optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    suitabilityVerdict: z.string().optional(),
  }).optional(),
  ingredientAnalysis: z.object({
    ingredientList100: z.array(z.object({
      name: z.string(),
      category: z.enum(['positive', 'neutral', 'cautionary']),
      reason: z.string(),
      safetyRating: z.string().optional()
    })),
    suitabilityAudit: z.object({
      suitableFor: z.array(z.string()),
      notSuitableFor: z.array(z.string()),
      unsuitableReasons: z.string()
    })
  }),
  scientificAnalysis: z.object({
    nutrientMass: z.object({
      protein_g: z.number(),
      fat_g: z.number(),
      carbs_g: z.number(),
      kcal: z.number()
    }),
    comparativeChart: z.array(z.object({
      nutrient: z.string(),
      productValue: z.number(),
      standardMin: z.number(),
      standardMax: z.number().optional()
    }))
  }),
  feedingGuide: z.object({
    productPurpose: z.string(),
    feedingTable: z.array(z.object({
      weightRange: z.string(),
      lowActivityGrams: z.string(),
      highActivityGrams: z.string(),
      totalKcalRange: z.string()
    })).optional()
  }),
  esgReport: z.object({
    transparencyStatus: z.enum(['DIRECT', 'OEM_LOW', 'OEM_PREMIUM']),
    environmental: z.string(),
    recallHistory: z.string(),
    certifications: z.array(z.string())
  }),
  veterinaryAdvice: z.string()
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are a world-class Veterinary Nutritionist.
Target Language: {{{language}}}.

### [Scoring Rubric (Deterministic)]
1. Start at 100 points.
2. Deduct 15 pts if not AAFCO compliant.
3. Deduct 5 pts per cautionary ingredient.
4. Deduct 10 pts if Carbs > 40% (for cat) or > 50% (for dog).
5. Add 5 pts for high-quality single source protein (e.g., Deboned Chicken).

### [AAFCO Standards]
- Dog Adult Min: Protein 18%, Fat 5.5%
- Cat Adult Min: Protein 26%, Fat 9%

### [Analysis Focus]
{{#if (eq analysisMode "general")}}
- Focus on the product's objective quality and brand transparency.
- Provide a Grade (A-F) based on the score.
{{else}}
- Focus on the match between the product and {{{petProfile.name}}}.
- Calculate Match Score (%) based on allergies ({{{petProfile.allergies}}}) and health ({{{petProfile.healthConditions}}}).
- Provide advice addressing the pet by name.
{{/if}}

Product Context: {{{productName}}} ({{{productCategory}}})
Pet Profile: {{{petProfile.name}}}, {{{petProfile.breed}}}, {{{petProfile.age}}}yo, {{{petProfile.weight}}}kg.
Photo Provided: {{#if photoDataUri}}Yes{{else}}No{{/if}}`,
});

const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async (input) => {
    try {
      const response = await analyzePetFoodIngredientsPrompt(input);
      if (!response || !response.output) throw new Error('AI failed to return output.');
      return { ...response.output, status: 'success' as const };
    } catch (error: any) {
      console.error("AI Flow Error:", error);
      throw new Error(`분석 실패: ${error.message}`);
    }
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}
