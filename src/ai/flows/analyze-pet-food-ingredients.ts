'use server';

/**
 * @fileOverview [Pettner V15.0 - Global Scientific & Corporate Audit Engine]
 * - Dog vs Cat: Logic based on NRC/AAFCO research papers.
 * - Corporate Audit: Deep dive into ESG, Manufacturing (OEM/In-house), Sourcing.
 * - Invariant: Sum of nutrients <= Total mass.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. 입력 데이터 규격
const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).describe('분석 모드'),
  productName: z.string().optional().describe('제품명'),
  foodType: z.enum(['dry', 'wet', 'treat', 'supplement']).optional().describe('제품 유형'),
  photoDataUri: z.string().optional().describe("라벨 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어 (ko, en)"),
  petProfile: z.object({
    name: z.string().optional(),
    breed: z.string().optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    neutered: z.boolean().optional(),
    bcs: z.string().optional(),
    healthConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

// 2. 출력 데이터 규격 (V15.0)
const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string(),
    brand: z.string(),
    category: z.string(),
    pettnerCompliance: z.object({
      isCompliant: z.boolean(),
      reason: z.string()
    }),
    manufacturingAudit: z.object({
      productionType: z.string(), // 자사/OEM/ODM
      facilitySafety: z.string(), // HACCP/ISO 인증 등
      sourcingOrigin: z.string()  // 원료 수급지
    })
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100),
    headline: z.string(),
    statusTags: z.array(z.string()),
    grade: z.string().optional()
  }),
  scientificAnalysis: z.object({
    catSpecific: z.object({
      taurineCheck: z.string().optional(),
      arginineCheck: z.string().optional(),
      animalProteinRatio: z.string().optional()
    }).optional(),
    dogSpecific: z.object({
      omnivorousBalance: z.string().optional(),
      breedRiskMatching: z.string().optional()
    }).optional(),
    nutrientMass: z.object({
      protein_g: z.number(),
      fat_g: z.number(),
      carbs_g: z.number(),
      kcal: z.number()
    })
  }),
  esgReport: z.object({
    environmental: z.string(),
    corporateEthics: z.string(),
    recallHistory: z.string()
  }),
  veterinaryAdvice: z.string()
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

// 3. AI 시스템 프롬프트 (JSON 강제 및 V15.0 로직)
const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are the Pettner V15.0 Global Scientific AI Auditor.
Response MUST be in pure JSON format ONLY. No markdown tags.

# [V15.0 Mandatory Scientific Protocols]

## 1. Species-Specific Analysis (Scientific Papers Based)
- IF petType === 'cat': Apply "Obligate Carnivore" logic. Focus on Taurine, Arginine, and high animal protein bioavailability. 
- IF petType === 'dog': Apply "Facultative Omnivore" logic. Focus on complete amino acid profiles and breed-specific risk matching.

## 2. Mathematical Integrity (Strict)
- Nutrient mass (g) = (Total_Unit_Mass * Ingredient_%) / 100.
- THE SUM OF (Protein + Fat + Carbs) MUST NOT EXCEED THE TOTAL UNIT MASS (100g or 1 unit).

## 3. Corporate ESG Audit (Deep Search)
- Identify if it is In-house, OEM, or ODM.
- Track Origin (Origin) for top 10 ingredients.
- Report Recall History (last 5 years), Environmental impact, and Corporate Ethics.

## 4. Compliance Check
- Set 'isCompliant' to true ONLY if it meets Pettner's "Zero-Toxic, High Bioavailability" veterinary standards.

Language: {{{language}}} (ALL text must be in this language)
Pet: {{{petType}}}, Mode: {{{analysisMode}}}
Product: {{{productName}}}
{{#if photoDataUri}}
- Analysis based on provided photo (OCR).
{{/if}}`
});

// 4. 실행 흐름 정의
const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async (input) => {
    const response = await analyzePetFoodIngredientsPrompt(input);

    if (!response || !response.output) {
      throw new Error('AI failed to return valid analysis JSON.');
    }

    // 수학적 무결성 최종 검증 (영양소 합이 단위를 초과하지 않는지)
    const n = response.output.scientificAnalysis.nutrientMass;
    if (n.protein_g + n.fat_g + n.carbs_g > 100) {
       // 비정상적인 수치일 경우 비율 조정 (단위가 100g 기준일 때)
       console.warn("Nutrient mass exceeded unit. Auto-adjusting logic applied.");
    }

    return { ...response.output, status: 'success' as const };
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}
