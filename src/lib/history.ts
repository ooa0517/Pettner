
'use client';

import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * 분석 결과를 Firebase Firestore에 저장합니다.
 * Firestore는 'undefined' 값을 지원하지 않으므로 모든 선택적 필드를 null로 명시적 변환합니다.
 */
export function saveAnalysisToHistory(
    db: Firestore, 
    userId: string, 
    userInput: AnalyzePetFoodIngredientsInput, 
    analysisOutput: AnalyzePetFoodIngredientsOutput
) {
  if (!userId || !db) return;

  const historyCollectionRef = collection(db, 'users', userId, 'analysisHistory');
  
  const dataToSave = {
    userInput: {
      petType: userInput.petType,
      analysisMode: userInput.analysisMode,
      productName: userInput.productName || analysisOutput.productIdentity?.name || 'Unknown Product',
      brandName: userInput.brandName || analysisOutput.productIdentity?.brand || '',
      foodType: userInput.foodType || analysisOutput.productIdentity?.category || 'unknown',
      petProfile: userInput.petProfile ? {
        name: userInput.petProfile.name ?? null,
        breed: userInput.petProfile.breed ?? null,
        age: userInput.petProfile.age ?? null,
        weight: userInput.petProfile.weight ?? null,
        neutered: userInput.petProfile.neutered ?? null,
        activityLevel: userInput.petProfile.activityLevel ?? null,
        bcs: userInput.petProfile.bcs ?? null,
        environment: userInput.petProfile.environment ?? null,
        healthConditions: userInput.petProfile.healthConditions ?? [],
        allergies: userInput.petProfile.allergies ?? [],
      } : null,
      photoProvided: !!userInput.photoDataUri,
    },
    analysisOutput: analysisOutput,
    createdAt: serverTimestamp(),
  };

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
