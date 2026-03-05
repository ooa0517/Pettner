
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
  
  const dataToSave = {
    userInput: {
      petType: userInput.petType,
      analysisMode: userInput.analysisMode,
      productName: userInput.productName || analysisOutput.productIdentity?.name || 'Unknown Product',
      productCategory: userInput.productCategory,
      detailedProductType: userInput.detailedProductType,
      brandName: analysisOutput.productIdentity?.brand || '',
      petProfile: userInput.petProfile ? {
        name: userInput.petProfile.name ?? null,
        gender: userInput.petProfile.gender ?? 'unknown',
        breed: userInput.petProfile.breed ?? null,
        age: userInput.petProfile.age ?? null,
        weight: userInput.petProfile.weight ?? null,
        neutered: userInput.petProfile.neutered ?? null,
        bcs: userInput.petProfile.bcs ?? null,
        activityLevel: userInput.petProfile.activityLevel ?? null,
        healthConditions: userInput.petProfile.healthConditions ?? [],
        allergies: userInput.petProfile.allergies ?? [],
        waterIntake: userInput.petProfile.waterIntake ?? null,
        stoolCondition: userInput.petProfile.stoolCondition ?? null,
        medications: userInput.petProfile.medications ?? null,
      } : null,
      photoProvided: !!userInput.photoDataUri,
      prescriptionProvided: !!userInput.prescriptionPhotoDataUri,
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
