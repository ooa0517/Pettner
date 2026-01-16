'use server';

import { analyzePetFoodIngredients } from "@/ai/flows/analyze-pet-food-ingredients";
import type { AnalyzePetFoodIngredientsInput, AnalyzePetFoodIngredientsOutput } from "@/ai/flows/analyze-pet-food-ingredients";

type ActionResult = {
  data?: AnalyzePetFoodIngredientsOutput;
  error?: string;
}

export async function getAnalysis(input: AnalyzePetFoodIngredientsInput): Promise<ActionResult> {
  try {
    const result = await analyzePetFoodIngredients(input);
    return { data: result };
  } catch (e) {
    console.error(e);
    // Return a translation key instead of a hardcoded string
    return { error: 'homePage.aiError' };
  }
}
