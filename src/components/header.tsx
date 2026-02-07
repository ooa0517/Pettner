
'use client';

import { PawPrint, LogOut, LayoutDashboard, ChevronDown, History, Globe, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from '@/contexts/language-context';

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const getInitials = (email: string | null) => {
    return email ? email.substring(0, 2).toUpperCase() : '..';
  }

  return (
    <header className="py-4 px-4 sm:px-6 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <PawPrint className="text-primary h-8 w-8" />
          <h1 className="text-2xl font-bold text-foreground font-headline">
            {t('header.title')}
          </h1>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden md:flex text-muted-foreground hover:text-primary">
            <a href="mailto:support@pettner.ai" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('header.feedback')}
            </a>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('ko')}>한국어</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isUserLoading ? (
            <div className="h-9 w-32 bg-muted rounded-md animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                   <Avatar className="h-8 w-8">
                     <AvatarImage src={user.photoURL || undefined} />
                     <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                   </Avatar>
                   <span className="hidden lg:inline text-sm">{user.email}</span>
                   <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('common.myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>{t('header.accountManagement')}</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href="/history">
                    <History className="mr-2 h-4 w-4" />
                    <span>{t('common.analysisHistory')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('common.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t('common.login')}</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-4">
                <Link href="/signup">{t('common.signup')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
