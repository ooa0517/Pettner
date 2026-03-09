'use server';

/**
 * @fileOverview [Pettner Core Engine v14.0 - Professional Life-stage & Genetic Matching]
 * * - Mathematical Integrity: (Dosage * %) / 100.
 * - Genetic Engine: Breed-specific risk matching.
 * - Life-cycle: Puppy/Adult/Senior precision nutrition.
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
    targetAudience: z.object({
      lifeStage: z.string().describe('Recommended life stage (Puppy/Adult/Senior)'),
      recommendedBreeds: z.string().describe('Optimal breeds'),
    }).optional(),
    manufacturingDetails: z.object({
      productionType: z.string().describe('In-house/OEM/ODM'),
      facilityInfo: z.string().describe('Safety certifications'),
      sourcingOrigin: z.string().describe('Origin of primary ingredients')
    }).optional()
  }),
  scoreCard: z.object({
    totalScore: z.number().min(0).max(100).describe('Total score'),
    headline: z.string().describe('Core diagnostic headline'),
    statusTags: z.array(z.string()).describe('Status tags'),
    grade: z.string().optional().describe('Display grade (e.g., A+, B)')
  }),
  calculatorData: z.object({
    unitName: z.string().describe('Unit (g, pill, piece)'),
    defaultAmount: z.number().describe('Default amount for 1 unit or 100g'),
    kcalPerUnit: z.number().describe('Calories per unit'),
    nutrientsPerUnit: z.object({
      protein: z.number().describe('Protein mass in grams'),
      fat: z.number().describe('Fat mass in grams'),
      carbs: z.number().describe('Carb mass in grams')
    })
  }).optional(),
  personalMatching: z.object({
    matches: z.array(z.object({ feature: z.string(), reason: z.string() })),
    mismatches: z.array(z.object({ feature: z.string(), reason: z.string() }))
  }).optional(),
  weightDiagnosis: z.object({
    currentWeight: z.number(),
    idealWeight: z.number(),
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
      recallHistory: z.string()
    }).optional()
  }).optional(),
  feedingSummary: z.object({
    dailyAmount: z.string().describe('e.g., 230.2g'),
    perMealAmount: z.string().describe('e.g., 115.1g'),
    cupGuide: z.string().describe('e.g., 1.5 cups')
  }).optional(),
  veterinaryAdvice: z.string().describe('Final professional advice')
});

export type AnalyzePetFoodIngredientsOutput = z.infer<typeof AnalyzePetFoodIngredientsOutputSchema>;

// 3. AI 프롬프트 정의
const analyzePetFoodIngredientsPrompt = ai.definePrompt({
  name: 'analyzePetFoodIngredientsPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: AnalyzePetFoodIngredientsOutputSchema},
  prompt: `You are the world's most advanced Veterinary Nutritionist and Product Auditor.
Analyze the pet food product and provide a precision report in the TARGET LANGUAGE: {{{language}}}.

# [Pettner V14.0 Mandatory Execution: Strict Math & Logic]

## 1. Mathematical Integrity (STRICT)
- Calculate nutrient masses (Protein, Fat, Carbs) in 'g' for the default unit (100g or 1 Piece/Pill).
- Formula: (Unit_Amount * Ingredient_%) / 100.
- THE SUM OF NUTRIENT MASSES MUST NOT EXCEED THE UNIT AMOUNT. 
- Example: If defaultAmount is 100g, and Protein is 25%, Protein mass is 25g.
- Ensure all numerical data are Number types.

## 2. Professional Life-stage & Genetic Matching (Mode B)
- **Life-stage:** Determine if the pet is Puppy, Adult, or Senior based on Age. Evaluate if the product meets the specific nutritional guidelines (e.g., NRC/AAFCO growth vs maintenance).
- **Breed Genetics:** Use your knowledge to identify breed-specific risks (e.g., Maltipoo -> Patellar Luxation, Poodle -> Skin/Trachea). Analyze if ingredients (e.g., Glucosamine, Omega-3) support these risks.
- **Obesity Logic:** If BCS is 4 or 5, set 'idealWeight' to ~15-20% lower than current. The verdict must state weight loss is mandatory.

## 3. Product Specialist Audit (Mode A)
- Identify Manufacturer: In-house vs OEM/ODM.
- Track Sourcing: Origin of top 10 ingredients.

## 4. [CRITICAL] Deep Ingredient Purpose Analysis
- You must explain the SPECIFIC FUNCTION of key ingredients.
- Do NOT just say "Vitamin". Say "Vitamin E: Natural preservative and immune support".
- Do NOT just say "Chicken". Say "Chicken: Primary protein source for muscle development".
- If an ingredient is controversial (e.g., BHA, BHT), explicitly warn about its potential risks.
- Connect the ingredients to the pet's condition (e.g., "Glucosamine added for this Senior dog's joints").

# [Data Integrity]
- No Markdown. Pure JSON only.
- Match Target Language: {{{language}}}.

Input Context:
- Pet: {{{petType}}}, Breed: {{{petProfile.breed}}}, Weight: {{{petProfile.weight}}}, BCS: {{{petProfile.bcs}}}, Age: {{{petProfile.age}}}
- Product Name: {{{productName}}}
{{#if photoDataUri}}
- Photo Data: {{media url=photoDataUri}}
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
    try {
      // 1. AI 호출
      const response = await analyzePetFoodIngredientsPrompt({
        ...input,
        isModeA: input.analysisMode === 'general',
        isModeB: input.analysisMode === 'custom',
      });

      // 2. 응답 확인
      if (!response || !response.output) {
        console.error("❌ AI 응답 없음 (Response is null):", response);
        throw new Error('AI가 분석 결과를 반환하지 않았습니다.');
      }

      // 3. 성공 반환 (★ 여기가 수정되었습니다 ★)
      // 'success' 뒤에 as const를 붙여서 "이건 변하지 않는 값이야"라고 알려줍니다.
      return { ...response.output, status: 'success' as const };

    } catch (error: any) {
      // 4. 에러 처리
      console.error("🔥 AI 분석 중 치명적 오류 발생:");
      console.error("에러 메시지:", error.message);
      
      throw new Error(`분석 실패: ${error.message}`);
    }
  }
);

export async function analyzePetFoodIngredients(input: AnalyzePetFoodIngredientsInput): Promise<AnalyzePetFoodIngredientsOutput> {
  return analyzePetFoodIngredientsFlow(input);
}