'use client';

import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * 분석 결과를 Firebase Firestore에 저장합니다.
 */
export function saveAnalysisToHistory(
    db: Firestore, 
    userId: string, 
    userInput: AnalyzePetFoodIngredientsInput, 
    analysisOutput: AnalyzePetFoodIngredientsOutput
) {
  if (!userId || !db) return;

  const historyCollectionRef = collection(db, 'users', userId, 'analysisHistory');
  
  // Save a cleaner version of input for history
  const dataToSave = {
    userInput: {
      petType: userInput.petType,
      analysisMode: userInput.analysisMode,
      productName: userInput.productName || analysisOutput.productIdentity.name,
      brandName: userInput.brandName || analysisOutput.productIdentity.brand || '',
      foodType: userInput.foodType || analysisOutput.productIdentity.category || 'unknown',
      petProfile: userInput.petProfile ? {
        name: userInput.petProfile.name,
        breed: userInput.petProfile.breed,
        age: userInput.petProfile.age,
        weight: userInput.petProfile.weight,
        healthConditions: userInput.petProfile.healthConditions,
      } : undefined,
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
