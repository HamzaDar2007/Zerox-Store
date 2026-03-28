import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm text-[#565959] flex-wrap', className)}>
      <Link to="/" className="flex items-center gap-1 text-[#007185] hover:text-[#C7511F] transition-colors">
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-[#8D9096]" />
          {item.to ? (
            <Link to={item.to} className="text-[#007185] hover:text-[#C7511F] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#0F1111]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
