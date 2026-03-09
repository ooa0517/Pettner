'use server';

/**
 * @fileOverview [Pettner Core Engine v18.0 - Deterministic Scoring & Nutrition Audit]
 * - 고정된 스코어링 알고리즘(Pettner Scoring Rubric v1.0) 도입으로 결과 일관성 확보.
 * - AAFCO 표준 및 영양소 밀도 기반의 정밀 계산 로직 강화.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).describe('분석 모드'),
  productName: z.string().optional().describe('제품명'),
  productCategory: z.enum(['food', 'treat', 'supplement']).optional().describe('제품 카테고리'),
  detailedProductType: z.string().optional().describe('세부 제품 유형'),
  photoDataUri: z.string().optional().describe("라벨 사진 데이터 URI"),
  prescriptionPhotoDataUri: z.string().optional().describe("처방전 또는 영양제 사진 데이터 URI"),
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

const PromptInputSchema = AnalyzePetFoodIngredientsInputSchema.extend({
  isModeGeneral: z.boolean(),
  isModeCustom: z.boolean(),
});

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
    headline: z.string(),
    grade: z.string().optional(),
    statusTags: z.array(z.string())
  }),
  ingredientAnalysis: z.object({
    ingredientList100: z.array(z.object({
      name: z.string(),
      category: z.enum(['positive', 'neutral', 'cautionary']),
      reason: z.string()
    })),
    suitabilityAudit: z.object({
      suitableFor: z.array(z.string()),
      notSuitableFor: z.array(z.string()),
      unsuitableReasons: z.string()
    })
  }),
  scientificAnalysis: z.object({
    nutrientMass: z.object({
      protein_g: z.number().describe('Product Protein %'),
      fat_g: z.number().describe('Product Fat %'),
      carbs_g: z.number().describe('Product Carbs %'),
      kcal: z.number()
    }),
    comparativeChart: z.array(z.object({
      nutrient: z.string().describe('e.g., Protein, Fat, Carbs'),
      productValue: z.number(),
      standardMin: z.number(),
      standardMax: z.number().optional()
    })).describe('Data for side-by-side comparison chart against AAFCO standards'),
    aafcoComparison: z.array(z.object({
      nutrient: z.string(),
      unit: z.string(),
      productValue: z.number(),
      aafcoMin: z.number().optional(),
      aafcoMax: z.number().optional(),
      status: z.enum(['pass', 'fail', 'optimal'])
    }))
  }),
  feedingGuide: z.object({
    productPurpose: z.string(),
    feedingTable: z.array(z.object({
      weightRange: z.string(),
      lowActivityGrams: z.string().describe('e.g., 50-100g (150-300 kcal)'),
      highActivityGrams: z.string().describe('e.g., 70-120g (210-360 kcal)')
    })).optional()
  }),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number(),
    breedStandardRange: z.string(),
    overweightPercentage: z.number(),
    verdict: z.string()
  }).optional(),
  dietRoadmap: z.array(z.object({
    phase: z.string(),
    weight: z.number(),
    grams: z.number()
  })).optional(),
  esgReport: z.object({
    environmental: z.string(),
    recallHistory: z.string()
  }),
  veterinaryAdvice: z.string()
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are a world-class Veterinary Nutritionist. Analyze the pet food based on the provided data.
Match Target Language: {{{language}}}. (If 'ko', all output strings must be in Korean).

### [Pettner Scoring Rubric v1.0 - MANDATORY DETERMINISTIC CALCULATION]
To ensure consistency, you MUST calculate the 'totalScore' using this exact logic:
1. **Base Score**: 100 points.
2. **Deductions**:
   - **AAFCO Non-compliance**: -15 points for each major nutrient (Protein, Fat) outside the AAFCO range for the pet's life stage.
   - **Cautionary Ingredients**: -5 points for each 'cautionary' ingredient identified (e.g., artificial colors, unspecified by-products, high-glycemic fillers like tapioca).
   - **High Carb Penalty**: If Carbs (NFE) > 40% (for dogs) or > 25% (for cats), deduct 10 points.
   - **Health Mismatch**: If the product contains ingredients known to trigger the pet's listed allergies or worsen listed health conditions, deduct 15 points.
3. **Bonuses**:
   - **High-Quality Protein**: If the top 3 ingredients are specific animal proteins (e.g., Deboned Chicken), add 5 points.
   - **Functional Additives**: +2 points for each functional additive like Probiotics, Glucosamine, or Omega-3 (max +10).
4. **Final Grade Mapping**:
   - 90-100: A (Optimal)
   - 80-89: B (Good)
   - 70-79: C (Fair)
   - <70: D or F (Caution)

### [Instructions for Report Generation]
1. **Comparative Chart**: Provide Protein, Fat, and Carbs vs AAFCO standards for {{{petType}}}. Ensure 'productValue' matches the detected label data exactly.
2. **Feeding Table**: Each entry MUST include the calorie range in brackets. Example: "50-100g (150-300 kcal)". Calculate this based on the product's kcal/kg density.
3. **Ingredient Audit**: List 100% of detected ingredients. categorize as positive, neutral, or cautionary with clear scientific reasons.
4. **Suitability**: Explicitly state if it's unsuitable for certain pets (e.g., "Not suitable for cats" or "Avoid for pets with kidney issues").

### [Input Context]
- Pet Type: {{{petType}}}
{{#if isModeCustom}}
- Profile: Breed {{{petProfile.breed}}}, Age {{{petProfile.age}}}, Weight {{{petProfile.weight}}}kg, BCS {{{petProfile.bcs}}}, Health ({{#each petProfile.healthConditions}}{{{this}}}, {{/each}})
{{/if}}
- Product: {{{productName}}} ({{{productCategory}}})

{{#if photoDataUri}}
- Label Photo: {{media url=photoDataUri}}
{{/if}}`,
});

const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async (input) => {
    try {
      const response = await analyzePetFoodIngredientsPrompt({
        ...input,
        isModeGeneral: input.analysisMode === 'general',
        isModeCustom: input.analysisMode === 'custom',
      });
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
