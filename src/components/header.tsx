import { PawPrint } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 border-b">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <PawPrint className="text-primary h-8 w-8" />
          <h1 className="text-2xl font-bold text-foreground font-headline">
            Pettner Ingredient Analyzer
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/login">로그인</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">회원가입</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
