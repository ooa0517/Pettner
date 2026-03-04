
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Activity, HeartPulse, ClipboardCheck, ArrowRight, ArrowLeft, Dog, Cat, Info, Calendar, Footprints, Droplets, Pill, Loader2 } from 'lucide-react';
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
  weightChange: z.string().default('none'),
  neutered: z.enum(['yes', 'no']),
  bcs: z.string().default('3'),
  lifestyle: z.string().default('NORMAL'),
  behaviorPattern: z.string().default('NORMAL'),
  healthConditions: z.array(z.string()).default([]),
  customHealthNote: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  stoolCondition: z.string().default('GOOD'),
  medications: z.string().optional(),
  waterIntake: z.string().default('NORMAL'),
});

type PetProfileValues = z.infer<typeof petProfileSchema>;

export default function PetProfileSurvey({ onComplete }: { onComplete: () => void }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PetProfileValues>({
    resolver: zodResolver(petProfileSchema),
    defaultValues: {
      petType: 'dog',
      neutered: 'yes',
      healthConditions: [],
      allergies: [],
      lifestyle: 'NORMAL',
      behaviorPattern: 'NORMAL',
      bcs: '3',
      weightChange: 'none',
      stoolCondition: 'GOOD',
      waterIntake: 'NORMAL',
    }
  });

  const selectedConditions = watch('healthConditions');
  const selectedPetType = watch('petType');

  const dogConditions = ['슬개골 탈구', '관절염', '피부 알러지', '눈물 자국', '심장 질환', '소화 불량', '췌장염'];
  const catConditions = ['방광염/요로결석', '신장 질환', '헤어볼', '구강 건강', '심부전', '당뇨'];

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
      <CardHeader className="text-center bg-muted/30 p-8 border-b">
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
        <CardTitle className="text-2xl font-black">초정밀 메디컬 프로필</CardTitle>
        <CardDescription>아이의 라이프스타일과 병력을 분석에 반영합니다.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-10">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => { setPetType('dog'); setValue('petType', 'dog'); }} className={cn("flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all", watch('petType') === 'dog' ? "border-primary bg-primary/5" : "border-muted opacity-50")}>
                  <Dog className="w-10 h-10 mb-2"/> 강아지
                </div>
                <div onClick={() => { setPetType('cat'); setValue('petType', 'cat'); }} className={cn("flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer transition-all", watch('petType') === 'cat' ? "border-primary bg-primary/5" : "border-muted opacity-50")}>
                  <Cat className="w-10 h-10 mb-2"/> 고양이
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="이름" {...register('name')} className="rounded-xl h-12" />
                <Input placeholder="품종" {...register('breed')} className="rounded-xl h-12" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" step="0.1" placeholder="나이(살)" {...register('age', { valueAsNumber: true })} className="rounded-xl h-12" />
                <Input type="number" step="0.1" placeholder="체중(kg)" {...register('weight', { valueAsNumber: true })} className="rounded-xl h-12" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <Label className="font-bold">신체 변화 및 소화 상태</Label>
              <div className="space-y-4">
                <div className="p-4 bg-muted/20 rounded-2xl">
                  <Label className="text-xs font-bold mb-2 block">최근 3개월 체중 변화</Label>
                  <div className="flex gap-2">
                    {['변화없음', '찜', '빠짐'].map((v, i) => (
                      <div key={v} onClick={() => setValue('weightChange', i===0?'none':i===1?'gain':'loss')} className={cn("flex-1 text-center p-2 border rounded-xl text-xs cursor-pointer", watch('weightChange') === (i===0?'none':i===1?'gain':'loss') ? "bg-primary text-white" : "bg-white")}>
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <Label className="font-bold">라이프스타일 및 행동</Label>
              <div className="space-y-3">
                <Label className="text-xs font-bold">{selectedPetType === 'dog' ? '산책 빈도' : '고양이 환경'}</Label>
                <div className="grid gap-2">
                  {(selectedPetType === 'dog' ? ['안함', '30분 미만', '1시간 내외', '활발함'] : ['실내묘', '산책묘', '외출묘']).map(v => (
                    <div key={v} onClick={() => setValue('lifestyle', v)} className={cn("p-4 border rounded-2xl cursor-pointer text-sm font-bold", watch('lifestyle') === v ? "border-primary bg-primary/5" : "border-muted")}>
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <Label className="font-bold">질환 및 병력 관리</Label>
              <div className="flex flex-wrap gap-2">
                {conditions.map(c => (
                  <div key={c} className={cn("cursor-pointer px-4 py-2 rounded-full text-xs font-bold border transition-all", selectedConditions.includes(c) ? "bg-primary text-white border-primary" : "bg-white border-muted")} onClick={() => {
                    const cur = selectedConditions;
                    setValue('healthConditions', cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);
                  }}>{c}</div>
                ))}
              </div>
              <Input placeholder="복용 중인 약물 직접 기입" {...register('medications')} className="rounded-xl h-12 mt-4" />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-8 bg-muted/10">
          {step > 1 ? <Button type="button" variant="ghost" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4"/> 이전</Button> : <div/>}
          {step < 4 ? (
            <Button type="button" onClick={nextStep} className="font-black">다음 <ArrowRight className="ml-2 h-4 w-4"/></Button>
          ) : (
            <Button type="submit" disabled={isSaving} className="font-black">
              {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              프로필 등록 완료
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
