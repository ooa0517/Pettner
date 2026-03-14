'use server';

/**
 * @fileOverview [Analyzer_A: Product-Only Engine v24.0]
 * - Focuses on Deterministic Scientific Audit.
 * - Adds Physical & Origin Audit (Origin mapping, Processing loss, Kibble specs).
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
  nutritionalAnalysis: z.object({
    radarData: z.array(z.object({
      nutrient: z.string(),
      value: z.number(),
      standard: z.number()
    })).optional(),
    caloriePerUnit: z.string().optional(),
    additiveWarnings: z.array(z.object({
      name: z.string(),
      reason: z.string(),
      riskLevel: z.enum(['low', 'medium', 'high'])
    })).optional(),
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
  physicalOriginAudit: z.object({
    originRiskMap: z.array(z.object({
      ingredient: z.string(),
      origin: z.string(),
      riskLevel: z.enum(['safe', 'caution'])
    })),
    processingAnalysis: z.object({
      method: z.string(),
      nutrientLossNote: z.string()
    }),
    kibbleSpecs: z.object({
      texture: z.string(),
      size: z.string(),
      digestibilityNote: z.string()
    })
  }),
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
  prompt: `You are a Deterministic Food Quality Auditor.
Target Language: {{{language}}}.

### [CRITICAL: DETERMINISTIC MODE]
You MUST provide consistent results for the same input. Base your analysis strictly on the label text or image provided.

1. [Headline & Suitability]: Factual one-liner and target mapping.
2. [Nutritional Analysis]: AAFCO standards comparison.
3. [Ingredients]: Traffic light system (100% audit).
4. [Physical & Origin Audit]:
   - originRiskMap: Mapping major ingredients to their likely origins (e.g. NZ, USA, China) and identifying risks (e.g. synthetic additives from certain regions).
   - processingAnalysis: Audit the manufacturing method (Extruded, Freeze-dried, Baked). Note potential nutrient loss (e.g. heat-sensitive taurine).
   - kibbleSpecs: Analyze physical kibble properties (hardness, size, oiliness) and their impact on different breeds/ages.
5. [Reliability]: ESG report and OEM status.

Product: {{{productName}}} ({{{productCategory}}})
Type: {{{detailedProductType}}}
Photo: {{#if photoDataUri}}Provided{{else}}Not Provided{{/if}}`,
});

export async function analyzeProductOnly(input: AnalyzeProductOnlyInput): Promise<AnalyzeProductOnlyOutput> {
  const {output} = await analyzeProductOnlyPrompt(input);
  return { ...output!, status: 'success' };
}
