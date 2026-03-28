import { Button } from '@/components/ui/button'
import { Smartphone } from 'lucide-react'

export function AppDownloadBanner() {
  return (
    <section className="py-6" aria-label="Download our app">
      <div className="container-main">
        <div className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#818CF8] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Download the ShopVerse App</h2>
            <p className="text-white/90 mb-6">
              Get exclusive app-only deals, faster checkout, and real-time order tracking.
              Shop anytime, anywhere!
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" className="font-bold">
                App Store
              </Button>
              <Button variant="outline" size="lg" className="font-bold border-white text-white hover:bg-white/10 hover:text-white">
                Google Play
              </Button>
            </div>
          </div>

          <div className="shrink-0">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-center">
              <Smartphone className="h-24 w-24 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
