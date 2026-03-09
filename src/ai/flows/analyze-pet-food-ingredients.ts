'use server';

/**
 * @fileOverview [Pettner Core Engine v16.0 - Advanced Analysis]
 * - AAFCO 기준 대비 영양 성분 분석 데이터 추가.
 * - 원재료 분석 및 급여 가이드 로직 강화.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. 입력 데이터 규칙 (Input Schema)
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

// 2. 출력 데이터 규칙 (Output Schema)
const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string().describe('Identified product name'),
    brand: z.string().describe('Brand name'),
    category: z.string().describe('Category'),
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
  // 원재료 분석 데이터
  ingredientAnalysis: z.object({
    ingredientList100: z.array(z.object({
      name: z.string(),
      category: z.enum(['positive', 'neutral', 'cautionary']),
      reason: z.string().describe('Scientific reason for category')
    })).describe('Analysis of 100% of the visible ingredients on the label'),
    suitabilityAudit: z.object({
      suitableFor: z.array(z.string()).describe('List of pet types/conditions this is good for'),
      notSuitableFor: z.array(z.string()).describe('List of pet types/conditions this is bad for'),
      unsuitableReasons: z.string().describe('Clear warning why it might be unsuitable')
    })
  }),
  // 영양 분석 데이터
  scientificAnalysis: z.object({
    nutrientMass: z.object({
      protein_g: z.number(),
      fat_g: z.number(),
      carbs_g: z.number(),
      kcal: z.number()
    }),
    aafcoComparison: z.array(z.object({
      nutrient: z.string().describe('e.g., Crude Protein, Calcium'),
      unit: z.string().describe('e.g., %, mg/kg'),
      productValue: z.number(),
      aafcoMin: z.number().optional(),
      aafcoMax: z.number().optional(),
      status: z.enum(['pass', 'fail', 'optimal'])
    })).describe('Comparison against AAFCO nutritional profiles for dogs/cats'),
    dogSpecific: z.object({
      breedRiskMatching: z.string()
    }).optional(),
    catSpecific: z.object({
      taurineCheck: z.string()
    }).optional()
  }),
  // 급여 가이드
  feedingGuide: z.object({
    productPurpose: z.string().describe('Summary of what the product is for'),
    feedingTable: z.array(z.object({
      weightRange: z.string().describe('e.g., 1-5kg'),
      lowActivityGrams: z.string().describe('e.g., 50-100g'),
      highActivityGrams: z.string().describe('e.g., 60-120g')
    })).optional()
  }),
  // 맞춤 분석 전용 데이터 (Mode: Custom)
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

// 3. AI 프롬프트 정의
const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are a world-class Veterinary Nutritionist. Analyze the pet food based on the provided data.
Match Target Language: {{{language}}}.

# [Operation Mode]
- Mode: {{#if isModeGeneral}}PRODUCT ANALYSIS ONLY (General Mode){{else}}PERSONALIZED CUSTOM ANALYSIS (Custom Mode){{/if}}

# [Input Data Context]
- Pet Type: {{{petType}}}
{{#if isModeCustom}}
- Profile: Breed {{{petProfile.breed}}}, Gender {{{petProfile.gender}}}, Age {{{petProfile.age}}}, Weight {{{petProfile.weight}}}kg, BCS {{{petProfile.bcs}}}
- Medical: Health Conditions ({{#each petProfile.healthConditions}}{{{this}}}, {{/each}}), Allergies ({{#each petProfile.allergies}}{{{this}}}, {{/each}})
- Medications: {{{petProfile.medications}}}
{{/if}}
- Product: {{{productName}}} ({{{productCategory}}} - {{{detailedProductType}}})

# [Instructions]
1. **100% Ingredient Analysis**: Analyze every single ingredient shown on the photo. Categorize into 'positive' (Good), 'neutral' (Safe but no major benefit), or 'cautionary' (Risk factors). Provide clear scientific reasons.
2. **AAFCO Comparison Table**: Provide a table comparing core nutrients (Protein, Fat, Calcium, Phosphorus, etc.) against AAFCO minimum/maximum standards for the specific pet type and life stage.
3. **Feeding Table**: Create a robust feeding table for various weight ranges showing suggested daily grams for 'Low Activity' vs 'High Activity'.
4. **Product Purpose**: Summarize the core goal of this product.
5. **Suitability Audit**: Explicitly state who should NOT eat this. List medical conditions that are contraindications.

# [Multimodal Analysis]
{{#if photoDataUri}}
- Food Label Photo: {{media url=photoDataUri}}
{{/if}}
{{#if prescriptionPhotoDataUri}}
- Prescription/Supplement Photo: {{media url=prescriptionPhotoDataUri}}
{{/if}}`,
});

// 4. 실행 흐름 정의
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

      if (!response || !response.output) {
        throw new Error('AI failed to return analysis output.');
      }

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
