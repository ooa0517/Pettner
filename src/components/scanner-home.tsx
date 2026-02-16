'use client';

import { useMemo } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, ShieldCheck, 
  CheckCircle2, Database, Activity,
  Zap, ChevronRight,
  HeartPulse, Scale,
  Dna, AlertCircle, Trash2
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

const bcsOptions = [
  { value: '1', label: '매우 마름', description: '뼈가 도드라짐', emoji: '🦴' },
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
    age: string;
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
      age: z.string().min(1, '나이를 입력해주세요'),
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
        age: '',
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
  const selectedBcs = form.watch('petProfile.bcs');
  const selectedGender = form.watch('petProfile.genderStatus');
  const selectedActivity = form.watch('petProfile.activityLevel');
  const selectedHealth = form.watch('petProfile.healthConditions');
  const selectedAllergies = form.watch('petProfile.allergies');

  const dogConditions = ['관절/슬개골', '피부/눈물', '소화기', '심장', '다이어트'];
  const catConditions = ['신장/비뇨기', '헤어볼', '구강/치아', '심장', '다이어트'];
  const allergyList = ['닭고기', '소고기', '연어', '양고기', '곡물', '달걀'];

  const handleAllergyToggle = (allergy: string) => {
    const current = [...selectedAllergies];
    if (allergy === '없음') {
      form.setValue('petProfile.allergies', []);
      return;
    }
    const idx = current.indexOf(allergy);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(allergy);
    }
    form.setValue('petProfile.allergies', current);
  };

  return (
    <div className="space-y-12 max-w-2xl mx-auto pb-48 animate-in fade-in duration-700">
      <div className="text-center space-y-4 pt-10">
        <Badge className="bg-primary/10 text-primary border-none px-4 py-2 rounded-full font-black text-[10px] tracking-widest uppercase">
          Veterinary Analysis Engine v5.2
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-foreground leading-tight">
          Pettner Scan
        </h1>
        <p className="text-muted-foreground text-lg font-medium">우리 아이의 건강을 위한 가장 정확한 선택 🐾</p>
      </div>

      <Tabs defaultValue="custom" onValueChange={(v) => form.setValue('analysisMode', v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-20 rounded-[2.5rem] bg-white shadow-xl p-2 mb-12">
          <TabsTrigger value="general" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all">
            <Database className="mr-2 h-4 w-4" /> 단순 성분 분석
          </TabsTrigger>
          <TabsTrigger value="custom" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            <Sparkles className="mr-2 h-4 w-4" /> 맞춤 정밀 리포트
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-10">
            <TabsContent value="custom" className="space-y-10 mt-0">
              {/* 1. Identity Section */}
              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Dna className="text-primary" size={28}/> 🧬 1. 아이 기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <FormField control={form.control} name="petType" render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-6">
                      <Label htmlFor="dog" className={cn("flex flex-col items-center p-8 border-4 rounded-[3.5rem] cursor-pointer transition-all active:scale-95", selectedPet === 'dog' ? "border-primary bg-primary/5 shadow-inner" : "border-muted opacity-40")}>
                        <RadioGroupItem value="dog" id="dog" className="sr-only" />
                        <Dog size={56} className={cn("mb-3 transition-colors", selectedPet === 'dog' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black text-xl">강아지</span>
                      </Label>
                      <Label htmlFor="cat" className={cn("flex flex-col items-center p-8 border-4 rounded-[3.5rem] cursor-pointer transition-all active:scale-95", selectedPet === 'cat' ? "border-primary bg-primary/5 shadow-inner" : "border-muted opacity-40")}>
                        <RadioGroupItem value="cat" id="cat" className="sr-only" />
                        <Cat size={56} className={cn("mb-3 transition-colors", selectedPet === 'cat' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black text-xl">고양이</span>
                      </Label>
                    </RadioGroup>
                  )}/>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="petProfile.name" render={({ field }) => (
                      <FormItem><FormLabel className="font-black ml-2 text-muted-foreground">이름</FormLabel><FormControl><Input placeholder="아이 이름" className="rounded-2xl h-14 bg-muted/20 border-none px-6" {...field} /></FormControl></FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.breed" render={({ field }) => (
                      <FormItem><FormLabel className="font-black ml-2 text-muted-foreground">품종</FormLabel><FormControl><Input placeholder="예: 말티즈, 코숏" className="rounded-2xl h-14 bg-muted/20 border-none px-6" {...field} /></FormControl></FormItem>
                    )}/>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="petProfile.age" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black ml-2 text-muted-foreground">나이 (살)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              step="0.1" 
                              inputMode="decimal" 
                              placeholder="예: 4.5" 
                              className="rounded-2xl h-14 bg-muted/20 border-none px-6 pr-12" 
                              {...field} 
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-muted-foreground">살</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}/>
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
                            <Scale className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-30 pointer-events-none" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}/>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Physical Stats Section */}
              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
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
                            <Label key={opt.v} htmlFor={opt.v} className={cn("p-6 rounded-[2rem] text-center font-bold cursor-pointer transition-all active:scale-95 border-4", selectedGender === opt.v ? "border-primary bg-primary/5 shadow-md" : "border-muted/30 opacity-60")}>
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
                        <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-black text-[10px]">VET RECOMMENDED</Badge>
                      </div>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-3">
                          {bcsOptions.map(opt => (
                            <Label key={opt.value} htmlFor={`bcs-${opt.value}`} className={cn("flex items-center gap-5 p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all active:scale-[0.98]", selectedBcs === opt.value ? "border-primary bg-primary/5 shadow-md" : "border-muted/30 opacity-60")}>
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
              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
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
                            <Label key={lvl.v} className={cn("flex items-center gap-5 p-7 border-4 rounded-[3rem] cursor-pointer transition-all active:scale-95", selectedActivity === lvl.v ? "border-primary bg-primary/5 shadow-md" : "border-muted/30 opacity-50")}>
                              <RadioGroupItem value={lvl.v} className="sr-only" />
                              <div className={cn("p-4 rounded-2xl", selectedActivity === lvl.v ? "bg-primary text-white" : "bg-muted")}><Zap size={24}/></div>
                              <div className="text-left">
                                <p className="font-black text-xl">{lvl.t}</p>
                                <p className="text-xs text-muted-foreground font-medium">{lvl.d}</p>
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
              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
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
                          className={cn("px-6 py-4 rounded-full font-black text-sm transition-all active:scale-90", 
                            selectedHealth.includes(c) ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-muted/50 text-muted-foreground hover:bg-muted"
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
                  <div className="space-y-5">
                    <div className="flex items-center justify-between px-2">
                      <Label className="font-black text-lg">피해야 할 성분 (알러지)</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs font-black text-destructive hover:bg-destructive/10"
                        onClick={() => handleAllergyToggle('없음')}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> 초기화
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {allergyList.map(a => (
                        <button 
                          key={a} 
                          type="button"
                          className={cn("px-6 py-4 rounded-full font-black text-sm transition-all active:scale-90", 
                            selectedAllergies.includes(a) ? "bg-destructive text-white shadow-xl shadow-destructive/20" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          )} 
                          onClick={() => handleAllergyToggle(a)}
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
               <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-14 text-center space-y-6">
                 <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4">
                    <Database className="w-12 h-12 text-primary" />
                 </div>
                 <h2 className="text-3xl font-black">심플 성분 분석 모드</h2>
                 <p className="text-muted-foreground font-medium text-lg leading-relaxed">아이 정보 없이 제품의 성분과 영양 농도만<br/>객관적으로 분석합니다.</p>
               </Card>
            </TabsContent>

            {/* Always Visible: Product Image Section */}
            <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 p-12 border-b">
                <CardTitle className="flex items-center gap-5 text-3xl font-black"><Camera className="text-primary" size={36}/> 제품 사진 촬영</CardTitle>
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
                          <Label key={t.v} className={cn("flex items-center justify-center h-16 border-4 rounded-[2rem] cursor-pointer font-black text-sm transition-all active:scale-95", field.value === t.v ? "border-primary bg-primary/5 shadow-md" : "border-muted/30 opacity-50")}>
                            <RadioGroupItem value={t.v} className="sr-only" />{t.l}
                          </Label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}/>

                <FormField control={form.control} name="image" render={({ field: { onChange } }) => (
                  <div className={cn("relative w-full aspect-[4/3] border-[6px] border-dashed rounded-[4.5rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all hover:bg-primary/5", imageFile?.length ? "border-success bg-success/5 shadow-inner" : "border-muted/30")}>
                    {imageFile?.length ? <CheckCircle2 className="h-28 w-28 text-success mb-6 animate-in zoom-in" /> : <Camera className="h-28 w-28 text-primary mb-6 opacity-20" />}
                    <p className="text-3xl font-black">{imageFile?.length ? "촬영 완료!" : "성분표 촬영하기"}</p>
                    <p className="text-base text-muted-foreground mt-4 font-medium px-14 leading-relaxed">뒷면의 원재료명과 등록성분량이<br/>잘 보이도록 밝은 곳에서 찍어주세요.</p>
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

            <div className="flex items-center justify-center gap-2 text-muted-foreground/40 pb-10">
               <AlertCircle size={14} />
               <p className="text-[10px] font-bold uppercase tracking-widest">Safe & Secured Analysis by Pettner AI</p>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
