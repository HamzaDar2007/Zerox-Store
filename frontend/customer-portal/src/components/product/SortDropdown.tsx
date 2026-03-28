import { useSearchParams } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SORT_OPTIONS } from '@/constants/config'

export function SortDropdown() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentSort = searchParams.get('sort') ?? 'relevance'

  const handleSort = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'relevance') {
      next.delete('sort')
    } else {
      next.set('sort', value)
    }
    setSearchParams(next)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#565959] shrink-0">Sort by:</span>
      <Select value={currentSort} onValueChange={handleSort}>
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
