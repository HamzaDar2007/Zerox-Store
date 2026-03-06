import { memo, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Image URL */
  src: string;
  /** Alt text (required for accessibility) */
  alt: string;
  /** Optional fallback for broken images */
  fallbackSrc?: string;
  /** Aspect ratio container class like 'aspect-square' or 'aspect-video' */
  aspectRatio?: string;
  /** Additional wrapper classes */
  wrapperClassName?: string;
}

/**
 * Performance-optimized image component with:
 * - Native lazy loading
 * - Intersection Observer for below-fold images
 * - Fade-in animation on load
 * - Error fallback
 * - Proper sizing attributes
 */
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder.svg',
  aspectRatio,
  wrapperClassName,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }, // Start loading 200px before visible
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  const imageSrc = hasError ? fallbackSrc : src;

  return (
    <div
      ref={imgRef}
      className={cn(
        'overflow-hidden bg-muted',
        aspectRatio,
        wrapperClassName,
      )}
    >
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          {...props}
        />
      )}
    </div>
  );
});
