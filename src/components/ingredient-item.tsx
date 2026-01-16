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
    <AccordionItem value={value}>
      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
        <div className="flex items-center gap-2">
          {icon}
          {title}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-4 pt-2">
          {ingredients.map((item, index) => (
            <li key={index} className={cn("pl-2 border-l-2 ml-2", {
                "border-success": value === 'positive',
                "border-accent": value === 'cautionary',
                "border-border": value !== 'positive' && value !== 'cautionary'
            })}>
              <div className='pl-4'>
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.reason}</p>
              </div>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
