'use server';

import { analyzePetFoodIngredients } from "@/ai/flows/analyze-pet-food-ingredients";
import type { AnalyzePetFoodIngredientsInput, AnalyzePetFoodIngredientsOutput } from "@/ai/flows/analyze-pet-food-ingredients";

type ActionResult = {
  data?: AnalyzePetFoodIngredientsOutput;
  error?: string;
  details?: string;
}

export async function getAnalysis(input: AnalyzePetFoodIngredientsInput): Promise<ActionResult> {
  try {
    console.log(`[AI Analysis] Calling AI for: ${input.productName || 'Unknown Product'}`);
    const result = await analyzePetFoodIngredients(input);
    return { data: result };
  } catch (e: any) {
    console.error("Analysis Server Action Error:", e);
    // Log the full error to the console for debugging
    return { 
      error: 'homePage.aiError', 
      details: e.message || 'An unknown error occurred during AI generation.'
    };
  }
}
