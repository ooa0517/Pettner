
'use client';

import { useState } from 'react';
import { ShoppingBag, Camera, Sparkles, ArrowLeft, Info, HeartPulse, FileText, X, AlertTriangle, ChevronDown, CheckCircle2, Search, Microscope, PlusCircle } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PetProfileSurvey from '@/components/pet-profile-survey';

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
  const [showPetSurvey, setShowPetSurvey] = useState(false);

  const petsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'pets');
  }, [db, user]);
  const { data: pets, isLoading: isPetsLoading } = useCollection(petsQuery);

  const handleAnalyze = async () => {
    if (!selectedPet) {
      toast({ variant: "destructive", title: "진단 대상을 선택해주세요", description: "리포트를 받을 아이를 먼저 선택해야 합니다." });
      return;
    }
    if (!image) {
      toast({ variant: "destructive", title: "제품 사진이 필요합니다", description: "성분표 라벨이 잘 보이게 촬영해주세요." });
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
      toast({ variant: "destructive", title: "분석 엔진 오류", description: e.message });
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
      <Button variant="ghost" onClick={onBack} className="rounded-full h-12 px-6 font-bold gap-2 hover:bg-white shadow-sm active:scale-95 transition-all">
        <ArrowLeft size={18} /> 대시보드로 돌아가기
      </Button>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary rounded-[1.5rem] text-white shadow-2xl shadow-primary/30 animate-pulse"><Microscope size={32} /></div>
          <div>
            <h2 className="text-4xl font-black tracking-tight leading-none">1:1 수의학 맞춤 진단</h2>
            <p className="text-muted-foreground font-medium mt-2">아이의 프로필과 제품 성분을 대조하여 정밀 리포트를 생성합니다.</p>
          </div>
        </div>
      </div>

      {/* 1. Pet Selection */}
      <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white group hover:shadow-primary/5 transition-all duration-500">
        <CardHeader className="bg-primary/5 p-10 border-b">
          <CardTitle className="text-2xl font-black flex items-center gap-3">
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
                    "p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all flex items-center gap-4 group",
                    selectedPet?.id === pet.id ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" : "border-muted opacity-60 hover:opacity-100 hover:border-muted-foreground/30"
                  )}
                >
                  <div className="p-3 bg-white rounded-2xl shadow-sm transition-transform group-hover:scale-110">
                    {pet.petType === 'cat' ? <Cat size={28}/> : <Dog size={28}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-lg truncate">{pet.name}</p>
                    <p className="text-xs font-bold text-muted-foreground truncate">{pet.breed}</p>
                  </div>
                  {selectedPet?.id === pet.id && <CheckCircle2 className="text-primary fill-primary/10 shrink-0" size={24} />}
                </div>
              ))}
              <div 
                onClick={() => setShowPetSurvey(true)}
                className="p-6 border-4 border-dashed border-muted rounded-[2.5rem] cursor-pointer transition-all flex items-center justify-center gap-3 opacity-60 hover:opacity-100 hover:bg-muted/10 group"
              >
                <PlusCircle className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-black text-muted-foreground">새 식구 등록</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-6 bg-muted/5 rounded-[2.5rem] border-2 border-dashed">
              <div className="p-4 bg-white rounded-full w-fit mx-auto shadow-sm">
                <HeartPulse className="h-10 w-10 text-muted-foreground opacity-30" />
              </div>
              <div className="space-y-1 px-10">
                <p className="text-muted-foreground font-black text-lg">등록된 반려동물이 없습니다.</p>
                <p className="text-sm text-muted-foreground font-medium">우리 아이 맞춤 진단을 위해 프로필을 먼저 등록해주세요.</p>
              </div>
              <Button onClick={() => setShowPetSurvey(true)} className="rounded-[1.5rem] h-14 px-10 font-black text-lg shadow-xl shadow-primary/20">프로필 등록하러 가기</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Category & Product */}
      <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
        <CardHeader className="bg-primary/5 p-10 border-b">
          <CardTitle className="text-2xl font-black flex items-center gap-3">
            <ShoppingBag className="text-primary"/> 2. 제품 정보 입력
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-10">
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map(c => (
              <div key={c.id} onClick={() => { setCategory(c); setDetailedType(c.types[0]); }} className={cn("flex flex-col items-center p-5 border-4 rounded-[2rem] cursor-pointer transition-all gap-2", category.id === c.id ? "border-primary bg-primary/5 shadow-md scale-[1.02]" : "border-muted opacity-40 hover:opacity-80")}>
                <span className="font-black text-sm">{c.label}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <label className="text-xs font-black text-muted-foreground ml-3 uppercase tracking-widest">세부 유형 선택</label>
            <div className="flex flex-wrap gap-2">
              {category.types.map((t: string) => (
                <button key={t} onClick={() => setDetailedType(t)} className={cn("px-6 py-3 rounded-full font-black text-sm border-2 transition-all active:scale-90", detailedType === t ? "bg-primary text-white border-primary shadow-lg" : "bg-white border-muted text-muted-foreground hover:border-muted-foreground/30")}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-muted-foreground ml-3 uppercase tracking-widest">제품명 (선택)</label>
            <Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="분석할 제품의 정확한 이름을 입력해주세요." className="h-16 rounded-[1.5rem] border-none bg-muted/20 px-6 font-bold text-lg focus-visible:ring-2 focus-visible:ring-primary/20" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Scan */}
      <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
        <CardHeader className="bg-primary p-12 text-white text-center">
          <CardTitle className="text-3xl font-black flex items-center justify-center gap-4">
            <Camera size={40} /> 3. 성분표 라벨 촬영
          </CardTitle>
          <p className="opacity-80 font-medium mt-2">제품 뒷면의 원재료명과 등록성분량을 찍어주세요.</p>
        </CardHeader>
        <CardContent className="p-10">
          <div onClick={() => document.getElementById('image-master')?.click()} className={cn("relative w-full aspect-[4/3] border-[6px] border-dashed rounded-[3.5rem] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group", image ? "border-success bg-success/5" : "border-muted/30 hover:border-primary/30")}>
            {image ? (
               <div className="relative w-full h-full">
                 <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" alt="Label" />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-black text-xl flex items-center gap-2"><Camera /> 다시 촬영하기</span>
                 </div>
               </div>
            ) : (
              <>
                <Camera className="h-20 w-20 text-primary opacity-20 mb-6 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-black text-muted-foreground">라벨 촬영 / 이미지 업로드</span>
                <p className="text-sm text-muted-foreground mt-2 font-medium">클릭하여 카메라를 실행하거나 파일을 선택하세요.</p>
              </>
            )}
            <input id="image-master" type="file" accept="image/*" className="hidden" onChange={e => {
              const file = e.target.files?.[0];
              if (file) setImage(file);
            }} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleAnalyze} disabled={!image || !selectedPet} className="w-full h-32 rounded-[3.5rem] text-4xl font-black shadow-2xl shadow-primary/40 bg-primary hover:scale-[1.02] active:scale-95 transition-all">
        <Sparkles className="mr-4 h-12 w-12" /> 진단 리포트 생성
      </Button>

      {/* Modals */}
      <UsageLimitModal open={showLimitModal} onOpenChange={setShowLimitModal} />
      
      <Dialog open={showPetSurvey} onOpenChange={setShowPetSurvey}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-white rounded-[3.5rem]">
          <DialogHeader className="sr-only">
            <DialogTitle>새 식구 등록</DialogTitle>
            <DialogDescription>아이의 정보를 입력하여 정밀 분석을 준비합니다.</DialogDescription>
          </DialogHeader>
          <PetProfileSurvey onComplete={() => setShowPetSurvey(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
