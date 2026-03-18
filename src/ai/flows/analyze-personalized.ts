'use server';

/**
 * @fileOverview [Analyzer_B: Personalized Medical Solution Engine v28.2]
 * - Focuses on Matching, Behavioral Forecast, and Transition Schedule.
 * - Uses RER (70*BW^0.75) and DER formulas for feeding guides.
 * - Dynamic Language Control: Supports ko-KR or en-US.
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
Target Language: {{{language}}}. Use professional medical terminology.

### [CRITICAL: MEDICAL CALCULATION RULE]
1. [Precision Feeding Guide]:
   - Calculate RER = 70 * ({{{petProfile.weight}}} ^ 0.75).
   - Determine DER based on BCS {{{petProfile.bcs}}} and age {{{petProfile.age}}}.
   - Output exact daily grams and per-meal grams (assuming 2 meals/day).
   - Treats: Apply "10% of Daily Calories" rule strictly.

2. [Behavioral Forecast]:
   - Palatability: Calculate eater probability based on aromatic fats and hydrolyzed proteins.
   - Glycemic Index (GI): Evaluate carb sources (Tapioca/Rice = High GI, Lentils/Chickpeas = Low GI).

3. [Mandatory Hydration]:
   - For cats or dry food users, calculate required additional water intake (ml) based on dry matter intake.

Pet: {{{petProfile.name}}}, {{{petProfile.breed}}}, {{{petProfile.age}}}yo, {{{petProfile.weight}}}kg, BCS {{{petProfile.bcs}}}
Product: {{{productInfo.productName}}} ({{{productInfo.productCategory}}})`,
});

export async function analyzePersonalized(input: AnalyzePersonalizedInput): Promise<AnalyzePersonalizedOutput> {
  const {output} = await analyzePersonalizedPrompt(input);
  return { ...output!, status: 'success' };
}
