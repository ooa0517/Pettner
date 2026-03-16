
'use client';

import { useState, useRef } from 'react';
import { ShoppingBag, Cookie, HeartPulse, Camera, Sparkles, ArrowLeft, Microscope, Info, ScanBarcode, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getGeneralAnalysis } from '@/app/actions';
import AnalysisLoading from '@/components/analysis-loading';
import AnalysisResult from '@/components/analysis-result';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import UsageLimitModal from '@/components/usage-limit-modal';

const CATEGORIES = [
  { id: 'food', label: '사료', icon: ShoppingBag, types: ['건식', '습식', '동결건조', '화식'] },
  { id: 'treat', label: '간식', icon: Cookie, types: ['육포', '츄르', '껌', '트릿'] },
  { id: 'supplement', label: '영양제', icon: HeartPulse, types: ['가루', '캡슐', '츄어블', '펌핑'] },
];

export default function AnalyzerA({ onBack, userData }: { onBack: () => void, userData: any }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [category, setCategory] = useState<any>(CATEGORIES[0]);
  const [detailedType, setDetailedType] = useState(CATEGORIES[0].types[0]);
  const [productName, setProductName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startScanning = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      toast({ variant: 'destructive', title: '카메라 권한 오류' });
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
      toast({ variant: "destructive", title: "성분표 사진 누락" });
      return;
    }

    // Usage Check
    if (!userData?.isPremium && (userData?.dailyUsageCount || 0) >= 5) {
      setShowLimitModal(true);
      return;
    }

    setStep('loading');

    try {
      const reader = new FileReader();
      const uri = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(image);
      });
      setPhotoDataUri(uri);

      const result = await getGeneralAnalysis({
        productCategory: category.id as any,
        detailedProductType: detailedType,
        productName,
        photoDataUri: uri,
      });

      if (result.error) throw new Error(result.error);

      if (user && db) {
        // Save History
        addDoc(collection(db, 'users', user.uid, 'analysisHistory'), {
          type: 'A',
          userInput: { productName, productCategory: category.id, detailedProductType: detailedType, analysisMode: 'general' },
          analysisOutput: result.data,
          createdAt: serverTimestamp(),
        });
        // Increment Usage
        updateDoc(doc(db, 'users', user.uid), {
          dailyUsageCount: increment(1)
        });
      }

      setAnalysisData(result.data);
      setStep('result');
    } catch (e: any) {
      toast({ variant: "destructive", title: "분석 실패", description: e.message });
      setStep('input');
    }
  };

  if (step === 'loading') return <AnalysisLoading />;
  if (step === 'result') return (
    <AnalysisResult 
      result={analysisData} 
      input={{ productName, productCategory: category.id, analysisMode: 'general', photoDataUri } as any} 
      onReset={() => setStep('input')} 
    />
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-12 pb-48 animate-in fade-in duration-700">
      <Button variant="ghost" onClick={onBack} className="rounded-full h-12 px-6 font-bold gap-2 hover:bg-white shadow-sm">
        <ArrowLeft size={18} /> 대시보드로
      </Button>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Microscope /></div>
          <h2 className="text-3xl font-black tracking-tight">제품 객관적 분석 (Analyzer_A)</h2>
        </div>
        <p className="text-muted-foreground font-medium">제품의 영양 스펙과 제조사 투명성을 팩트 기반으로 감사힙니다.</p>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-muted/30 p-10 border-b">
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <ShoppingBag className="text-primary"/> 1. 카테고리 선택
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            {CATEGORIES.map(c => (
              <div key={c.id} onClick={() => { setCategory(c); setDetailedType(c.types[0]); }} className={cn("flex flex-col items-center p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all gap-2", category.id === c.id ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                <c.icon size={32} />
                <span className="font-black text-xs">{c.label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <label className="text-xs font-black text-muted-foreground ml-2 uppercase tracking-widest">세부 유형</label>
            <div className="flex flex-wrap gap-2">
              {category.types.map((t: string) => (
                <button key={t} onClick={() => setDetailedType(t)} className={cn("px-5 py-2.5 rounded-full font-bold text-sm border-2 transition-all", detailedType === t ? "bg-primary text-white border-primary shadow-lg" : "bg-white border-muted text-muted-foreground")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-muted/30 p-10 border-b">
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <ScanBarcode className="text-primary"/> 2. 스마트 제품 식별
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="space-y-4">
             <label className="text-xs font-black text-muted-foreground ml-2 uppercase tracking-widest">바코드 인식</label>
             {!isScanning ? (
                <div onClick={startScanning} className="w-full h-40 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20 transition-all group">
                  <div className="p-4 bg-primary/5 rounded-full group-hover:scale-110 transition-transform">
                    <ScanBarcode className="h-10 w-10 text-primary opacity-40" />
                  </div>
                  <span className="font-black mt-3 text-muted-foreground">바코드 스캔 카메라 열기</span>
                </div>
             ) : (
                <div className="relative rounded-[2.5rem] overflow-hidden bg-black aspect-video shadow-2xl">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-4/5 h-1/3 border-2 border-primary/50 rounded-2xl animate-pulse" />
                  </div>
                  <Button onClick={stopScanning} size="icon" className="absolute top-4 right-4 rounded-full bg-black/50 backdrop-blur-md">
                    <X size={20} />
                  </Button>
                </div>
             )}
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-muted-foreground ml-2 uppercase tracking-widest">제품명 직접 입력</label>
            <Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="분석할 제품명을 입력해주세요." className="h-16 rounded-2xl border-none bg-muted/20 px-6 font-bold text-lg" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-muted/30 p-10 border-b">
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <FileText className="text-primary"/> 3. 정밀 분석용 성분표 촬영
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          <Alert className="bg-primary/5 border-primary/20 rounded-3xl p-6">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-black text-sm">촬영 가이드</AlertTitle>
            <AlertDescription className="text-xs font-medium text-primary/70 leading-relaxed mt-1">
              제품 뒷면의 <strong>'원재료명'</strong>과 <strong>'등록성분량'</strong>이 뚜렷하게 보이도록 한 화면에 꽉 차게 촬영해 주세요.
            </AlertDescription>
          </Alert>

          <div onClick={() => document.getElementById('image-a')?.click()} className={cn("relative w-full aspect-[4/3] border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden", image ? "border-success bg-success/5" : "border-muted/30")}>
            {image ? (
               <img src={URL.createObjectURL(image)} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
            ) : (
              <>
                <div className="p-6 bg-primary/5 rounded-full mb-4">
                  <Camera className="h-16 w-16 text-primary opacity-20" />
                </div>
                <span className="text-xl font-black text-muted-foreground">성분표 사진 촬영 / 업로드</span>
              </>
            )}
            <input id="image-a" type="file" accept="image/*" className="hidden" onChange={e => setImage(e.target.files?.[0] || null)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleAnalyze} disabled={!image} className="w-full h-28 rounded-[3.5rem] text-3xl font-black shadow-2xl bg-primary hover:scale-[1.02] active:scale-95 transition-all">
        <Sparkles className="mr-4 h-10 w-10" /> 분석 시작
      </Button>

      <UsageLimitModal open={showLimitModal} onOpenChange={setShowLimitModal} />
    </div>
  );
}

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
