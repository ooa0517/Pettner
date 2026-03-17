
'use client';

import { useState, useRef } from 'react';
import { Target, ShoppingBag, Camera, Sparkles, ArrowLeft, Info, HeartPulse, AlertTriangle, Dog, Cat, ScanBarcode, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getPersonalizedAnalysis } from '@/app/actions';
import AnalysisLoading from '@/components/analysis-loading';
import AnalysisResult from '@/components/analysis-result';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import UsageLimitModal from '@/components/usage-limit-modal';

const DOG_SYMPTOMS = ['눈물 자국', '슬개골 이상', '피부 발진', '귓병', '묽은 변', '기타'];
const DOG_ALLERGIES = ['닭고기', '소고기', '대두', '밀가루', '연어', '곡물', '없음'];
const DOG_CONCERNS = ['기호성 부족', '심한 변 냄새', '체중 증가', '활력 저하'];

const CAT_SYMPTOMS = ['헤어볼 구토', '혈뇨 및 화장실 실수', '턱드름', '푸석한 모질', '구강 질환', '기타'];
const CAT_ALLERGIES = ['특정 생선류', '가금류', '곡물', '유제품', '없음'];
const CAT_CONCERNS = ['음수량 부족', '까다로운 입맛', '잦은 구토', '비만 관리'];

