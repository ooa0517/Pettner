'use server';

import { analyzePetFoodIngredients } from "@/ai/flows/analyze-pet-food-ingredients";
import type { AnalyzePetFoodIngredientsOutput } from "@/ai/flows/analyze-pet-food-ingredients";

type ActionResult = {
  data?: AnalyzePetFoodIngredientsOutput;
  error?: string;
}

export async function getAnalysis(photoDataUri: string): Promise<ActionResult> {
  try {
    const result = await analyzePetFoodIngredients({ photoDataUri });
    return { data: result };
  } catch (e) {
    console.error(e);
    // It's better to return a generic error message to the client
    // and log the detailed error on the server.
    return { error: 'AI 분석 중 오류가 발생했습니다. 이미지에 성분표가 잘 보이는지 확인 후 다시 시도해주세요.' };
  }
}
