
'use server';

/**
 * @fileOverview [Analyzer_A: Hyper-Gap Audit Engine v28.1]
 * - Focuses on Meat vs Carb Ratio (Back-calculation).
 * - Satiety Index, Stool/Odor Forecast, and Global Risk Radar.
 * - Statistical Allergy Risk integration.
 * - Forced "Fact-Bomb" Tone.
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
  prompt: `You are a Deterministic Food Quality Auditor for Pets. 
Target Language: {{{language}}}. Use professional, cold, and fact-based veterinary terminology.

### [CRITICAL: HYPER-GAP AUDIT MODE]
1. [Meat vs Carb]: AI must back-calculate carbohydrates (Carbs = 100 - (Protein + Fat + Fiber + Ash + Moisture)). 
   - Expose "Hidden Carbs" that companies hide behind high-protein marketing. 
   - Commentary must be sharp and critical.
2. [Stool & Odor]: Predict physical outcomes based on fiber sources (beet pulp, cellulose) and protein quality (fresh meat vs by-product meals).
3. [Ingredient Allergy Stat]: For each ingredient, include a statistical note relevant to the region (e.g., "Chicken: #1 allergy source for dogs in urban areas").
4. [Satiety Index]: Analyze calorie density vs volume. Use 'Energy-concentrated' or 'High-volume' terminology.
5. [Global Risk Radar]: Search for specific recent (2023-2024) FDA reports, DCM (Dilated Cardiomyopathy) investigations, or class-action lawsuits regarding the manufacturer.

Product: {{{productName}}} ({{{productCategory}}})
Type: {{{detailedProductType}}}
Photo: {{#if photoDataUri}}Provided{{else}}Not Provided{{/if}}`,
});

export async function analyzeProductOnly(input: AnalyzeProductOnlyInput): Promise<AnalyzeProductOnlyOutput> {
  const {output} = await analyzeProductOnlyPrompt(input);
  return { ...output!, status: 'success' };
}
