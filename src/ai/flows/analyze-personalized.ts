
'use server';

/**
 * @fileOverview [Analyzer_B: Personalized Solution Engine v26.0]
 * - Focuses on Matching, Behavioral Forecast, and Transition Schedule.
 * - Ensures consistent results for consistent pet profiles.
 * - Uses inclusive terminology (Food/Product instead of just feed).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePersonalizedInputSchema = z.object({
  productInfo: z.object({
    productCategory: z.enum(['food', 'treat', 'supplement']),
    detailedProductType: z.string(),
    productName: z.string().optional(),
    photoDataUri: z.string().optional(),
  }),
  petProfile: z.object({
    petType: z.enum(['dog', 'cat']),
    name: z.string(),
    breed: z.string(),
    age: z.number(),
    weight: z.number(),
    bcs: z.string(),
    symptoms: z.array(z.string()),
    allergies: z.array(z.string()),
    mainConcern: z.string(),
    medications: z.string().optional(),
  }),
  language: z.string().optional().default('ko'),
});

export type AnalyzePersonalizedInput = z.infer<typeof AnalyzePersonalizedInputSchema>;

const AnalyzePersonalizedOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  matchingReport: z.object({
    matchScore: z.number().min(0).max(100),
    suitabilityVerdict: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
  }),
  personalizedFeedingGuide: z.object({
    category: z.enum(['food', 'treat', 'supplement']),
    dailyGrams: z.string().optional(),
    perMealGrams: z.string().optional(),
    kcalInstruction: z.string().optional(),
    maxUnitsPerDay: z.string().optional(),
    ruleOf10PercentMsg: z.string().optional(),
    dosage: z.string().optional(),
    dosageUnit: z.string().optional(),
    sideEffectWarning: z.string().optional()
  }),
  behavioralForecast: z.object({
    palatabilityIndex: z.object({
      probability: z.number(),
      reason: z.string()
    }),
    giAndSatiety: z.object({
      level: z.string(),
      note: z.string()
    }),
    mandatoryWaterIntake: z.object({
      ml: z.string(),
      reason: z.string()
    })
  }),
  riskAndTransition: z.object({
    allergySupplementAlert: z.string(),
    transitionSchedule: z.array(z.object({
      day: z.string(),
      ratio: z.string()
    })),
    expectedStoolChanges: z.string()
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
  }),
  veterinaryAdvice: z.string()
});

export type AnalyzePersonalizedOutput = z.infer<typeof AnalyzePersonalizedOutputSchema>;

const analyzePersonalizedPrompt = ai.definePrompt({
  name: 'analyzePersonalizedPrompt',
  input: {schema: AnalyzePersonalizedInputSchema},
  output: {schema: AnalyzePersonalizedOutputSchema},
  prompt: `You are a Clinical Veterinary Nutritionist. 
Target Language: {{{language}}}.

### [CRITICAL: CONSISTENCY RULE]
For the same pet profile and product, you MUST produce identical scores and instructions. Use scientific formulas for feeding (RER/DER calculation). 
Avoid words like 'feed' (사료) when referring to treats or supplements. Use 'product' (제품) or 'food' (식품).

### [Mode B: Personalized Solution]
1. [Matching]: Score (0-100) and specific vet opinion addressing {{{petProfile.name}}}.
2. [Feeding Guide]: Precise grams/units based on weight {{{petProfile.weight}}}kg and BCS {{{petProfile.bcs}}}.
   - Apply 10% rule for treats.
   - Apply precise dosage for supplements.
3. [Behavioral Forecast]:
   - palatabilityIndex: Calculate probability of eating based on aromatic coatings (fat, liver) and ingredients.
   - giAndSatiety: Evaluate Glycemic Index based on carbohydrate sources.
   - mandatoryWaterIntake: MANDATORY for cats and dry food users. Calculate ml based on grams.
4. [Risk & Transition]:
   - Identify allergy conflicts.
   - Provide a 7-day transition schedule (e.g., Day 1-2: 25% new, 75% old).
   - Predict stool changes (odor, consistency).
5. [Ingredients & ESG]: Standard traffic light audit and brand transparency.

Pet: {{{petProfile.name}}}, {{{petProfile.petType}}}, {{{petProfile.breed}}}, {{{petProfile.age}}}yo, {{{petProfile.weight}}}kg, BCS {{{petProfile.bcs}}}
Product: {{{productInfo.productName}}} ({{{productInfo.productCategory}}})`,
});

export async function analyzePersonalized(input: AnalyzePersonalizedInput): Promise<AnalyzePersonalizedOutput> {
  const {output} = await analyzePersonalizedPrompt(input);
  return { ...output!, status: 'success' };
}
