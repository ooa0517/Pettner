import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Pettner AI Core Configuration
 * Uses Gemini 1.5/2.5 Flash for high-speed multimodal analysis.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
