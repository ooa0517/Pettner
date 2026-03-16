
'use client'; // This is a client-side action wrapper, but for server actions in Next.js 15, we use the server side logic inside them.

import { analyzeProductOnly } from "@/ai/flows/analyze-product-only";
import { analyzePersonalized } from "@/ai/flows/analyze-personalized";
import type { AnalyzeProductOnlyInput, AnalyzeProductOnlyOutput } from "@/ai/flows/analyze-product-only";
import type { AnalyzePersonalizedInput, AnalyzePersonalizedOutput } from "@/ai/flows/analyze-personalized";

// Note: Usage increment logic should happen on the client side before/after calling these actions to stay within Firebase Client SDK rules
// or via a separate Cloud Function. Here we keep it simple by providing the AI response.

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
