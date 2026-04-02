import { Badge } from "@/components/ui/badge";
import { Priority } from "@prisma/client";
import { cn } from "@/lib/utils";

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100" },
  MEDIUM: { label: "Medium", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-100" },
  HIGH: { label: "High", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 hover:bg-orange-100" },
  URGENT: { label: "Urgent", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-100" },
};

interface PriorityBadgeProps {
  priority: Priority | string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const key = priority.toUpperCase() as Priority;
  const config = priorityConfig[key] || priorityConfig.MEDIUM;
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
