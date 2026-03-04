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
    console.log(`[AI Analysis] Starting analysis for: ${input.productName || 'Unnamed Product'} in Mode: ${input.analysisMode}`);
    
    const result = await analyzePetFoodIngredients(input);
    
    if (!result || result.status === 'error') {
      throw new Error('AI returned an error status or empty result.');
    }

    console.log("[AI Analysis] Successfully generated report.");
    return { data: result };
  } catch (e: any) {
    // 상세 에러를 서버 로그에 남겨 디버깅을 지원합니다.
    console.error("Critical AI Analysis Error Details:", e);
    
    return { 
      error: 'scannerHome.aiError', 
      details: e.message || 'An unexpected error occurred during AI generation.'
    };
  }
}
