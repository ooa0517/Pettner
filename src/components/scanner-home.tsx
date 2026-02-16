'use client';

import { useMemo } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, ShieldCheck, 
  CheckCircle2, Database, Activity,
  Zap,
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
import { Checkbox } from '@/components/ui/checkbox';

const bcsOptions = [
  { value: '1', label: '1. 매우 마름', emoji: '😰', color: 'bg-[#E3F2FD]', activeBorder: 'border-blue-400' },
  { value: '2', label: '2. 마름', emoji: '😟', color: 'bg-[#E0F7FA]', activeBorder: 'border-cyan-400' },
  { value: '3', label: '3. 이상적', emoji: '😊', color: 'bg-[#E8F5E9]', activeBorder: 'border-green-400' },
  { value: '4', label: '4. 통통', emoji: '🙂', color: 'bg-[#FFFDE7]', activeBorder: 'border-yellow-400' },
  { value: '5', label: '5. 비만', emoji: '😖', color: 'bg-[#FBE9E7]', activeBorder: 'border-orange-400' },
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
      name: z.string().optional(),
      breed: z.string().optional(),
      age: z.string().optional(),
      genderStatus: z.string().optional(),
      weight: z.string().optional(),
      bcs: z.string().optional(),
      activityLevel: z.string().optional(),
      healthConditions: z.array(z.string()).optional(),
      allergies: z.array(z.string()).optional(),
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

  const selectedMode = form.watch('analysisMode');
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

  const onSubmit = (data: AnalysisFormValues) => {
    // Custom mode validation
    if (data.analysisMode === 'custom') {
      if (!data.petProfile.name || !data.petProfile.breed || !data.petProfile.age || !data.petProfile.weight) {
        alert('반려동물 정보를 모두 입력해주세요.');
        return;
      }
    }
    onAnalyze(data);
  };

  return (
    <div className="space-y-12 max-w-2xl mx-auto pb-48 animate-in fade-in duration-700">
      <div className="text-center space-y-4 pt-10">
        <Badge className="bg-primary/10 text-primary border-none px-4 py-2 rounded-full font-black text-[10px] tracking-widest uppercase">
          Certified Pet Food Audit v9.0
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <TabsContent value="custom" className="space-y-10 mt-0">
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
                            <Input type="number" step="0.1" placeholder="예: 4.5" className="rounded-2xl h-14 bg-muted/20 border-none px-6 pr-12" {...field} />
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
                            <Input type="number" step="0.1" placeholder="0.0" className="rounded-2xl h-14 bg-muted/20 border-none px-6 pr-12" {...field} />
                            <Scale className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-30" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}/>
                  </div>
                </CardContent>
              </Card>

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
                            <Label key={opt.v} htmlFor={opt.v} className={cn("p-6 rounded-[2rem] text-center font-bold cursor-pointer transition-all border-4", selectedGender === opt.v ? "border-primary bg-primary/5" : "border-muted/30 opacity-60")}>
                              <RadioGroupItem value={opt.v} id={opt.v} className="sr-only"/>{opt.l}
                            </Label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}/>

                  <FormField control={form.control} name="petProfile.bcs" render={({ field }) => (
                    <FormItem className="space-y-6">
                      <FormLabel className="font-black text-muted-foreground ml-2">아이의 체형 (BCS)</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {bcsOptions.map(opt => (
                            <Label 
                              key={opt.value} 
                              htmlFor={`bcs-${opt.value}`} 
                              className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-[2rem] cursor-pointer transition-all border-4 text-center",
                                selectedBcs === opt.value ? cn("scale-105 shadow-xl", opt.activeBorder) : "border-transparent opacity-60",
                                opt.color
                              )}
                            >
                              <RadioGroupItem value={opt.value} id={`bcs-${opt.value}`} className="sr-only" />
                              <span className="text-4xl mb-2">{opt.emoji}</span>
                              <p className="font-black text-[10px] whitespace-nowrap">{opt.label}</p>
                            </Label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}/>
                </CardContent>
              </Card>

              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><ShieldCheck className="text-primary" size={28}/> 🛡️ 3. 건강 & 알러지</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-12">
                  <div className="space-y-5">
                    <Label className="font-black text-lg ml-2">건강 고민 (중복 선택)</Label>
                    <div className="flex flex-wrap gap-3">
                      {(selectedPet === 'dog' ? dogConditions : catConditions).map(c => (
                        <button 
                          key={c} 
                          type="button"
                          className={cn("px-6 py-4 rounded-full font-black text-sm transition-all", 
                            selectedHealth.includes(c) ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-muted/50 text-muted-foreground"
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general" className="mt-0">
               <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-14 text-center space-y-6">
                 <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4">
                    <Database className="w-12 h-12 text-primary" />
                 </div>
                 <h2 className="text-3xl font-black">심플 성분 분석 모드 (감사 보고서)</h2>
                 <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                   제품 자체의 원료 품질, 브랜드 평판, ESG 가치를<br/>객관적으로 분석하여 리포트를 발행합니다.
                 </p>
               </Card>
            </TabsContent>

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
                        {['dry', 'wet', 'treat', 'supplement'].map(t => (
                          <Label key={t} className={cn("flex items-center justify-center h-16 border-4 rounded-[2rem] cursor-pointer font-black text-sm transition-all", field.value === t ? "border-primary bg-primary/5" : "border-muted/30 opacity-50")}>
                            <RadioGroupItem value={t} className="sr-only" />{t === 'dry' ? '🍚 건식' : t === 'wet' ? '🍲 습식' : t === 'treat' ? '🍖 간식' : '💊 영양제'}
                          </Label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}/>

                <FormField control={form.control} name="image" render={({ field: { onChange } }) => (
                  <div className={cn("relative w-full aspect-[4/3] border-[6px] border-dashed rounded-[4.5rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all", imageFile?.length ? "border-success bg-success/5 shadow-inner" : "border-muted/30")}>
                    {imageFile?.length ? <CheckCircle2 className="h-28 w-28 text-success mb-6" /> : <Camera className="h-28 w-28 text-primary mb-6 opacity-20" />}
                    <p className="text-3xl font-black">{imageFile?.length ? "촬영 완료!" : "성분표 촬영하기"}</p>
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
              <Sparkles className="mr-4 h-10 w-10" /> 분석 시작하기
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
