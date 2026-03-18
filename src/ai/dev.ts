
import { config } from 'dotenv';
config();

/**
 * Pettner AI Development Entry
 * - Imports specialized forensic engines for Type A and Type B analysis.
 */
import '@/ai/flows/analyze-product-only.ts';
import '@/ai/flows/analyze-personalized.ts';
import '@/ai/flows/summarize-ingredient-analysis.ts';
