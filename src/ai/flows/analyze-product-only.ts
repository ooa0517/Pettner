
'use server';

/**
 * @fileOverview [Analyzer_A: Hyper-Gap Audit Engine v28.0]
 * - Focuses on Meat vs Carb Ratio (Back-calculation).
 * - Satiety Index, Stool/Odor Forecast, and Global Risk Radar.
 * - Statistical Allergy Risk integration.
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
  }),
  summary: z.object({
    headline: z.string().describe('One-line sharp summary based on numbers'),
    expertOpinion: z.string(),
  }),
  meatCarbRatio: z.object({
    proteinPct: z.number(),
    carbPct: z.number(),
    commentary: z.string().describe('Fact-bomb about hidden carbs'),
  }),
  nutritionalAnalysis: z.object({
    radarData: z.array(z.object({
      nutrient: z.string(),
      value: z.number(),
      standardAAFCO: z.number(),
      standardFEDIAF: z.number()
    })),
    nutritionalDensityScore: z.number(),
  }),
  wasteAndOdorForecast: z.object({
    stoolCondition: z.string().describe('Prediction of stool shape/consistency'),
    odorLevel: z.string().describe('Prediction of breath and stool odor'),
    reasoning: z.string(),
  }),
  ingredientAnalysis: z.array(z.object({
    name: z.string(),
    category: z.enum(['positive', 'neutral', 'cautionary']),
    reason: z.string(),
    allergyStat: z.string().optional().describe('Statistical allergy risk ranking/info'),
  })),
  satietyIndex: z.object({
    level: z.enum(['LOW', 'NORMAL', 'HIGH']),
    durationLabel: z.string(),
    analysis: z.string().describe('Expert analysis on how long the pet feels full'),
  }),
  marketAndRisk: z.object({
    priceEfficiency: z.string().describe('Price per kg analysis'),
    manufacturerTrust: z.string(),
    globalRiskRadar: z.string().describe('Recent overseas lawsuits, FDA recalls, or brand controversies'),
    cleanMark: z.boolean(),
  })
});

export type AnalyzeProductOnlyOutput = z.infer<typeof AnalyzeProductOnlyOutputSchema>;

const analyzeProductOnlyPrompt = ai.definePrompt({
  name: 'analyzeProductOnlyPrompt',
  input: {schema: AnalyzeProductOnlyInputSchema},
  output: {schema: AnalyzeProductOnlyOutputSchema},
  prompt: `You are a Deterministic Food Quality Auditor for Pets. 
Target Language: {{{language}}}. Use professional veterinary terminology.

### [CRITICAL: HYPER-GAP AUDIT MODE]
1. [Meat vs Carb]: AI must back-calculate carbohydrates (Carbs = 100 - (Protein + Fat + Fiber + Ash + Moisture)). 
   - Expose "Hidden Carbs" that companies hide. 
   - Commentary must be sharp (e.g., "High protein claim but 40%+ carbs").
2. [Stool & Odor]: Predict physical outcomes based on fiber sources (beet pulp, etc.) and protein sources (fish meal vs fresh meat).
3. [Ingredient Allergy Stat]: For each ingredient, include a statistical note (e.g., "Beef: #1 allergy source in Korea").
4. [Satiety Index]: Analyze calorie density vs volume. Label as 'Energy-concentrated' or 'High-volume'.
5. [Global Risk Radar]: Specifically search for recent (2023-2024) FDA reports, DCM investigations, or class-action lawsuits regarding the brand.

Product: {{{productName}}} ({{{productCategory}}})
Type: {{{detailedProductType}}}
Photo: {{#if photoDataUri}}Provided{{else}}Not Provided{{/if}}`,
});

export async function analyzeProductOnly(input: AnalyzeProductOnlyInput): Promise<AnalyzeProductOnlyOutput> {
  const {output} = await analyzeProductOnlyPrompt(input);
  return { ...output!, status: 'success' };
}
