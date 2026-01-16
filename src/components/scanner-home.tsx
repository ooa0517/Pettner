'use client';

import { useRef, useState } from 'react';
import { Camera, Sparkles, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/language-context';

type ScannerHomeProps = {
  onImageSelect: (file: File, healthConditions: string) => void;
};

export default function ScannerHome({ onImageSelect }: ScannerHomeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [healthConditions, setHealthConditions] = useState('');
  const { t } = useLanguage();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file, healthConditions);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto text-center shadow-2xl shadow-primary/10 animate-in fade-in-50 duration-700 border-primary/20">
      <CardHeader className="p-8 md:p-12">
        <CardTitle className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight">{t('scannerHome.title')}</CardTitle>
        <CardDescription className="text-muted-foreground pt-3 text-base" dangerouslySetInnerHTML={{ __html: t('scannerHome.description')}} />
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="flex flex-col items-center space-y-6">
           <div className="w-full text-left space-y-2 mb-4">
              <Label htmlFor="health-conditions" className="flex items-center gap-2 font-semibold text-foreground">
                <HeartPulse className="w-5 h-5 text-primary" />
                {t('scannerHome.healthConditionsLabel')}
              </Label>
              <Textarea
                id="health-conditions"
                placeholder={t('scannerHome.healthConditionsPlaceholder')}
                value={healthConditions}
                onChange={(e) => setHealthConditions(e.target.value)}
                className="bg-background"
              />
           </div>

           <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
             <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Camera className="w-10 h-10 text-primary" />
            </div>
           </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <Button onClick={handleButtonClick} size="lg" className="text-lg py-7 px-8 rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow duration-300">
            <Sparkles className="mr-3" />
            {t('scannerHome.analyzeButton')}
          </Button>
          <p className="text-xs text-muted-foreground pt-2">
            {t('scannerHome.instruction')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
