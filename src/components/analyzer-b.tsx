
'use client';

/**
 * [Analyzer_B: Personalized Analysis]
 * - Strictly independent component for Step 3-B.
 * - Collects symptoms, allergies, and concerns for factory statistics.
 */

import { useState } from 'react';
import { Target, ShoppingBag, Camera, Sparkles, ArrowLeft, Info, HeartPulse, AlertTriangle, Scale, Footprints, Droplets, Dog, Cat, Loader2 } from 'lucide-react';
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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const DOG_SYMPTOMS = ['눈물 자국', '슬개골 이상', '피부 발진', '귓병', '묽은 변', '기타'];
const DOG_ALLERGIES = ['닭고기', '소고기', '대두', '밀가루', '연어', '곡물', '없음'];
const DOG_CONCERNS = ['기호성 부족', '심한 변 냄새', '체중 증가', '활력 저하'];

const CAT_SYMPTOMS = ['헤어볼 구토', '혈뇨 및 화장실 실수', '턱드름', '푸석한 모질', '구강 질환', '기타'];
const CAT_ALLERGIES = ['특정 생선류', '가금류', '곡물', '유제품', '없음'];
const CAT_CONCERNS = ['음수량 부족', '까다로운 입맛', '잦은 구토', '비만 관리'];

export default function AnalyzerB({ onBack }: { onBack: () => void }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'product' | 'survey' | 'loading' | 'result'>('product');
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [productInfo, setProductInfo] = useState({ name: '', image: null as File | null });
  const [petProfile, setPetProfile] = useState<any>({ name: '', breed: '', age: '', weight: '', bcs: '3', symptoms: [], allergies: [], mainConcern: '' });
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleNextToSurvey = () => {
    if (!productInfo.image) {
      toast({ variant: "destructive", title: "사진 필요", description: "분석을 위해 성분표 사진을 찍어주세요." });
      return;
    }
    setStep('survey');
  };

  const handleAnalyze = async () => {
    setStep('loading');
    try {
      const reader = new FileReader();
      const photoDataUri = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(productInfo.image!);
      });

      const analysisInput = {
        productInfo: { productCategory: 'food' as any, detailedProductType: '건식', productName: productInfo.name, photoDataUri },
        petProfile: { ...petProfile, petType, age: parseFloat(petProfile.age), weight: parseFloat(petProfile.weight) },
      };

      const result = await getPersonalizedAnalysis(analysisInput);
      
      if (result.error) throw new Error(result.error);

      // Save to B-type specific DB (for factory stats)
      if (user && db) {
        await addDoc(collection(db, 'users', user.uid, 'analysisHistory'), {
          type: 'B',
          userInput: analysisInput,
          analysisOutput: result.data,
          createdAt: serverTimestamp(),
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
  if (step === 'result') return <AnalysisResult result={analysisData} input={{ ...productInfo, analysisMode: 'custom', petProfile } as any} onReset={() => setStep('product')} />;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-12 pb-48 animate-in fade-in duration-700">
      <Button variant="ghost" onClick={onBack} className="rounded-full h-12 px-6 font-bold gap-2">
        <ArrowLeft size={18} /> 처음으로
      </Button>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/30"><Target /></div>
          <h2 className="text-3xl font-black tracking-tight">밀착 맞춤 분석 (Analyzer_B)</h2>
        </div>
        <p className="text-muted-foreground font-medium">아이의 신체 데이터와 제품 성분을 완벽하게 매칭합니다.</p>
      </div>

      {step === 'product' ? (
        <div className="space-y-8 animate-in slide-in-from-right-5">
           <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-10 border-b">
              <CardTitle className="text-xl font-black flex items-center gap-2"><ShoppingBag className="text-primary"/> 1단계: 제품 정보 입력</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-black text-muted-foreground ml-2">제품명</label>
                <Input value={productInfo.name} onChange={e => setProductInfo({...productInfo, name: e.target.value})} placeholder="분석할 제품명을 입력하세요." className="h-14 rounded-2xl border-none bg-muted/20 px-6 font-bold" />
              </div>
              <div onClick={() => document.getElementById('image-b')?.click()} className={cn("relative w-full aspect-video border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all", productInfo.image ? "border-success bg-success/5" : "border-muted/30")}>
                <Camera className="h-16 w-16 text-primary mb-4 opacity-20" />
                <span className="text-xl font-black">{productInfo.image ? "성분표 촬영 완료" : "성분표 촬영하기"}</span>
                <input id="image-b" type="file" accept="image/*" className="hidden" onChange={e => setProductInfo({...productInfo, image: e.target.files?.[0] || null})} />
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleNextToSurvey} className="w-full h-24 rounded-[3rem] text-2xl font-black shadow-2xl bg-primary">다음 단계로 (설문)</Button>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-5">
          <div className="grid grid-cols-2 gap-4">
            <div onClick={() => setPetType('dog')} className={cn("flex flex-col items-center p-8 border-4 rounded-[2.5rem] cursor-pointer transition-all", petType === 'dog' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
              <Dog size={48} className="mb-2"/> <span className="font-black">강아지</span>
            </div>
            <div onClick={() => setPetType('cat')} className={cn("flex flex-col items-center p-8 border-4 rounded-[2.5rem] cursor-pointer transition-all", petType === 'cat' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
              <Cat size={48} className="mb-2"/> <span className="font-black">고양이</span>
            </div>
          </div>

          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-muted/30 p-10 border-b">
              <CardTitle className="text-xl font-black flex items-center gap-2"><HeartPulse className="text-primary"/> 2단계: 종별 정밀 설문</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground ml-2">이름</label>
                  <Input value={petProfile.name} onChange={e => setPetProfile({...petProfile, name: e.target.value})} className="rounded-xl h-12 bg-muted/20 border-none px-4 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground ml-2">품종</label>
                  <Input value={petProfile.breed} onChange={e => setPetProfile({...petProfile, breed: e.target.value})} className="rounded-xl h-12 bg-muted/20 border-none px-4 font-bold" />
                </div>
              </div>

              <div className="space-y-6">
                <label className="font-black flex items-center gap-2"><AlertTriangle className="text-destructive" size={18}/> 현재 겪고 있는 증상</label>
                <div className="flex flex-wrap gap-2">
                  {(petType === 'dog' ? DOG_SYMPTOMS : CAT_SYMPTOMS).map(s => (
                    <Badge key={s} onClick={() => {
                      const cur = petProfile.symptoms;
                      setPetProfile({...petProfile, symptoms: cur.includes(s) ? cur.filter((x:any)=>x!==s) : [...cur, s]});
                    }} variant="outline" className={cn("px-4 py-2 rounded-full font-bold cursor-pointer border-2 transition-all", petProfile.symptoms.includes(s) ? "bg-destructive text-white border-destructive" : "bg-white border-muted text-muted-foreground")}>
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="font-black flex items-center gap-2"><Info className="text-primary" size={18}/> 기피 알러지 원료</label>
                <div className="flex flex-wrap gap-2">
                  {(petType === 'dog' ? DOG_ALLERGIES : CAT_ALLERGIES).map(a => (
                    <Badge key={a} onClick={() => {
                      const cur = petProfile.allergies;
                      setPetProfile({...petProfile, allergies: cur.includes(a) ? cur.filter((x:any)=>x!==a) : [...cur, a]});
                    }} variant="outline" className={cn("px-4 py-2 rounded-full font-bold cursor-pointer border-2 transition-all", petProfile.allergies.includes(a) ? "bg-primary text-white border-primary" : "bg-white border-muted text-muted-foreground")}>
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="font-black flex items-center gap-2 text-primary">보호자의 최대 고민</label>
                <div className="grid grid-cols-2 gap-2">
                  {(petType === 'dog' ? DOG_CONCERNS : CAT_CONCERNS).map(c => (
                    <div key={c} onClick={() => setPetProfile({...petProfile, mainConcern: c})} className={cn("p-4 border-2 rounded-2xl cursor-pointer text-center font-bold text-xs transition-all", petProfile.mainConcern === c ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground opacity-60")}>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('product')} className="h-24 px-8 rounded-[2.5rem] font-bold">이전</Button>
            <Button onClick={handleAnalyze} className="flex-1 h-24 rounded-[2.5rem] text-2xl font-black shadow-2xl bg-primary">맞춤 분석 시작</Button>
          </div>
        </div>
      )}
    </div>
  );
}
