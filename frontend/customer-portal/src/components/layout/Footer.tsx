import { Link } from 'react-router-dom'
import { ChevronUp, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="bg-[#0F172A] text-[#94A3B8]">
      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#1E293B] hover:bg-[#334155] py-3 text-sm text-[#CBD5E1] flex items-center justify-center gap-1 transition-colors cursor-pointer"
      >
        <ChevronUp className="h-4 w-4" />
        Back to Top
      </button>

      {/* Main Footer Links */}
      <div className="container-main py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Get to Know Us</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">About ShopVerse</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Press Releases</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Make Money with Us</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Sell on ShopVerse</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Affiliate Program</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Advertise Your Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Payment</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span>Credit/Debit Cards</span></li>
              <li><span>Cash on Delivery</span></li>
              <li><span>Bank Transfer</span></li>
              <li><span>JazzCash / EasyPaisa</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Let Us Help You</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={ROUTES.ACCOUNT} className="hover:text-white transition-colors">Your Account</Link></li>
              <li><Link to={ROUTES.ACCOUNT_ORDERS} className="hover:text-white transition-colors">Your Orders</Link></li>
              <li><Link to={ROUTES.ACCOUNT_RETURNS} className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link to={ROUTES.ACCOUNT_CHAT} className="hover:text-white transition-colors">Help & Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-[#334155]" />

      {/* Bottom Footer */}
      <div className="container-main py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#6366F1] text-white font-bold text-base w-7 h-7 rounded-lg flex items-center justify-center">S</div>
            <span className="text-white font-semibold">ShopVerse</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">
              <Youtube className="h-4 w-4" />
            </a>
          </div>

          <p className="text-xs text-[#64748B]">© {new Date().getFullYear()} ShopVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
