import { cn } from '@/lib/utils';
import { Badge } from '@/common/components/ui/badge';

type StatusVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

/**
 * Auto-maps common statuses to colors, or use an explicit variant.
 */
const statusVariantMap: Record<string, StatusVariant> = {
  active: 'success',
  published: 'success',
  completed: 'success',
  approved: 'success',
  delivered: 'success',
  resolved: 'success',
  success: 'success',
  paid: 'success',

  pending: 'warning',
  pending_review: 'warning',
  under_review: 'warning',
  processing: 'warning',
  shipped: 'warning',
  in_progress: 'warning',

  inactive: 'default',
  draft: 'default',
  closed: 'default',
  cancelled: 'default',

  rejected: 'error',
  failed: 'error',
  suspended: 'error',
  out_of_stock: 'error',
  refunded: 'error',
  discontinued: 'error',
  blocked: 'error',

  open: 'info',
  new: 'info',
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolvedVariant = variant ?? statusVariantMap[status.toLowerCase()] ?? 'default';
  const displayText = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent font-medium',
        variantStyles[resolvedVariant],
        className,
      )}
    >
      {displayText}
    </Badge>
  );
}
