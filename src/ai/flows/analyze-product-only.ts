'use server';

/**
 * @fileOverview [Analyzer_A: Hyper-Gap Audit Engine v28.2]
 * - Focuses on Meat vs Carb Ratio using NFE (Nitrogen-Free Extract) Formula.
 * - Satiety Index, Stool/Odor Forecast, and Global Risk Radar.
 * - Statistical Allergy Risk integration.
 * - Forced "Forensic Audit" Tone.
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
    headline: z.string().describe('One-line sharp summary based on numbers (e.g., "High protein claim but 40%+ carbs")'),
    expertOpinion: z.string().describe('Professional vet auditor tone'),
  }),
  meatCarbRatio: z.object({
    proteinPct: z.number(),
    carbPct: z.number(),
    commentary: z.string().describe('Aggressive fact-bomb about hidden carbohydrates and deception.'),
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
    stoolCondition: z.string().describe('Prediction of stool shape/consistency based on fiber/protein sources'),
    odorLevel: z.string().describe('Prediction of breath and stool odor'),
    reasoning: z.string(),
  }),
  ingredientAnalysis: z.array(z.object({
    name: z.string(),
    category: z.enum(['positive', 'neutral', 'cautionary']),
    reason: z.string(),
    allergyStat: z.string().optional().describe('Statistical allergy risk ranking/info (e.g., "#1 allergy source in Korea")'),
  })),
  satietyIndex: z.object({
    level: z.enum(['LOW', 'NORMAL', 'HIGH']),
    durationLabel: z.string(),
    analysis: z.string().describe('Analysis on how long the pet feels full vs hunger issues'),
  }),
  marketAndRisk: z.object({
    priceEfficiency: z.string().describe('Price per kg analysis'),
    manufacturerTrust: z.string(),
    globalRiskRadar: z.string().describe('Recent overseas lawsuits (2023-2024), FDA recalls, or brand controversies'),
    cleanMark: z.boolean(),
  })
});

export type AnalyzeProductOnlyOutput = z.infer<typeof AnalyzeProductOnlyOutputSchema>;

const analyzeProductOnlyPrompt = ai.definePrompt({
  name: 'analyzeProductOnlyPrompt',
  input: {schema: AnalyzeProductOnlyInputSchema},
  output: {schema: AnalyzeProductOnlyOutputSchema},
  prompt: `You are a Deterministic Forensic Auditor for Pet Nutrition. 
Target Language: {{{language}}}. Use professional, cold, and fact-based veterinary terminology.

### [CRITICAL: MATHEMATICAL AUDIT MODE]
1. [The Carb Deception (NFE Formula)]: 
   - You MUST back-calculate Nitrogen-Free Extract (NFE).
   - Formula: Carbs = 100 - (Crude Protein + Crude Fat + Crude Fiber + Moisture + Ash).
   - If Ash is not on the label, assume 8% for dry food, 2% for wet food.
   - Commentary MUST be aggressive if Carbs > 35%. Expose the "Hidden Sugars".

2. [Biometric Forecast]:
   - Predict Stool: Based on Fiber sources (Beet pulp, Cellulose, Inulin).
   - Predict Odor: Based on Protein quality (Fresh meat vs By-product meal) and Yucca Schidigera presence.

3. [Satiety Index Calculation]:
   - Ratio of Fiber/Protein to Calorie density.
   - High Density (Low Satiety): Energy-concentrated, small volume.
   - High Fiber (High Satiety): Bulky volume, lower calories.

4. [Global Risk Radar]:
   - Search for specific manufacturer issues: 2023-2024 FDA warnings, DCM class-action lawsuits, or Aflatoxin recalls.

Product: {{{productName}}} ({{{productCategory}}})
Type: {{{detailedProductType}}}
Photo: {{#if photoDataUri}}Provided{{else}}Not Provided{{/if}}`,
});

export async function analyzeProductOnly(input: AnalyzeProductOnlyInput): Promise<AnalyzeProductOnlyOutput> {
  const {output} = await analyzeProductOnlyPrompt(input);
  return { ...output!, status: 'success' };
}
