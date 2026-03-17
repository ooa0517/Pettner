'use server';

/**
 * @fileOverview [Analyzer_A: Product-Only Engine v27.1]
 * - Focuses on Deterministic Scientific Audit.
 * - Dynamic Language Control: Supports ko-KR or en-US based on input.
 * - Added Nutritional Density, Price Analysis, and 5-Year Recall Audit.
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
    worstFor: z.array(z.string()),
    nutritionalDensityScore: z.number().describe('0-100 score for nutrient density'),
    densityComment: z.string().describe('Expert comment on density')
  }),
  nutritionalAnalysis: z.object({
    radarData: z.array(z.object({
      nutrient: z.string(),
      value: z.number(),
      standardAAFCO: z.number(),
      standardFEDIAF: z.number()
    })).optional(),
    caloriePerUnit: z.string().optional(),
    priceEfficiency: z.string().optional().describe('Analysis of cost-effectiveness per kg or unit')
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
    recallHistory: z.string().describe('Last 5 years recall history fact check'),
    certifications: z.array(z.string()),
    cleanMarkGranted: z.boolean().describe('Whether to grant the Pettner Clean Mark')
  })
});

export type AnalyzeProductOnlyOutput = z.infer<typeof AnalyzeProductOnlyOutputSchema>;

const analyzeProductOnlyPrompt = ai.definePrompt({
  name: 'analyzeProductOnlyPrompt',
  input: {schema: AnalyzeProductOnlyInputSchema},
  output: {schema: AnalyzeProductOnlyOutputSchema},
  prompt: `You are a Deterministic Food Quality Auditor for Pets.
Target Language: {{{language}}}. Use professional veterinary terminology.

### [CRITICAL: DETERMINISTIC MODE]
1. [Headline & Suitability]: Base insights on specific numbers (e.g., "Protein 32% high-nutrient formula"). Avoid generic phrases.
2. [Nutritional Analysis]: 
   - For 'food', MUST provide 'radarData' with 6 nutrients: Crude Protein, Crude Fat, Crude Fiber, Crude Ash, Calcium, Phosphorus (Translated to target language).
   - Include 'standardAAFCO' and 'standardFEDIAF' minimums for comparison.
   - Provide a 'nutritionalDensityScore' (0-100) based on moisture and nutrient concentration.
3. [Ingredients]: 100% audit. Identify specific functions of each ingredient.
4. [Physical & Origin Audit]:
   - originRiskMap: Map major ingredients to origins (NZ, USA, China, etc.).
   - processingAnalysis: Audit the method (Extruded, Freeze-dried, etc.).
   - kibbleSpecs: Analyze physical properties (hardness, mm size, oiliness).
5. [Reliability & Killer Content]: 
   - Recall History: Specifically check the last 5 years for this brand/manufacturer.
   - Clean Mark: Grant 'true' only if no major recalls and high transparency.
   - Price Efficiency: Estimate cost-effectiveness based on ingredient quality vs market average.

Product: {{{productName}}} ({{{productCategory}}})
Type: {{{detailedProductType}}}
Photo: {{#if photoDataUri}}Provided{{else}}Not Provided{{/if}}`,
});

export async function analyzeProductOnly(input: AnalyzeProductOnlyInput): Promise<AnalyzeProductOnlyOutput> {
  const {output} = await analyzeProductOnlyPrompt(input);
  return { ...output!, status: 'success' };
}
