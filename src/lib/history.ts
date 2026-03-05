
'use client';

import { collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { AnalyzePetFoodIngredientsOutput, AnalyzePetFoodIngredientsInput } from '@/ai/flows/analyze-pet-food-ingredients';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * 분석 결과를 Firebase Firestore에 저장합니다.
 * 모든 상세 설문 데이터를 포함하여 저장하도록 업데이트되었습니다.
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
        age: userInput.petProfile.age ?? 0,
        weight: userInput.petProfile.weight ?? 0,
        neutered: userInput.petProfile.neutered ?? 'unknown',
        bcs: userInput.petProfile.bcs ?? '3',
        activityLevel: userInput.petProfile.activityLevel ?? 'UNKNOWN',
        walkingTime: userInput.petProfile.walkingTime ?? 'UNKNOWN',
        livingEnvironment: userInput.petProfile.livingEnvironment ?? 'UNKNOWN',
        healthConditions: userInput.petProfile.healthConditions ?? [],
        allergies: userInput.petProfile.allergies ?? [],
        waterIntake: userInput.petProfile.waterIntake ?? 'UNKNOWN',
        stoolCondition: userInput.petProfile.stoolCondition ?? 'UNKNOWN',
        medications: userInput.petProfile.medications ?? '',
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
