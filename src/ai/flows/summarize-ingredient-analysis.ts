'use server';
/**
 * @fileOverview A summarization AI agent for ingredient analysis.
 *
 * - summarizeIngredientAnalysis - A function that handles the ingredient analysis summarization process.
 * - SummarizeIngredientAnalysisInput - The input type for the summarizeIngredientAnalysis function.
 * - SummarizeIngredientAnalysisOutput - The return type for the summarizeIngredientAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIngredientAnalysisInputSchema = z.object({
  productName: z.string().describe('The name of the product being analyzed.'),
  ingredients: z.object({
    positive: z.array(
      z.object({
        name: z.string().describe('The name of the positive ingredient.'),
        reason: z.string().describe('The scientific reason why it is positive.'),
      })
    ).describe('List of positive ingredients and their reasons'),
    cautionary: z.array(
      z.object({
        name: z.string().describe('The name of the cautionary ingredient.'),
        reason: z.string().describe('The scientific reason why it is cautionary.'),
      })
    ).describe('List of cautionary ingredients and their reasons'),
  }).describe('Details of ingredients, separated into positive and cautionary.'),
  nutritionalAnalysis: z.object({
    estimatedCalories: z.string().describe('Estimated calorie content of the product.'),
    insights: z.array(z.string()).describe('Expert comments related to nutritional balance.'),
  }).describe('Analysis of the nutritional content.'),
  hiddenInsights: z.array(z.string()).describe('Deeper insights not commonly known about the product.'),
});
export type SummarizeIngredientAnalysisInput = z.infer<typeof SummarizeIngredientAnalysisInputSchema>;

const SummarizeIngredientAnalysisOutputSchema = z.object({
  summaryHeadline: z.string().describe('A one-line scientific summary of the ingredient analysis.'),
});
export type SummarizeIngredientAnalysisOutput = z.infer<typeof SummarizeIngredientAnalysisOutputSchema>;

export async function summarizeIngredientAnalysis(input: SummarizeIngredientAnalysisInput): Promise<SummarizeIngredientAnalysisOutput> {
  return summarizeIngredientAnalysisFlow(input);
}

const summarizeIngredientAnalysisPrompt = ai.definePrompt({
  name: 'summarizeIngredientAnalysisPrompt',
  input: {schema: SummarizeIngredientAnalysisInputSchema},
  output: {schema: SummarizeIngredientAnalysisOutputSchema},
  prompt: `You are a world-leading expert in veterinary medicine and pet nutrition. You are analyzing the ingredient list of a pet food product and will provide a one-line summary of your analysis.

  The summary should highlight key positive and negative aspects of the food, and potential concerns.
  The summary must be based on scientific evidence and reliable nutritional guidelines (e.g., NRC, AAFCO guidelines).

  Product Name: {{{productName}}}

  Positive Ingredients:
  {{#each ingredients.positive}}
  - {{name}}: {{reason}}
  {{/each}}

  Cautionary Ingredients:
  {{#each ingredients.cautionary}}
  - {{name}}: {{reason}}
  {{/each}}

  Nutritional Analysis:
  Estimated Calories: {{{nutritionalAnalysis.estimatedCalories}}}
  Insights:
  {{#each nutritionalAnalysis.insights}}
  - {{this}}
  {{/each}}

  Hidden Insights:
  {{#each hiddenInsights}}
  - {{this}}
  {{/each}}

  Summary Headline: `,
});

const summarizeIngredientAnalysisFlow = ai.defineFlow(
  {
    name: 'summarizeIngredientAnalysisFlow',
    inputSchema: SummarizeIngredientAnalysisInputSchema,
    outputSchema: SummarizeIngredientAnalysisOutputSchema,
  },
  async input => {
    const {output} = await summarizeIngredientAnalysisPrompt(input);
    return output!;
  }
);