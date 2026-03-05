
'use client';

import { useMemo, useState } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, 
  Scale, Stethoscope, ChevronDown, Pill, 
  ShoppingBag, Cookie, HeartPulse, Info
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
  productCategory: 'food' | 'treat' | 'supplement';
  detailedProductType: string;
  image?: FileList;
  prescriptionImage?: FileList;
  petProfile: {
    name: string;
    gender: 'male' | 'female' | 'unknown';
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
    productCategory: z.enum(['food', 'treat', 'supplement']),
    detailedProductType: z.string(),
    image: z.any().optional(),
    prescriptionImage: z.any().optional(),
    petProfile: z.object({
      name: z.string().optional(),
      gender: z.enum(['male', 'female', 'unknown']).optional(),
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
      productCategory: 'food',
      detailedProductType: '건식 사료',
      petProfile: {
        name: '',
        gender: 'unknown',
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
  const selectedCategory = form.watch('productCategory');
  const imageFile = form.watch('image');
  const prescriptionFile = form.watch('prescriptionImage');

  const categoryOptions = {
    food: ['건식 사료', '습식 사료(캔/파우치)', '화식/생식', '동결건조 사료', '소프트 사료'],
    treat: ['껌/치과용 간식', '져키/트릿', '츄르/퓨레', '동결건조 간식', '비스킷/쿠키'],
    supplement: ['관절 영양제', '피부/모질 영양제', '눈/눈물 영양제', '유산균', '심장/신장 영양제', '종합 비타민']
  };

  const selectSavedPet = (pet: any) => {
    form.reset({
      ...form.getValues(),
      petType: pet.petType,
      petProfile: {
        name: pet.name,
        gender: pet.gender || 'unknown',
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
          Veterinary Precision v19.2
        </Badge>
        <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter text-foreground leading-tight">
          Pettner Scan
        </h1>
        <p className="text-muted-foreground font-medium text-lg">제품 분류 및 처방전 OCR 정밀 분석 🐾</p>
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          
          <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-10 border-b">
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <ShoppingBag className="text-primary" size={28}/> 1. 분석할 제품 분류
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <FormField control={form.control} name="productCategory" render={({ field }) => (
                <RadioGroup onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue('detailedProductType', categoryOptions[val as keyof typeof categoryOptions][0]);
                }} value={field.value} className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'food', label: '사료', icon: ShoppingBag },
                    { id: 'treat', label: '간식', icon: Cookie },
                    { id: 'supplement', label: '영양제', icon: HeartPulse },
                  ].map((cat) => (
                    <Label key={cat.id} htmlFor={cat.id} className={cn(
                      "flex flex-col items-center p-4 border-2 rounded-3xl cursor-pointer transition-all gap-2",
                      field.value === cat.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-muted opacity-60"
                    )}>
                      <RadioGroupItem value={cat.id} id={cat.id} className="sr-only" />
                      <cat.icon size={28} className={field.value === cat.id ? "text-primary" : ""} />
                      <span className="font-black text-xs">{cat.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              )}/>

              <div className="space-y-4">
                <Label className="font-bold text-sm ml-2">세부 유형 선택</Label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions[selectedCategory].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => form.setValue('detailedProductType', opt)}
                      className={cn(
                        "px-4 py-2 rounded-full font-bold text-xs border-2 transition-all",
                        form.watch('detailedProductType') === opt ? "bg-primary text-white border-primary" : "bg-white border-muted text-muted-foreground"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <FormField control={form.control} name="productName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold ml-2">제품명 (옵션)</FormLabel>
                  <FormControl>
                    <Input placeholder="제품명을 적으면 더 정확한 분석이 가능합니다." className="rounded-2xl h-12 bg-muted/10 border-none px-4" {...field} />
                  </FormControl>
                </FormItem>
              )}/>
            </CardContent>
          </Card>

          <Tabs defaultValue="custom" onValueChange={(v) => form.setValue('analysisMode', v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-20 rounded-[2.5rem] bg-white shadow-xl p-2 mb-10">
              <TabsTrigger value="general" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-muted">
                제품 성분만 분석
              </TabsTrigger>
              <TabsTrigger value="custom" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                우리 아이 맞춤 분석
              </TabsTrigger>
            </TabsList>

            <TabsContent value="custom" className="space-y-10 mt-0">
              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Scale className="text-primary" size={28}/> 2. 신체 및 활동 정보</CardTitle>
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
                </CardContent>
              </Card>

              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Stethoscope className="text-primary" size={28}/> 3. 정밀 메디컬 데이터</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="space-y-4">
                    <Label className="font-black text-lg ml-2 flex items-center gap-2">복용 약물 및 영양제 (OCR 지원)</Label>
                    <FormField control={form.control} name="prescriptionImage" render={({ field: { onChange } }) => (
                      <div className={cn("relative w-full aspect-video border-4 border-dashed rounded-[2rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all", prescriptionFile?.length ? "border-primary bg-primary/5" : "border-muted/30")}>
                        <Pill className="h-12 w-12 text-primary mb-2 opacity-40" />
                        <p className="text-sm font-black">{prescriptionFile?.length ? "사진 인식 준비 완료" : "처방전 사진 촬영 (선택)"}</p>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange(e.target.files)} />
                      </div>
                    )}/>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary p-12 text-white">
              <CardTitle className="flex items-center gap-5 text-3xl font-black"><Camera size={36}/> 분석할 제품 라벨 촬영</CardTitle>
            </CardHeader>
            <CardContent className="p-12 space-y-8">
              <FormField control={form.control} name="image" render={({ field: { onChange } }) => (
                <div className={cn("relative w-full aspect-[4/3] border-[6px] border-dashed rounded-[4.5rem] flex flex-col justify-center items-center text-center cursor-pointer transition-all", imageFile?.length ? "border-success bg-success/5" : "border-muted/30")}>
                  <Camera className="h-24 w-24 text-primary mb-6 opacity-20" />
                  <p className="text-2xl font-black">{imageFile?.length ? "라벨 사진 준비 완료" : "성분표 촬영하기"}</p>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange(e.target.files)} />
                </div>
              )}/>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" disabled={!imageFile?.length} className="w-full h-28 text-3xl font-black rounded-[3.5rem] shadow-2xl bg-primary hover:scale-[1.02] transition-all">
            <Sparkles className="mr-4 h-10 w-10" /> 분석 리포트 생성
          </Button>
        </form>
      </Form>
    </div>
  );
}
