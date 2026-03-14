
'use server';

/**
 * @fileOverview [Analyzer_A: Product-Only Engine v23.0]
 * - Focuses strictly on product specs, AAFCO compliance, and category-specific highlights.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProductOnlyInputSchema = z.object({
  productCategory: z.enum(['food', 'treat', 'supplement']),
  detailedProductType: z.string(),
  productName: z.string().optional(),
  photoDataUri: z.string().optional(),
  language: z.string().optional().default('ko'),
});

export type AnalyzeProductOnlyInput = z.infer<typeof AnalyzeProductOnlyInputSchema>;

const AnalyzeProductOnlyOutputSchema = z.object({
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
  summary: z.object({
    headline: z.string(),
    bestFor: z.array(z.string()),
    worstFor: z.array(z.string())
  }),
  // Category specific spec data
  nutritionalAnalysis: z.object({
    // For Food: Radar chart data (0-100 scale vs standard)
    radarData: z.array(z.object({
      nutrient: z.string(),
      value: z.number(),
      standard: z.number()
    })).optional(),
    // For Treat: Additive focus
    caloriePerUnit: z.string().optional(),
    additiveWarnings: z.array(z.object({
      name: z.string(),
      reason: z.string(),
      riskLevel: z.enum(['low', 'medium', 'high'])
    })).optional(),
    // For Supplement: Active ingredient focus
    activeIngredients: z.array(z.object({
      name: z.string(),
      amount: z.string(),
      recommended: z.string(),
      status: z.string()
    })).optional()
  }),
  ingredientAnalysis: z.array(z.object({
    name: z.string(),
    category: z.enum(['positive', 'neutral', 'cautionary']),
    reason: z.string(),
    safetyRating: z.string().optional()
  })),
  esgReport: z.object({
    transparencyStatus: z.enum(['DIRECT', 'OEM_LOW', 'OEM_PREMIUM']),
    recallHistory: z.string(),
    certifications: z.array(z.string())
  })
});

export type AnalyzeProductOnlyOutput = z.infer<typeof AnalyzeProductOnlyOutputSchema>;

const analyzeProductOnlyPrompt = ai.definePrompt({
  name: 'analyzeProductOnlyPrompt',
  input: {schema: AnalyzeProductOnlyInputSchema},
  output: {schema: AnalyzeProductOnlyOutputSchema},
  prompt: `You are a world-class Food Quality Auditor specializing in pet nutrition.
Target Language: {{{language}}}.

### [Strict Analysis Mode: Analyzer_A]
Provide a factual, objective audit of the product based on the label image or info.

1. [Headline]: Scientific one-liner.
2. [Suitability]: Best target audience vs. Worst target audience.
3. [Category-Specific Logic]:
   - If 'food': Provide radarData for Protein, Fat, Carbs, Fiber, Ash, Moisture (Value vs AAFCO Standard).
   - If 'treat': Highlight additives (preservatives, colors, sweeteners) and calorie per unit. Use red text logic for warnings.
   - If 'supplement': Focus on active ingredients (e.g., Glucosamine mg, Probiotics CFU) vs recommended dosage.
4. [Ingredients]: Traffic light system (positive, neutral, cautionary).
5. [Reliability]: Check if DIRECT sourcing or OEM. Mention recall history.

Product: {{{productName}}} ({{{productCategory}}})
Type: {{{detailedProductType}}}
Photo: {{#if photoDataUri}}Provided{{else}}Not Provided{{/if}}`,
});

export async function analyzeProductOnly(input: AnalyzeProductOnlyInput): Promise<AnalyzeProductOnlyOutput> {
  const {output} = await analyzeProductOnlyPrompt(input);
  return { ...output!, status: 'success' };
}
