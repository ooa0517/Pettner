
'use client';

import { useMemo } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, ShieldCheck, 
  CheckCircle2, Database, Activity, Calendar,
  User, Weight, Ruler, Zap, Info, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const bcsOptions = [
  { value: '1', label: '1. 매우 마름', description: '갈비뼈와 골반뼈가 보임', emoji: '🦴' },
  { value: '2', label: '2. 마름', description: '갈비뼈가 쉽게 만져짐', emoji: '🐕' },
  { value: '3', label: '3. 이상적', description: '허리 굴곡이 있고 균형 잡힘', emoji: '✨' },
  { value: '4', label: '4. 과체중', description: '갈비뼈를 만지기 어려움', emoji: '🍔' },
  { value: '5', label: '5. 비만', description: '복부 팽창 및 지방 과다', emoji: '🍩' },
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
    neutered: boolean;
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
    productName: z.string().default(''),
    foodType: z.enum(['dry', 'wet', 'treat', 'supplement']),
    image: z.any().optional(),
    petProfile: z.object({
      name: z.string().default(''),
      breed: z.string().default(''),
      birthDate: z.string().default(''),
      dontKnowBirth: z.boolean().default(false),
      ageYears: z.string().default(''),
      neutered: z.boolean().default(true),
      weight: z.string().default(''),
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
        neutered: true,
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

  const dogConditions = ['관절/슬개골', '피부/눈물', '소화기', '심장', '다이어트'];
  const catConditions = ['신장/비뇨기', '헤어볼', '구강/치아', '심장', '다이어트'];
  const allergyList = ['닭', '소', '양', '생선', '밀/곡물', '계란', '콩'];

  return (
    <div className="space-y-12 max-w-2xl mx-auto pb-40 animate-in fade-in duration-700">
      <div className="text-center space-y-3">
        <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-black text-xs tracking-widest uppercase">
          Veterinary Analysis Engine v5.0
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-foreground leading-tight">
          {t('scannerHome.title')}
        </h1>
        <p className="text-muted-foreground text-sm font-medium">사료, 간식, 영양제의 성분을 분석하여 맞춤 리포트를 생성합니다.</p>
      </div>

      <Tabs defaultValue="custom" onValueChange={(v) => form.setValue('analysisMode', v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-16 rounded-[2rem] bg-muted/50 p-1.5 mb-10">
          <TabsTrigger value="general" className="rounded-[1.5rem] text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg">
            <Database className="mr-2 h-4 w-4" /> 제품 성분만 분석
          </TabsTrigger>
          <TabsTrigger value="custom" className="rounded-[1.5rem] text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg relative">
            <Sparkles className="mr-2 h-4 w-4 text-primary" /> 우리 아이 맞춤 분석
            <Badge className="absolute -top-3 -right-2 bg-primary text-[8px] h-5">RECOMMENDED</Badge>
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-10">
            <TabsContent value="custom" className="space-y-10 mt-0">
              {/* Step 1: Identity */}
              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-black/5">
                <CardHeader className="bg-muted/30 p-8 border-b">
                  <CardTitle className="flex items-center gap-3 text-lg font-black"><User className="text-primary" size={20}/> 1. 아이 기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <FormField control={form.control} name="petType" render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                      <Label htmlFor="dog" className={cn("flex flex-col items-center p-6 border-2 rounded-[2rem] cursor-pointer transition-all", selectedPet === 'dog' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted opacity-40")}>
                        <RadioGroupItem value="dog" id="dog" className="sr-only" />
                        <Dog size={32} className={cn("mb-2", selectedPet === 'dog' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black">강아지</span>
                      </Label>
                      <Label htmlFor="cat" className={cn("flex flex-col items-center p-6 border-2 rounded-[2rem] cursor-pointer transition-all", selectedPet === 'cat' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted opacity-40")}>
                        <RadioGroupItem value="cat" id="cat" className="sr-only" />
                        <Cat size={32} className={cn("mb-2", selectedPet === 'cat' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black">고양이</span>
                      </Label>
                    </RadioGroup>
                  )}/>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="petProfile.name" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold">이름</FormLabel><FormControl><Input placeholder="아이 이름" className="rounded-xl h-12" {...field} /></FormControl></FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.breed" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold">품종</FormLabel><FormControl><Input placeholder="예: 말티즈" className="rounded-xl h-12" {...field} /></FormControl></FormItem>
                    )}/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FormLabel className="font-bold">생년월일</FormLabel>
                      <Input type={dontKnowBirth ? "number" : "date"} step="0.1" className="rounded-xl h-12" {...form.register(dontKnowBirth ? 'petProfile.ageYears' : 'petProfile.birthDate')} />
                      <div className="flex items-center gap-2 mt-1">
                        <Checkbox id="dontKnow" onCheckedChange={(v) => form.setValue('petProfile.dontKnowBirth', !!v)} />
                        <Label htmlFor="dontKnow" className="text-xs text-muted-foreground">생일을 몰라요 (나이 입력)</Label>
                      </div>
                    </div>
                    <FormField control={form.control} name="petProfile.weight" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold">현재 몸무게 (kg)</FormLabel><FormControl><Input type="number" step="0.1" className="rounded-xl h-12" {...field} /></FormControl></FormItem>
                    )}/>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Physical Stats */}
              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-black/5">
                <CardHeader className="bg-muted/30 p-8 border-b">
                  <CardTitle className="flex items-center gap-3 text-lg font-black"><Weight className="text-primary" size={20}/> 2. 신체 상태 (급여량 계산)</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  <FormField control={form.control} name="petProfile.neutered" render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="font-bold">중성화 여부 *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={(v) => field.onChange(v === 'yes')} defaultValue={field.value ? 'yes' : 'no'} className="grid grid-cols-2 gap-4">
                          <Label htmlFor="n-y" className={cn("p-4 border-2 rounded-2xl text-center font-bold cursor-pointer", field.value ? "border-primary bg-primary/5" : "border-muted opacity-50")}>
                            <RadioGroupItem value="yes" id="n-y" className="sr-only"/>완료
                          </Label>
                          <Label htmlFor="n-n" className={cn("p-4 border-2 rounded-2xl text-center font-bold cursor-pointer", !field.value ? "border-primary bg-primary/5" : "border-muted opacity-50")}>
                            <RadioGroupItem value="no" id="n-n" className="sr-only"/>미완료
                          </Label>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}/>

                  <FormField control={form.control} name="petProfile.bcs" render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="font-bold">체형 선택 (BCS) *</FormLabel>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-5 gap-2">
                        {bcsOptions.map(opt => (
                          <TooltipProvider key={opt.value}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Label htmlFor={`bcs-${opt.value}`} className={cn("flex flex-col items-center p-3 border-2 rounded-2xl cursor-pointer transition-all", field.value === opt.value ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-muted opacity-40")}>
                                  <RadioGroupItem value={opt.value} id={`bcs-${opt.value}`} className="sr-only" />
                                  <span className="text-2xl mb-1">{opt.emoji}</span>
                                  <span className="text-[10px] font-black">{opt.value}단계</span>
                                </Label>
                              </TooltipTrigger>
                              <TooltipContent><p className="font-bold">{opt.label}</p><p className="text-[10px]">{opt.description}</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )}/>
                </CardContent>
              </Card>

              {/* Step 3: Lifestyle */}
              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-black/5">
                <CardHeader className="bg-muted/30 p-8 border-b">
                  <CardTitle className="flex items-center gap-3 text-lg font-black"><Activity className="text-primary" size={20}/> 3. 라이프스타일</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <FormField control={form.control} name="petProfile.activityLevel" render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                      {[
                        { v: 'LOW', t: selectedPet === 'dog' ? '집순이 (&lt;30분)' : '활동량 적음 (실내묘)', i: Ruler },
                        { v: 'NORMAL', t: '적당함 (보통 활동)', i: Activity },
                        { v: 'HIGH', t: selectedPet === 'dog' ? '에너자이저 (&gt;1시간)' : '활동량 많음 (외출묘)', i: Zap }
                      ].map(lvl => (
                        <Label key={lvl.v} className={cn("flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all", field.value === lvl.v ? "border-primary bg-primary/5 shadow-md" : "border-muted opacity-50")}>
                          <RadioGroupItem value={lvl.v} className="sr-only" />
                          <div className={cn("p-2 rounded-xl", field.value === lvl.v ? "bg-primary text-white" : "bg-muted")}><lvl.i size={20}/></div>
                          <span className="font-black text-sm">{lvl.t}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  )}/>
                </CardContent>
              </Card>

              {/* Step 4: Safety Net */}
              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-black/5">
                <CardHeader className="bg-muted/30 p-8 border-b">
                  <CardTitle className="flex items-center gap-3 text-lg font-black"><ShieldCheck className="text-primary" size={20}/> 4. 건강 고민 & 알러지</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <Label className="font-bold text-sm">최근 건강 고민 (중복 선택)</Label>
                    <div className="flex flex-wrap gap-2">
                      {(selectedPet === 'dog' ? dogConditions : catConditions).map(c => (
                        <Badge key={c} variant={form.watch('petProfile.healthConditions').includes(c) ? 'default' : 'outline'} className="px-4 py-2 cursor-pointer rounded-full font-bold" onClick={() => {
                          const cur = form.getValues('petProfile.healthConditions');
                          form.setValue('petProfile.healthConditions', cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);
                        }}>{c}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="font-bold text-sm">피해야 하는 성분 (알러지)</Label>
                    <div className="flex flex-wrap gap-2">
                      {allergyList.map(a => (
                        <Badge key={a} variant={form.watch('petProfile.allergies').includes(a) ? 'destructive' : 'outline'} className="px-4 py-2 cursor-pointer rounded-full font-bold" onClick={() => {
                          const cur = form.getValues('petProfile.allergies');
                          form.setValue('petProfile.allergies', cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
                        }}>{a}</Badge>
                      ))}
                      <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold" onClick={() => form.setValue('petProfile.allergies', [])}>없음 / 모름</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Product Upload (Always Visible) */}
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white ring-1 ring-black/5">
              <CardHeader className="bg-primary/5 p-10 border-b">
                <CardTitle className="flex items-center gap-4 text-2xl font-black"><Camera className="text-primary" size={28}/> 분석할 제품 촬영</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <FormField control={form.control} name="foodType" render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { v: 'dry', l: '🍚 건식' }, { v: 'wet', l: '🍲 습식' },
                      { v: 'treat', l: '🍖 간식' }, { v: 'supplement', l: '💊 영양제' }
                    ].map(t => (
                      <Label key={t.v} className={cn("flex items-center justify-center h-14 border-2 rounded-2xl cursor-pointer font-bold text-xs transition-all", field.value === t.v ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted opacity-50")}>
                        <RadioGroupItem value={t.v} className="sr-only" />{t.l}
                      </Label>
                    ))}
                  </RadioGroup>
                )}/>

                <FormField control={form.control} name="image" render={({ field: { onChange } }) => (
                  <div className={cn("relative w-full aspect-[4/3] border-4 border-dashed rounded-[3rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all", imageFile?.length ? "border-success bg-success/5" : "border-muted hover:border-primary hover:bg-primary/5")}>
                    {imageFile?.length ? <CheckCircle2 className="h-20 w-20 text-success mb-4" /> : <Camera className="h-20 w-20 text-primary mb-4 opacity-30" />}
                    <p className="text-xl font-black">{imageFile?.length ? "촬영 완료" : "성분표 촬영하기"}</p>
                    <p className="text-xs text-muted-foreground mt-2 font-medium px-10">등록성분량과 원재료명이 잘 보이게 찍어주세요.</p>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange(e.target.files)} />
                  </div>
                )}/>

                <FormField control={form.control} name="productName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">제품명 (직접 입력 가능)</FormLabel>
                    <FormControl><Input placeholder="AI가 사진에서 추출하지만, 미리 적어주시면 더 정확해요." className="h-14 rounded-2xl border-2" {...field} /></FormControl>
                  </FormItem>
                )}/>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" disabled={!imageFile?.length} className="w-full h-24 text-3xl font-black rounded-[3rem] shadow-2xl shadow-primary/30 bg-primary hover:scale-[1.02] active:scale-95 transition-all">
              <Sparkles className="mr-4 h-10 w-10" /> 정밀 분석 리포트 생성
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
