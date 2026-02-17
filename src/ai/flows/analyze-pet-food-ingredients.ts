'use server';

/**
 * @fileOverview [Pettner Core Engine v11.0 - Global Multi-language & Ultra-Precision Audit]
 * 
 * - Mode A: [Product Scientist] - Focus on Manufacturing, Sourcing, ESG, and Spec.
 * - Mode B: [Pet Consultant] - Focus on Personalized Match, General Health, and Dosage.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const PromptInputSchema = AnalyzePetFoodIngredientsInputSchema.extend({
  isModeA: z.boolean().describe('단순 제품 분석 모드 여부'),
  isModeB: z.boolean().describe('맞춤 가이드 모드 여부'),
});

const AnalyzePetFoodIngredientsOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  productIdentity: z.object({
    name: z.string().describe('Exact identified product name'),
    brand: z.string().describe('Brand name'),
    category: z.string().describe('Category (e.g., Dry Food, Treat)'),
    qualityGrade: z.string().optional().describe('Quality grade (e.g., A, B, C)'),
    targetAudience: z.object({
      lifeStage: z.string().describe('Recommended life stage'),
      recommendedBreeds: z.string().describe('Optimal breed sizes'),
      focus: z.string().describe('Design focus/purpose')
    }).optional(),
    manufacturingDetails: z.object({
      productionType: z.string().describe('Production type (In-house/OEM/ODM)'),
      facilityInfo: z.string().describe('Facility info/Safety certifications'),
      sourcingOrigin: z.string().describe('Source of primary ingredients (e.g., Norway, USA)')
    }).optional()
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100).describe('Total score'),
    headline: z.string().describe('Core diagnostic headline'),
    statusTags: z.array(z.string()).describe('Status tags'),
    grade: z.string().optional().describe('Display grade (e.g., A+, B)')
  }),
  calculatorData: z.object({
    unitName: z.string().describe('Unit (g, oz, pill, piece)'),
    defaultAmount: z.number().describe('Default serving amount'),
    kcalPerUnit: z.number().describe('Calories per unit'),
    nutrientsPerUnit: z.object({
      protein: z.number().optional(),
      fat: z.number().optional(),
      carbs: z.number().optional()
    }).optional()
  }).optional(),
  personalMatching: z.object({
    matches: z.array(z.object({ feature: z.string(), reason: z.string() })),
    mismatches: z.array(z.object({ feature: z.string(), reason: z.string() }))
  }).optional(),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number().describe('Target ideal weight'),
    weightGap: z.number(),
    breedStandardRange: z.string().describe('Standard range for the breed'),
    breedGeneticInsight: z.string().describe('Genetic vulnerability insight'),
    overweightPercentage: z.number(),
    verdict: z.string()
  }).optional(),
  deepDive: z.object({
    ingredientAudit: z.object({
      tiers: z.array(z.object({
        level: z.string(),
        ingredients: z.array(z.string()),
        comment: z.string()
      })),
      giIndex: z.string(),
      giComment: z.string()
    }).optional(),
    nutritionalEngineering: z.object({
      ratios: z.object({
        caPRatio: z.string(),
        omega63Ratio: z.string(),
        balanceVerdict: z.string()
      })
    }).optional(),
    safetyToxicology: z.object({
      checks: z.array(z.object({ label: z.string(), status: z.boolean() })),
      recallHistory: z.string().describe('Brand recall and safety history')
    }).optional(),
    brandESG: z.object({
      rdLevel: z.string(),
      sustainability: z.string()
    }).optional()
  }).optional(),
  feedingSummary: z.object({
    dailyAmount: z.string().describe('Total daily amount (e.g., 100g, 3.5oz)'),
    perMealAmount: z.string().describe('Amount per meal (assuming 2 meals/day)'),
    cupGuide: z.string().describe('Feeding guide in cups (Paper cup for ko, Standard cup for en)')
  }).optional(),
  veterinaryAdvice: z.string().describe('Final veterinary advice')
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are the world's most advanced Veterinary Nutritionist and Product Auditor.
Analyze the pet food product and provide a precision report in the TARGET LANGUAGE: {{{language}}}.

# [Mandatory Execution: Error Prevention]
- Response Format: 반드시 순수한 JSON 데이터만 출력할 것. 마크다운 태그조차 생략하고 순수 객체만 반환하라.
- Language Sync: 모든 텍스트 필드는 반드시 {{{language}}}로 작성하라.
- Numerical Data: 모든 dosage, weight, calories 관련 수치는 Number(숫자) 타입으로 생성하라.

# [Logic Path Separation]
{{#if isModeA}}
## [Mode A: Product Scientist] - 단순 제품 분석 모드
- 사용자의 반려동물 정보를 절대 참조하지 마십시오.
- Identity Verification: OCR 데이터와 제품명을 99% 확률로 매칭하여 식별하십시오.
- Manufacturer Audit: 자사 생산(In-house) vs OEM/ODM 여부를 판별하고 제조 시설 안전 등급을 리포트하십시오.
- Ingredient Deep Dive: 제1~10원료의 수급 국가(Origin) 및 품질 등급을 분석하십시오.
- Product Spec: 100g당(사료) 혹은 1개당(간식) 영양 성분비 및 Kcal를 정밀 계산하십시오.
- ESG Report: 제조사의 리콜 이력, 기업 신뢰도, 지속 가능성을 분석하십시오.
{{/if}}

{{#if isModeB}}
## [Mode B: Personalized Consultant] - 맞춤형 건강 비서 모드
- 사용자가 입력한 품종, BCS(비만도), 질환, 알러지 데이터를 최우선으로 반영하십시오.
- Clinical Reasoning: 해당 품종의 표준 체중/유전병과 현재 상태를 비교하여 위험 요소를 짚어주십시오.
- Health Mapping: 제품 성분이 아이의 비만도, 라이프스타일, 기저 질환에 적합한지 수의학적 근거를 설명하십시오.
- Feeding Guide: 1일 권장 급여량(Daily) 및 1회 급여량(Per Meal, 2회 기준)을 산출하십시오.
{{/if}}

# [Data Integrity]
- 모든 수치는 10,000번의 시뮬레이션을 거친 듯한 정밀도로 산출하십시오.
- 사료(Cup), 영양제(Pill/Scoop), 간식(Piece) 단위를 자동 변환하여 적용하십시오.

Input Context:
- Pet: {{{petType}}}, Breed: {{{petProfile.breed}}}, Weight: {{{petProfile.weight}}}, BCS: {{{petProfile.bcs}}}
- Product Name: {{{productName}}}
- Photo Data: {{media url=photoDataUri}}`
});

const analyzePetFoodIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzePetFoodIngredientsFlow',
    inputSchema: AnalyzePetFoodIngredientsInputSchema,
    outputSchema: AnalyzePetFoodIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzePetFoodIngredientsPrompt({
      ...input,
      isModeA: input.analysisMode === 'general',
      isModeB: input.analysisMode === 'custom',
    });
    if (!output) throw new Error('AI Analysis Failed: No output data.');
    return { ...output, status: 'success' };
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}
