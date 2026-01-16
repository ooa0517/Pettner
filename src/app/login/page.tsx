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
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.596,44,30.823,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { t } = useLanguage();

  const formSchema = useMemo(() => z.object({
    email: z.string().email({ message: t('loginPage.invalidEmail') }),
    password: z.string().min(1, { message: t('loginPage.passwordRequired') }),
  }), [t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
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
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: t('loginPage.loginSuccessTitle'),
        description: t('loginPage.loginSuccessDescription'),
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      let errorMessage = t('loginPage.loginFailedDescription');
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = t('loginPage.loginFailedNotAllowed');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = t('loginPage.loginFailedInvalid');
      }
      toast({
        variant: 'destructive',
        title: t('loginPage.loginFailedTitle'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    if (!auth) {
      toast({
        variant: 'destructive',
        title: t('loginPage.firebaseErrorTitle'),
        description: t('loginPage.firebaseErrorDescription'),
      });
      setIsGoogleLoading(false);
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: t('loginPage.loginSuccessTitle'),
        description: t('loginPage.loginSuccessDescription'),
      });
      router.push('/');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
       toast({
        variant: 'destructive',
        title: t('loginPage.loginFailedTitle'),
        description: t('loginPage.googleLoginFailed'),
      });
    } finally {
        setIsGoogleLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center flex-grow p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{t('loginPage.title')}</CardTitle>
          <CardDescription>
            {t('loginPage.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('loginPage.emailLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('loginPage.emailPlaceholder')} {...field} />
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
                      <FormLabel>{t('loginPage.passwordLabel')}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('common.login')}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t('loginPage.or')}
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" type="button" disabled={isLoading || isGoogleLoading} onClick={handleGoogleSignIn}>
              {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
              {t('loginPage.googleLogin')}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            {t('loginPage.noAccount')}{' '}
            <Link href="/signup" className="underline">
              {t('common.signup')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
