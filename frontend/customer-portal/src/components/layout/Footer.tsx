import { Link } from 'react-router-dom'
import { ChevronUp, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="bg-[#131921] text-[#DDD]">
      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475A] hover:bg-[#485769] py-3 text-sm text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
      >
        <ChevronUp className="h-4 w-4" />
        Back to Top
      </button>

      {/* Main Footer Links */}
      <div className="container-main py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Get to Know Us</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-[#F57224] transition-colors">About ShopVerse</Link></li>
              <li><Link to="/" className="hover:text-[#F57224] transition-colors">Careers</Link></li>
              <li><Link to="/" className="hover:text-[#F57224] transition-colors">Blog</Link></li>
              <li><Link to="/" className="hover:text-[#F57224] transition-colors">Press Releases</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Make Money with Us</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-[#F57224] transition-colors">Sell on ShopVerse</Link></li>
              <li><Link to="/" className="hover:text-[#F57224] transition-colors">Affiliate Program</Link></li>
              <li><Link to="/" className="hover:text-[#F57224] transition-colors">Advertise Your Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Payment</h4>
            <ul className="space-y-2 text-sm">
              <li><span>Credit/Debit Cards</span></li>
              <li><span>Cash on Delivery</span></li>
              <li><span>Bank Transfer</span></li>
              <li><span>JazzCash / EasyPaisa</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Let Us Help You</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={ROUTES.ACCOUNT} className="hover:text-[#F57224] transition-colors">Your Account</Link></li>
              <li><Link to={ROUTES.ACCOUNT_ORDERS} className="hover:text-[#F57224] transition-colors">Your Orders</Link></li>
              <li><Link to={ROUTES.ACCOUNT_RETURNS} className="hover:text-[#F57224] transition-colors">Returns & Refunds</Link></li>
              <li><Link to={ROUTES.ACCOUNT_CHAT} className="hover:text-[#F57224] transition-colors">Help & Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-[#3a4553]" />

      {/* Bottom Footer */}
      <div className="container-main py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#F57224] text-white font-extrabold text-lg px-2 py-0.5 rounded">S</div>
            <span className="text-white font-bold">ShopVerse</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#F57224] transition-colors" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#F57224] transition-colors" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#F57224] transition-colors" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#F57224] transition-colors" aria-label="YouTube">
              <Youtube className="h-5 w-5" />
            </a>
          </div>

          <p className="text-xs text-[#8D9096]">© {new Date().getFullYear()} ShopVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
