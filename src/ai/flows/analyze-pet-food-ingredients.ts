
'use server';

/**
 * @fileOverview [Pettner V18.0 - Precision Life Cycle Audit]
 * - Added: Neutering status, walking time, and living environment metrics.
 * - Logic: AI calculates RER (Resting Energy Requirement) adjustments based on neutering and lifestyle.
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
    neutered: z.enum(['yes', 'no', 'unknown']).optional().describe('중성화 여부'),
    bcs: z.string().optional(),
    activityLevel: z.string().optional(),
    walkingTime: z.string().optional().describe('평균 산책 시간 (없음, 30분 미만, 30~60분, 1시간 이상)'),
    livingEnvironment: z.enum(['INDOOR', 'OUTDOOR', 'BOTH', 'UNKNOWN']).optional().describe('생활 환경'),
    healthConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    waterIntake: z.string().optional(),
    stoolCondition: z.string().optional(),
    medications: z.string().optional().describe('복용 중인 약물'),
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
    manufacturingAudit: z.object({
      productionType: z.string(),
      facilitySafety: z.string(),
      sourcingOrigin: z.string()
    })
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100),
    headline: z.string(),
    statusTags: z.array(z.string()),
    grade: z.string().optional()
  }),
  weightDiagnosis: z.object({
    currentWeight: z.number().describe('입력된 체중'),
    idealWeight: z.number().describe('AI가 판단한 해당 품종/생애주기별 이상적 체중'),
    weightGap: z.number().describe('이상적 체중과의 차이'),
    breedStandardRange: z.string().describe('해당 품종의 표준 체중 범위'),
    overweightPercentage: z.number().describe('과체중 정도 (%)'),
    verdict: z.string().describe('체중에 대한 수의학적 소견')
  }).optional(),
  dietRoadmap: z.array(z.object({
    weight: z.number(),
    grams: z.number(),
    phase: z.string()
  })).optional().describe('목표 체중 도달을 위한 단계별 급여 로드맵'),
  scientificAnalysis: z.object({
    catSpecific: z.object({
      taurineCheck: z.string().optional(),
      arginineCheck: z.string().optional(),
      kidneyHealthMatching: z.string().optional(),
    }).optional(),
    dogSpecific: z.object({
      omnivorousBalance: z.string().optional(),
      jointHealthMatching: z.string().optional(),
      breedRiskMatching: z.string().optional(),
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
  veterinaryAdvice: z.string(),
  allergyWarning: z.string().optional()
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

// 3. AI 시스템 프롬프트
const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: AnalyzePetFoodIngredientsInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are the Pettner V18.0 Medical Diagnostic AI Auditor.
Response MUST be in pure JSON format ONLY.

# [V18.0 Precision Life Cycle Protocol]

## 1. Energy Requirement (RER/DER) Calculation
- IF neutered === 'yes', decrease calorie requirement by 15-20% as metabolic rate drops.
- IF activityLevel is 'HIGH' and walkingTime is 'OVER_60', increase calorie requirement by 20%.
- IF livingEnvironment is 'OUTDOOR', adjust for seasonal energy expenditure.

## 2. Medical Interaction Audit
- Check if ingredients in the product conflict with the listed 'medications' ({{{petProfile.medications}}}).
- Highlight if the food is suitable for the 'healthConditions' ({{{petProfile.healthConditions}}}).

## 3. Intelligent Data Completion
- IF weight is 0 or unknown, search your veterinary database for the standard weight of the breed ({{{petProfile.breed}}}) and age ({{{petProfile.age}}}). 

Language: {{{language}}} (ALL text must be in this language)
Pet: {{{petType}}}, Breed: {{{petProfile.breed}}}, Neutered: {{{petProfile.neutered}}}, Walking: {{{petProfile.walkingTime}}}
Allergies: {{{petProfile.allergies}}}, Medications: {{{petProfile.medications}}}
{{#if photoDataUri}}
- Perform OCR on the provided image to extract ingredients and guaranteed analysis.
{{/if}}`
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
