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
  AlertTriangle, Target, Cookie, Footprints, Utensils, CalendarDays
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
  weight: z.number().min(0.1, '0.1kg 이상이어야 합니다'),
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

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<PetProfileValues>({
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

  const handleNextStep = async () => {
    const isStep1Valid = await trigger(['name', 'breed', 'petType', 'gender', 'weight']);
    if (isStep1Valid) {
      setStep(2);
    } else {
      toast({ 
        variant: "destructive", 
        title: "입력 정보를 확인해주세요", 
        description: "이름, 품종, 성별, 몸무게는 필수 입력 사항입니다." 
      });
    }
  };

  const onSubmit = async (data: PetProfileValues) => {
    if (!user || !db) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'pets'), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast({ title: "프로필 등록 완료", description: "이제 즉시 정밀 분석을 시작할 수 있습니다." });
      onComplete();
    } catch (e) {
      toast({ variant: "destructive", title: "저장 실패", description: "서버 연결 상태를 확인해주세요." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-none border-none bg-white rounded-none overflow-hidden">
      <CardHeader className="text-center bg-primary/5 p-10 border-b relative">
        <div className="flex justify-center mb-6 gap-2">
          {[1, 2].map(i => (
            <div key={i} className={cn("w-16 h-2.5 rounded-full transition-all duration-500", step >= i ? "bg-primary shadow-sm" : "bg-muted")} />
          ))}
        </div>
        <CardTitle className="text-3xl font-black tracking-tight">15초 컷 프로필 등록</CardTitle>
        <CardDescription className="text-base font-medium">정밀 분석을 위해 최소한의 정보만 받습니다.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-8 md:p-12 space-y-10 min-h-[550px] overflow-y-auto max-h-[70vh]">
          {step === 1 ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-5 duration-500">
              {/* 이름 */}
              <div className="space-y-4">
                <Label className="font-black text-lg ml-1">아이 이름</Label>
                <Input placeholder="이름을 입력해주세요 (예: 나무)" {...register('name')} className="h-16 rounded-2xl bg-muted/20 border-none px-6 text-xl font-bold focus-visible:ring-2 focus-visible:ring-primary/20" />
              </div>

              {/* 종류 */}
              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setValue('petType', 'dog')} className={cn("flex flex-col items-center p-8 border-4 rounded-[2.5rem] cursor-pointer transition-all gap-3 group", selectedType === 'dog' ? "border-primary bg-primary/5 shadow-xl scale-[1.02]" : "border-muted/50 opacity-40 hover:opacity-60")}>
                  <Dog size={56} className={cn("transition-transform group-hover:scale-110", selectedType === 'dog' ? "text-primary" : "")} />
                  <span className="font-black text-lg">강아지</span>
                </div>
                <div onClick={() => setValue('petType', 'cat')} className={cn("flex flex-col items-center p-8 border-4 rounded-[2.5rem] cursor-pointer transition-all gap-3 group", selectedType === 'cat' ? "border-primary bg-primary/5 shadow-xl scale-[1.02]" : "border-muted/50 opacity-40 hover:opacity-60")}>
                  <Cat size={56} className={cn("transition-transform group-hover:scale-110", selectedType === 'cat' ? "text-primary" : "")} />
                  <span className="font-black text-lg">고양이</span>
                </div>
              </div>

              {/* 품종 */}
              <div className="space-y-4">
                <Label className="font-black text-lg ml-1">품종</Label>
                <Input placeholder="예: 말티즈, 코리안숏헤어" {...register('breed')} className="h-14 rounded-2xl bg-muted/20 border-none px-6 font-bold focus-visible:ring-2 focus-visible:ring-primary/20" />
              </div>

              {/* 나이 (입력 + 스크롤) */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-primary h-5 w-5" />
                  <Label className="font-black text-lg">나이</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/10 p-6 rounded-3xl">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-muted-foreground uppercase">Years</span>
                      <Input type="number" min={0} max={20} value={ageYears} onChange={(e) => setValue('ageYears', Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))} className="w-16 h-8 text-center font-black p-0 border-none bg-white rounded-lg shadow-sm" />
                    </div>
                    <Slider value={[ageYears]} onValueChange={([v]) => setValue('ageYears', v)} max={20} step={1} className="py-2" />
                    <p className="text-right text-sm font-black text-primary">{ageYears}살</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-muted-foreground uppercase">Months</span>
                      <Input type="number" min={0} max={11} value={ageMonths} onChange={(e) => setValue('ageMonths', Math.min(11, Math.max(0, parseInt(e.target.value) || 0)))} className="w-16 h-8 text-center font-black p-0 border-none bg-white rounded-lg shadow-sm" />
                    </div>
                    <Slider value={[ageMonths]} onValueChange={([v]) => setValue('ageMonths', v)} max={11} step={1} className="py-2" />
                    <p className="text-right text-sm font-black text-primary">{ageMonths}개월</p>
                  </div>
                </div>
              </div>

              {/* 몸무게 (입력 + 스크롤) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="text-primary h-5 w-5" />
                    <Label className="font-black text-lg">몸무게</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={weight} 
                      onChange={(e) => setValue('weight', Math.max(0.1, parseFloat(e.target.value) || 0.1))} 
                      className="w-24 h-10 text-center font-black border-2 border-primary/20 rounded-xl bg-white shadow-sm text-lg" 
                    />
                    <span className="font-black text-lg text-muted-foreground">kg</span>
                  </div>
                </div>
                <div className="bg-muted/10 p-6 rounded-3xl space-y-4">
                  <Slider value={[weight]} onValueChange={([v]) => setValue('weight', v)} max={50} step={0.1} className="py-2" />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                    <span>0.1kg</span>
                    <span>25kg</span>
                    <span>50kg+</span>
                  </div>
                </div>
              </div>

              {/* 성별 및 중성화 */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-muted/20 rounded-3xl">
                <div className="flex w-full md:w-auto gap-3">
                  <Button type="button" onClick={() => setValue('gender', 'male')} variant={gender === 'male' ? 'default' : 'outline'} className={cn("flex-1 md:w-24 h-14 rounded-2xl font-black text-lg transition-all", gender === 'male' && "shadow-lg shadow-primary/20")}>남아</Button>
                  <Button type="button" onClick={() => setValue('gender', 'female')} variant={gender === 'female' ? 'default' : 'outline'} className={cn("flex-1 md:w-24 h-14 rounded-2xl font-black text-lg transition-all", gender === 'female' && "shadow-lg shadow-primary/20")}>여아</Button>
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm w-full md:w-auto justify-center">
                  <Checkbox id="neutered" checked={isNeutered} onCheckedChange={(v) => setValue('isNeutered', !!v)} className="w-6 h-6 rounded-lg border-2 border-primary" />
                  <Label htmlFor="neutered" className="font-black text-base cursor-pointer select-none">중성화 완료</Label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-5 duration-500">
              {/* BCS */}
              <div className="space-y-6">
                <Label className="font-black text-xl flex items-center gap-3"><Scale className="text-primary h-6 w-6"/> 체형(BCS) 선택</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'THIN', label: '마름', desc: '갈비뼈가 드러남' },
                    { id: 'IDEAL', label: '적당함', desc: '이상적인 체형' },
                    { id: 'OVERWEIGHT', label: '통통함', desc: '허리 라인이 희미함' },
                    { id: 'OBESE', label: '뚱뚱함', desc: '갈비뼈가 안만져짐' }
                  ].map(item => (
                    <div key={item.id} onClick={() => setValue('bcs', item.id as any)} className={cn("p-5 border-4 rounded-[2rem] cursor-pointer text-center transition-all flex flex-col gap-1", bcs === item.id ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" : "border-muted/50 opacity-60 hover:opacity-100")}>
                      <span className="font-black text-base">{item.label}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 배변 상태 */}
              <div className="space-y-6">
                <Label className="font-black text-xl flex items-center gap-3"><Footprints className="text-primary h-6 w-6"/> 평소 배변 상태</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'HARD', label: '딱딱한 토끼똥', icon: '🥚' },
                    { id: 'IDEAL', label: '촉촉한 맛동산', icon: '🪵' },
                    { id: 'SOFT', label: '묽은 변·설사', icon: '💧' }
                  ].map(item => (
                    <div key={item.id} onClick={() => setValue('stoolStatus', item.id as any)} className={cn("p-6 border-4 rounded-[2rem] cursor-pointer text-center transition-all flex flex-col items-center gap-2", stool === item.id ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" : "border-muted/50 opacity-60 hover:opacity-100")}>
                      <span className="text-3xl">{item.icon}</span>
                      <span className="font-black text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 식습관 */}
              <div className="space-y-6">
                <Label className="font-black text-xl flex items-center gap-3"><Utensils className="text-primary h-6 w-6"/> 평소 식습관</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'FAST', label: '진공청소기', desc: '1초 만에 마심' },
                    { id: 'NORMAL', label: '오독오독', desc: '꼭꼭 씹어먹음' },
                    { id: 'SLOW', label: '깨작거림', desc: '조금씩 나눠먹음' }
                  ].map(item => (
                    <div key={item.id} onClick={() => setValue('eatingHabit', item.id as any)} className={cn("p-6 border-4 rounded-[2rem] cursor-pointer text-center transition-all flex flex-col gap-1", habit === item.id ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" : "border-muted/50 opacity-60 hover:opacity-100")}>
                      <span className="font-black text-base">{item.label}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 사용 목적 */}
              <div className="space-y-6">
                <Label className="font-black text-xl flex items-center gap-3"><Target className="text-primary h-6 w-6"/> 앱 사용 목적</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'DIET', label: '체중 관리', icon: '⚖️' },
                    { id: 'SKIN', label: '눈물·피부 개선', icon: '✨' },
                    { id: 'ODOR', label: '배변 냄새 완화', icon: '🌿' },
                    { id: 'FACTCHECK', label: '성분 팩트체크', icon: '🔍' }
                  ].map(item => (
                    <div key={item.id} onClick={() => setValue('usagePurpose', item.id as any)} className={cn("p-6 border-4 rounded-[2rem] cursor-pointer transition-all flex items-center justify-center gap-3", purpose === item.id ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" : "border-muted/50 opacity-60 hover:opacity-100")}>
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-black text-base">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 영양제/약물 */}
              <div className="space-y-4">
                <Label className="font-black text-lg ml-1">복용 중인 영양제/약물 (선택)</Label>
                <Input placeholder="예: 관절 영양제, 심장약 등" {...register('medications')} className="h-14 rounded-2xl bg-muted/20 border-none px-6 font-bold focus-visible:ring-2 focus-visible:ring-primary/20" />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-8 md:p-12 bg-muted/5 border-t flex gap-4">
          {step === 2 && (
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-20 px-8 rounded-3xl font-black text-lg border-2 hover:bg-white active:scale-95 transition-all">
              <ArrowLeft className="mr-2" /> 이전
            </Button>
          )}
          <Button 
            type="button" 
            onClick={() => step === 1 ? handleNextStep() : handleSubmit(onSubmit)()} 
            disabled={isSaving} 
            className="flex-1 h-20 rounded-[2.5rem] text-2xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : step === 1 ? <>다음 단계로 <ArrowRight className="ml-3" /></> : "프로필 완성하기"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
