
'use server';

/**
 * @fileOverview [Analyzer_B: Personalized Matching Engine]
 * - Focuses on the match between product and pet's specific medical/symptom data.
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
    riskLevel: z.enum(['low', 'medium', 'high']),
  }),
  ingredientMatchAnalysis: z.array(z.object({
    name: z.string(),
    matchStatus: z.enum(['perfect', 'safe', 'warning', 'danger']),
    reason: z.string(),
  })),
  feedingGuide: z.object({
    dailyGrams: z.string(),
    dailyKcal: z.string(),
    feedingTips: z.string(),
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
Focus on Symptoms: {{{#each petProfile.symptoms}}}{{{this}}}, {{{/each}}}
And Allergies: {{{#each petProfile.allergies}}}{{{this}}}, {{{/each}}}
Main Concern: {{{petProfile.mainConcern}}}

Calculate a Match Score (%) and provide specific veterinary advice addressing the pet by name.

Product: {{{productInfo.productName}}}
Pet: {{{petProfile.name}}}, {{{petProfile.petType}}}, {{{petProfile.age}}}yo, {{{petProfile.weight}}}kg, BCS {{{petProfile.bcs}}}`,
});

export async function analyzePersonalized(input: AnalyzePersonalizedInput): Promise<AnalyzePersonalizedOutput> {
  const {output} = await analyzePersonalizedPrompt(input);
  return { ...output!, status: 'success' };
}
