
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';


export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const auth = useAuth();

  const formSchema = useMemo(() => z.object({
    email: z.string().email({ message: t('signupPage.invalidEmail') }),
    password: z.string().min(6, { message: t('signupPage.passwordMinLength') }),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t('signupPage.passwordMismatch'),
    path: ['confirmPassword'],
  }), [t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!auth) {
      toast({
        variant: 'destructive',
        title: t('loginPage.firebaseErrorTitle'),
        description: t('loginPage.firebaseErrorDescription'),
      });
      setIsLoading(false);
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      toast({
        title: t('signupPage.signupSuccessTitle'),
        description: t('signupPage.signupSuccessDescription'),
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      let errorMessage = t('signupPage.signupFailedDefault');
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('signupPage.emailInUse');
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = t('signupPage.operationNotAllowed');
      }
      toast({
        variant: 'destructive',
        title: t('signupPage.signupFailedTitle'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center flex-grow p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{t('signupPage.title')}</CardTitle>
          <CardDescription>
            {t('signupPage.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('signupPage.emailLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('signupPage.emailPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('signupPage.passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('signupPage.confirmPasswordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('signupPage.createAccount')}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t('signupPage.haveAccount')}{' '}
            <Link href="/login" className="underline">
              {t('common.login')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
