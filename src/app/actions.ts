'use server';

import { analyzePetFoodIngredients } from "@/ai/flows/analyze-pet-food-ingredients";
import type { AnalyzePetFoodIngredientsInput, AnalyzePetFoodIngredientsOutput } from "@/ai/flows/analyze-pet-food-ingredients";
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Server Action에서 직접 Firebase 사용을 위해 초기화
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

type ActionResult = {
  data?: AnalyzePetFoodIngredientsOutput;
  error?: string;
  isCached?: boolean;
}

/**
 * 제품 아이디(슬러그) 생성
 */
function generateProductId(brandName: string = '', productName: string = ''): string {
  const combined = `${brandName.trim()}-${productName.trim()}`.toLowerCase();
  return combined.replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-');
}

export async function getAnalysis(input: AnalyzePetFoodIngredientsInput): Promise<ActionResult> {
  try {
    const productId = generateProductId(input.brandName, input.productName);
    
    // 1. 글로벌 캐시 확인 (Firestore /products)
    if (productId && productId.length > 5) {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        console.log(`[Cache Hit] Product: ${productId}`);
        return { data: productSnap.data() as AnalyzePetFoodIngredientsOutput, isCached: true };
      }
    }

    // 2. 캐시 없으면 AI 분석 실행
    console.log(`[Cache Miss] Calling AI for: ${input.productName}`);
    const result = await analyzePetFoodIngredients(input);
    
    // 3. 분석 결과를 글로벌 캐시에 저장
    if (result.status === 'success' && productId && productId.length > 5) {
      const productRef = doc(db, 'products', productId);
      await setDoc(productRef, result);
    }

    return { data: result, isCached: false };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e.message || 'homePage.aiError';
    return { error: errorMessage.includes('must be provided') ? 'homePage.aiInputError' : 'homePage.aiError' };
  }
}
