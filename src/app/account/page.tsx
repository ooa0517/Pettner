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

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
        <h1 className="text-3xl font-bold font-headline">내 계정</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>프로필</CardTitle>
            <CardDescription>내 계정 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{user.displayName || '사용자'}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="text-primary"/>
              나의 반려동물
            </CardTitle>
            <CardDescription>
              반려동물을 등록하고 맞춤형 서비스를 이용해보세요. (구독 기능 준비 중)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <p className="text-muted-foreground">아직 등록된 반려동물이 없습니다.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled>
              <PlusCircle className="mr-2 h-4 w-4" />
              반려동물 추가하기
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
