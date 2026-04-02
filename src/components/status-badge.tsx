import { Badge } from "@/components/ui/badge";
import { Status } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusConfig: Record<Status, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-100" },
  IN_PROGRESS: { label: "In Progress", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-100" },
  RESOLVED: { label: "Resolved", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100" },
  CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100" },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
