import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  "Billing": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "Technical Support": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  "Bug Report": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  "Feature Request": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  "General Inquiry": "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  "Account Issue": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  "Uncategorized": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colorClass = categoryColors[category] || categoryColors["Uncategorized"];
  return (
    <Badge variant="secondary" className={cn(colorClass, "hover:opacity-90", className)}>
      {category}
    </Badge>
  );
}
