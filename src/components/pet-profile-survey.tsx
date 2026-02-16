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
import { Checkbox } from '@/components/ui/checkbox';
import { Activity, HeartPulse, ClipboardCheck, ArrowRight, ArrowLeft, Dog, Cat, Info, Calendar, Footprints, Droplets, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

export default function PetProfileSurvey({ onComplete }: { onComplete: (data: PetProfileValues) => void }) {
  const [step, setStep] = useState(1);
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');

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
  const selectedAllergies = watch('allergies');

  const dogConditions = ['슬개골 탈구', '관절염', '피부 알러지', '눈물 자국', '심장 질환', '소화 불량', '췌장염'];
  const catConditions = ['방광염/요로결석', '신장 질환', '헤어볼', '구강 건강', '심부전', '당뇨'];

  const conditions = petType === 'dog' ? dogConditions : catConditions;
  const allergyList = ['닭고기', '소고기', '연어', '양고기', '곡물', '달걀'];

  const onSubmit = (data: PetProfileValues) => {
    onComplete(data);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <TooltipProvider>
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-none bg-white rounded-[2.5rem] overflow-hidden">
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
                <Label htmlFor="dog-s" className={cn("flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer", watch('petType') === 'dog' ? "border-primary bg-primary/5" : "border-muted")}>
                  <RadioGroupItem value="dog" id="dog-s" className="sr-only" onClick={() => { setPetType('dog'); setValue('petType', 'dog'); }} />
                  <Dog className="w-10 h-10 mb-2"/> 강아지
                </Label>
                <Label htmlFor="cat-s" className={cn("flex flex-col items-center p-6 border-2 rounded-2xl cursor-pointer", watch('petType') === 'cat' ? "border-primary bg-primary/5" : "border-muted")}>
                  <RadioGroupItem value="cat" id="cat-s" className="sr-only" onClick={() => { setPetType('cat'); setValue('petType', 'cat'); }} />
                  <Cat className="w-10 h-10 mb-2"/> 고양이
                </Label>
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
                  <RadioGroup defaultValue="none" onValueChange={v => setValue('weightChange', v)} className="flex gap-2">
                    {['변화없음', '찜', '빠짐'].map((v, i) => (
                      <Label key={v} className={cn("flex-1 text-center p-2 border rounded-xl text-xs cursor-pointer", watch('weightChange') === (i===0?'none':i===1?'gain':'loss') ? "bg-primary text-white" : "bg-white")}>
                        <RadioGroupItem value={i===0?'none':i===1?'gain':'loss'} className="sr-only"/> {v}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
                <div className="p-4 bg-muted/20 rounded-2xl">
                  <Label className="text-xs font-bold mb-2 block">평소 변 상태</Label>
                  <RadioGroup defaultValue="GOOD" onValueChange={v => setValue('stoolCondition', v)} className="flex gap-2">
                    {['딱딱', '촉촉', '설사'].map((v, i) => (
                      <Label key={v} className={cn("flex-1 text-center p-2 border rounded-xl text-xs cursor-pointer", watch('stoolCondition') === (i===0?'DRY':i===1?'GOOD':'SOFT') ? "bg-primary text-white" : "bg-white")}>
                        <RadioGroupItem value={i===0?'DRY':i===1?'GOOD':'SOFT'} className="sr-only"/> {v}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <Label className="font-bold">라이프스타일 및 행동</Label>
              <div className="space-y-3">
                <Label className="text-xs font-bold">{petType === 'dog' ? '산책 빈도' : '고양이 환경'}</Label>
                <RadioGroup onValueChange={v => setValue('lifestyle', v)} className="grid gap-2">
                  {(petType === 'dog' ? ['안함', '30분 미만', '1시간 내외', '활발함'] : ['실내묘', '산책묘', '외출묘']).map(v => (
                    <Label key={v} className={cn("p-4 border rounded-2xl cursor-pointer text-sm font-bold", watch('lifestyle') === v ? "border-primary bg-primary/5" : "border-muted")}>
                      <RadioGroupItem value={v} className="sr-only"/> {v}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <Label className="font-bold">질환 및 병력 관리</Label>
              <div className="flex flex-wrap gap-2">
                {conditions.map(c => (
                  <Badge key={c} variant={selectedConditions.includes(c) ? "default" : "outline"} className="cursor-pointer px-4 py-2" onClick={() => {
                    const cur = selectedConditions;
                    setValue('healthConditions', cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);
                  }}>{c}</Badge>
                ))}
              </div>
              <Input placeholder="복용 중인 약물 직접 기입" {...register('medications')} className="rounded-xl h-12 mt-4" />
              <Input placeholder="기타 건강 고민 직접 기입" {...register('customHealthNote')} className="rounded-xl h-12" />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-8 bg-muted/10">
          {step > 1 ? <Button type="button" variant="ghost" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4"/> 이전</Button> : <div/>}
          {step < 4 ? <Button type="button" onClick={nextStep}>다음 <ArrowRight className="ml-2 h-4 w-4"/></Button> : <Button type="submit">프로필 등록 완료</Button>}
        </CardFooter>
      </form>
    </Card>
    </TooltipProvider>
  );
}