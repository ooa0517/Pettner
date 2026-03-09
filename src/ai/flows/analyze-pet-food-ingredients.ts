'use server';

/**
 * @fileOverview [Pettner Core Engine v21.0 - Hybrid Analysis Mode]
 * - Mode A: General Product Audit (Standard AAFCO/ESG focused)
 * - Mode B: Custom Pet Matching (Tailored interaction focused)
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
  // 일반 분석용 점수 카드
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100),
    grade: z.string(),
    headline: z.string(),
    statusTags: z.array(z.string()),
    scoringBasis: z.string(),
  }),
  // 맞춤 분석 전용 매칭 리포트
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
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are a world-class Veterinary Nutritionist.
Match Target Language: {{{language}}}.

### [Selected Mode: {{#if isModeGeneral}}GENERAL PRODUCT AUDIT{{else}}CUSTOM PET MATCHING{{/if}}]

{{#if isModeGeneral}}
### [Mode A: General Product Audit Instructions]
- Focus on objective product quality and AAFCO compliance.
- ScoreCard: Standard scoring based on ingredient density and safety.
- scientificAnalysis: Compare against standard AAFCO adult maintenance ranges.
- feedingGuide: Standard weight-based table.
{{else}}
### [Mode B: Custom Pet Matching Instructions]
- Focus on the interaction between product and {{{petProfile.name}}} ({{{petProfile.breed}}}, {{{petProfile.age}}}yo, {{{petProfile.weight}}}kg).
- matchingReport: Calculate a Match Score (%) based on how well this food fits the pet's health conditions: {{{petProfile.healthConditions}}} and allergies: {{{petProfile.allergies}}}.
- veterinaryAdvice: Must address the pet by name and give specific advice for their condition.
- feedingGuide: Calculate specific grams for this pet's exact weight.
{{/if}}

### [Scientific Baselines]
- NRC/AAFCO Guidelines (Nutr Rev Pet, 2023).
- Calorie calculation (AVMA J, 2022): 30~50kcal/kg.

### [Input Context]
- Pet Type: {{{petType}}}
- Product: {{{productName}}} ({{{productCategory}}})
{{#if photoDataUri}}- Label Photo Provided{{/if}}`,
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
