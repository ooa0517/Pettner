
'use server';

/**
 * @fileOverview [Pettner V19.1 - Detailed Product Categorization]
 * - Added: productCategory and detailedProductType for better context.
 * - Logic: AI uses categorization to apply different nutritional benchmarks (e.g., AAFCO for food vs. functional limits for supplements).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. 입력 데이터 규격
const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).describe('분석 모드'),
  productName: z.string().optional().describe('제품명'),
  // 카테고리 체계 고도화
  productCategory: z.enum(['food', 'treat', 'supplement']).describe('제품 대분류 (사료, 간식, 영양제)'),
  detailedProductType: z.string().optional().describe('세부 유형 (건식, 습식, 껌, 유산균 등)'),
  
  photoDataUri: z.string().optional().describe("사료 라벨 사진 데이터 URI"),
  prescriptionPhotoDataUri: z.string().optional().describe("처방전 또는 영양제 라벨 사진 데이터 URI"),
  language: z.string().optional().default('ko').describe("출력 언어 (ko, en)"),
  petProfile: z.object({
    name: z.string().optional(),
    breed: z.string().optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    neutered: z.enum(['yes', 'no', 'unknown']).optional().describe('중성화 여부'),
    bcs: z.string().optional(),
    activityLevel: z.string().optional(),
    walkingTime: z.string().optional().describe('평균 산책 시간'),
    livingEnvironment: z.enum(['INDOOR', 'OUTDOOR', 'BOTH', 'UNKNOWN']).optional().describe('생활 환경'),
    healthConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    waterIntake: z.string().optional(),
    stoolCondition: z.string().optional(),
    medications: z.string().optional().describe('복용 중인 약물 직접 입력'),
  }).optional(),
});

export type AnalyzePetFoodIngredientsInput = z.infer<typeof AnalyzePetFoodIngredientsInputSchema>;

// 2. 출력 데이터 규격
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
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100),
    headline: z.string(),
    statusTags: z.array(z.string()),
    grade: z.string().optional()
  }),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number(),
    weightGap: z.number(),
    breedStandardRange: z.string(),
    overweightPercentage: z.number(),
    verdict: z.string()
  }).optional(),
  medicationAudit: z.object({
    identifiedMeds: z.array(z.string()).describe('처방전/사진에서 인식된 약물 리스트'),
    interactionRisk: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']),
    findings: z.string().describe('약물과 사료 성분 간의 상호작용 분석 결과')
  }).optional(),
  scientificAnalysis: z.object({
    nutrientMass: z.object({
      protein_g: z.number(),
      fat_g: z.number(),
      carbs_g: z.number(),
      kcal: z.number()
    }),
    catSpecific: z.object({
      taurineCheck: z.string().optional(),
    }).optional(),
    dogSpecific: z.object({
      breedRiskMatching: z.string().optional(),
    }).optional()
  }),
  veterinaryAdvice: z.string(),
  esgReport: z.object({
    environmental: z.string(),
    corporateEthics: z.string(),
    recallHistory: z.string()
  })
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

// 3. AI 시스템 프롬프트
const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are the Pettner V19.1 Medical Diagnostic AI Auditor.
Response MUST be in pure JSON format ONLY.

# [V19.1 Protocol: Categorical Context]
- Category: {{{productCategory}}} (Sub-type: {{{detailedProductType}}})
- Based on the category, adjust your nutritional benchmarks.
- IF 'food': Focus on complete and balanced nutrition (AAFCO/NRC).
- IF 'treat': Focus on calorie density and harmful additives.
- IF 'supplement': Focus on functional efficacy and safe upper limits of vitamins/minerals.

# [Medication & Interaction Protocol]
- IF photoDataUri is provided: Analyze the food ingredients and guaranteed analysis.
- IF prescriptionPhotoDataUri is provided: Perform OCR on the prescription/supplement label. Identify APIs and audit interactions with the food ingredients.

# [Energy Requirement]
- Calculate based on breed ({{{petProfile.breed}}}), age ({{{petProfile.age}}}), weight ({{{petProfile.weight}}}), neutering ({{{petProfile.neutered}}}), and activity.

Language: {{{language}}}
{{#if photoDataUri}}Food Photo: {{media url=photoDataUri}}{{/if}}
{{#if prescriptionPhotoDataUri}}Prescription Photo: {{media url=prescriptionPhotoDataUri}}{{/if}}`
});

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
    return { ...response.output, status: 'success' as const };
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}
