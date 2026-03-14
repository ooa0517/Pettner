
'use client';

/**
 * [Analyzer_A: Product-Only Analysis]
 * - Strictly independent component for Step 3-A.
 * - Added: Barcode simulation and dedicated Ingredient Label section.
 */

import { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Cookie, HeartPulse, Camera, Sparkles, ArrowLeft, Microscope, Info, CheckCircle2, ScanBarcode, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getGeneralAnalysis } from '@/app/actions';
import AnalysisLoading from '@/components/analysis-loading';
import AnalysisResult from '@/components/analysis-result';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [barcode, setBarcode] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  // Camera state simulation
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startScanning = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: 'destructive',
        title: '카메라 권한 오류',
        description: '바코드 스캔을 위해 카메라 권한을 허용해 주세요.',
      });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const handleAnalyze = async () => {
    if (!image) {
      toast({ variant: "destructive", title: "성분표 사진 누락", description: "정밀 분석을 위해 제품 뒷면 성분표를 촬영해 주세요." });
      return;
    }
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
        <p className="text-muted-foreground font-medium">제품의 스펙을 기반으로 수의학적 등급을 판별합니다.</p>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-muted/30 p-10 border-b">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <ShoppingBag className="text-primary"/> 1. 카테고리 선택
          </CardTitle>
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
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <ScanBarcode className="text-primary"/> 2. 스마트 제품 식별
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="space-y-4">
             <label className="text-sm font-black text-muted-foreground ml-2">바코드 스캔 (제품 식별용)</label>
             {!isScanning ? (
                <div onClick={startScanning} className="w-full h-32 border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20 transition-all">
                  <ScanBarcode className="h-10 w-10 text-primary opacity-30 mb-2" />
                  <span className="font-bold">바코드 카메라 열기</span>
                </div>
             ) : (
                <div className="relative rounded-[2rem] overflow-hidden bg-black aspect-video">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-1/2 border-2 border-primary rounded-lg animate-pulse" />
                  </div>
                  <Button onClick={stopScanning} className="absolute bottom-4 right-4 rounded-full">닫기</Button>
                </div>
             )}
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-muted-foreground ml-2">제품명 직접 입력 (또는 바코드 인식값)</label>
            <Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="제품명을 정확히 입력해주세요." className="h-14 rounded-2xl border-none bg-muted/20 px-6 font-bold" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-muted/30 p-10 border-b">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <FileText className="text-primary"/> 3. 정밀 분석용 성분표 촬영
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          <Alert className="bg-primary/5 border-primary/20 rounded-2xl">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary font-black">촬영 팁</AlertTitle>
            <AlertDescription className="text-xs font-medium text-primary/70">
              제품 뒷면의 '원재료명'과 '등록성분량'이 한 화면에 잘 보이도록 촬영해 주세요.
            </AlertDescription>
          </Alert>

          <div onClick={() => document.getElementById('image-a')?.click()} className={cn("relative w-full aspect-[4/3] border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all", image ? "border-success bg-success/5" : "border-muted/30")}>
            {image ? (
               <img src={URL.createObjectURL(image)} className="absolute inset-0 w-full h-full object-cover rounded-[2.3rem]" alt="Preview" />
            ) : (
              <>
                <Camera className="h-16 w-16 text-primary mb-4 opacity-20" />
                <span className="text-xl font-black">성분표 사진 촬영</span>
              </>
            )}
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
