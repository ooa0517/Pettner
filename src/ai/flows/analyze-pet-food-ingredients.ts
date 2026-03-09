'use server';

/**
 * @fileOverview [Pettner Core Engine v18.0 - Deterministic Scoring & Nutrition Audit]
 * - 고정된 스코어링 알고리즘(Pettner Scoring Rubric v1.0) 도입으로 결과 일관성 확보.
 * - AAFCO 표준 수치 명문화로 비교 그래프의 기준점 고정.
 * - 권장 성분 리스트 추출 로직 강화 (누락 없는 전수 조사).
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
      suitableFor: z.array(z.string()).describe('List of all positive and functional ingredients found'),
      notSuitableFor: z.array(z.string()).describe('List of all allergens or cautionary ingredients found'),
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
      nutrient: z.string().describe('Protein, Fat, Carbs'),
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

### [AAFCO Standards Fixed Baselines (Dry Matter %)]
Use these fixed values for comparison charts to ensure consistency:
- **Adult Dog**: Protein Min: 18%, Fat Min: 5%
- **Puppy/Repro Dog**: Protein Min: 22.5%, Fat Min: 8.5%
- **Adult Cat**: Protein Min: 26%, Fat Min: 9%
- **Kitten/Repro Cat**: Protein Min: 30%, Fat Min: 9%
- **Carbs (NFE)**: No official AAFCO min, but Pettner Ideal is <40% (Dogs) / <25% (Cats).

### [Pettner Scoring Rubric v1.0 - MANDATORY DETERMINISTIC CALCULATION]
Calculate 'totalScore' (0-100):
1. **Base**: 100 points.
2. **Deductions**:
   - AAFCO Major Nutrient Fail: -15 pts each.
   - Cautionary Ingredient: -5 pts each (max -30).
   - High Carb (>40% Dog / >25% Cat): -10 pts.
   - Health/Allergy Mismatch: -15 pts.
3. **Bonuses**:
   - Specific Animal Protein in top 3: +5 pts.
   - Functional Additive (Probiotics, Glucosamine, Omega-3): +2 pts each (max +10).

### [Instructions for Comprehensive Audit]
1. **ingredientList100**: Extract and categorize EVERY ingredient from the label.
2. **suitableFor**: This MUST include ALL positive ingredients found (e.g., "Chicken", "Salmon Oil", "Taurine", "Probiotics", "Lutein"). Do not summarize too much; provide a rich list.
3. **comparativeChart**: Must include "Protein", "Fat", and "Carbs". The 'standardMin' and 'standardMax' must be consistent with the AAFCO baselines provided above.
4. **feedingTable**: Calculate grams based on product density. Include kcal in brackets: "50-100g (150-300 kcal)".

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
