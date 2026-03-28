import { Outlet, Link } from 'react-router-dom'

export function CheckoutLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="container-main flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#6366F1] text-white font-bold text-lg w-8 h-8 rounded-lg flex items-center justify-center">S</div>
            <span className="text-lg font-semibold text-[#0F172A]">ShopVerse</span>
          </Link>
          <h1 className="text-lg font-semibold text-[#0F172A]">Checkout</h1>
          <div className="w-24" />
        </div>
      </header>
      <main className="flex-1 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-[#E2E8F0] bg-white py-4 text-center text-xs text-[#64748B]">
        <p>© {new Date().getFullYear()} ShopVerse. All rights reserved.</p>
      </footer>
    </div>
  )
}
