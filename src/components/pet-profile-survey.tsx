
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Activity, HeartPulse, ClipboardCheck, ArrowRight, ArrowLeft, Dog, Cat, 
  Info, Calendar, Footprints, Droplets, Pill, Loader2, Utensils, AlertTriangle, Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const petProfileSchema = z.object({
  petType: z.enum(['dog', 'cat']),
  name: z.string().min(1, '이름을 입력해주세요'),
  breed: z.string().min(1, '품종을 입력해주세요'),
  age: z.number().min(0, '나이를 입력해주세요'),
  weight: z.number().min(0.1, '몸무게를 입력해주세요'),
  neutered: z.enum(['yes', 'no']),
  bcs: z.string().default('3'),
  activityLevel: z.enum(['LOW', 'NORMAL', 'HIGH', 'VERY_HIGH']).default('NORMAL'),
  weightChange: z.enum(['none', 'gain', 'loss']).default('none'),
  healthConditions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  currentDietType: z.string().default('DRY'),
  waterIntake: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
  stoolCondition: z.enum(['GOOD', 'SOFT', 'HARD', 'DIARRHEA']).default('GOOD'),
  medications: z.string().optional(),
});

type PetProfileValues = z.infer<typeof petProfileSchema>;

export default function PetProfileSurvey({ onComplete }: { onComplete: () => void }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PetProfileValues>({
    resolver: zodResolver(petProfileSchema),
    defaultValues: {
      petType: 'dog',
      neutered: 'yes',
      healthConditions: [],
      allergies: [],
      activityLevel: 'NORMAL',
      bcs: '3',
      weightChange: 'none',
      currentDietType: 'DRY',
      waterIntake: 'NORMAL',
      stoolCondition: 'GOOD',
    }
  });

  const selectedConditions = watch('healthConditions');
  const selectedAllergies = watch('allergies');
  const selectedPetType = watch('petType');
  const currentActivity = watch('activityLevel');
  const currentBCS = watch('bcs');

  const dogConditions = ['슬개골 탈구', '관절염', '피부 알러지', '눈물 자국', '심장 질환', '소화 불량', '췌장염', '신장 질환'];
  const catConditions = ['방광염/요로결석', '신장 질환', '헤어볼', '구강 건강', '심부전', '피부 건강', '당뇨'];
  const allergyList = ['닭고기', '소고기', '돼지고기', '연어', '곡물(그레인)', '계란', '유제품'];

  const conditions = selectedPetType === 'dog' ? dogConditions : catConditions;

  const onSubmit = async (data: PetProfileValues) => {
    if (!user || !db) {
      toast({ variant: "destructive", title: "로그인 필요", description: "프로필을 저장하려면 로그인이 필요합니다." });
      return;
    }

    setIsSaving(true);
    try {
      const petsRef = collection(db, 'users', user.uid, 'pets');
      await addDoc(petsRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast({ title: "프로필 등록 완료", description: `${data.name}의 정보가 안전하게 저장되었습니다.` });
      onComplete();
    } catch (error) {
      console.error("Error saving pet profile:", error);
      toast({ variant: "destructive", title: "저장 실패", description: "프로필 저장 중 오류가 발생했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-none border-none bg-white rounded-none overflow-hidden h-full md:h-auto">
      <CardHeader className="text-center bg-primary/5 p-8 border-b">
        <div className="flex justify-center mb-6">
          {[1, 2, 3, 4].map(i => (
            <React.Fragment key={i}>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all", step === i ? "bg-primary text-white scale-110" : "bg-muted text-muted-foreground")}>
                {i}
              </div>
              {i < 4 && <div className="w-6 h-0.5 bg-muted self-center mx-1" />}
            </React.Fragment>
          ))}
        </div>
        <CardTitle className="text-2xl font-black">초정밀 메디컬 프로필 V2</CardTitle>
        <CardDescription>정교한 분석을 위해 아이의 세부 상태를 입력해주세요.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-8 space-y-8 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setValue('petType', 'dog')} className={cn("flex flex-col items-center p-6 border-4 rounded-3xl cursor-pointer transition-all", watch('petType') === 'dog' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                  <Dog size={40} className="mb-2"/> 
                  <span className="font-black">강아지</span>
                </div>
                <div onClick={() => setValue('petType', 'cat')} className={cn("flex flex-col items-center p-6 border-4 rounded-3xl cursor-pointer transition-all", watch('petType') === 'cat' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                  <Cat size={40} className="mb-2"/> 
                  <span className="font-black">고양이</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold ml-1">이름</Label>
                  <Input placeholder="아이 이름" {...register('name')} className="rounded-xl h-12 bg-muted/20 border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold ml-1">품종</Label>
                  <Input placeholder="예: 말티푸" {...register('breed')} className="rounded-xl h-12 bg-muted/20 border-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold ml-1">나이 (살)</Label>
                  <Input type="number" step="0.1" {...register('age', { valueAsNumber: true })} className="rounded-xl h-12 bg-muted/20 border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold ml-1">체중 (kg)</Label>
                  <Input type="number" step="0.1" {...register('weight', { valueAsNumber: true })} className="rounded-xl h-12 bg-muted/20 border-none" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
              <div className="space-y-4">
                <Label className="font-black text-lg flex items-center gap-2">
                  <Activity size={20} className="text-primary" /> 활동량 및 체형
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'LOW', label: '거의 안움직임' },
                    { id: 'NORMAL', label: '평범함' },
                    { id: 'HIGH', label: '활발함' },
                    { id: 'VERY_HIGH', label: '매우 활동적' }
                  ].map(v => (
                    <div key={v.id} onClick={() => setValue('activityLevel', v.id as any)} className={cn("p-4 border-2 rounded-2xl cursor-pointer text-center font-bold text-sm", currentActivity === v.id ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground")}>
                      {v.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-black text-lg flex items-center gap-2">
                  <Scale size={20} className="text-primary" /> BCS (체측정 점수)
                </Label>
                <div className="flex gap-2">
                  {['1', '2', '3', '4', '5'].map(v => (
                    <div key={v} onClick={() => setValue('bcs', v)} className={cn("flex-1 h-14 border-2 rounded-2xl flex items-center justify-center font-black cursor-pointer", currentBCS === v ? "border-primary bg-primary text-white" : "border-muted text-muted-foreground")}>
                      {v}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground text-center font-medium">1: 매우 마름 ~ 3: 이상적 ~ 5: 고도 비만</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
              <div className="space-y-4">
                <Label className="font-black text-lg flex items-center gap-2">
                  <AlertTriangle size={20} className="text-destructive" /> 알러지 및 주의 성분
                </Label>
                <div className="flex flex-wrap gap-2">
                  {allergyList.map(a => (
                    <div key={a} onClick={() => {
                      const cur = selectedAllergies;
                      setValue('allergies', cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
                    }} className={cn("px-4 py-2 rounded-full text-xs font-bold border-2 cursor-pointer transition-all", selectedAllergies.includes(a) ? "bg-destructive text-white border-destructive" : "bg-white border-muted text-muted-foreground")}>
                      {a}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-black text-lg flex items-center gap-2">
                  <HeartPulse size={20} className="text-primary" /> 관리 중인 건강 고민
                </Label>
                <div className="flex flex-wrap gap-2">
                  {conditions.map(c => (
                    <div key={c} onClick={() => {
                      const cur = selectedConditions;
                      setValue('healthConditions', cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);
                    }} className={cn("px-4 py-2 rounded-full text-xs font-bold border-2 cursor-pointer transition-all", selectedConditions.includes(c) ? "bg-primary text-white border-primary" : "bg-white border-muted text-muted-foreground")}>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
              <div className="space-y-4">
                <Label className="font-black text-lg flex items-center gap-2">
                  <Droplets size={20} className="text-blue-500" /> 평소 습관 (음수 및 배변)
                </Label>
                <div className="grid grid-cols-1 gap-4">
                   <div className="p-4 bg-muted/10 rounded-2xl space-y-3">
                      <Label className="text-xs font-bold text-muted-foreground">음수량</Label>
                      <div className="flex gap-2">
                        {['적음', '보통', '많음'].map((v, i) => (
                          <div key={v} onClick={() => setValue('waterIntake', i === 0 ? 'LOW' : i === 1 ? 'NORMAL' : 'HIGH')} className={cn("flex-1 text-center py-2 rounded-xl text-xs font-bold border-2 cursor-pointer", watch('waterIntake') === (i === 0 ? 'LOW' : i === 1 ? 'NORMAL' : 'HIGH') ? "bg-blue-500 text-white border-blue-500" : "bg-white border-muted")}>
                            {v}
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="p-4 bg-muted/10 rounded-2xl space-y-3">
                      <Label className="text-xs font-bold text-muted-foreground">변 상태</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'GOOD', label: '건강함' },
                          { id: 'SOFT', label: '묽은 변' },
                          { id: 'HARD', label: '딱딱함' },
                          { id: 'DIARRHEA', label: '설사' }
                        ].map(v => (
                          <div key={v.id} onClick={() => setValue('stoolCondition', v.id as any)} className={cn("text-center py-2 rounded-xl text-xs font-bold border-2 cursor-pointer", watch('stoolCondition') === v.id ? "bg-amber-700 text-white border-amber-700" : "bg-white border-muted")}>
                            {v.label}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold ml-1">기타 참고사항 (복용 약물 등)</Label>
                <Input placeholder="예: 심장약 복용 중, 가금류 알러지 의심" {...register('medications')} className="rounded-xl h-12 bg-muted/20 border-none" />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-8 bg-muted/5">
          {step > 1 ? (
            <Button type="button" variant="ghost" onClick={prevStep} className="h-14 px-8 rounded-2xl font-bold">
              <ArrowLeft className="mr-2 h-4 w-4"/> 이전
            </Button>
          ) : <div/>}
          
          {step < 4 ? (
            <Button type="button" onClick={nextStep} className="h-14 px-10 rounded-2xl font-black bg-primary shadow-lg shadow-primary/20">
              다음 단계 <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
          ) : (
            <Button type="submit" disabled={isSaving} className="h-14 px-10 rounded-2xl font-black bg-primary shadow-lg shadow-primary/20">
              {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              프로필 완성하기
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
