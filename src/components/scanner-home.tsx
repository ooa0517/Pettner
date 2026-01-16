'use client';

import { useMemo } from 'react';
import { Camera, Sparkles, HeartPulse, FileText, Package, Building, Pilcrow, Dog, Cat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

type AnalysisFormValues = {
  petType: 'dog' | 'cat';
  productName: string;
  brandName: string;
  foodType: string;
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
    // Dynamically create the schema for the image field.
    // On the server, use `z.any()` to avoid referencing browser-only APIs like `FileList`.
    // On the client, use `z.instanceof(FileList)` for proper validation.
    const imageSchema = typeof window !== 'undefined' 
      ? z.instanceof(FileList).optional() 
      : z.any().optional();

    return z.object({
      petType: z.enum(['dog', 'cat'], { required_error: t('scannerHome.petTypeRequired') }),
      productName: z.string().min(1, { message: t('scannerHome.productNameRequired') }),
      brandName: z.string().optional(),
      foodType: z.string().optional(),
      ingredientsText: z.string().optional(),
      healthConditions: z.string().optional(),
      image: imageSchema,
    }).refine(data => data.ingredientsText || (data.image && data.image.length > 0), {
      message: t('scannerHome.inputRequired'),
      path: ['ingredientsText'], 
    });
  }, [t]);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petType: 'dog',
      productName: '',
      brandName: '',
      foodType: 'dry',
      ingredientsText: '',
      healthConditions: '',
    },
  });

  const onSubmit = (data: AnalysisFormValues) => {
    onAnalyze(data);
  };

  return (
    <Card className="max-w-2xl mx-auto text-center shadow-2xl shadow-primary/10 animate-in fade-in-50 duration-700 border-primary/20">
      <CardHeader className="p-8 md:p-12">
        <CardTitle className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight">{t('scannerHome.title')}</CardTitle>
        <CardDescription className="text-muted-foreground pt-3 text-base" dangerouslySetInnerHTML={{ __html: t('scannerHome.descriptionV2')}} />
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-left">

            <FormField
              control={form.control}
              name="petType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="font-semibold">{t('scannerHome.petTypeLabel')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="dog" id="dog" className="sr-only" />
                        </FormControl>
                        <Label htmlFor="dog" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                          <Dog className="mb-3 h-6 w-6" />
                          {t('scannerHome.petTypes.dog')}
                        </Label>
                      </FormItem>
                      <FormItem>
                         <FormControl>
                          <RadioGroupItem value="cat" id="cat" className="sr-only" />
                        </FormControl>
                        <Label htmlFor="cat" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                           <Cat className="mb-3 h-6 w-6" />
                          {t('scannerHome.petTypes.cat')}
                        </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Package/>{t('scannerHome.productNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('scannerHome.productNamePlaceholder')} {...field} />
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
                    <FormLabel className="flex items-center gap-2"><Building/>{t('scannerHome.brandNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('scannerHome.brandNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="foodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Pilcrow/>{t('scannerHome.foodTypeLabel')}</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                name="ingredientsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><FileText/>{t('scannerHome.ingredientsLabel')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('scannerHome.ingredientsPlaceholder')} {...field} rows={6}/>
                    </FormControl>
                     <FormDescription>{t('scannerHome.ingredientsDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
                control={form.control}
                name="healthConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><HeartPulse/>{t('scannerHome.healthConditionsLabel')}</FormLabel>
                    <FormControl>
                       <Textarea placeholder={t('scannerHome.healthConditionsPlaceholder')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                        <FormLabel className="flex items-center gap-2"><Camera/>{t('scannerHome.imageLabel')}</FormLabel>
                        <FormControl>
                           <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} />
                        </FormControl>
                        <FormDescription>{t('scannerHome.imageDescription')}</FormDescription>
                         <FormMessage />
                    </FormItem>
                )}
                />
            <div className="text-center pt-4">
              <Button type="submit" size="lg" className="w-full md:w-auto text-lg py-7 px-8 rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow duration-300">
                <Sparkles className="mr-3" />
                {t('scannerHome.analyzeButton')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
