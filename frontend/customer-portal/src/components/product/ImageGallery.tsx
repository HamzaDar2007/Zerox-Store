import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types'

interface ImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  const selectedImage = sorted[selectedIndex]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      <div className="flex flex-col gap-2 shrink-0">
        {sorted.map((img, index) => (
          <button
            key={img.id}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'h-14 w-14 rounded border-2 overflow-hidden bg-white transition-colors cursor-pointer',
              selectedIndex === index ? 'border-[#F57224]' : 'border-[#DDD] hover:border-[#999]',
            )}
          >
            <img src={img.url} alt={img.altText ?? `${productName} ${index + 1}`} className="h-full w-full object-contain" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div
        className="flex-1 relative bg-white border border-[#DDD] rounded-[8px] overflow-hidden cursor-crosshair"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {selectedImage ? (
          <div className="aspect-square overflow-hidden">
            <img
              src={selectedImage.url}
              alt={selectedImage.altText ?? productName}
              className="h-full w-full object-contain transition-transform duration-200"
              style={isZoomed ? {
                transform: 'scale(2)',
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              } : undefined}
            />
          </div>
        ) : (
          <div className="aspect-square flex items-center justify-center text-[#565959]">No image</div>
        )}
      </div>
    </div>
  )
}
