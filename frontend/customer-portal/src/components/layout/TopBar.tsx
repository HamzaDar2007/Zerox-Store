import { Link } from 'react-router-dom'
import { MapPin, HelpCircle, Globe } from 'lucide-react'

export function TopBar() {
  return (
    <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs text-[#64748B]">
      <div className="container-main flex items-center justify-between h-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1 hover:text-[#6366F1] transition-colors">
            <MapPin className="h-3 w-3" />
            <span>Deliver to Pakistan</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/flash-sales" className="hover:text-[#6366F1] transition-colors">Today&apos;s Deals</Link>
          <Link to="/account/chat" className="hidden sm:flex items-center gap-1 hover:text-[#6366F1] transition-colors">
            <HelpCircle className="h-3 w-3" />
            <span>Help</span>
          </Link>
          <button className="flex items-center gap-1 hover:text-[#6366F1] transition-colors cursor-pointer">
            <Globe className="h-3 w-3" />
            <span>EN</span>
          </button>
        </div>
      </div>
    </div>
  )
}
