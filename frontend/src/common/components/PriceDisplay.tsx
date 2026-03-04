import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

/**
 * Displays price with optional compare-at (strikethrough) price.
 */
export function PriceDisplay({
  price,
  compareAtPrice,
  currency,
  className,
  size = 'md',
}: PriceDisplayProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className={cn('font-bold', sizeStyles[size])}>
        {formatCurrency(price, currency)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatCurrency(compareAtPrice, currency)}
          </span>
          <span className="text-xs font-medium text-green-600">
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
