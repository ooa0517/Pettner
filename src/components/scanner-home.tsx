'use client';

import { useMemo, useState } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, ShieldCheck, 
  CheckCircle2, Database, Activity,
  HeartPulse, Scale,
  Dna, AlertCircle, Info, Stethoscope, Footprints, Droplets, UtensilsCrossed, Pill
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

const bcsOptions = [
  { value: '1', label: '1. 매우 마름', emoji: '😰', color: 'bg-[#E3F2FD]' },
  { value: '2', label: '2. 마름', emoji: '😟', color: 'bg-[#E0F7FA]' },
  { value: '3', label: '3. 이상적', emoji: '😊', color: 'bg-[#E8F5E9]' },
  { value: '4', label: '4. 통통', emoji: '🙂', color: 'bg-[#FFFDE7]' },
  { value: '5', label: '5. 비만', emoji: '😖', color: 'bg-[#FBE9E7]' },
];

type AnalysisFormValues = {
  petType: 'dog' | 'cat';
  analysisMode: 'general' | 'custom';
  productName: string;
  foodType: 'dry' | 'wet' | 'treat' | 'supplement';
  image?: FileList;
  petProfile: {
    name: string;
    breed: string;
    age: string;
    weight: string;
    weightChange: string;
    neutered: boolean;
    bcs: string;
    lifestyle: string;
    behaviorPattern: string;
    environment: string;
    healthConditions: string[];
    customHealthNote: string;
    allergies: string[];
    stoolCondition: string;
    medications: string;
    pickiness: string;
    preferredTexture: string;
    waterIntake: string;
  };
};

