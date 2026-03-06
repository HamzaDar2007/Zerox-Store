import { useState, useCallback } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/common/components/ui/dialog';
import { VisuallyHidden } from '@/common/components/ui/visually-hidden';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: { url: string; alt?: string }[];
  className?: string;
}

/**
 * Product image gallery with thumbnails and lightbox zoom.
 */
export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  if (images.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-muted">
        <p className="text-sm text-muted-foreground">No images</p>
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main Image */}
      <div
        className="group relative cursor-pointer overflow-hidden rounded-lg border"
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={currentImage.url}
          alt={currentImage.alt ?? 'Product image'}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
          <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={cn(
                'h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                idx === selectedIndex
                  ? 'border-primary'
                  : 'border-transparent hover:border-muted-foreground/30',
              )}
            >
              <img
                src={img.url}
                alt={img.alt ?? `Thumbnail ${idx + 1}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          <VisuallyHidden>
            <DialogTitle>Product Image</DialogTitle>
          </VisuallyHidden>
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={currentImage.url}
            alt={currentImage.alt ?? 'Product image'}
            loading="lazy"
            decoding="async"
            className="w-full rounded-lg object-contain"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
