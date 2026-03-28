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
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm text-[#64748B] flex-wrap', className)}>
      <Link to="/" className="flex items-center gap-1 text-[#6366F1] hover:text-[#4F46E5] transition-colors">
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-[#94A3B8]" />
          {item.to ? (
            <Link to={item.to} className="text-[#6366F1] hover:text-[#4F46E5] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#0F172A]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
