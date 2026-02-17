'use server';

/**
 * @fileOverview [Pettner Core Engine v10.0 - Global Multi-language & Ultra-Precision Audit]
 * 
 * - Mode A: [Product Scientist] - Focus on Manufacturing, Sourcing, ESG, and Spec.
 * - Mode B: [Pet Consultant] - Focus on Personalized Match, Obesity Roadmap, and Dosage.
 * - Multi-language: Supports 'ko' and 'en' with localized units (g/oz, Paper/Standard Cup).
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

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string().describe('Exact identified product name'),
    brand: z.string().describe('Brand name'),
    category: z.string().describe('Category (e.g., Dry Food, Treat)'),
    qualityGrade: z.string().describe('Quality grade (e.g., A, B, C)'),
    targetAudience: z.object({
      lifeStage: z.string().describe('Recommended life stage'),
      recommendedBreeds: z.string().describe('Optimal breed sizes'),
      focus: z.string().describe('Design focus/purpose')
    }),
    manufacturingDetails: z.object({
      productionType: z.string().describe('Production type (In-house/OEM/ODM)'),
      facilityInfo: z.string().describe('Facility info/Safety certifications'),
      sourcingOrigin: z.string().describe('Source of primary ingredients (e.g., Norway, USA)')
    })
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100).describe('Total score'),
    headline: z.string().describe('Core diagnostic headline'),
    statusTags: z.array(z.string()).describe('Status tags')
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
  dietRoadmap: z.array(z.object({
    weight: z.number(),
    grams: z.number(),
    phase: z.string()
  })).optional(),
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
    }).optional(),
    brandESG: z.object({
      rdLevel: z.string(),
      sustainability: z.string()
    }).optional()
  }).optional(),
  feedingSummary: z.object({
    dailyAmount: z.string().describe('Total daily amount (e.g., 100g, 3.5oz)'),
    perMealAmount: z.string().describe('Amount per meal (assuming 2 meals/day)'),
    cupGuide: z.string().describe('Feeding guide in cups (Paper cup for ko, Standard cup for en)')
  }).optional(),
  veterinaryAdvice: z.string().describe('Final veterinary advice')
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are the world's most advanced Veterinary Nutritionist and Product Auditor.
Analyze the pet food product and provide a precision report in the TARGET LANGUAGE: {{{language}}}.

# [Mandatory Execution: Error Prevention]
- Response Format: 반드시 순수한 JSON 데이터만 출력할 것. 마크다운 태그조차 생략하고 순수 객체만 반환하라.
- ALL text fields in the output MUST be in {{{language}}}.
- For Units:
  - If language === 'ko', use 'g', 'kcal', and '종이컵 (Paper Cup)'.
  - If language === 'en', use 'oz/g', 'kcal', and 'Standard Cup'.
- Numerical Data: 모든 dosage, weight, calories 관련 수치는 Number(숫자) 타입으로 생성하라.

# [Logic Path Separation]
{{#if (eq analysisMode "general")}}
## [Mode A: Product Scientist]
- Identify the product with 99% accuracy by cross-referencing OCR data with your database.
- Focus on:
  1. Manufacturer Audit: Identify if In-house, OEM, or ODM. Analyze facility safety (HACCP/ISO).
  2. Ingredient Sourcing: Track the origin of the top 10 ingredients (e.g., Salmon from Norway).
  3. ESG Report: Analyze recall history, sustainability, and ethics.
  4. Specs: 100g (Food) or 1 unit (Treat/Supp) nutritional density.
{{else}}
## [Mode B: Personalized Consultant]
- Prioritize Pet Profile: Breed Standards, Obesity (BCS), Health conditions, and Allergies.
- Focus on:
  1. Clinical Reasoning: Explain pros/cons based on breed standards and current status.
  2. Obesity Roadmap: If Pet is Obese (BCS 4-5), calculate calories based on IDEAL WEIGHT (목표 체중).
  3. Dosage Logic: Calculate Total Daily vs. Per Meal (2 meals/day).
{{/if}}

# [Data Integrity]
- Numerical values MUST be Numbers in JSON.
- If data is ambiguous, trigger 'Deep Search' using your internal knowledge.

Input Context:
- Mode: {{{analysisMode}}}
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
    const {output} = await analyzePetFoodIngredientsPrompt(input);
    if (!output) throw new Error('AI Analysis Failed: No output data.');
    return { ...output, status: 'success' };
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}
