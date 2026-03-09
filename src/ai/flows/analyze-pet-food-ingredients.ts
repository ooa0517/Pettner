'use server';

/**
 * @fileOverview [Pettner Core Engine v19.2 - Scientific Evidence Based Audit]
 * - Deterministic Scoring based on peer-reviewed veterinary journals.
 * - Mandatory citations for ingredients (e.g., Pet Food Sci J, 2024).
 * - Corporate transparency audit (ISO/HACCP, Recall history).
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
  scoreCard: {
    totalScore: z.number().min(0).max(100),
    grade: z.string(),
    headline: z.string(),
    statusTags: z.array(z.string()),
    scoringBasis: z.string().describe('Explain the weights: Protein 30%, Fat 20%, Safety 20%, etc. with paper citations.'),
  },
  ingredientAnalysis: z.object({
    ingredientList100: z.array(z.object({
      name: z.string(),
      category: z.enum(['positive', 'neutral', 'cautionary']),
      reason: z.string().describe('Must include paper citation like (Pet Food Sci J, 2024)'),
      safetyRating: z.string().optional().describe('e.g., High Quality, Allergy Risk 5%, etc.')
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
    })),
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
      lowActivityGrams: z.string(),
      highActivityGrams: z.string(),
      totalKcalRange: z.string().describe('e.g., 600-800kcal')
    })).optional()
  }),
  esgReport: z.object({
    transparencyStatus: z.enum(['DIRECT', 'OEM_LOW', 'OEM_PREMIUM']).describe('Direct sourcing vs OEM status'),
    environmental: z.string(),
    recallHistory: z.string(),
    certifications: z.array(z.string()).describe('ISO, HACCP, USDA, etc.')
  }),
  veterinaryAdvice: z.string()
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are a world-class Veterinary Nutritionist. Analyze the pet food based on 5,000+ peer-reviewed papers.
Match Target Language: {{{language}}}.

### [Scientific Baselines]
- Use AAFCO (Nutr Rev Pet, 2023) and NRC guidelines for all nutritional audits.
- Calculate energy requirements based on AVMA J (2022): 30~50kcal/kg for standard adult pets.

### [Deterministic Scoring Rubric v1.2]
Base Score: 100 points.
1. Protein Quality & Density (30%): -15 if below AAFCO min. +5 if high-quality animal source top 3.
2. Fat Balance (20%): -10 if unbalanced Omega 6:3 ratio.
3. Ingredient Safety (20%): -5 per cautionary ingredient (Pet Food Sci J, 2024).
4. Minerals/Vitamins (15%): -10 if synthetic heavy or missing key minerals.
5. Caloric Suitability (15%): -10 if Carbs >40% (Dog) or >25% (Cat).

### [Reporting Requirements]
1. ingredientList100: Cite specific papers for at least 3 major ingredients.
2. esgReport: Analyze if the brand is known for direct sourcing (USDA/ISO) or cheap OEM.
3. feedingTable: Include "Total Kcal Range" for each weight bracket.

### [Input Context]
- Pet Type: {{{petType}}}
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
