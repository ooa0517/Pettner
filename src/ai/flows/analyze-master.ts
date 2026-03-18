'use server';

/**
 * @fileOverview [Pettner 1-on-1 Master Engine v1.0]
 * - Unified Diagnosis AI for Pet Food.
 * - Roles: Chief Veterinary Nutritionist.
 * - Logic: RER/DER Math, NFE Carb Reverse Engineering, Dual-Filtering.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMasterInputSchema = z.object({
  productInfo: z.object({
    productName: z.string().optional(),
    productCategory: z.enum(['food', 'treat', 'supplement']),
    detailedProductType: z.string(),
    photoDataUri: z.string(),
  }),
  petProfile: z.object({
    name: z.string(),
    petType: z.enum(['dog', 'cat']),
    breed: z.string(),
    ageYears: z.number(),
    ageMonths: z.number(),
    gender: z.enum(['male', 'female']),
    isNeutered: z.boolean(),
    weight: z.number(),
    bcs: z.enum(['THIN', 'IDEAL', 'OVERWEIGHT', 'OBESE']),
    stoolStatus: z.enum(['HARD', 'IDEAL', 'SOFT']),
    eatingHabit: z.enum(['FAST', 'NORMAL', 'SLOW']),
    usagePurpose: z.enum(['DIET', 'SKIN', 'ODOR', 'FACTCHECK']),
    medications: z.string().optional(),
  }),
  language: z.string().optional().default('ko'),
});

export type AnalyzeMasterInput = z.infer<typeof AnalyzeMasterInputSchema>;

const AnalyzeMasterOutputSchema = z.object({
  language: z.string(),
  report_type: z.string(),
  result_data: z.object({
    "1_matching_insight": z.object({
      "match_score": z.number().min(0).max(100),
      "clinical_comment": z.string()
    }),
    "2_strict_prescription": z.object({
      "target_weight": z.number(),
      "daily_amount_g": z.number(),
      "amount_per_meal_cup": z.string(),
      "water_intake_guide": z.string()
    }),
    "3_risk_and_synergy": z.object({
      "allergy_disease_red_flag": z.string(),
      "supplement_collision": z.string()
    }),
    "4_fact_check_and_nutrition": z.object({
      "real_meat_vs_carb": z.string(),
      "carb_pct": z.number().optional(),
      "protein_pct": z.number().optional(),
      "nutrition_radar": z.object({
        "aafco_fediaf_met": z.boolean(),
        "comment": z.string(),
        "radarData": z.array(z.object({
          "nutrient": z.string(),
          "value": z.number(),
          "standardAAFCO": z.number(),
          "standardFEDIAF": z.number()
        })).optional()
      })
    }),
    "5_physical_and_prediction": z.object({
      "kibble_and_eating_habit": z.string(),
      "satiety_index": z.string(),
      "stool_and_odor": z.string()
    }),
    "6_ingredient_audit": z.array(z.object({
      "name": z.string(),
      "grade": z.enum(['green', 'yellow', 'red']),
      "reason": z.string()
    })),
    "7_economics_and_plan_b": z.object({
      "days_to_consume": z.number(),
      "cost_per_day": z.number(),
      "manufacturer_trust": z.string(),
      "plan_b_recommendation": z.string()
    })
  })
});

export type AnalyzeMasterOutput = z.infer<typeof AnalyzeMasterOutputSchema>;

const masterPrompt = ai.definePrompt({
  name: 'analyzeMasterPrompt',
  input: {schema: AnalyzeMasterInputSchema},
  output: {schema: AnalyzeMasterOutputSchema},
  prompt: `You are the world's leading Veterinary Nutritionist and the 1:1 Diagnosis AI for 'Pettner'.
Target Language: {{language}}. Use professional and sharp veterinary terminology.

# ABSOLUTE RULES
1. [Dynamic Language]: Follow {{language}} strictly (Korean or English).
2. [Double Filtering]: 
   - 1st Filter: Match Breed ({{petProfile.breed}}) and computed life stage based on age ({{petProfile.ageYears}}y {{petProfile.ageMonths}}m).
   - 2nd Filter: Check for conflicts with purpose ({{petProfile.usagePurpose}}), eating habit ({{petProfile.eatingHabit}}), and medications ({{petProfile.medications}}).
3. [Strict Math]: Use RER = 70 * ({{petProfile.weight}} ^ 0.75). DER coefficient: 1.6 if neutered, 1.8 if not.
   - Calculate daily_amount_g and cups (1 cup approx 80g).
4. [Carb Reverse Engineering]: 
   - Mandatory: Carb % = 100 - (Protein + Fat + Ash + Fiber + Moisture). Assume 8% Ash if missing.
   - Expose the "hidden sugars" if carb > 35%.
5. [No Generalization]: Be firm and clinical. 2-3 sentences per field.

# INPUT CONTEXT
Pet: {{petProfile.name}} ({{petProfile.petType}}), {{petProfile.breed}}, {{petProfile.weight}}kg, BCS: {{petProfile.bcs}}
Habit: {{petProfile.eatingHabit}}, Stool: {{petProfile.stoolStatus}}, Purpose: {{petProfile.usagePurpose}}
Product: {{productInfo.productName}} ({{productInfo.productCategory}})
OCR Label Data: {{media url=productInfo.photoDataUri}}`,
});

export async function analyzeMaster(input: AnalyzeMasterInput): Promise<AnalyzeMasterOutput> {
  const {output} = await masterPrompt(input);
  if (!output) throw new Error('AI analysis failed.');
  return output;
}
