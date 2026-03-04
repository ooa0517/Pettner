
'use client';

import { useMemo, useState, useEffect } from 'react';
import { 
  Camera, Sparkles, Dog, Cat, ShieldCheck, 
  CheckCircle2, Database, Activity,
  HeartPulse, Scale,
  Dna, AlertCircle, Info, Stethoscope, Footprints, Droplets, UtensilsCrossed, Pill,
  ChevronDown
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
  petProfile: {
    name: string;
    breed: string;
    age: string;
    weight: string;
    neutered: boolean;
    bcs: string;
    healthConditions: string[];
    allergies: string[];
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
    petProfile: z.object({
      name: z.string().optional(),
      breed: z.string().optional(),
      age: z.string().optional(),
      weight: z.string().optional(),
      neutered: z.boolean().optional(),
      bcs: z.string().optional(),
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
        weight: '',
        neutered: true,
        bcs: '3',
        healthConditions: [],
        allergies: [],
      }
    },
  });

  const selectedPet = form.watch('petType');
  const imageFile = form.watch('image');
  const selectedHealth = form.watch('petProfile.healthConditions') || [];

  const dogConditions = ['슬개골 탈구', '관절염', '피부 알러지', '눈물 자국', '심장 질환', '소화 불량', '췌장염', '신장 질환'];
  const catConditions = ['방광염/요로결석', '헤어볼', '신장 질환', '구강 건강', '심부전', '피부 건강', '당뇨'];

  const selectSavedPet = (pet: any) => {
    form.reset({
      ...form.getValues(),
      petType: pet.petType,
      petProfile: {
        name: pet.name,
        breed: pet.breed,
        age: pet.age.toString(),
        weight: pet.weight.toString(),
        neutered: pet.neutered === 'yes',
        bcs: pet.bcs || '3',
        healthConditions: pet.healthConditions || [],
        allergies: pet.allergies || [],
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
          Veterinary Precision v15.0
        </Badge>
        <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter text-foreground leading-tight">
          Pettner Scan
        </h1>
        <p className="text-muted-foreground font-medium text-lg">우리 아이를 위한 병원급 정밀 영양 매칭 🐾</p>
      </div>

      {user && pets && pets.length > 0 && (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 border-2 border-primary text-primary font-black bg-white shadow-lg hover:bg-primary/5">
                저장된 반려동물 선택 <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 rounded-3xl p-2">
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
          <TabsTrigger value="general" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all">
            제품 성분만 분석
          </TabsTrigger>
          <TabsTrigger value="custom" className="rounded-[2rem] text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            우리 아이 맞춤 분석
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <TabsContent value="custom" className="space-y-10 mt-0">
              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Scale className="text-primary" size={28}/> 1. 신체 정보</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <FormField control={form.control} name="petType" render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4">
                      <Label htmlFor="dog" className={cn("flex flex-col items-center p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all active:scale-95", field.value === 'dog' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
                        <RadioGroupItem value="dog" id="dog" className="sr-only" />
                        <Dog size={48} className={cn("mb-2", field.value === 'dog' ? "text-primary" : "text-muted-foreground")} />
                        <span className="font-black">강아지</span>
                      </Label>
                      <Label htmlFor="cat" className={cn("flex flex-col items-center p-6 border-4 rounded-[2.5rem] cursor-pointer transition-all active:scale-95", field.value === 'cat' ? "border-primary bg-primary/5" : "border-muted opacity-40")}>
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
                </CardContent>
              </Card>

              <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
                <CardHeader className="bg-muted/30 p-10 border-b">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black"><Stethoscope className="text-primary" size={28}/> 2. 건강 체크</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
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
