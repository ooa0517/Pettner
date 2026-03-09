'use server';

/**
 * @fileOverview [Pettner Core Engine v14.5 - Full Medical Integration]
 * - 모든 설문 데이터(성별, 중성화, 생활 습관, 약물)를 AI 분석 로직에 통합.
 * - 데이터 규격(Schema)을 프론트엔드 폼 데이터와 일치시킴.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. 입력 데이터 규칙 (Input Schema) - 프론트엔드 데이터와 정밀 동기화
const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).describe('분석 모드'),
  productName: z.string().optional().describe('제품명'),
  productCategory: z.enum(['food', 'treat', 'supplement']).optional().describe('제품 카테고리'),
  detailedProductType: z.string().optional().describe('세부 제품 유형'),
  photoDataUri: z.string().optional().describe("라벨 사진 데이터 URI"),
  prescriptionPhotoDataUri: z.string().optional().describe("처방전 또는 영양제 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어"),
  petProfile: z.object({
    name: z.string().optional(),
    gender: z.enum(['male', 'female', 'unknown']).optional(),
    breed: z.string().optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    neutered: z.enum(['yes', 'no', 'unknown']).optional(),
    bcs: z.string().optional(),
    activityLevel: z.string().optional(),
    walkingTime: z.string().optional(),
    livingEnvironment: z.string().optional(),
    healthConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    waterIntake: z.string().optional(),
    stoolCondition: z.string().optional(),
    medications: z.string().optional(),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

const PromptInputSchema = AnalyzePetFoodIngredientsInputSchema.extend({
  isModeA: z.boolean(),
  isModeB: z.boolean(),
});

// 2. 출력 데이터 규칙 (Output Schema)
const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string().describe('Identified product name'),
    brand: z.string().describe('Brand name'),
    category: z.string().describe('Category'),
    pettnerCompliance: z.object({
      isCompliant: z.boolean(),
      reason: z.string()
    })
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100),
    headline: z.string(),
    grade: z.string().optional(),
    statusTags: z.array(z.string())
  }),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number(),
    breedStandardRange: z.string(),
    overweightPercentage: z.number(),
    verdict: z.string()
  }).optional(),
  dietRoadmap: z.array(z.object({
    phase: z.string(),
    weight: z.number(),
    grams: z.number()
  })).optional(),
  scientificAnalysis: z.object({
    nutrientMass: z.object({
      protein_g: z.number(),
      fat_g: z.number(),
      carbs_g: z.number(),
      kcal: z.number()
    }),
    dogSpecific: z.object({
      breedRiskMatching: z.string()
    }).optional(),
    catSpecific: z.object({
      taurineCheck: z.string()
    }).optional()
  }),
  esgReport: z.object({
    environmental: z.string(),
    recallHistory: z.string()
  }),
  veterinaryAdvice: z.string()
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

// 3. AI 프롬프트 정의
const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are a world-class Veterinary Nutritionist. Analyze the pet food based on the provided data.
Match Target Language: {{{language}}}.

# [Input Data Context]
- Pet: {{{petType}}}, Breed: {{{petProfile.breed}}}, Gender: {{{petProfile.gender}}}, Neutered: {{{petProfile.neutered}}}
- Age: {{{petProfile.age}}} years, Weight: {{{petProfile.weight}}}kg, BCS: {{{petProfile.bcs}}}
- Lifestyle: Walking Time {{{petProfile.walkingTime}}}, Living Environment {{{petProfile.livingEnvironment}}}
- Medical: Health Conditions ({{#each petProfile.healthConditions}}{{{this}}}, {{/each}}), Allergies ({{#each petProfile.allergies}}{{{this}}}, {{/each}})
- Current Medications/Supplements: {{{petProfile.medications}}}
- Product: {{{productName}}} ({{{productCategory}}} - {{{detailedProductType}}})

# [Instructions]
1. **Neutered Correction**: If neutered is 'yes', reduce calorie needs (RER) by ~20%.
2. **Breed Genetics**: Check breed-specific vulnerabilities (e.g., Maltipoo -> Joints, Maltese -> Heart).
3. **Medication Audit**: If prescriptionPhotoDataUri or medications are provided, analyze if ingredients conflict with the drugs.
4. **Calculations**: Provide nutrient mass per 100g. Total nutrient mass cannot exceed 100g.
5. **ESG**: Research brand's recall history and environmental impact.

# [Multimodal Analysis]
{{#if photoDataUri}}
- Food Label Photo: {{media url=photoDataUri}}
{{/if}}
{{#if prescriptionPhotoDataUri}}
- Prescription/Supplement Photo: {{media url=prescriptionPhotoDataUri}}
{{/if}}`,
});

// 4. 실행 흐름 정의
const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async (input) => {
    try {
      const response = await analyzePetFoodIngredientsPrompt({
        ...input,
        isModeA: input.analysisMode === 'general',
        isModeB: input.analysisMode === 'custom',
      });

      if (!response || !response.output) {
        throw new Error('AI failed to return analysis output.');
      }

      return { ...response.output, status: 'success' as const };
    } catch (error: any) {
      console.error("AI Flow Error:", error);
      throw new Error(`분석 실패: ${error.message}`);
    }
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}
