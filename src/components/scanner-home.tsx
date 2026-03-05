
'use client';

import { useMemo } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, 
  Scale, Stethoscope, ChevronDown, Pill
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AnalysisFormValues = {
  petType: 'dog' | 'cat';
  analysisMode: 'general' | 'custom';
  productName: string;
  foodType: 'dry' | 'wet' | 'treat' | 'supplement';
  image?: FileList;
  prescriptionImage?: FileList;
  petProfile: {
    name: string;
    breed: string;
    age: string;
    weight: string;
    neutered: 'yes' | 'no' | 'unknown';
    bcs: string;
    activityLevel: string;
    walkingTime: string;
    livingEnvironment: string;
    healthConditions: string[];
    allergies: string[];
    waterIntake: string;
    stoolCondition: string;
    medications: string;
  };
};

export default function ScannerHome({ onAnalyze }: { onAnalyze: (data: any) => void }) {
  const { t } = useLanguage();
  const { user } = useUser();
  const db = useFirestore();
  
  const petsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'pets');
  }, [db, user]);

  const { data: pets } = useCollection(petsQuery);

  const formSchema = useMemo(() => z.object({
    petType: z.enum(['dog', 'cat']),
    analysisMode: z.enum(['general', 'custom']),
    productName: z.string().optional(),
    foodType: z.enum(['dry', 'wet', 'treat', 'supplement']),
    image: z.any().optional(),
    prescriptionImage: z.any().optional(),
    petProfile: z.object({
      name: z.string().optional(),
      breed: z.string().optional(),
      age: z.string().optional(),
      weight: z.string().optional(),
      neutered: z.enum(['yes', 'no', 'unknown']).optional(),
      bcs: z.string().optional(),
      activityLevel: z.string().optional(),
      walkingTime: z.string().optional(),
      livingEnvironment: z.string().optional(),
      healthConditions: z.array(z.string()).optional(),
      allergies: z.array(z.string()).optional(),
      waterIntake: z.string().optional(),
      stoolCondition: z.string().optional(),
      medications: z.string().optional(),
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
        breed: '믹스/기타',
        age: '0',
        weight: '0',
        neutered: 'unknown',
        bcs: '3',
        activityLevel: 'UNKNOWN',
        walkingTime: 'UNKNOWN',
        livingEnvironment: 'UNKNOWN',
        healthConditions: [],
        allergies: [],
        waterIntake: 'UNKNOWN',
        stoolCondition: 'UNKNOWN',
        medications: '',
      }
    },
  });

  const selectedPet = form.watch('petType');
  const imageFile = form.watch('image');
  const prescriptionFile = form.watch('prescriptionImage');
  const selectedHealth = form.watch('petProfile.healthConditions') || [];
  const selectedAllergies = form.watch('petProfile.allergies') || [];

  const dogConditions = ['슬개골 탈구', '관절염', '피부 알러지', '눈물 자국', '심장 질환', '소화 불량', '췌장염', '신장 질환', '기타(메모 입력)'];
  const catConditions = ['방광염/요로결석', '헤어볼', '신장 질환', '구강 건강', '심부전', '피부 건강', '당뇨', '기타(메모 입력)'];
  const allergyList = ['닭고기', '소고기', '돼지고기', '연어', '곡물(그레인)', '계란', '유제품', '없음/모름'];

  const selectSavedPet = (pet: any) => {
    form.reset({
      ...form.getValues(),
      petType: pet.petType,
      petProfile: {
        name: pet.name,
        breed: pet.breed || '믹스/기타',
        age: pet.age?.toString() || '0',
        weight: pet.weight?.toString() || '0',
        neutered: pet.neutered || 'unknown',
        bcs: pet.bcs || '3',
        activityLevel: pet.activityLevel || 'UNKNOWN',
        walkingTime: pet.walkingTime || 'UNKNOWN',
        livingEnvironment: pet.livingEnvironment || 'UNKNOWN',
        healthConditions: pet.healthConditions || [],
        allergies: pet.allergies || [],
        waterIntake: pet.waterIntake || 'UNKNOWN',
        stoolCondition: pet.stoolCondition || 'UNKNOWN',
        medications: pet.medications || '',
      }
    });
  };

  const onSubmit = (data: AnalysisFormValues) => {
    onAnalyze(data);
  };

  return (
    <div className="space-y-12 max-w-2xl mx-auto pb-48 animate-in fade-in duration-700 px-4">
      <div className="text-center space-y-4 pt-10">
        <Badge className="bg-primary/10 text-primary border-none px-4 py-2 rounded-full font-black text-[10px] tracking-widest uppercase">
          Veterinary Precision v19.0
        </Badge>
        <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter text-foreground leading-tight">
          Pettner Scan
        </h1>
        <p className="text-muted-foreground font-medium text-lg">처방전 OCR 및 맞춤 영양 분석 🐾</p>
      </div>

      {user && pets && pets.length > 0 && (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 border-2 border-primary text-primary font-black bg-white shadow-lg hover:bg-primary/5">
                저장된 반려동물 선택 <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64 rounded-3xl p-2">
              <DropdownMenuLabel className="font-black">아이를 선택하세요</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {pets.map(pet => (
                <DropdownMenuItem key={pet.id} onClick={() => selectSavedPet(pet)} className="rounded-2xl cursor-pointer p-3 font-bold">
                  {pet.petType === 'cat' ? <Cat className="mr-2 h-4 w-4 text-primary"/> : <Dog className="mr-2 h-4 w-4 text-primary"/>}
                  {pet.name} ({pet.breed})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <Tabs defaultValue="custom" onValueChange={(v) => form.setValue('analysisMode', v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-20 rounded-[2.5rem] bg-white shadow-xl p-2 mb-12">
          <TabsTrigger value="general" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-muted">
            제품 성분만 분석
          </TabsTrigger>
          <TabsTrigger value="custom" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
            우리 아이 맞춤 분석
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <TabsContent value="custom" className="space-y-10 mt-0">
              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Scale className="text-primary" size={28}/> 1. 신체 및 활동 정보</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <FormField control={form.control} name="petType" render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4">
                      <Label htmlFor="dog" className={cn("flex flex-col items-center p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all", field.value === 'dog' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                        <RadioGroupItem value="dog" id="dog" className="sr-only" />
                        <Dog size={48} className={cn("mb-2", field.value === 'dog' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black">강아지</span>
                      </Label>
                      <Label htmlFor="cat" className={cn("flex flex-col items-center p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all", field.value === 'cat' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                        <RadioGroupItem value="cat" id="cat" className="sr-only" />
                        <Cat size={48} className={cn("mb-2", field.value === 'cat' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black">고양이</span>
                      </Label>
                    </RadioGroup>
                  )}/>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="petProfile.name" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2">이름</FormLabel><FormControl><Input placeholder="아이 이름" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.breed" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2">품종</FormLabel><FormControl><Input placeholder="예: 말티푸" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="petProfile.age" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2 text-xs">나이 (살)</FormLabel><FormControl><Input type="number" step="0.1" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                    <FormField control={form.control} name="petProfile.weight" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold ml-2 text-xs">체중 (kg)</FormLabel><FormControl><Input type="number" step="0.1" className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} /></FormControl></FormItem>
                    )}/>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Stethoscope className="text-primary" size={28}/> 2. 건강 및 라이프스타일</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="space-y-4">
                    <Label className="font-black text-lg ml-2 flex items-center gap-2">직접 입력: 복용 약물 및 영양제</Label>
                    <FormField control={form.control} name="petProfile.medications" render={({ field }) => (
                       <FormControl><Input placeholder="직접 아는 성분만 적으셔도 됩니다." className="h-14 rounded-2xl bg-muted/10 border-none px-6 font-bold" {...field} /></FormControl>
                    )}/>
                  </div>

                  {/* 처방전 사진 업로드 섹션 */}
                  <div className="space-y-4">
                    <Label className="font-black text-lg ml-2 flex items-center gap-2">AI 자동 인식: 처방전 또는 약 봉투 사진</Label>
                    <FormField control={form.control} name="prescriptionImage" render={({ field: { onChange } }) => (
                      <div className={cn("relative w-full aspect-video border-4 border-dashed rounded-[2rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all", prescriptionFile?.length ? "border-primary bg-primary/5" : "border-muted/30")}>
                        <Pill className="h-12 w-12 text-primary mb-2 opacity-40" />
                        <p className="text-sm font-black">{prescriptionFile?.length ? "사진 인식 준비 완료" : "처방전 사진 추가 (선택)"}</p>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange(e.target.files)} />
                      </div>
                    )}/>
                    <p className="text-[10px] text-muted-foreground ml-2">약 이름을 모른다면 사진을 찍어주세요. AI가 자동으로 성분을 분석합니다.</p>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-black text-lg ml-2 flex items-center gap-2">알러지 성분</Label>
                    <div className="flex flex-wrap gap-2">
                      {allergyList.map(a => (
                        <button 
                          key={a} 
                          type="button"
                          className={cn("px-4 py-2 rounded-full font-bold text-xs transition-all border-2", 
                            selectedAllergies.includes(a) ? "bg-destructive text-white border-destructive" : "bg-muted/30 border-transparent text-muted-foreground"
                          )} 
                          onClick={() => {
                            const cur = [...selectedAllergies];
                            if (a === '없음/모름') {
                                form.setValue('petProfile.allergies', ['없음/모름']);
                                return;
                            }
                            const filtered = cur.filter(x => x !== '없음/모름');
                            form.setValue('petProfile.allergies', filtered.includes(a) ? filtered.filter(x => x !== a) : [...filtered, a]);
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
               <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-14 text-center space-y-6">
                 <h2 className="text-3xl font-black">제품 감사관 모드</h2>
                 <p className="text-muted-foreground font-medium text-lg">제품 자체의 원료 품질과 브랜드 신뢰도를 심사합니다.</p>
               </Card>
            </TabsContent>

            <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 p-12 border-b">
                <CardTitle className="flex items-center gap-5 text-3xl font-black"><Camera className="text-primary" size={36}/> 분석할 제품 사진 (필수)</CardTitle>
              </CardHeader>
              <CardContent className="p-12 space-y-8">
                <FormField control={form.control} name="image" render={({ field: { onChange } }) => (
                  <div className={cn("relative w-full aspect-[4/3] border-[6px] border-dashed rounded-[4.5rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all", imageFile?.length ? "border-success bg-success/5" : "border-muted/30")}>
                    <Camera className="h-24 w-24 text-primary mb-6 opacity-20" />
                    <p className="text-2xl font-black">{imageFile?.length ? "사진이 준비되었습니다" : "성분표 촬영하기"}</p>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange(e.target.files)} />
                  </div>
                )}/>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" disabled={!imageFile?.length} className="w-full h-28 text-3xl font-black rounded-[3.5rem] shadow-2xl bg-primary hover:scale-[1.02] transition-all">
              <Sparkles className="mr-4 h-10 w-10" /> 분석 시작하기
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
