import { PawPrint } from 'lucide-react';

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <PawPrint className="text-primary h-8 w-8" />
        <h1 className="text-2xl font-bold text-foreground font-headline">
          Pettner Ingredient Analyzer
        </h1>
      </div>
    </header>
  );
}