export default function AnalyzerB({ onBack, userData }: { onBack: () => void, userData: any }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'product' | 'survey' | 'loading' | 'result'>('product');
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [productInfo, setProductInfo] = useState({ name: '', image: null as File | null });
  const [petProfile, setPetProfile] = useState<any>({ name: '', breed: '', age: '', weight: '', bcs: '3', symptoms: [], allergies: [], mainConcern: '' });
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const [isBarcodeScanning, setIsBarcodeScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const barcodeVideoRef = useRef<HTMLVideoElement>(null);

  const startBarcodeScan = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ variant: 'destructive', title: '카메라 미지원 브라우저' });
      return;
    }

    setIsBarcodeScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (barcodeVideoRef.current) barcodeVideoRef.current.srcObject = stream;
    } catch (e: any) {
      console.error('Barcode Camera Error:', e);
      let errorMsg = '카메라 권한이 거부되었습니다.';
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        errorMsg = '카메라 권한이 차단되었습니다. 브라우저 설정에서 카메라 사용을 허용해 주세요.';
      }
      setCameraError(errorMsg);
      toast({ variant: 'destructive', title: '카메라 권한 오류', description: errorMsg });
    }
  };

  const stopBarcodeScan = () => {
    if (barcodeVideoRef.current?.srcObject) {
      const stream = barcodeVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsBarcodeScanning(false);
    setCameraError(null);
  };

  const handleNextToSurvey = () => {
    if (!productInfo.image) {
      toast({ variant: "destructive", title: "성분표 사진 필요" });
      return;
    }
    setStep('survey');
  };

  const handleAnalyze = async () => {
    if (!userData?.isPremium && (userData?.dailyUsageCount || 0) >= 5) {
      setShowLimitModal(true);
      return;
    }

    setStep('loading');
    try {
      const reader = new FileReader();
      const uri = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(productInfo.image!);
      });
      setPhotoDataUri(uri);

      const analysisInput = {
        productInfo: { productCategory: 'food' as any, detailedProductType: '건식', productName: productInfo.name, photoDataUri: uri },
        petProfile: { ...petProfile, petType, age: parseFloat(petProfile.age) || 0, weight: parseFloat(petProfile.weight) || 0 },
      };

      const result = await getPersonalizedAnalysis(analysisInput);
      
      if (result.error) throw new Error(result.error);

      if (user && db) {
        const { photoDataUri: _, ...inputWithoutImage } = analysisInput.productInfo;
        addDoc(collection(db, 'users', user.uid, 'analysisHistory'), {
          type: 'B',
          userInput: { ...analysisInput, productInfo: inputWithoutImage },
          analysisOutput: result.data,
          createdAt: serverTimestamp(),
        });
        updateDoc(doc(db, 'users', user.uid), {
          dailyUsageCount: increment(1)
        });
      }

      setAnalysisData(result.data);
      setStep('result');
    } catch (e: any) {
      toast({ variant: "destructive", title: "분석 실패", description: e.message });
      setStep('survey');
    }
  };

  if (step === 'loading') return <AnalysisLoading />;
  if (step === 'result') return (
    <AnalysisResult 
      result={analysisData} 
      input={{ ...productInfo, photoDataUri, analysisMode: 'custom', petProfile } as any} 
      onReset={() => setStep('product')} 
    />
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-12 pb-48 animate-in fade-in duration-700">
      <Button variant="ghost" onClick={onBack} className="rounded-full h-12 px-6 font-bold gap-2 hover:bg-white shadow-sm">
        <ArrowLeft size={18} /> 대시보드로
      </Button>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/30"><Target /></div>
          <h2 className="text-3xl font-black tracking-tight">밀착 맞춤 진단 (Analyzer_B)</h2>
        </div>
        <p className="text-muted-foreground font-medium">아이의 증상과 알러지 데이터를 기반으로 1:1 매칭 처방전을 생성합니다.</p>
      </div>

      {step === 'product' ? (
        <div className="space-y-8 animate-in slide-in-from-right-5 duration-500">
           <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-10 border-b">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <ScanBarcode className="text-primary"/> 1단계: 제품 정보 & 바코드
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                 <label className="text-xs font-black text-muted-foreground ml-2 uppercase tracking-widest">바코드 촬영 (제품 자동 식별)</label>
                 {!isBarcodeScanning ? (
                    <div onClick={startBarcodeScan} className="w-full h-40 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/10 transition-all group">
                      <div className="p-4 bg-primary/5 rounded-full group-hover:scale-110 transition-transform">
                        <ScanBarcode className="h-10 w-10 text-primary opacity-40" />
                      </div>
                      <span className="font-black mt-3 text-muted-foreground">바코드 카메라 실행</span>
                    </div>
                 ) : (
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-black aspect-video shadow-2xl">
                      {cameraError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-8 text-center space-y-4">
                          <AlertTriangle className="text-destructive h-12 w-12" />
                          <p className="font-black text-foreground break-keep">{cameraError}</p>
                          <Button onClick={stopBarcodeScan} variant="outline" className="rounded-full">닫기</Button>
                        </div>
                      ) : (
                        <>
                          <video ref={barcodeVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                          <Button onClick={stopBarcodeScan} size="icon" className="absolute top-4 right-4 rounded-full bg-black/50 backdrop-blur-md">
                            <X size={20} />
                          </Button>
                        </>
                      )}
                    </div>
                 )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground ml-2 uppercase tracking-widest">제품명 직접 입력</label>
                <Input value={productInfo.name} onChange={e => setProductInfo({...productInfo, name: e.target.value})} placeholder="분석할 제품명을 정확히 입력하세요." className="h-16 rounded-2xl border-none bg-muted/20 px-6 font-bold text-lg" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-10 border-b">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <FileText className="text-primary"/> 2단계: 성분표 정밀 스캔
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
              <div onClick={() => document.getElementById('image-b')?.click()} className={cn("relative w-full aspect-[4/3] border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden", productInfo.image ? "border-success bg-success/5" : "border-muted/30")}>
                {productInfo.image ? (
                   <img src={URL.createObjectURL(productInfo.image)} className="absolute inset-0 w-full h-full object-cover" alt="Ingredients" />
                ) : (
                  <>
                    <div className="p-6 bg-primary/5 rounded-full mb-4">
                      <Camera className="h-16 w-16 text-primary opacity-20" />
                    </div>
                    <span className="text-xl font-black text-muted-foreground">제품 뒷면 성분표 촬영 / 업로드</span>
                  </>
                )}
                <input id="image-b" type="file" accept="image/*" className="hidden" onChange={e => setProductInfo({...productInfo, image: e.target.files?.[0] || null})} />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleNextToSurvey} className="w-full h-28 rounded-[3.5rem] text-2xl font-black shadow-2xl bg-primary hover:scale-[1.02] active:scale-95 transition-all">다음 단계로 (아이 상태 입력)</Button>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-5 duration-500">
          <div className="grid grid-cols-2 gap-4">
            <div onClick={() => setPetType('dog')} className={cn("flex flex-col items-center p-8 border-4 rounded-[3rem] cursor-pointer transition-all shadow-xl", petType === 'dog' ? "border-primary bg-primary/5" : "border-white bg-white opacity-40")}>
              <Dog size={64} className={cn("mb-2", petType === 'dog' ? "text-primary" : "")}/> 
              <span className="font-black text-lg">강아지</span>
            </div>
            <div onClick={() => setPetType('cat')} className={cn("flex flex-col items-center p-8 border-4 rounded-[3rem] cursor-pointer transition-all shadow-xl", petType === 'cat' ? "border-primary bg-primary/5" : "border-white bg-white opacity-40")}>
              <Cat size={64} className={cn("mb-2", petType === 'cat' ? "text-primary" : "")}/> 
              <span className="font-black text-lg">고양이</span>
            </div>
          </div>

          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-muted/30 p-10 border-b">
              <CardTitle className="text-xl font-black flex items-center gap-3"><HeartPulse className="text-primary" size={28}/> 3단계: 종별 정밀 설문</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground ml-2 uppercase tracking-widest">이름</label>
                  <Input value={petProfile.name} onChange={e => setPetProfile({...petProfile, name: e.target.value})} className="rounded-2xl h-14 bg-muted/20 border-none px-6 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground ml-2 uppercase tracking-widest">나이/체중</label>
                  <div className="flex gap-2">
                    <Input placeholder="살" type="number" value={petProfile.age} onChange={e => setPetProfile({...petProfile, age: e.target.value})} className="rounded-2xl h-14 bg-muted/20 border-none px-4 font-bold" />
                    <Input placeholder="kg" type="number" value={petProfile.weight} onChange={e => setPetProfile({...petProfile, weight: e.target.value})} className="rounded-2xl h-14 bg-muted/20 border-none px-4 font-bold" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <label className="font-black text-lg flex items-center gap-2 border-b pb-2"><AlertTriangle className="text-destructive" size={24}/> 현재 겪고 있는 증상</label>
                <div className="flex flex-wrap gap-2">
                  {(petType === 'dog' ? DOG_SYMPTOMS : CAT_SYMPTOMS).map(s => (
                    <button key={s} onClick={() => {
                      const cur = petProfile.symptoms;
                      setPetProfile({...petProfile, symptoms: cur.includes(s) ? cur.filter((x:any)=>x!==s) : [...cur, s]});
                    }} className={cn("px-6 py-3 rounded-full font-black text-sm border-2 transition-all", petProfile.symptoms.includes(s) ? "bg-destructive text-white border-destructive shadow-lg" : "bg-white border-muted text-muted-foreground")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="font-black text-lg flex items-center gap-2 border-b pb-2"><Info className="text-primary" size={24}/> 기피 알러지 원료</label>
                <div className="flex flex-wrap gap-2">
                  {(petType === 'dog' ? DOG_ALLERGIES : CAT_ALLERGIES).map(a => (
                    <button key={a} onClick={() => {
                      const cur = petProfile.allergies;
                      setPetProfile({...petProfile, allergies: cur.includes(a) ? cur.filter((x:any)=>x!==a) : [...cur, a]});
                    }} className={cn("px-6 py-3 rounded-full font-black text-sm border-2 transition-all", petProfile.allergies.includes(a) ? "bg-primary text-white border-primary shadow-lg" : "bg-white border-muted text-muted-foreground")}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="font-black text-lg flex items-center gap-2 border-b pb-2 text-primary">보호자의 최대 고민</label>
                <div className="grid grid-cols-2 gap-3">
                  {(petType === 'dog' ? DOG_CONCERNS : CAT_CONCERNS).map(c => (
                    <div key={c} onClick={() => setPetProfile({...petProfile, mainConcern: c})} className={cn("p-6 border-2 rounded-3xl cursor-pointer text-center font-black text-sm transition-all", petProfile.mainConcern === c ? "border-primary bg-primary/5 text-primary shadow-inner" : "border-muted text-muted-foreground opacity-60")}>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('product')} className="h-28 px-10 rounded-[3.5rem] font-bold text-lg border-2">이전</Button>
            <Button onClick={handleAnalyze} className="flex-1 h-28 rounded-[3.5rem] text-3xl font-black shadow-2xl bg-primary hover:scale-[1.02] active:scale-95 transition-all">맞춤 진단 시작</Button>
          </div>
        </div>
      )}

      <UsageLimitModal open={showLimitModal} onOpenChange={setShowLimitModal} />
    </div>
  );
}
