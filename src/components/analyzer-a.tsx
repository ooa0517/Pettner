
'use client';

/**
 * [Analyzer_A: Product-Only Analysis]
 * - Strictly independent component for Step 3-A.
 */

import { useState } from 'react';
import { ShoppingBag, Cookie, HeartPulse, Camera, Sparkles, ArrowLeft, Microscope, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getGeneralAnalysis } from '@/app/actions';
import AnalysisLoading from '@/components/analysis-loading';
import AnalysisResult from '@/components/analysis-result';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  { id: 'food', label: '사료', icon: ShoppingBag, types: ['건식', '습식', '동결건조', '화식'] },
  { id: 'treat', label: '간식', icon: Cookie, types: ['육포', '츄르', '껌', '트릿'] },
  { id: 'supplement', label: '영양제', icon: HeartPulse, types: ['가루', '캡슐', '츄어블', '펌핑'] },
];

export default function AnalyzerA({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [category, setCategory] = useState<any>(CATEGORIES[0]);
  const [detailedType, setDetailedType] = useState(CATEGORIES[0].types[0]);
  const [productName, setProductName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!image) return;
    setStep('loading');

    const reader = new FileReader();
    const photoDataUri = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(image);
    });

    const result = await getGeneralAnalysis({
      productCategory: category.id as any,
      detailedProductType: detailedType,
      productName,
      photoDataUri,
    });

    if (result.error) {
      toast({ variant: "destructive", title: "분석 실패", description: result.error });
      setStep('input');
    } else {
      setAnalysisData(result.data);
      setStep('result');
    }
  };

  if (step === 'loading') return <AnalysisLoading />;
  if (step === 'result') return <AnalysisResult result={analysisData} input={{ productName, productCategory: category.id, analysisMode: 'general' } as any} onReset={() => setStep('input')} />;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-12 pb-48">
      <Button variant="ghost" onClick={onBack} className="rounded-full h-12 px-6 font-bold gap-2">
        <ArrowLeft size={18} /> 처음으로
      </Button>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Microscope /></div>
          <h2 className="text-3xl font-black tracking-tight">제품 정보 수집 (Analyzer_A)</h2>
        </div>
        <p className="text-muted-foreground font-medium">제품의 팩트와 품질 데이터를 전수 조사합니다.</p>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-muted/30 p-10 border-b">
          <CardTitle className="text-xl font-black">1. 카테고리 선택</CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            {CATEGORIES.map(c => (
              <div key={c.id} onClick={() => { setCategory(c); setDetailedType(c.types[0]); }} className={cn("flex flex-col items-center p-6 border-4 rounded-3xl cursor-pointer transition-all gap-2", category.id === c.id ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                <c.icon size={32} />
                <span className="font-black text-sm">{c.label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <label className="text-sm font-black text-muted-foreground ml-2">세부 유형</label>
            <div className="flex flex-wrap gap-2">
              {category.types.map((t: string) => (
                <Badge key={t} onClick={() => setDetailedType(t)} variant="outline" className={cn("px-4 py-2 rounded-full font-bold cursor-pointer border-2", detailedType === t ? "border-primary bg-primary text-white" : "border-muted text-muted-foreground")}>
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-muted/30 p-10 border-b">
          <CardTitle className="text-xl font-black">2. 제품 식별 및 촬영</CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-black text-muted-foreground ml-2">제품명 직접 입력</label>
            <Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="제품명을 정확히 입력해주세요." className="h-14 rounded-2xl border-none bg-muted/20 px-6 font-bold" />
          </div>
          <div onClick={() => document.getElementById('image-a')?.click()} className={cn("relative w-full aspect-video border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all", image ? "border-success bg-success/5" : "border-muted/30")}>
            <Camera className="h-16 w-16 text-primary mb-4 opacity-20" />
            <span className="text-xl font-black">{image ? "라벨 사진 준비 완료" : "제품 뒷면 성분표 촬영"}</span>
            <input id="image-a" type="file" accept="image/*" className="hidden" onChange={e => setImage(e.target.files?.[0] || null)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleAnalyze} disabled={!image} className="w-full h-24 rounded-[3rem] text-2xl font-black shadow-2xl bg-primary hover:scale-[1.02] transition-transform">
        <Sparkles className="mr-3 h-8 w-8" /> 분석 시작
      </Button>
    </div>
  );
}
