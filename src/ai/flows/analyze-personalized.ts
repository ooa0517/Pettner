
'use server';

/**
 * @fileOverview [Analyzer_B: Personalized Solution Engine v23.0]
 * - Focuses on Matching, Prescription, and Fulfillment Briefing.
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
    // For Food
    dailyGrams: z.string().optional(),
    perMealGrams: z.string().optional(),
    kcalInstruction: z.string().optional(),
    // For Treat
    maxUnitsPerDay: z.string().optional(),
    ruleOf10PercentMsg: z.string().optional(),
    // For Supplement
    dosage: z.string().optional(), // e.g. "1 pill", "2 scoops"
    dosageUnit: z.string().optional(),
    sideEffectWarning: z.string().optional()
  }),
  fulfillmentBriefing: z.object({
    pros: z.array(z.string()), // Things this product fulfills
    cons: z.array(z.string()), // Things missing or needing supplement
  }),
  veterinaryAdvice: z.string()
});

export type AnalyzePersonalizedOutput = z.infer<typeof AnalyzePersonalizedOutputSchema>;

const analyzePersonalizedPrompt = ai.definePrompt({
  name: 'analyzePersonalizedPrompt',
  input: {schema: AnalyzePersonalizedInputSchema},
  output: {schema: AnalyzePersonalizedOutputSchema},
  prompt: `You are a Veterinary Clinical Nutritionist.
Target Language: {{{language}}}.

Analyze the compatibility between the product and {{{petProfile.name}}} ({{{petProfile.breed}}}).

### [Mode B: Personalized Solution]
1. [Match Score]: 0-100%.
2. [Suitability Verdict]: Address the pet by name. Explain why this product is good or bad based on their specific concerns: {{{petProfile.mainConcern}}}, symptoms: {{{#each petProfile.symptoms}}}{{{this}}}, {{{/each}}}.
3. [Prescription Guide]:
   - If 'food': Provide exact daily/per-meal grams based on {{{petProfile.weight}}}kg and BCS {{{petProfile.bcs}}}.
   - If 'treat': Apply 10% Calorie Rule. "Maximum O pieces per day".
   - If 'supplement': Precise count in pills/scoops/pumps. Warn about side effects (e.g., liver levels).
4. [Briefing]: What is fulfilled (Pros) vs. What is missing (Cons - suggest supplement needs).

Pet: {{{petProfile.name}}}, {{{petProfile.petType}}}, {{{petProfile.age}}}yo, {{{petProfile.weight}}}kg, BCS {{{petProfile.bcs}}}
Product: {{{productInfo.productName}}} ({{{productInfo.productCategory}}})`,
});

export async function analyzePersonalized(input: AnalyzePersonalizedInput): Promise<AnalyzePersonalizedOutput> {
  const {output} = await analyzePersonalizedPrompt(input);
  return { ...output!, status: 'success' };
}
