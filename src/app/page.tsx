'use client';

import { useState } from 'react';
import type { AnalyzePetFoodIngredientsOutput } from '@/ai/flows/analyze-pet-food-ingredients';
import { getAnalysis } from '@/app/actions';
import AnalysisResult from '@/components/analysis-result';
import ScannerHome from '@/components/scanner-home';
import AnalysisLoading from '@/components/analysis-loading';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzePetFoodIngredientsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageAnalysis = async (file: File) => {
    setIsLoading(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const imageDataUri = reader.result as string;
      try {
        const result = await getAnalysis(imageDataUri);
        if (result.error) {
          throw new Error(result.error);
        }
        setAnalysisResult(result.data);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "분석 실패",
          description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.",
        });
        setAnalysisResult(null);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error: ", error);
      toast({
        variant: "destructive",
        title: "파일 읽기 실패",
        description: "이미지를 읽는 중 오류가 발생했습니다. 다른 파일을 선택해 주세요.",
      });
      setIsLoading(false);
    };
  };
  
  const handleReset = () => {
    setAnalysisResult(null);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4 md:p-8">
      <div className="w-full max-w-4xl">
        {isLoading ? (
          <AnalysisLoading />
        ) : analysisResult ? (
          <AnalysisResult result={analysisResult} onReset={handleReset} />
        ) : (
          <ScannerHome onImageSelect={handleImageAnalysis} />
        )}
      </div>
    </div>
  );
}
