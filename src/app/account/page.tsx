'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PawPrint, PlusCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center flex-grow p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const getInitials = (email: string | null) => {
    return email ? email.substring(0, 2).toUpperCase() : '..';
  }

  return (
    <div className="flex-grow p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold font-headline">{t('accountPage.title')}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('accountPage.profile')}</CardTitle>
            <CardDescription>{t('accountPage.profileDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{user.displayName || t('accountPage.user')}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="text-primary"/>
              {t('accountPage.myPets')}
            </CardTitle>
            <CardDescription>
              {t('accountPage.myPetsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <p className="text-muted-foreground">{t('accountPage.noPets')}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('accountPage.addPet')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
