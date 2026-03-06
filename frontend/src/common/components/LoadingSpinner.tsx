import { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  /** Full-screen centered spinner (for Suspense fallback) */
  fullScreen?: boolean;
  /** Size of the spinner icon */
  size?: 'sm' | 'md' | 'lg';
  /** Optional label */
  label?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const LoadingSpinner = memo(function LoadingSpinner({
  fullScreen = false,
  size = 'md',
  label,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={`animate-spin text-primary ${sizeMap[size]}`} />
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">{spinner}</div>
  );
});
