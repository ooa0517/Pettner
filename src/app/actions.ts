
'use server';

import { analyzeProductOnly } from "@/ai/flows/analyze-product-only";
import { analyzePersonalized } from "@/ai/flows/analyze-personalized";
import type { AnalyzeProductOnlyInput, AnalyzeProductOnlyOutput } from "@/ai/flows/analyze-product-only";
import type { AnalyzePersonalizedInput, AnalyzePersonalizedOutput } from "@/ai/flows/analyze-personalized";

export async function getGeneralAnalysis(input: AnalyzeProductOnlyInput): Promise<{data?: AnalyzeProductOnlyOutput, error?: string}> {
  try {
    const data = await analyzeProductOnly(input);
    return { data };
  } catch (e: any) {
    console.error("General Analysis Action Error:", e);
    return { error: e.message };
  }
}

export async function getPersonalizedAnalysis(input: AnalyzePersonalizedInput): Promise<{data?: AnalyzePersonalizedOutput, error?: string}> {
  try {
    const data = await analyzePersonalized(input);
    return { data };
  } catch (e: any) {
    console.error("Personalized Analysis Action Error:", e);
    return { error: e.message };
  }
}
