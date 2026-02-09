
'use client';

import { useMemo } from 'react';
import { Camera, Sparkles, HeartPulse, FileText, Package, Building, Pilcrow, Dog, Cat, Upload, ChevronDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/contexts/language-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type AnalysisFormValues = {
  petType: 'dog' | 'cat';
  productName: string;
  brandName: string;
  foodType: string;
  lifeStage: 'PUPPY' | 'ADULT' | 'SENIOR' | 'GERIATRIC' | 'ALL_STAGES';
  ingredientsText: string;
  healthConditions: string;
  image?: FileList;
};

type ScannerHomeProps = {
  onAnalyze: (data: AnalysisFormValues) => void;
};

export default function ScannerHome({ onAnalyze }: ScannerHomeProps) {
  const { t } = useLanguage();
  
  const formSchema = useMemo(() => {
    const imageSchema = typeof window !== 'undefined' 
      ? z.instanceof(FileList).optional() 
      : z.any().optional();

    return z.object({
      petType: z.enum(['dog', 'cat'], { required_error: t('scannerHome.petTypeRequired') }),
      productName: z.string().min(1, { message: t('scannerHome.productNameRequired') }),
      brandName: z.string().optional(),
      foodType: z.string().optional(),
      lifeStage: z.enum(['PUPPY' , 'ADULT' , 'SENIOR' , 'GERIATRIC' , 'ALL_STAGES'], { required_error: t('scannerHome.lifeStageRequired') }),
      ingredientsText: z.string().optional(),
      healthConditions: z.string().optional(),
      image: imageSchema,
    }).refine(data => data.ingredientsText || (data.image && data.image.length > 0), {
      message: t('scannerHome.inputRequired'),
      path: ['image'], 
    });
  }, [t]);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petType: 'dog',
      productName: '',
      brandName: '',
      foodType: 'dry',
      lifeStage: 'ADULT',
      ingredientsText: '',
      healthConditions: '',
    },
  });

  const selectedPet = form.watch('petType');
  const imageFile = form.watch('image');

  const onSubmit = (data: AnalysisFormValues) => {
    onAnalyze(data);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-bold">Beta Service</AlertTitle>
        <AlertDescription className="text-muted-foreground text-sm" dangerouslySetInnerHTML={{ __html: t('scannerHome.betaNotice')}} />
      </Alert>

      <Card className="shadow-2xl shadow-primary/10 animate-in fade-in-50 duration-700 border-primary/20 overflow-hidden">
        <CardHeader className="p-8 md:p-10 text-center bg-muted/30 border-b">
          <h1 className="text-3xl font-extrabold font-headline tracking-tight">{t('scannerHome.title')}</h1>
          <CardDescription className="text-muted-foreground pt-2 text-base" dangerouslySetInnerHTML={{ __html: t('scannerHome.descriptionV2')}} />
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              <FormField
                control={form.control}
                name="petType"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-lg font-bold flex items-center gap-2">
                       <span className="w-1.5 h-6 bg-primary rounded-full" />
                       {t('scannerHome.petTypeLabel')}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem value="dog" id="dog" className="sr-only" />
                          <Label
                            htmlFor="dog"
                            className={cn(
                              "flex flex-col items-center justify-center rounded-2xl border-2 p-6 cursor-pointer transition-all hover:bg-primary/5",
                              selectedPet === 'dog' ? "border-primary bg-primary/10 shadow-lg" : "border-muted bg-popover"
                            )}
                          >
                            <Dog className={cn("mb-3 h-10 w-10 transition-colors", selectedPet === 'dog' ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("font-bold text-lg", selectedPet === 'dog' ? "text-primary" : "text-muted-foreground")}>
                                {t('scannerHome.petTypes.dog')}
                            </span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="cat" id="cat" className="sr-only" />
                          <Label
                            htmlFor="cat"
                            className={cn(
                              "flex flex-col items-center justify-center rounded-2xl border-2 p-6 cursor-pointer transition-all hover:bg-primary/5",
                              selectedPet === 'cat' ? "border-primary bg-primary/10 shadow-lg" : "border-muted bg-popover"
                            )}
                          >
                            <Cat className={cn("mb-3 h-10 w-10 transition-colors", selectedPet === 'cat' ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("font-bold text-lg", selectedPet === 'cat' ? "text-primary" : "text-muted-foreground")}>
                                {t('scannerHome.petTypes.cat')}
                            </span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel className="text-lg font-bold flex items-center gap-2">
                   <span className="w-1.5 h-6 bg-primary rounded-full" />
                   {t('scannerHome.imageLabel')}
                </FormLabel>
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                            <FormControl>
                              <div className="relative w-full h-48 border-2 border-dashed rounded-2xl flex flex-col justify-center items-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all bg-muted/20 group">
                                  <div className="p-4 bg-white rounded-full shadow-md group-hover:scale-110 transition-transform">
                                    <Camera className="h-8 w-8 text-primary" />
                                  </div>
                                  <div className="mt-4 px-4">
                                      {imageFile && imageFile.length > 0 ? (
                                          <p className="font-bold text-primary truncate max-w-xs">{imageFile[0].name}</p>
                                      ) : (
                                          <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('scannerHome.imagePrompt') }} />
                                      )}
                                  </div>
                                  <Input 
                                      type="file" 
                                      accept="image/*" 
                                      capture="environment"
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      onChange={(e) => onChange(e.target.files)}
                                      {...rest}
                                  />
                              </div>
                            </FormControl>
                            <FormDescription className="text-center mt-2">{t('scannerHome.imageDescription')}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2"><Package className="w-4 h-4 text-primary"/>{t('scannerHome.productNameLabel')}</FormLabel>
                      <FormControl>
                        <Input className="rounded-xl" placeholder={t('scannerHome.productNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2"><Building className="w-4 h-4 text-primary"/>{t('scannerHome.brandNameLabel')}</FormLabel>
                      <FormControl>
                        <Input className="rounded-xl" placeholder={t('scannerHome.brandNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="foodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2"><Pilcrow className="w-4 h-4 text-primary"/>{t('scannerHome.foodTypeLabel')}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder={t('scannerHome.foodTypePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dry">{t('scannerHome.foodTypes.dry')}</SelectItem>
                            <SelectItem value="wet">{t('scannerHome.foodTypes.wet')}</SelectItem>
                            <SelectItem value="cooked">{t('scannerHome.foodTypes.cooked')}</SelectItem>
                            <SelectItem value="treat">{t('scannerHome.foodTypes.treat')}</SelectItem>
                            <SelectItem value="supplement">{t('scannerHome.foodTypes.supplement')}</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lifeStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2"><HeartPulse className="w-4 h-4 text-primary"/>{t('scannerHome.lifeStageLabel')}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder={t('scannerHome.lifeStagePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PUPPY">{t('scannerHome.lifeStages.puppy')}</SelectItem>
                            <SelectItem value="ADULT">{t('scannerHome.lifeStages.adult')}</SelectItem>
                            <SelectItem value="SENIOR">{t('scannerHome.lifeStages.senior')}</SelectItem>
                            <SelectItem value="GERIATRIC">{t('scannerHome.lifeStages.geriatric')}</SelectItem>
                             <SelectItem value="ALL_STAGES">{t('scannerHome.lifeStages.all')}</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                  control={form.control}
                  name="healthConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2"><HeartPulse className="w-4 h-4 text-primary"/>{t('scannerHome.healthConditionsLabel')}</FormLabel>
                      <FormControl>
                         <Textarea className="rounded-xl" placeholder={t('scannerHome.healthConditionsPlaceholder')} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

              <div className="pt-6">
                <Button type="submit" size="lg" className="w-full text-xl py-8 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.02]">
                  <Sparkles className="mr-3 h-6 w-6" />
                  {t('scannerHome.analyzeButton')}
                </Button>
              </div>

              <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                      {t('scannerHome.ingredientsLabel')} (텍스트 입력)
                      </span>
                  </div>
              </div>

              <FormField
                  control={form.control}
                  name="ingredientsText"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea className="rounded-xl" placeholder={t('scannerHome.ingredientsPlaceholder')} {...field} rows={3}/>
                      </FormControl>
                       <FormDescription className="text-xs">{t('scannerHome.ingredientsDescription')}</FormDescription>
                    </FormItem>
                  )}
                />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
