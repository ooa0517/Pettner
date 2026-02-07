
'use client';

import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Firestore에 실제로 저장되는 데이터 타입 (가족 연결 및 분석 히스토리를 위해 정교하게 구성)
type UserInputForHistory = {
    petType: 'dog' | 'cat';
    productName: string;
    brandName: string;
    foodType: string; // 사료, 간식, 영양제 등 유형 저장
    lifeStage: 'PUPPY' | 'ADULT' | 'SENIOR' | 'ALL_STAGES';
    ingredientsText: string;
    healthConditions: string;
    photoProvided: boolean;
};

/**
 * 분석 결과를 Firebase Firestore에 저장합니다.
 */
export function saveAnalysisToHistory(
    db: Firestore, 
    userId: string, 
    userInput: UserInputForHistory, 
    analysisOutput: AnalyzePetFoodIngredientsOutput
) {
  if (!userId || !db) return;

  const historyCollectionRef = collection(db, 'users', userId, 'analysisHistory');
  
  const dataToSave = {
    userInput: {
      ...userInput,
      productName: userInput.productName || analysisOutput.productInfo.name,
      brandName: userInput.brandName || analysisOutput.productInfo.brand || '',
      foodType: userInput.foodType || analysisOutput.productInfo.type || 'unknown'
    },
    analysisOutput: analysisOutput,
    createdAt: serverTimestamp(),
  };

  // 비동기로 저장 시도 (UI 흐름을 방해하지 않음)
  addDoc(historyCollectionRef, dataToSave)
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: historyCollectionRef.path,
            operation: 'create',
            requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}
