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
    console.log(`[AI Analysis] Starting analysis for: ${input.productName || 'Unnamed Product'}`);
    const result = await analyzePetFoodIngredients(input);
    
    if (!result || result.status === 'error') {
      throw new Error('AI returned an error status or empty result.');
    }
    
    return { data: result };
  } catch (e: any) {
    // 서버 로그에 구체적인 에러 내용을 남깁니다. (Schema validation error 등 확인용)
    console.error("Critical AI Analysis Error:", e);
    
    // 사용자에게는 번역 가능한 에러 키를 반환합니다.
    return { 
      error: 'homePage.aiError', 
      details: e.message || 'An unexpected error occurred during AI generation.'
    };
  }
}
