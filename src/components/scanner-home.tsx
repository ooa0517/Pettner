'use client';

import { useMemo } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, ShieldCheck, 
  CheckCircle2, Database, Activity,
  Zap, ChevronRight,
  HeartPulse, Scale,
  Dna, Calendar
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
  { value: '1', label: '매우 마름', description: '갈비뼈가 훤히 보임', emoji: '🦴' },
  { value: '2', label: '마름', description: '지방층이 매우 얇음', emoji: '🐕' },
  { value: '3', label: '이상적', description: '적당한 허리선 (Best)', emoji: '✨' },
  { value: '4', label: '통통함', description: '허리선이 잘 안 보임', emoji: '🍑' },
  { value: '5', label: '비만', description: '지방층이 두껍고 무거움', emoji: '🍩' },
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
    birthDate: string;
    dontKnowBirth: boolean;
    ageYears: string;
    genderStatus: string;
    weight: string;
    bcs: string;
    activityLevel: string;
    healthConditions: string[];
    allergies: string[];
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
      name: z.string().min(1, '이름을 입력해주세요'),
      breed: z.string().min(1, '품종을 입력해주세요'),
      birthDate: z.string().optional(),
      dontKnowBirth: z.boolean().default(false),
      ageYears: z.string().optional(),
      genderStatus: z.string().default('neutered_male'),
      weight: z.string().min(1, '몸무게를 입력해주세요'),
      bcs: z.string().default('3'),
      activityLevel: z.string().default('NORMAL'),
      healthConditions: z.array(z.string()).default([]),
      allergies: z.array(z.string()).default([]),
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
        birthDate: '',
        dontKnowBirth: false,
        ageYears: '',
        genderStatus: 'neutered_male',
        weight: '',
        bcs: '3',
        activityLevel: 'NORMAL',
        healthConditions: [],
        allergies: [],
      }
    },
  });

  const selectedPet = form.watch('petType');
  const imageFile = form.watch('image');
  const dontKnowBirth = form.watch('petProfile.dontKnowBirth');
  const selectedBcs = form.watch('petProfile.bcs');
  const selectedGender = form.watch('petProfile.genderStatus');
  const selectedActivity = form.watch('petProfile.activityLevel');

  const dogConditions = ['관절/슬개골', '피부/눈물', '소화기', '심장', '다이어트'];
  const catConditions = ['신장/비뇨기', '헤어볼', '구강/치아', '심장', '다이어트'];
  const allergyList = ['닭', '소', '양', '생선', '곡물', '계란', '콩'];

  return (
    <div className="space-y-12 max-w-2xl mx-auto pb-48 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none px-4 py-2 rounded-full font-black text-[10px] tracking-widest uppercase">
          Veterinary Analysis Engine v5.0
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-foreground leading-tight">
          반려동물 정밀 분석
        </h1>
        <p className="text-muted-foreground text-base font-medium">우리 아이 건강을 위한 맞춤 영양 처방전 🐾</p>
      </div>

      <Tabs defaultValue="custom" onValueChange={(v) => form.setValue('analysisMode', v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-20 rounded-[2.5rem] bg-white shadow-xl p-2 mb-12">
          <TabsTrigger value="general" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all">
            <Database className="mr-2 h-4 w-4" /> 단순 성분 분석
          </TabsTrigger>
          <TabsTrigger value="custom" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            <Sparkles className="mr-2 h-4 w-4" /> 맞춤 정밀 리포트
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-12">
            <TabsContent value="custom" className="space-y-12 mt-0">
              {/* 1. Identity Section */}
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Dna className="text-primary" size={28}/> 🧬 1. 아이 기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <FormField control={form.control} name="petType" render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-6">
                      <Label htmlFor="dog" className={cn("flex flex-col items-center p-8 border-4 rounded-[3rem] cursor-pointer transition-all active:scale-95", selectedPet === 'dog' ? "border-primary bg-primary/5 shadow-inner" : "border-muted opacity-40")}>
                        <RadioGroupItem value="dog" id="dog" className="sr-only" />
                        <Dog size={48} className={cn("mb-3", selectedPet === 'dog' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black text-xl">강아지</span>
                      </Label>
                      <Label htmlFor="cat" className={cn("flex flex-col items-center p-8 border-4 rounded-[3rem] cursor-pointer transition-all active:scale-95", selectedPet === 'cat' ? "border-primary bg-primary/5 shadow-inner" : "border-muted opacity-40")}>
                        <RadioGroupItem value="cat" id="cat" className="sr-only" />
                        <Cat size={48} className={cn("mb-3", selectedPet === 'cat' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black text-xl">고양이</span>
                      </Label>
                    </RadioGroup>
                  )}/>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField control={form.control} name="petProfile.name" render={({ field }) => (
                      <FormItem><FormLabel className="font-black ml-2 text-muted-foreground">이름</FormLabel><FormControl><Input placeholder="아이 이름" className="rounded-2xl h-14 bg-muted/20 border-none px-6" {...field} /></FormControl></FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.breed" render={({ field }) => (
                      <FormItem><FormLabel className="font-black ml-2 text-muted-foreground">품종</FormLabel><FormControl><Input placeholder="예: 말티즈, 코숏" className="rounded-2xl h-14 bg-muted/20 border-none px-6" {...field} /></FormControl></FormItem>
                    )}/>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <FormLabel className="font-black ml-2 text-muted-foreground">생년월일 / 나이</FormLabel>
                      {dontKnowBirth ? (
                        <div className="relative">
                          <Input 
                            type="number" 
                            step="0.1" 
                            inputMode="decimal" 
                            placeholder="예: 4.5" 
                            className="rounded-2xl h-14 bg-muted/20 border-none px-6 pr-12" 
                            {...form.register('petProfile.ageYears')} 
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-muted-foreground">살</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input 
                            type="date" 
                            className="rounded-2xl h-14 bg-muted/20 border-none px-6 block w-full" 
                            {...form.register('petProfile.birthDate')} 
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-2 mt-1">
                        <Checkbox 
                          id="dontKnow" 
                          checked={dontKnowBirth}
                          onCheckedChange={(v) => form.setValue('petProfile.dontKnowBirth', !!v)} 
                        />
                        <Label htmlFor="dontKnow" className="text-xs font-bold text-muted-foreground cursor-pointer">생일을 몰라요 (나이 직접 입력)</Label>
                      </div>
                    </div>
                    <FormField control={form.control} name="petProfile.weight" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black ml-2 text-muted-foreground">현재 체중 (kg)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              step="0.1" 
                              inputMode="decimal" 
                              placeholder="0.0" 
                              className="rounded-2xl h-14 bg-muted/20 border-none px-6 pr-12" 
                              {...field} 
                            />
                            <Scale className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-30" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}/>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Physical Stats Section */}
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><HeartPulse className="text-primary" size={28}/> ⚖️ 2. 신체 상태</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-12">
                  <FormField control={form.control} name="petProfile.genderStatus" render={({ field }) => (
                    <FormItem className="space-y-6">
                      <FormLabel className="font-black ml-2 text-muted-foreground">성별 및 중성화 여부</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4">
                          {[
                            { v: 'male', l: '미중성화 수컷' }, { v: 'female', l: '미중성화 암컷' },
                            { v: 'neutered_male', l: '중성화 수컷' }, { v: 'neutered_female', l: '중성화 암컷' }
                          ].map(opt => (
                            <Label key={opt.v} htmlFor={opt.v} className={cn("p-5 rounded-2xl text-center font-bold cursor-pointer transition-all active:scale-95 border-4", selectedGender === opt.v ? "border-primary bg-primary/5" : "border-muted/30 opacity-60")}>
                              <RadioGroupItem value={opt.v} id={opt.v} className="sr-only"/>{opt.l}
                            </Label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}/>

                  <FormField control={form.control} name="petProfile.bcs" render={({ field }) => (
                    <FormItem className="space-y-6">
                      <div className="flex items-center justify-between ml-2">
                        <FormLabel className="font-black text-muted-foreground">아이의 체형 (BCS)</FormLabel>
                        <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-bold">전문의 권장 척도</Badge>
                      </div>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-3">
                          {bcsOptions.map(opt => (
                            <Label key={opt.value} htmlFor={`bcs-${opt.value}`} className={cn("flex items-center gap-5 p-5 border-4 rounded-[2rem] cursor-pointer transition-all active:scale-[0.98]", selectedBcs === opt.value ? "border-primary bg-primary/5" : "border-muted/30 opacity-60")}>
                              <RadioGroupItem value={opt.value} id={`bcs-${opt.value}`} className="sr-only" />
                              <span className="text-4xl">{opt.emoji}</span>
                              <div className="flex-1">
                                <p className="font-black text-lg">{opt.label}</p>
                                <p className="text-xs text-muted-foreground font-medium">{opt.description}</p>
                              </div>
                              {selectedBcs === opt.value && <CheckCircle2 className="text-primary w-6 h-6" />}
                            </Label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}/>
                </CardContent>
              </Card>

              {/* 3. Lifestyle Section */}
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Activity className="text-primary" size={28}/> 🏃‍♂️ 3. 라이프스타일</CardTitle>
                </CardHeader>
                <CardContent className="p-10">
                  <FormField control={form.control} name="petProfile.activityLevel" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-4">
                          {[
                            { v: 'LOW', t: selectedPet === 'dog' ? '집순이/노령견 (<30분)' : '활동량 적음 (실내묘)', d: '주로 잠을 자거나 움직임이 적음' },
                            { v: 'NORMAL', t: '적당함 (일반적인 활동)', d: '매일 꾸준히 활동하거나 산책함' },
                            { v: 'HIGH', t: selectedPet === 'dog' ? '에너자이저 (>1시간)' : '활동량 매우 많음', d: '매우 활동적이고 에너지가 넘침' }
                          ].map(lvl => (
                            <Label key={lvl.v} className={cn("flex items-center gap-5 p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all active:scale-95", selectedActivity === lvl.v ? "border-primary bg-primary/5 shadow-sm" : "border-muted/30 opacity-50")}>
                              <RadioGroupItem value={lvl.v} className="sr-only" />
                              <div className={cn("p-3 rounded-2xl", selectedActivity === lvl.v ? "bg-primary text-white" : "bg-muted")}><Zap size={24}/></div>
                              <div className="text-left">
                                <p className="font-black text-lg">{lvl.t}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">{lvl.d}</p>
                              </div>
                            </Label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}/>
                </CardContent>
              </Card>

              {/* 4. Health & Allergy Section */}
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><ShieldCheck className="text-primary" size={28}/> 🛡️ 4. 건강 & 알러지</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-12">
                  <div className="space-y-5">
                    <Label className="font-black text-lg ml-2">건강 고민 (중복 선택)</Label>
                    <div className="flex flex-wrap gap-3">
                      {(selectedPet === 'dog' ? dogConditions : catConditions).map(c => (
                        <button 
                          key={c} 
                          type="button"
                          className={cn("px-6 py-3 rounded-full font-bold text-sm transition-all active:scale-90", 
                            form.watch('petProfile.healthConditions').includes(c) ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          )} 
                          onClick={() => {
                            const cur = form.getValues('petProfile.healthConditions');
                            form.setValue('petProfile.healthConditions', cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between px-2">
                      <Label className="font-black text-lg">피해야 할 성분 (알러지)</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs font-bold text-destructive hover:bg-destructive/10"
                        onClick={() => form.setValue('petProfile.allergies', [])}
                      >
                        초기화
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {allergyList.map(a => (
                        <button 
                          key={a} 
                          type="button"
                          className={cn("px-6 py-3 rounded-full font-bold text-sm transition-all active:scale-90", 
                            form.watch('petProfile.allergies').includes(a) ? "bg-destructive text-white shadow-lg shadow-destructive/20" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          )} 
                          onClick={() => {
                            const cur = form.getValues('petProfile.allergies');
                            form.setValue('petProfile.allergies', cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
                          }}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general" className="mt-0">
               <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-12 text-center space-y-4">
                 <div className="w-20 h-20 bg-muted/30 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                    <Database className="w-10 h-10 text-muted-foreground" />
                 </div>
                 <h2 className="text-2xl font-black">심플 성분 분석 모드</h2>
                 <p className="text-muted-foreground font-medium">아이 정보 없이 제품의 성분과 영양 농도만 객관적으로 분석합니다.</p>
               </Card>
            </TabsContent>

            <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 p-12 border-b">
                <CardTitle className="flex items-center gap-5 text-3xl font-black"><Camera className="text-primary" size={36}/> 분석할 제품 촬영</CardTitle>
              </CardHeader>
              <CardContent className="p-12 space-y-12">
                <FormField control={form.control} name="foodType" render={({ field }) => (
                  <FormItem className="space-y-6">
                    <FormLabel className="font-black text-lg ml-2 text-muted-foreground">제품 종류</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { v: 'dry', l: '🍚 건식' }, { v: 'wet', l: '🍲 습식' },
                          { v: 'treat', l: '🍖 간식' }, { v: 'supplement', l: '💊 영양제' }
                        ].map(t => (
                          <Label key={t.v} className={cn("flex items-center justify-center h-16 border-4 rounded-[2rem] cursor-pointer font-bold text-sm transition-all active:scale-95", field.value === t.v ? "border-primary bg-primary/5 shadow-sm" : "border-muted/30 opacity-50")}>
                            <RadioGroupItem value={t.v} className="sr-only" />{t.l}
                          </Label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}/>

                <FormField control={form.control} name="image" render={({ field: { onChange } }) => (
                  <div className={cn("relative w-full aspect-[4/3] border-[6px] border-dashed rounded-[4rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all hover:bg-primary/5", imageFile?.length ? "border-success bg-success/5" : "border-muted/30")}>
                    {imageFile?.length ? <CheckCircle2 className="h-24 w-24 text-success mb-6 animate-in zoom-in" /> : <Camera className="h-24 w-24 text-primary mb-6 opacity-20" />}
                    <p className="text-2xl font-black">{imageFile?.length ? "촬영 완료!" : "성분표 촬영하기"}</p>
                    <p className="text-sm text-muted-foreground mt-3 font-medium px-12 leading-relaxed">뒷면의 원재료명과 등록성분량이<br/>잘 보이도록 밝은 곳에서 찍어주세요.</p>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange(e.target.files)} />
                  </div>
                )}/>

                <FormField control={form.control} name="productName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-lg ml-2 text-muted-foreground">제품명 (직접 입력 시 더 정확해요)</FormLabel>
                    <FormControl><Input placeholder="AI가 사진에서 찾지만, 입력해주시면 가장 정확해요." className="h-16 rounded-[2rem] bg-muted/20 border-none px-8 font-bold" {...field} /></FormControl>
                  </FormItem>
                )}/>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" disabled={!imageFile?.length} className="w-full h-28 text-3xl font-black rounded-[3.5rem] shadow-2xl shadow-primary/30 bg-primary hover:scale-[1.02] active:scale-95 transition-all">
              <Sparkles className="mr-4 h-10 w-10" /> 정밀 분석 시작하기
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
