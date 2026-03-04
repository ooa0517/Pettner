'use server';

/**
 * @fileOverview [Pettner Core Engine v15.0 - Scientific Paper Based & Corporate ESG Audit]
 * - Cat vs Dog: Distinct physiological logic based on NRC/AAFCO papers.
 * - Corporate Audit: Deep dive into Manufacturing (OEM/In-house), Sourcing, and ESG.
 * - Pettner Compliance: Automated verification of Pettner's nutritional standards.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. 입력 데이터 규칙 (Input Schema)
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

// 프롬프트용 확장 스키마
const PromptInputSchema = AnalyzePetFoodIngredientsInputSchema.extend({
  isModeA: z.boolean().describe('제품 감사 모드 여부'),
  isModeB: z.boolean().describe('맞춤 컨설팅 모드 여부'),
});

// 2. 출력 데이터 규칙 (Output Schema)
const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string().describe('Identified product name'),
    brand: z.string().describe('Brand name'),
    category: z.string().describe('Category'),
    pettnerCompliance: z.object({
      isCompliant: z.boolean().describe('Pettner 분석법 부합 여부'),
      reason: z.string().describe('부합/미달 사유 요약')
    }),
    manufacturingAudit: z.object({
      productionType: z.string().describe('자사생산/OEM/ODM'),
      facilitySafety: z.string().describe('HACCP/ISO 등 인증 상태'),
      sourcingOrigin: z.string().describe('주요 원료 수급 국가 (Deep Search 결과)')
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
    environmental: z.string().describe('친환경 패키징 및 탄소 저감 지표'),
    corporateEthics: z.string().describe('기업 윤리 및 사회 공헌'),
    recallHistory: z.string().describe('최근 5년 내 리콜 이력 및 대응')
  }),
  personalMatching: z.object({
    matches: z.array(z.object({ feature: z.string(), reason: z.string() })),
    mismatches: z.array(z.object({ feature: z.string(), reason: z.string() }))
  }).optional(),
  feedingSummary: z.object({
    dailyAmount: z.string(),
    perMealAmount: z.string(),
    cupGuide: z.string()
  }).optional(),
  veterinaryAdvice: z.string()
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

// 3. AI 프롬프트 정의
const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are the Pettner V15.0 AI Veterinary Scientist & Corporate Auditor.
Analyze the pet food product with 99% accuracy and cross-verify with scientific papers (NRC, AAFCO).

# [Pettner V15.0 Mandatory Scientific Protocols]

## 1. Species-Specific Scientific Logic
- **IF petType === 'cat'**: Apply "Obligate Carnivore" logic. Focus on Taurine, Arginine, and Arachidonic Acid. Evaluate if animal protein is the primary source. Check for carbohydrate excess (DM > 10% is cautionary).
- **IF petType === 'dog'**: Apply "Facultative Carnivore/Omnivore" logic. Focus on balanced amino acid profiles and breed-specific requirements (e.g., Maltipoo joints, Poodle skin).

## 2. Corporate & ESG Audit (Deep Search Mode)
- **Manufacturer Audit**: Identify if it's In-house, OEM, or ODM. Look for HACCP/ISO certifications.
- **Sourcing Origin**: Track the origin of the top 10 ingredients (e.g., "Chicken from Brazil", "Rice from Korea").
- **ESG Analysis**: Report on Environmental (packaging), Corporate Ethics, and Recall History.

## 3. Pettner Method Compliance
- Verify if the product meets Pettner's "Zero Toxic, High Bioavailability" standard.
- Set 'isCompliant' to true ONLY if it meets professional veterinary standards.

## 4. Mathematical Integrity
- Formula: (100g or 1 Unit * Ingredient_%) / 100.
- SUM OF NUTRIENTS (Protein + Fat + Carbs) MUST NOT EXCEED THE UNIT MASS.

Language: {{{language}}} (ALL output must be in this language)
Context:
- Pet: {{{petType}}}, Mode: {{{analysisMode}}}
- Product: {{{productName}}}
{{#if photoDataUri}}
- OCR/Photo Data provided.
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
    const response = await analyzePetFoodIngredientsPrompt({
      ...input,
      isModeA: input.analysisMode === 'general',
      isModeB: input.analysisMode === 'custom',
    });

    if (!response || !response.output) {
      throw new Error('AI failed to return analysis result.');
    }

    return { ...response.output, status: 'success' as const };
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}
