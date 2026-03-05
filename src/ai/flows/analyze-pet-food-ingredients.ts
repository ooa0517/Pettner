
'use server';

/**
 * @fileOverview [Pettner V19.0 - Medication OCR & Interaction Audit]
 * - Added: prescriptionPhotoDataUri for medical document OCR.
 * - Logic: AI identifies medications from photos and audits interactions with food ingredients.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 1. 입력 데이터 규격
const AnalyzePetFoodIngredientsInputSchema = z.object({
  petType: z.enum(['dog', 'cat']).describe('반려동물 종류'),
  analysisMode: z.enum(['general', 'custom']).describe('분석 모드'),
  productName: z.string().optional().describe('제품명'),
  foodType: z.enum(['dry', 'wet', 'treat', 'supplement']).optional().describe('제품 유형'),
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
    })
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
  prompt: `You are the Pettner V19.0 Medical Diagnostic AI Auditor.
Response MUST be in pure JSON format ONLY.

# [V19.0 Medication & Interaction Protocol]

## 1. Multi-Image OCR Task
- IF photoDataUri is provided: Analyze the food ingredients and guaranteed analysis.
- IF prescriptionPhotoDataUri is provided: 
    1. Perform high-precision OCR on the prescription or supplement label.
    2. Identify active pharmaceutical ingredients (APIs) or supplement active compounds.
    3. Include these in the 'medicationAudit.identifiedMeds' field.

## 2. Interaction Audit (Food vs. Meds)
- Compare the identified medications (from OCR or text input) with the food ingredients.
- Check for contraindications (e.g., high calcium interfering with certain antibiotics, or high fat with pancreatitis meds).
- Provide detailed 'medicationAudit.findings' in {{{language}}}.

## 3. Energy Requirement (RER/DER)
- Calculate ideal weight based on breed ({{{petProfile.breed}}}) and age ({{{petProfile.age}}}).
- Adjust for neutering ({{{petProfile.neutered}}}) and activity ({{{petProfile.walkingTime}}}).

Language: {{{language}}} (ALL text must be in this language)
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
