'use server';

import { analyzeMaster } from "@/ai/flows/analyze-master";
import type { AnalyzeMasterInput, AnalyzeMasterOutput } from "@/ai/flows/analyze-master";

/**
 * Unified Analysis Server Action
 */
export async function getMasterAnalysis(input: AnalyzeMasterInput): Promise<{data?: AnalyzeMasterOutput, error?: string}> {
  try {
    const data = await analyzeMaster(input);
    return { data };
  } catch (e: any) {
    console.error("Master Analysis Action Error:", e);
    return { error: e.message };
  }
}
