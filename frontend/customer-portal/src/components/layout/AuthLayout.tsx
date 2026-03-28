import { Outlet, Link } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-[#DDD] py-4">
        <div className="container-main">
          <Link to="/" className="flex items-center gap-1 w-fit">
            <div className="bg-[#F57224] text-white font-extrabold text-xl px-2 py-0.5 rounded">S</div>
            <span className="text-xl font-bold text-[#0F1111]">ShopVerse</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-[400px]">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-[#DDD] py-4 text-center text-xs text-[#565959]">
        <p>© {new Date().getFullYear()} ShopVerse. All rights reserved.</p>
      </footer>
    </div>
  )
}