export default function ScannerHome({ onAnalyze }: { onAnalyze: (data: any) => void }) {
  const { t } = useLanguage();
  
  const formSchema = useMemo(() => z.object({
    petType: z.enum(['dog', 'cat']),
    analysisMode: z.enum(['general', 'custom']),
    productName: z.string().optional(),
    foodType: z.enum(['dry', 'wet', 'treat', 'supplement']),
    image: z.any().optional(),
    petProfile: z.object({
      name: z.string().optional(),
      breed: z.string().optional(),
      age: z.string().optional(),
      weight: z.string().optional(),
      weightChange: z.string().optional(),
      neutered: z.boolean().optional(),
      bcs: z.string().optional(),
      lifestyle: z.string().optional(),
      behaviorPattern: z.string().optional(),
      environment: z.string().optional(),
      healthConditions: z.array(z.string()).optional(),
      customHealthNote: z.string().optional(),
      allergies: z.array(z.string()).optional(),
      stoolCondition: z.string().optional(),
      medications: z.string().optional(),
      pickiness: z.string().optional(),
      preferredTexture: z.string().optional(),
      waterIntake: z.string().optional(),
    })
  }), []);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petType: 'dog',
      analysisMode: 'custom',
      productName: '',
      foodType: 'dry',
      petProfile: {
        name: '',
        breed: '',
        age: '',
        weight: '',
        weightChange: 'none',
        neutered: true,
        bcs: '3',
        lifestyle: 'NORMAL',
        behaviorPattern: 'NORMAL',
        environment: 'INDOOR',
        healthConditions: [],
        customHealthNote: '',
        allergies: [],
        stoolCondition: 'GOOD',
        medications: '',
        pickiness: 'NORMAL',
        preferredTexture: 'ANY',
        waterIntake: 'NORMAL',
      }
    },
  });

  const selectedMode = form.watch('analysisMode');
  const selectedPet = form.watch('petType');
  const imageFile = form.watch('image');
  const selectedHealth = form.watch('petProfile.healthConditions');

  const dogConditions = ['슬개골 탈구', '관절염', '피부 알러지', '눈물 자국', '심장 질환', '소화 불량', '췌장염', '신장 질환'];
  const catConditions = ['방광염/요로결석', '헤어볼', '신장 질환', '구강 건강', '심부전', '피부 건강', '당뇨'];

  const onSubmit = (data: AnalysisFormValues) => {
    onAnalyze(data);
  };

  return (
    <div className="space-y-12 max-w-2xl mx-auto pb-48 animate-in fade-in duration-700 px-4">
      <div className="text-center space-y-4 pt-10">
        <Badge className="bg-primary/10 text-primary border-none px-4 py-2 rounded-full font-black text-[10px] tracking-widest uppercase">
          Veterinary Precision v12.0
        </Badge>
        <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter text-foreground leading-tight">
          Pettner Scan
        </h1>
        <p className="text-muted-foreground font-medium text-lg">우리 아이를 위한 병원급 정밀 영양 매칭 🐾</p>
      </div>

      <Tabs defaultValue="custom" onValueChange={(v) => form.setValue('analysisMode', v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-20 rounded-[2.5rem] bg-white shadow-xl p-2 mb-12">
          <TabsTrigger value="general" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all">
            단순 성분 심사
          </TabsTrigger>
          <TabsTrigger value="custom" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            수의학 정밀 진단
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <TabsContent value="custom" className="space-y-10 mt-0">
              
              {/* 1. 기본 및 신체 정보 */}
              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Scale className="text-primary" size={28}/> 1. 신체 정보 및 체중 변화</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <FormField control={form.control} name="petType" render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                      <Label htmlFor="dog" className={cn("flex flex-col items-center p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all active:scale-95", selectedPet === 'dog' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                        <RadioGroupItem value="dog" id="dog" className="sr-only" />
                        <Dog size={48} className={cn("mb-2", selectedPet === 'dog' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black">강아지</span>
                      </Label>
                      <Label htmlFor="cat" className={cn("flex flex-col items-center p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all active:scale-95", selectedPet === 'cat' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                        <RadioGroupItem value="cat" id="cat" className="sr-only" />
                        <Cat size={48} className={cn("mb-2", selectedPet === 'cat' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black">고양이</span>
                      </Label>
                    </RadioGroup>
                  )}/>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="petProfile.name" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2">이름</FormLabel><FormControl><Input placeholder="아이 이름" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.breed" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2">품종</FormLabel><FormControl><Input placeholder="예: 말티즈" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="petProfile.age" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2">나이 (살)</FormLabel><FormControl><Input type="number" step="0.1" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.weight" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2">현재 체중 (kg)</FormLabel><FormControl><Input type="number" step="0.1" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                  </div>

                  <FormField control={form.control} name="petProfile.weightChange" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold ml-2">최근 3개월 체중 변화</FormLabel>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-3 pt-2">
                        {['변화없음', '급격히 찜', '급격히 빠짐'].map((v, i) => (
                          <Label key={v} className={cn("flex justify-center p-3 border-2 rounded-xl cursor-pointer text-xs font-bold", field.value === (i === 0 ? 'none' : i === 1 ? 'gain' : 'loss') ? "border-primary bg-primary/5" : "border-muted opacity-60")}>
                             <RadioGroupItem value={i === 0 ? 'none' : i === 1 ? 'gain' : 'loss'} className="sr-only" />
                             {v}
                          </Label>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )}/>
                </CardContent>
              </Card>

              {/* 2. 라이프스타일 및 행동 */}
              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Footprints className="text-primary" size={28}/> 2. 라이프스타일 및 활력</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <FormField control={form.control} name="petProfile.lifestyle" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold ml-2">{selectedPet === 'dog' ? '하루 평균 산책 시간' : '생활 환경'}</FormLabel>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 gap-2 pt-2">
                         {(selectedPet === 'dog' ? 
                          ['거의 안함(실내배변)', '가벼운 산책(30분 미만)', '적당한 활동(30~1시간)', '고강도 활동(1시간 이상)'] : 
                          ['완전 실내묘', '마당 및 산책 겸함', '방사형 외출묘']
                         ).map((v) => (
                          <Label key={v} className={cn("flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all", field.value === v ? "border-primary bg-primary/5" : "border-muted")}>
                             <RadioGroupItem value={v} className="sr-only" />
                             <span className="text-sm font-bold">{v}</span>
                          </Label>
                         ))}
                      </RadioGroup>
                    </FormItem>
                  )}/>

                  <FormField control={form.control} name="petProfile.behaviorPattern" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold ml-2">평소 행동 패턴</FormLabel>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 gap-2 pt-2">
                        {[
                          { v: 'LOW', t: '저활동', d: '하루종일 잠만 자거나 누워있음' },
                          { v: 'NORMAL', t: '보통', d: '장난감을 가지고 잘 놀고 가끔 우다다함' },
                          { v: 'HIGH', t: '고활동', d: '잠시도 가만히 있지 않고 매일 등반/우다다함' }
                        ].map((item) => (
                          <Label key={item.v} className={cn("flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all", field.value === item.v ? "border-primary bg-primary/5" : "border-muted")}>
                             <RadioGroupItem value={item.v} className="sr-only" />
                             <span className="text-sm font-bold">{item.t}</span>
                             <span className="text-[10px] text-muted-foreground font-medium mt-1">{item.d}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )}/>
                </CardContent>
              </Card>

              {/* 3. 소화 및 기호성 */}
              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><UtensilsCrossed className="text-primary" size={28}/> 3. 소화 상태 및 식습관</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <FormField control={form.control} name="petProfile.stoolCondition" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold ml-2">평소 변 상태</FormLabel>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-2 pt-2">
                         {['딱딱/건조', '촉촉/적당', '무름/설사'].map((v) => (
                          <Label key={v} className={cn("flex justify-center p-3 border-2 rounded-xl cursor-pointer text-[10px] font-black", field.value === v ? "border-primary bg-primary/5" : "border-muted opacity-60")}>
                             <RadioGroupItem value={v} className="sr-only" />
                             {v}
                          </Label>
                         ))}
                      </RadioGroup>
                    </FormItem>
                  )}/>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="petProfile.waterIntake" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold ml-2 flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-400"/> 음수량</FormLabel>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-2 pt-2">
                           {['적음', '보통', '많음'].map(v => (
                             <Label key={v} className={cn("flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer text-xs font-bold", field.value === v ? "border-primary bg-primary/5" : "border-muted")}>
                                <RadioGroupItem value={v} className="sr-only" /> {v}
                             </Label>
                           ))}
                        </RadioGroup>
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.pickiness" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold ml-2">입맛 까다로움</FormLabel>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-2 pt-2">
                           {['없음', '보통', '매우 예민'].map(v => (
                             <Label key={v} className={cn("flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer text-xs font-bold", field.value === v ? "border-primary bg-primary/5" : "border-muted")}>
                                <RadioGroupItem value={v} className="sr-only" /> {v}
                             </Label>
                           ))}
                        </RadioGroup>
                      </FormItem>
                    )}/>
                  </div>
                </CardContent>
              </Card>

              {/* 4. 건강 정밀 체크 */}
              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Stethoscope className="text-primary" size={28}/> 4. 건강 정밀 진단 & 병력</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-12">
                  <div className="space-y-4">
                    <Label className="font-black text-lg ml-2">관리 중인 질환 (중복 선택)</Label>
                    <div className="flex flex-wrap gap-2">
                      {(selectedPet === 'dog' ? dogConditions : catConditions).map(c => (
                        <button 
                          key={c} 
                          type="button"
                          className={cn("px-5 py-3 rounded-full font-black text-xs transition-all", 
                            selectedHealth.includes(c) ? "bg-primary text-white shadow-lg" : "bg-muted/50 text-muted-foreground"
                          )} 
                          onClick={() => {
                            const cur = [...selectedHealth];
                            if (cur.includes(c)) {
                              form.setValue('petProfile.healthConditions', cur.filter(x => x !== c));
                            } else {
                              form.setValue('petProfile.healthConditions', [...cur, c]);
                            }
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <FormField control={form.control} name="petProfile.customHealthNote" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold ml-2">기타 병력 및 질환 직접 기입</FormLabel>
                      <FormControl>
                        <Input placeholder="최근 수술 이력이나 현재 걱정되는 부분을 적어주세요." className="h-14 rounded-2xl bg-muted/10 border-none px-6" {...field} />
                      </FormControl>
                    </FormItem>
                  )}/>

                  <FormField control={form.control} name="petProfile.medications" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold ml-2 flex items-center gap-1"><Pill className="w-3 h-3 text-red-400"/> 복용 중인 약물</FormLabel>
                      <FormControl>
                        <Input placeholder="심장약, 처방 사료 등 정기 복용 중인 것이 있다면 기입하세요." className="h-14 rounded-2xl bg-muted/10 border-none px-6" {...field} />
                      </FormControl>
                    </FormItem>
                  )}/>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general" className="mt-0">
               <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-14 text-center space-y-6">
                 <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4">
                    <Database className="w-12 h-12 text-primary" />
                 </div>
                 <h2 className="text-3xl font-black">제품 감사관 모드</h2>
                 <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                   제품 자체의 원료 품질과 브랜드 신뢰도를<br/>객관적으로 심사하여 보고서를 발행합니다.
                 </p>
               </Card>
            </TabsContent>

            <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 p-12 border-b">
                <CardTitle className="flex items-center gap-5 text-3xl font-black"><Camera className="text-primary" size={36}/> 제품 사진 촬영</CardTitle>
              </CardHeader>
              <CardContent className="p-12 space-y-12">
                <FormField control={form.control} name="image" render={({ field: { onChange } }) => (
                  <div className={cn("relative w-full aspect-[4/3] border-[6px] border-dashed rounded-[4.5rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all", imageFile?.length ? "border-success bg-success/5" : "border-muted/30")}>
                    {imageFile?.length ? <CheckCircle2 className="h-24 w-24 text-success mb-6" /> : <Camera className="h-24 w-24 text-primary mb-6 opacity-20" />}
                    <p className="text-2xl font-black">{imageFile?.length ? "촬영 완료!" : "성분표 촬영하기"}</p>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange(e.target.files)} />
                  </div>
                )}/>

                <FormField control={form.control} name="productName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold ml-2">제품명</FormLabel>
                    <FormControl><Input placeholder="제품명을 입력해주세요." className="h-16 rounded-[2rem] bg-muted/10 border-none px-8 font-bold" {...field} /></FormControl>
                  </FormItem>
                )}/>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" disabled={!imageFile?.length} className="w-full h-28 text-3xl font-black rounded-[3.5rem] shadow-2xl shadow-primary/30 bg-primary hover:scale-[1.02] active:scale-95 transition-all">
              <Sparkles className="mr-4 h-10 w-10" /> 분석 시작하기
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}