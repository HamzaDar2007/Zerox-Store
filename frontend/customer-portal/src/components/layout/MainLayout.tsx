import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Header } from './Header'
import { CategoryNav } from './CategoryNav'
import { Footer } from './Footer'
import { MobileMenu } from './MobileMenu'

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <TopBar />
      <Header />
      <CategoryNav />
      <MobileMenu />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
