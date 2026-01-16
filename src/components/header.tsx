
'use client';

import { PawPrint, LogOut, AlertTriangle, LayoutDashboard, ChevronDown, History } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Header() {
  const { user, loading, isFirebaseReady } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const getInitials = (email: string | null) => {
    return email ? email.substring(0, 2).toUpperCase() : '..';
  }

  return (
    <>
      <header className="py-4 px-4 sm:px-6 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="text-primary h-8 w-8" />
            <h1 className="text-2xl font-bold text-foreground font-headline">
              Pettner
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-32 bg-muted rounded-md animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                     <Avatar className="h-8 w-8">
                       <AvatarImage src={user.photoURL || undefined} />
                       <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                     </Avatar>
                     <span className="hidden md:inline">{user.email}</span>
                     <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>계정 관리</span>
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/history">
                      <History className="mr-2 h-4 w-4" />
                      <span>분석 기록</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" disabled={!isFirebaseReady}>
                  <Link href="/login">로그인</Link>
                </Button>
                <Button asChild size="sm" disabled={!isFirebaseReady}>
                  <Link href="/signup">회원가입</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      {!isFirebaseReady && !loading && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Firebase 설정 오류</AlertTitle>
            <AlertDescription>
              Firebase가 설정되지 않았습니다. 인증 기능이 동작하지 않습니다. <code>.env</code> 파일에 Firebase 프로젝트 정보를 올바르게 입력했는지 확인해주세요.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}
