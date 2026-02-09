
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dog, Cat, Activity, HeartPulse, ClipboardCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const petProfileSchema = z.object({
  petType: z.enum(['dog', 'cat']),
  name: z.string().min(1, '이름을 입력해주세요'),
  breed: z.string().min(1, '품종을 입력해주세요'),
  age: z.number().min(0),
  weight: z.number().min(0.1),
  bcs: z.string(),
  activityLevel: z.enum(['LOW', 'NORMAL', 'HIGH']),
  healthConditions: z.array(z.string()).default([]),
  stoolCondition: z.string(),
  eatingHabit: z.string(),
});

type PetProfileValues = z.infer<typeof petProfileSchema>;

export default function PetProfileSurvey({ onComplete }: { onComplete: (data: PetProfileValues) => void }) {
  const [step, setStep] = useState(1);
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PetProfileValues>({
    resolver: zodResolver(petProfileSchema),
    defaultValues: {
      petType: 'dog',
      healthConditions: [],
      activityLevel: 'NORMAL',
      bcs: '5',
    }
  });

  const selectedConditions = watch('healthConditions');

  const commonConditions = [
    '피부 알러지', '눈물 자국', '신장 질환', '심장 질환', '관절염', '당뇨', '비만', '소화 불량'
  ];

  const dogSpecificConditions = ['고관절 이형성증', '슬개골 탈구', '심장사상충'];
  const catSpecificConditions = ['헤어볼 문제', '방광염(FLUTD)', '치은염'];

  const conditions = petType === 'dog' 
    ? [...commonConditions, ...dogSpecificConditions] 
    : [...commonConditions, ...catSpecificConditions];

  const onSubmit = (data: PetProfileValues) => {
    onComplete(data);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-primary/20">
      <CardHeader className="text-center bg-muted/30 border-b">
        <div className="flex justify-center mb-4">
          <div className={cn("p-3 rounded-2xl", step === 1 ? "bg-primary text-white" : "bg-muted")}>
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div className="w-12 h-0.5 bg-muted self-center mx-2" />
          <div className={cn("p-3 rounded-2xl", step === 2 ? "bg-primary text-white" : "bg-muted")}>
            <HeartPulse className="w-6 h-6" />
          </div>
          <div className="w-12 h-0.5 bg-muted self-center mx-2" />
          <div className={cn("p-3 rounded-2xl", step === 3 ? "bg-primary text-white" : "bg-muted")}>
            <Activity className="w-6 h-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-headline">정밀 프로필 등록 (구독 전용)</CardTitle>
        <CardDescription>정확한 영양 분석을 위해 아이의 상태를 알려주세요.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <Label className="text-lg font-bold">반려동물 종류</Label>
                <RadioGroup 
                  defaultValue="dog" 
                  onValueChange={(val) => {
                    setPetType(val as 'dog' | 'cat');
                    setValue('petType', val as 'dog' | 'cat');
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label htmlFor="dog-survey" className={cn("flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all", petType === 'dog' ? "border-primary bg-primary/5" : "border-muted")}>
                    <RadioGroupItem value="dog" id="dog-survey" className="sr-only" />
                    <Dog className={cn("w-10 h-10 mb-2", petType === 'dog' ? "text-primary" : "text-muted-foreground")} />
                    강아지
                  </Label>
                  <Label htmlFor="cat-survey" className={cn("flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all", petType === 'cat' ? "border-primary bg-primary/5" : "border-muted")}>
                    <RadioGroupItem value="cat" id="cat-survey" className="sr-only" />
                    <Cat className={cn("w-10 h-10 mb-2", petType === 'cat' ? "text-primary" : "text-muted-foreground")} />
                    고양이
                  </Label>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>이름</Label>
                  <Input placeholder="이름" {...register('name')} />
                </div>
                <div className="space-y-2">
                  <Label>품종</Label>
                  <Input placeholder="예: 말티즈, 코리안숏헤어" {...register('breed')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>나이 (살)</Label>
                  <Input type="number" {...register('age', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>몸무게 (kg)</Label>
                  <Input type="number" step="0.1" {...register('weight', { valueAsNumber: true })} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <Label className="text-lg font-bold">건강 상태 및 기저질환</Label>
                <div className="grid grid-cols-2 gap-3">
                  {conditions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox 
                        id={condition} 
                        onCheckedChange={(checked) => {
                          const current = selectedConditions;
                          if (checked) {
                            setValue('healthConditions', [...current, condition]);
                          } else {
                            setValue('healthConditions', current.filter(c => c !== condition));
                          }
                        }}
                      />
                      <Label htmlFor={condition} className="text-sm cursor-pointer">{condition}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-bold">Body Condition Score (BCS)</Label>
                <p className="text-xs text-muted-foreground">1(매우 마름) ~ 9(심한 비만). 보통 5가 이상적입니다.</p>
                <Input type="range" min="1" max="9" step="1" {...register('bcs')} className="accent-primary" />
                <div className="flex justify-between text-[10px] px-1 text-muted-foreground">
                  <span>매우 마름</span>
                  <span>이상적</span>
                  <span>비만</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <Label className="text-lg font-bold">활동량 및 생활 패턴</Label>
                <RadioGroup defaultValue="NORMAL" onValueChange={(val) => setValue('activityLevel', val as any)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="LOW" id="low-act" />
                    <Label htmlFor="low-act" className="flex-1 cursor-pointer">
                      <p className="font-bold">낮음</p>
                      <p className="text-xs text-muted-foreground">산책 주 1-2회 미만, 활동이 거의 없음</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="NORMAL" id="norm-act" />
                    <Label htmlFor="norm-act" className="flex-1 cursor-pointer">
                      <p className="font-bold">보통</p>
                      <p className="text-xs text-muted-foreground">매일 30분-1시간 산책, 표준적인 활동량</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="HIGH" id="high-act" />
                    <Label htmlFor="high-act" className="flex-1 cursor-pointer">
                      <p className="font-bold">높음</p>
                      <p className="text-xs text-muted-foreground">매일 1시간 이상 산책, 활동성이 매우 높음</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>최근 변 상태 (선택)</Label>
                <Input placeholder="예: 묽은 변, 딱딱한 변, 정상 등" {...register('stoolCondition')} />
              </div>

              <div className="space-y-2">
                <Label>식습관 (선택)</Label>
                <Input placeholder="예: 급하게 먹음, 까다로운 입맛 등" {...register('eatingHabit')} />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> 이전
            </Button>
          ) : <div />}
          
          {step < 3 ? (
            <Button type="button" onClick={nextStep}>
              다음 단계 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              프로필 등록 완료
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
