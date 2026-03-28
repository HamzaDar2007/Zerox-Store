import { Outlet, Link } from 'react-router-dom'

export function CheckoutLayout() {
  return (
    <div className="min-h-screen bg-[#F3F3F3] flex flex-col">
      <header className="bg-white border-b border-[#DDD] shadow-sm">
        <div className="container-main flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-1">
            <div className="bg-[#F57224] text-white font-extrabold text-xl px-2 py-0.5 rounded">S</div>
            <span className="text-xl font-bold text-[#0F1111]">ShopVerse</span>
          </Link>
          <h1 className="text-xl font-semibold text-[#0F1111]">Checkout</h1>
          <div className="w-24" />
        </div>
      </header>
      <main className="flex-1 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-[#DDD] bg-white py-4 text-center text-xs text-[#565959]">
        <p>© {new Date().getFullYear()} ShopVerse. All rights reserved.</p>
      </footer>
    </div>
  )
}
