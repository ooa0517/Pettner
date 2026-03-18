'use client';

import { useState, useRef } from 'react';
import { ShoppingBag, Camera, Sparkles, ArrowLeft, Info, HeartPulse, ScanBarcode, FileText, X, AlertTriangle, ChevronDown, CheckCircle2, Search, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getMasterAnalysis } from '@/app/actions';
import AnalysisLoading from '@/components/analysis-loading';
import AnalysisResult from '@/components/analysis-result';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import UsageLimitModal from '@/components/usage-limit-modal';
import { useLanguage } from '@/contexts/language-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const CATEGORIES = [
  { id: 'food', label: '식품(주식)', types: ['건식', '습식', '동결건조', '화식'] },
  { id: 'treat', label: '간식', types: ['육포', '츄르', '껌', '트릿'] },
  { id: 'supplement', label: '영양제', types: ['가루', '캡슐', '츄어블', '펌핑'] },
];

export default function UnifiedAnalyzer({ onBack, userData }: { onBack: () => void, userData: any }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [category, setCategory] = useState<any>(CATEGORIES[0]);
  const [detailedType, setDetailedType] = useState(CATEGORIES[0].types[0]);
  const [productName, setProductName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const petsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'pets');
  }, [db, user]);
  const { data: pets } = useCollection(petsQuery);

  const handleAnalyze = async () => {
    if (!selectedPet) {
      toast({ variant: "destructive", title: "반려동물을 선택해주세요." });
      return;
    }
    if (!image) {
      toast({ variant: "destructive", title: "성분표 사진을 업로드해주세요." });
      return;
    }

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

      const result = await getMasterAnalysis({
        productInfo: { productName, productCategory: category.id as any, detailedProductType: detailedType, photoDataUri: uri },
        petProfile: selectedPet,
        language: language,
      });

      if (result.error) throw new Error(result.error);

      if (user && db) {
        addDoc(collection(db, 'users', user.uid, 'analysisHistory'), {
          type: 'MASTER',
          userInput: { productName, categoryId: category.id, detailedType, petId: selectedPet.id },
          analysisOutput: result.data,
          createdAt: serverTimestamp(),
        });
        updateDoc(doc(db, 'users', user.uid), { dailyUsageCount: increment(1) });
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
      input={{ productName, photoDataUri, petProfile: selectedPet, language } as any} 
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
          <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/30"><Microscope /></div>
          <h2 className="text-3xl font-black tracking-tight">1:1 수의학 맞춤 진단</h2>
        </div>
        <p className="text-muted-foreground font-medium">아이의 프로필과 제품 성분을 대조하여 정밀 리포트를 생성합니다.</p>
      </div>

      {/* 1. Pet Selection */}
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-primary/5 p-10 border-b">
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <HeartPulse className="text-primary"/> 1. 진단 대상 선택
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          {pets && pets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pets.map(pet => (
                <div 
                  key={pet.id} 
                  onClick={() => setSelectedPet(pet)}
                  className={cn(
                    "p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all flex items-center gap-4",
                    selectedPet?.id === pet.id ? "border-primary bg-primary/5" : "border-muted opacity-60"
                  )}
                >
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    {pet.petType === 'cat' ? <Cat size={24}/> : <Dog size={24}/>}
                  </div>
                  <div>
                    <p className="font-black">{pet.name}</p>
                    <p className="text-xs font-bold text-muted-foreground">{pet.breed}</p>
                  </div>
                  {selectedPet?.id === pet.id && <CheckCircle2 className="ml-auto text-primary" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-4">
              <p className="text-muted-foreground font-bold">등록된 반려동물이 없습니다.</p>
              <Button onClick={() => window.location.href = '/account'} variant="outline" className="rounded-2xl">프로필 등록하러 가기</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Category & Product */}
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-primary/5 p-10 border-b">
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <ShoppingBag className="text-primary"/> 2. 제품 정보 입력
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map(c => (
              <div key={c.id} onClick={() => { setCategory(c); setDetailedType(c.types[0]); }} className={cn("flex flex-col items-center p-4 border-2 rounded-3xl cursor-pointer transition-all gap-2", category.id === c.id ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
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
          <div className="space-y-4">
            <label className="text-xs font-black text-muted-foreground ml-2 uppercase tracking-widest">제품명</label>
            <Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="제품명을 입력해주세요." className="h-16 rounded-2xl border-none bg-muted/20 px-6 font-bold" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Scan */}
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-primary p-10 text-white">
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <FileText /> 3. 성분표 라벨 촬영
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10">
          <div onClick={() => document.getElementById('image-master')?.click()} className={cn("relative w-full aspect-[4/3] border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden", image ? "border-success bg-success/5" : "border-muted/30")}>
            {image ? (
               <img src={URL.createObjectURL(image)} className="absolute inset-0 w-full h-full object-cover" alt="Label" />
            ) : (
              <>
                <Camera className="h-16 w-16 text-primary opacity-20 mb-4" />
                <span className="text-xl font-black text-muted-foreground">성분표 사진 촬영 / 업로드</span>
              </>
            )}
            <input id="image-master" type="file" accept="image/*" className="hidden" onChange={e => setImage(e.target.files?.[0] || null)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleAnalyze} disabled={!image || !selectedPet} className="w-full h-28 rounded-[3.5rem] text-3xl font-black shadow-2xl bg-primary hover:scale-[1.02] active:scale-95 transition-all">
        <Sparkles className="mr-4 h-10 w-10" /> 진단 리포트 생성
      </Button>

      <UsageLimitModal open={showLimitModal} onOpenChange={setShowLimitModal} />
    </div>
  );
}
