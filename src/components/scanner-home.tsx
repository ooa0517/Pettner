'use client';

import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type ScannerHomeProps = {
  onImageSelect: (file: File) => void;
};

export default function ScannerHome({ onImageSelect }: ScannerHomeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto text-center shadow-lg animate-in fade-in duration-500">
      <CardHeader className="p-8">
        <CardTitle className="text-3xl font-bold font-headline">사료 성분, AI로 10초만에 분석</CardTitle>
        <CardDescription className="text-muted-foreground pt-2">
          어려운 성분표, 사진 한 장으로 해결하세요. <br />
          수의 영양학 전문가 AI가 과학적 근거에 기반해 분석해드립니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="flex flex-col items-center space-y-6">
          <div className="p-6 bg-primary/10 rounded-full">
            <div className="p-5 bg-primary/20 rounded-full">
              <Camera className="w-16 h-16 text-primary" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <Button onClick={handleButtonClick} size="lg" className="text-lg py-7 px-8 rounded-full shadow-md">
            사료/영양제 성분 분석하기
          </Button>
          <p className="text-xs text-muted-foreground">
            * '등록성분량' 및 '원료명'이 잘 보이게 찍어주세요.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
