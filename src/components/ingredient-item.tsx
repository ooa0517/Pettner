import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

type Ingredient = {
  name: string;
  reason: string;
};

type IngredientItemProps = {
  value: string;
  title: string;
  icon: React.ReactNode;
  ingredients: Ingredient[];
};

export default function IngredientItem({ value, title, icon, ingredients }: IngredientItemProps) {
  return (
    <AccordionItem value={value} className="border-b-0">
      <AccordionTrigger className="text-lg font-semibold hover:no-underline rounded-lg p-4 data-[state=open]:bg-muted/50">
        <div className="flex items-center gap-3">
          {icon}
          {title}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2">
        <ul className="space-y-4">
          {ingredients.map((item, index) => (
            <li key={index} className={cn("p-4 rounded-lg", {
                "bg-success/10": value === 'positive',
                "bg-destructive/10": value === 'cautionary',
            })}>
              <p className="font-semibold text-foreground">{item.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.reason}</p>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
