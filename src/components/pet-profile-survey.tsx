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
  Dog, Cat, Scale, HeartPulse, ArrowRight, ArrowLeft, Loader2, CheckCircle2,
  AlertTriangle, Target, Cookie, Footprints, Utensils
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

const petProfileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  petType: z.enum(['dog', 'cat']),
  breed: z.string().min(1, '품종을 입력해주세요'),
  ageYears: z.number().min(0).max(20),
  ageMonths: z.number().min(0).max(11),
  gender: z.enum(['male', 'female']),
  isNeutered: z.boolean().default(false),
  weight: z.number().min(0.1),
  bcs: z.enum(['THIN', 'IDEAL', 'OVERWEIGHT', 'OBESE']).default('IDEAL'),
  stoolStatus: z.enum(['HARD', 'IDEAL', 'SOFT']).default('IDEAL'),
  eatingHabit: z.enum(['FAST', 'NORMAL', 'SLOW']).default('NORMAL'),
  usagePurpose: z.enum(['DIET', 'SKIN', 'ODOR', 'FACTCHECK']).default('FACTCHECK'),
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
      ageYears: 1,
      ageMonths: 0,
      gender: 'male',
      isNeutered: false,
      weight: 5.0,
      bcs: 'IDEAL',
      stoolStatus: 'IDEAL',
      eatingHabit: 'NORMAL',
      usagePurpose: 'FACTCHECK',
    }
  });

  const selectedType = watch('petType');
  const ageYears = watch('ageYears');
  const ageMonths = watch('ageMonths');
  const weight = watch('weight');
  const gender = watch('gender');
  const isNeutered = watch('isNeutered');
  const bcs = watch('bcs');
  const stool = watch('stoolStatus');
  const habit = watch('eatingHabit');
  const purpose = watch('usagePurpose');

  const onSubmit = async (data: PetProfileValues) => {
    if (!user || !db) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'pets'), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast({ title: "프로필 등록 완료" });
      onComplete();
    } catch (e) {
      toast({ variant: "destructive", title: "저장 실패" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-none border-none bg-white rounded-none overflow-hidden">
      <CardHeader className="text-center bg-primary/5 p-10 border-b">
        <div className="flex justify-center mb-6 gap-2">
          {[1, 2].map(i => (
            <div key={i} className={cn("w-12 h-2 rounded-full transition-all", step >= i ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
        <CardTitle className="text-3xl font-black">15초 컷 프로필 등록</CardTitle>
        <CardDescription className="text-base font-medium">정밀 분석을 위해 최소한의 정보만 받습니다.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-10 space-y-10 min-h-[500px]">
          {step === 1 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-5">
              <div className="space-y-4">
                <Label className="font-black text-lg ml-1">아이 이름</Label>
                <Input placeholder="이름 입력" {...register('name')} className="h-16 rounded-2xl bg-muted/20 border-none px-6 text-xl font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setValue('petType', 'dog')} className={cn("flex flex-col items-center p-8 border-4 rounded-[2.5rem] cursor-pointer transition-all gap-3", selectedType === 'dog' ? "border-primary bg-primary/5 shadow-xl" : "border-muted opacity-40")}>
                  <Dog size={48} className={selectedType === 'dog' ? "text-primary" : ""} />
                  <span className="font-black text-lg">강아지</span>
                </div>
                <div onClick={() => setValue('petType', 'cat')} className={cn("flex flex-col items-center p-8 border-4 rounded-[2.5rem] cursor-pointer transition-all gap-3", selectedType === 'cat' ? "border-primary bg-primary/5 shadow-xl" : "border-muted opacity-40")}>
                  <Cat size={48} className={selectedType === 'cat' ? "text-primary" : ""} />
                  <span className="font-black text-lg">고양이</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-black text-lg ml-1">품종 검색</Label>
                <Input placeholder="예: 말티즈, 코리안숏헤어" {...register('breed')} className="h-14 rounded-2xl bg-muted/20 border-none px-6 font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="font-black text-sm ml-1">나이 ({ageYears}년 {ageMonths}개월)</Label>
                  <Slider value={[ageYears]} onValueChange={([v]) => setValue('ageYears', v)} max={20} step={1} className="py-4" />
                  <Slider value={[ageMonths]} onValueChange={([v]) => setValue('ageMonths', v)} max={11} step={1} className="py-4" />
                </div>
                <div className="space-y-4">
                  <Label className="font-black text-sm ml-1">몸무게 ({weight}kg)</Label>
                  <Slider value={[weight]} onValueChange={([v]) => setValue('weight', v)} max={50} step={0.1} className="py-4" />
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-muted/20 rounded-3xl">
                <div className="flex gap-4">
                  <Button type="button" onClick={() => setValue('gender', 'male')} variant={gender === 'male' ? 'default' : 'outline'} className="rounded-xl font-bold">남아</Button>
                  <Button type="button" onClick={() => setValue('gender', 'female')} variant={gender === 'female' ? 'default' : 'outline'} className="rounded-xl font-bold">여아</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="neutered" checked={isNeutered} onCheckedChange={(v) => setValue('isNeutered', !!v)} className="w-6 h-6 rounded-lg" />
                  <Label htmlFor="neutered" className="font-black text-sm cursor-pointer">중성화 완료</Label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-5">
              <div className="space-y-4">
                <Label className="font-black text-xl flex items-center gap-2"><Scale className="text-primary"/> 체형(BCS) 선택</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'THIN', label: '마름' },
                    { id: 'IDEAL', label: '적당함' },
                    { id: 'OVERWEIGHT', label: '통통함' },
                    { id: 'OBESE', label: '뚱뚱함' }
                  ].map(item => (
                    <div key={item.id} onClick={() => setValue('bcs', item.id as any)} className={cn("p-4 border-2 rounded-2xl cursor-pointer text-center transition-all", bcs === item.id ? "border-primary bg-primary/5" : "border-muted opacity-60")}>
                      <span className="font-black text-xs">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-black text-xl flex items-center gap-2"><Footprints className="text-primary"/> 평소 배변 상태</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'HARD', label: '딱딱한 토끼똥' },
                    { id: 'IDEAL', label: '촉촉한 맛동산' },
                    { id: 'SOFT', label: '묽은 변·설사' }
                  ].map(item => (
                    <div key={item.id} onClick={() => setValue('stoolStatus', item.id as any)} className={cn("p-4 border-2 rounded-2xl cursor-pointer text-center transition-all", stool === item.id ? "border-primary bg-primary/5" : "border-muted opacity-60")}>
                      <span className="font-black text-xs">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-black text-xl flex items-center gap-2"><Utensils className="text-primary"/> 식습관</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'FAST', label: '진공청소기' },
                    { id: 'NORMAL', label: '오독오독' },
                    { id: 'SLOW', label: '깨작거림' }
                  ].map(item => (
                    <div key={item.id} onClick={() => setValue('eatingHabit', item.id as any)} className={cn("p-4 border-2 rounded-2xl cursor-pointer text-center transition-all", habit === item.id ? "border-primary bg-primary/5" : "border-muted opacity-60")}>
                      <span className="font-black text-xs">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-black text-xl flex items-center gap-2"><Target className="text-primary"/> 앱 사용 목적</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'DIET', label: '다이어트' },
                    { id: 'SKIN', label: '눈물·피부 개선' },
                    { id: 'ODOR', label: '냄새 완화' },
                    { id: 'FACTCHECK', label: '성분 팩트체크' }
                  ].map(item => (
                    <div key={item.id} onClick={() => setValue('usagePurpose', item.id as any)} className={cn("p-5 border-2 rounded-3xl cursor-pointer text-center transition-all", purpose === item.id ? "border-primary bg-primary/5" : "border-muted opacity-60")}>
                      <span className="font-black text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-10 bg-muted/5 border-t flex gap-4">
          {step === 2 && (
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-20 px-8 rounded-3xl font-bold">이전</Button>
          )}
          <Button type="button" onClick={() => step === 1 ? setStep(2) : handleSubmit(onSubmit)()} disabled={isSaving} className="flex-1 h-20 rounded-3xl text-xl font-black shadow-xl shadow-primary/20">
            {isSaving ? <Loader2 className="animate-spin" /> : step === 1 ? <>다음 단계로 <ArrowRight className="ml-2" /></> : "프로필 완성하기"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
