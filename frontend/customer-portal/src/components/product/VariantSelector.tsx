import { cn } from '@/lib/utils'
import type { ProductVariant, AttributeKey } from '@/types'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariantId?: string
  onSelect: (variant: ProductVariant) => void
}

export function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
  // Group attributes by key
  const attributeGroups = new Map<string, { key: AttributeKey; values: Set<string> }>()

  for (const v of variants) {
    for (const attr of v.attributes ?? []) {
      if (!attr.attributeKey || !attr.attributeValue) continue
      const keyId = attr.attributeKeyId
      if (!attributeGroups.has(keyId)) {
        attributeGroups.set(keyId, { key: attr.attributeKey, values: new Set() })
      }
      attributeGroups.get(keyId)?.values.add(attr.attributeValue.displayValue ?? attr.attributeValue.value)
    }
  }

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)

  // Get selected attribute values for the currently selected variant
  const selectedAttrs = new Map<string, string>()
  if (selectedVariant) {
    for (const attr of selectedVariant.attributes ?? []) {
      if (attr.attributeKey && attr.attributeValue) {
        selectedAttrs.set(attr.attributeKeyId, attr.attributeValue.displayValue ?? attr.attributeValue.value)
      }
    }
  }

  // Check if a variant with the given attribute exists
  const findVariant = (keyId: string, value: string) => {
    return variants.find((v) =>
      v.isActive &&
      (v.attributes ?? []).some(
        (a) => a.attributeKeyId === keyId &&
          (a.attributeValue?.displayValue ?? a.attributeValue?.value) === value,
      ),
    )
  }

  if (attributeGroups.size === 0 && variants.length <= 1) return null

  return (
    <div className="space-y-4">
      {Array.from(attributeGroups.entries()).map(([keyId, { key, values }]) => (
        <div key={keyId}>
          <label className="text-sm font-medium text-[#0F1111] mb-2 block">
            {key.name}: <span className="font-normal text-[#565959]">{selectedAttrs.get(keyId) ?? '—'}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {Array.from(values).map((value) => {
              const isSelected = selectedAttrs.get(keyId) === value
              const matchVariant = findVariant(keyId, value)
              const isAvailable = !!matchVariant

              return (
                <button
                  key={value}
                  onClick={() => matchVariant && onSelect(matchVariant)}
                  disabled={!isAvailable}
                  className={cn(
                    'px-4 py-2 text-sm rounded border transition-colors cursor-pointer',
                    isSelected
                      ? 'border-[#F57224] bg-[#FFF3EC] text-[#F57224] font-medium'
                      : isAvailable
                        ? 'border-[#DDD] bg-white text-[#0F1111] hover:border-[#999]'
                        : 'border-[#DDD] bg-[#F0F0F0] text-[#999] cursor-not-allowed line-through',
                  )}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
