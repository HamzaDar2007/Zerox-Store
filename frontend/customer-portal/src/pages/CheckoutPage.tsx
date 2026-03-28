import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SEOHead } from '@/components/common/SEOHead'
import { StepIndicator } from '@/components/checkout/StepIndicator'
import { AddressStep } from '@/components/checkout/AddressStep'
import { ShippingStep } from '@/components/checkout/ShippingStep'
import { PaymentStep } from '@/components/checkout/PaymentStep'
import { ReviewStep } from '@/components/checkout/ReviewStep'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { cartApi, ordersApi, stripeApi } from '@/services/api'
import { ROUTES } from '@/constants/routes'
import type { UserAddress, ShippingMethod, CartItem, CreateOrderPayload } from '@/types'
import { toast } from 'sonner'

const STEPS = [
  { label: 'Address' },
  { label: 'Shipping' },
  { label: 'Payment' },
  { label: 'Review' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const couponId = (location.state as { couponId?: string })?.couponId
  const [currentStep, setCurrentStep] = useState(0)
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)

  // Checkout state
  const [address, setAddress] = useState<UserAddress | null>(null)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('cod')

  useEffect(() => {
    cartApi.getItems().then((cartItems) => {
      if (cartItems.length === 0) {
        navigate(ROUTES.CART)
        return
      }
      setItems(cartItems)
    }).catch(() => navigate(ROUTES.CART))
      .finally(() => setLoading(false))
  }, [navigate])

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const shippingCost = shippingMethod?.baseRate ?? 0

  const handlePlaceOrder = async () => {
    if (!address || !shippingMethod) return
    setPlacing(true)
    try {
      const payload: CreateOrderPayload = {
        order: {
          couponId: couponId ?? undefined,
          shippingAmount: shippingCost,
          shippingLine1: address.line1,
          shippingLine2: address.line2,
          shippingCity: address.city,
          shippingState: address.state,
          shippingPostalCode: address.postalCode,
          shippingCountry: address.country,
        },
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      }

      const order = await ordersApi.create(payload)

      // Process payment
      if (paymentMethod === 'stripe') {
        const { url } = await stripeApi.createCheckout({
          orderId: order.id,
          successUrl: `${window.location.origin}${ROUTES.ORDER_CONFIRMATION}?orderId=${order.id}`,
          cancelUrl: `${window.location.origin}${ROUTES.CART}`,
        })
        window.location.href = url
        return
      }

      // COD or other — backend creates the payment record via order flow
      // Clear cart
      await cartApi.clear().catch(() => {})

      navigate(`${ROUTES.ORDER_CONFIRMATION}?orderId=${order.id}`)
      toast.success('Order placed successfully!')
    } catch {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>

  return (
    <>
      <SEOHead title="Checkout" />
      <div className="max-w-3xl mx-auto py-6 px-4">
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {currentStep === 0 && (
          <AddressStep onNext={(addr) => { setAddress(addr); setCurrentStep(1) }} />
        )}
        {currentStep === 1 && (
          <ShippingStep
            onNext={(method) => { setShippingMethod(method); setCurrentStep(2) }}
            onBack={() => setCurrentStep(0)}
          />
        )}
        {currentStep === 2 && (
          <PaymentStep
            onNext={(method) => { setPaymentMethod(method); setCurrentStep(3) }}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && address && shippingMethod && (
          <ReviewStep
            address={address}
            shippingMethod={shippingMethod}
            paymentMethod={paymentMethod}
            items={items}
            subtotal={subtotal}
            discount={0}
            shippingCost={shippingCost}
            onConfirm={handlePlaceOrder}
            onBack={() => setCurrentStep(2)}
            loading={placing}
          />
        )}
      </div>
    </>
  )
}
