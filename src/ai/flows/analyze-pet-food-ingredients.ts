'use server';

/**
 * @fileOverview [Pettner Core Engine v12.0 - Strict Math & Obesity Logic]
 * 
 * - Mode A: [Product Scientist] - Focus on Manufacturing, Sourcing, ESG, and Spec.
 * - Mode B: [Pet Consultant] - Focus on Personalized Match, Obesity Logic, and Precise Dosage.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    healthConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const PromptInputSchema = AnalyzePetFoodIngredientsInputSchema.extend({
  isModeA: z.boolean().describe('단순 제품 분석 모드 여부'),
  isModeB: z.boolean().describe('맞춤 가이드 모드 여부'),
});

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string().describe('Exact identified product name'),
    brand: z.string().describe('Brand name'),
    category: z.string().describe('Category (e.g., Dry Food, Treat)'),
    qualityGrade: z.string().optional().describe('Quality grade (e.g., A, B, C)'),
    targetAudience: z.object({
      lifeStage: z.string().describe('Recommended life stage'),
      recommendedBreeds: z.string().describe('Optimal breed sizes'),
      focus: z.string().describe('Design focus/purpose')
    }).optional(),
    manufacturingDetails: z.object({
      productionType: z.string().describe('Production type (In-house/OEM/ODM)'),
      facilityInfo: z.string().describe('Facility info/Safety certifications'),
      sourcingOrigin: z.string().describe('Source of primary ingredients')
    }).optional()
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100).describe('Total score'),
    headline: z.string().describe('Core diagnostic headline'),
    statusTags: z.array(z.string()).describe('Status tags'),
    grade: z.string().optional().describe('Display grade (e.g., A+, B)')
  }),
  calculatorData: z.object({
    unitName: z.string().describe('Unit (g, oz, pill, piece)'),
    defaultAmount: z.number().describe('Default serving amount'),
    kcalPerUnit: z.number().describe('Calories per unit'),
    nutrientsPerUnit: z.object({
      protein: z.number().optional(),
      fat: z.number().optional(),
      carbs: z.number().optional()
    }).optional()
  }).optional(),
  personalMatching: z.object({
    matches: z.array(z.object({ feature: z.string(), reason: z.string() })),
    mismatches: z.array(z.object({ feature: z.string(), reason: z.string() }))
  }).optional(),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number().describe('Target ideal weight'),
    weightGap: z.number(),
    breedStandardRange: z.string().describe('Standard range for the breed'),
    breedGeneticInsight: z.string().describe('Genetic vulnerability insight'),
    overweightPercentage: z.number(),
    verdict: z.string()
  }).optional(),
  deepDive: z.object({
    ingredientAudit: z.object({
      tiers: z.array(z.object({
        level: z.string(),
        ingredients: z.array(z.string()),
        comment: z.string()
      })),
      giIndex: z.string(),
      giComment: z.string()
    }).optional(),
    nutritionalEngineering: z.object({
      ratios: z.object({
        caPRatio: z.string(),
        omega63Ratio: z.string(),
        balanceVerdict: z.string()
      })
    }).optional(),
    safetyToxicology: z.object({
      checks: z.array(z.object({ label: z.string(), status: z.boolean() })),
      recallHistory: z.string().describe('Brand recall and safety history')
    }).optional()
  }).optional(),
  feedingSummary: z.object({
    dailyAmount: z.string().describe('Total daily amount (e.g., 230.2g)'),
    perMealAmount: z.string().describe('Amount per meal (e.g., 115.1g)'),
    cupGuide: z.string().describe('Feeding guide in cups')
  }).optional(),
  veterinaryAdvice: z.string().describe('Final veterinary advice')
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are the world's most advanced Veterinary Nutritionist and Product Auditor.
Analyze the pet food product and provide a precision report in the TARGET LANGUAGE: {{{language}}}.

# [Pettner V12.0 Mandatory Execution: Strict Math & Logic]

## 1. Nutritional Mass Calculation (STRICT)
- Ensure all nutrient masses (Protein, Fat, Carbs) in 'g' are calculated as: 
  (Total_Daily_Amount * Ingredient_%) / 100.
- THE SUM OF NUTRIENT MASSES MUST NOT EXCEED THE TOTAL DAILY AMOUNT. 
- All numerical data must be Number types.

## 2. Weight & BCS Logic (Obesity Prevention)
- IF Pet BCS is 4 or 5, the status MUST be 'Obese' or 'Overweight'.
- NEVER describe an obese pet as 'maintaining ideal weight (BCS 3)'. 
- For Obese pets (BCS 4-5), set 'idealWeight' to be ~15-20% lower than current weight (Target: Current_Weight * 0.8).
- The 'verdict' must clearly state that weight loss is required due to health risks.

## 3. Feeding Guidance Clarity (Mode B)
- 'dailyAmount': Total daily recommended amount (e.g., "230.2g").
- 'perMealAmount': 'dailyAmount' divided by 2 (e.g., "115.1g").
- Language: Use Korean (한국어) and clear labels: [1일 권장 급여량], [1회 급여량].
- 'cupGuide': Standard paper cup (180ml) conversion for KO, Standard cup (240ml) for EN.

# [Logic Path Separation]
{{#if isModeA}}
## [Mode A: Product Scientist]
- Identify product name with 99% accuracy.
- Determine Manufacturer: In-house vs OEM/ODM.
- Audit primary ingredient origins (e.g., Norway, USA).
- Calculate Kcal and Nutrients per 100g.
- Audit recall history and ESG reputation.
{{/if}}

{{#if isModeB}}
## [Mode B: Personalized Consultant]
- Prioritize Pet Profile: Breed, BCS, Health conditions, Allergies.
- Clinical Reasoning: Explain why ingredients are good/bad for the specific pet.
- Dosage: Calculate DER (Daily Energy Requirement) and convert to product dosage.
{{/if}}

# [Data Integrity]
- No Markdown tags. Pure JSON only.
- Match Target Language: {{{language}}}.

Input Context:
- Pet: {{{petType}}}, Breed: {{{petProfile.breed}}}, Weight: {{{petProfile.weight}}}, BCS: {{{petProfile.bcs}}}
- Product Name: {{{productName}}}
- Photo Data: {{media url=photoDataUri}}`
});

const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzePetFoodIngredientsPrompt({
      ...input,
      isModeA: input.analysisMode === 'general',
      isModeB: input.analysisMode === 'custom',
    });
    if (!output) throw new Error('AI Analysis Failed: No output data.');
    return { ...output, status: 'success' };
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}
