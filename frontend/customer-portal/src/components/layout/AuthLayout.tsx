import { Outlet } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#EEF2FF] to-[#F8FAFC] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#E2E8F0]/60 p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white font-bold text-2xl w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-[#6366F1]/25">
              S
            </div>
          </div>

          <Outlet />
        </div>

        {/* Security footer */}
        <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-[#94A3B8]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Secured by enterprise-grade encryption</span>
        </div>
      </div>
    </div>
  )
}
