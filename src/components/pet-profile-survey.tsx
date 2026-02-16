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
import { Activity, HeartPulse, ClipboardCheck, ArrowRight, ArrowLeft, Dog, Cat, Info, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const petProfileSchema = z.object({
  petType: z.enum(['dog', 'cat']),
  name: z.string().min(1, '이름을 입력해주세요'),
  breed: z.string().min(1, '품종을 입력해주세요'),
  age: z.number().min(0, '나이를 입력해주세요'),
  weight: z.number().min(0.1, '몸무게를 입력해주세요'),
  neutered: z.enum(['yes', 'no']),
  bcs: z.string().default('5'),
  activityLevel: z.enum(['LOW', 'NORMAL', 'HIGH']),
  healthConditions: z.array(z.string()).default([]),
  customHealthNote: z.string().optional(),
  allergies: z.array(z.string()).default([]),
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
      activityLevel: 'NORMAL',
      bcs: '5',
      customHealthNote: '',
    }
  });

  const selectedConditions = watch('healthConditions');
  const selectedAllergies = watch('allergies');

  const commonConditions = ['피부 알러지', '눈물 자국', '소화 불량', '비만/체중 관리'];
  const dogSpecific = ['슬개골 탈구', '관절염', '심장 질환'];
  const catSpecific = ['방광염/요로결석', '신장 질환', '헤어볼'];

  const conditions = petType === 'dog' 
    ? [...commonConditions, ...dogSpecific] 
    : [...commonConditions, ...catSpecific];

  const allergyList = ['닭고기', '소고기', '연어', '양고기', '곡물', '달걀'];

  const onSubmit = (data: PetProfileValues) => {
    onComplete(data);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <TooltipProvider>
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-none ring-1 ring-black/5 bg-white rounded-[2.5rem] overflow-hidden">
      <CardHeader className="text-center bg-muted/30 p-8 border-b">
        <div className="flex justify-center mb-6">
          <div className={cn("p-4 rounded-2xl transition-all duration-500", step === 1 ? "bg-primary text-white scale-110 shadow-lg" : "bg-white text-muted-foreground border")}>
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div className="w-10 h-0.5 bg-muted self-center mx-2" />
          <div className={cn("p-4 rounded-2xl transition-all duration-500", step === 2 ? "bg-primary text-white scale-110 shadow-lg" : "bg-white text-muted-foreground border")}>
            <HeartPulse className="w-6 h-6" />
          </div>
          <div className="w-10 h-0.5 bg-muted self-center mx-2" />
          <div className={cn("p-4 rounded-2xl transition-all duration-500", step === 3 ? "bg-primary text-white scale-110 shadow-lg" : "bg-white text-muted-foreground border")}>
            <Activity className="w-6 h-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-black font-headline">우리 아이 정밀 프로필</CardTitle>
        <CardDescription className="font-medium">나이, 체중, 건강 상태에 따른 맞춤 분석을 위해 꼭 필요해요.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-10">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <Label className="text-lg font-black flex items-center gap-2">1. 어떤 아이인가요?</Label>
                <RadioGroup 
                  defaultValue="dog" 
                  onValueChange={(val) => {
                    setPetType(val as 'dog' | 'cat');
                    setValue('petType', val as 'dog' | 'cat');
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label htmlFor="dog-survey" className={cn("flex flex-col items-center p-6 border-2 rounded-[2rem] cursor-pointer transition-all", petType === 'dog' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted opacity-60")}>
                    <RadioGroupItem value="dog" id="dog-survey" className="sr-only" />
                    <Dog className={cn("w-12 h-12 mb-2", petType === 'dog' ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-bold">강아지</span>
                  </Label>
                  <Label htmlFor="cat-survey" className={cn("flex flex-col items-center p-6 border-2 rounded-[2rem] cursor-pointer transition-all", petType === 'cat' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted opacity-60")}>
                    <RadioGroupItem value="cat" id="cat-survey" className="sr-only" />
                    <Cat className={cn("w-12 h-12 mb-2", petType === 'cat' ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-bold">고양이</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold ml-1">이름</Label>
                  <Input placeholder="이름" className="h-12 rounded-xl" {...register('name')} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold ml-1">품종</Label>
                  <Input placeholder="예: 말티즈, 코숏" className="h-12 rounded-xl" {...register('breed')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold ml-1">나이 (살)</Label>
                  <Input type="number" step="0.1" className="h-12 rounded-xl" {...register('age', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold ml-1">몸무게 (kg)</Label>
                  <Input type="number" step="0.1" className="h-12 rounded-xl" {...register('weight', { valueAsNumber: true })} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <Label className="text-lg font-black flex items-center gap-2">2. 건강 고민 ({petType === 'dog' ? '강아지' : '고양이'} 맞춤)</Label>
                
                <div className="grid grid-cols-2 gap-3">
                   {conditions.map((condition) => (
                     <div key={condition} className="flex items-center space-x-2 p-3 bg-white border rounded-xl hover:bg-muted/30 transition-colors">
                       <Checkbox 
                         id={condition} 
                         checked={selectedConditions.includes(condition)}
                         onCheckedChange={(checked) => {
                           const current = selectedConditions;
                           if (checked) {
                             setValue('healthConditions', [...current, condition]);
                           } else {
                             setValue('healthConditions', current.filter(c => c !== condition));
                           }
                         }}
                       />
                       <Label htmlFor={condition} className="text-xs font-bold cursor-pointer flex-1">{condition}</Label>
                     </div>
                   ))}
                </div>

                <div className="space-y-2 pt-4">
                   <Label className="font-bold text-sm ml-1">기타 고민 직접 입력</Label>
                   <Input 
                     placeholder="예: 최근 사료를 잘 안 먹어요, 특정 성분 눈물이 심해요 등" 
                     className="h-12 rounded-xl"
                     {...register('customHealthNote')}
                   />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <Label className="text-lg font-black">3. 식습관 & 활동량</Label>
                
                <div className="space-y-3">
                   <Label className="font-bold text-sm ml-1">피해야 하는 성분 (알러지)</Label>
                   <div className="flex flex-wrap gap-2">
                      {allergyList.map(allergy => (
                        <Badge 
                          key={allergy} 
                          variant={selectedAllergies.includes(allergy) ? "default" : "outline"}
                          className="px-4 py-2 cursor-pointer rounded-full font-bold text-xs"
                          onClick={() => {
                            const current = selectedAllergies;
                            if (current.includes(allergy)) {
                              setValue('allergies', current.filter(a => a !== allergy));
                            } else {
                              setValue('allergies', [...current, allergy]);
                            }
                          }}
                        >
                          {allergy}
                        </Badge>
                      ))}
                   </div>
                </div>

                <div className="space-y-3 pt-4">
                   <Label className="font-bold text-sm ml-1">활동 수준</Label>
                   <RadioGroup defaultValue="NORMAL" onValueChange={(val) => setValue('activityLevel', val as any)} className="space-y-2">
                      {[
                        { id: 'LOW', title: '낮음', desc: '거의 움직이지 않거나 노령견/묘' },
                        { id: 'NORMAL', title: '보통', desc: '매일 꾸준히 활동하거나 산책' },
                        { id: 'HIGH', title: '높음', desc: '활동량이 매우 많고 활동적' }
                      ].map((level) => (
                        <Label key={level.id} htmlFor={level.id} className={cn("flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all", watch('activityLevel') === level.id ? "border-primary bg-primary/5 shadow-sm" : "border-muted opacity-70")}>
                           <RadioGroupItem value={level.id} id={level.id} className="sr-only" />
                           <div className="flex-1 text-left">
                              <p className="font-black text-sm">{level.title}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">{level.desc}</p>
                           </div>
                        </Label>
                      ))}
                   </RadioGroup>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-8 bg-muted/10">
          {step > 1 ? (
            <Button type="button" variant="ghost" onClick={prevStep} className="font-bold rounded-xl h-12">
              <ArrowLeft className="mr-2 h-4 w-4" /> 이전
            </Button>
          ) : <div />}
          
          {step < 3 ? (
            <Button type="button" onClick={nextStep} className="bg-primary font-black rounded-xl h-12 px-8 shadow-lg shadow-primary/20">
              다음 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="bg-primary hover:bg-primary/90 font-black rounded-xl h-12 px-8 shadow-xl shadow-primary/30">
              프로필 등록 완료
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
    </TooltipProvider>
  );
}
