import { ShoppingCart } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function EmptyCart() {
  const navigate = useNavigate()

  return (
    <EmptyState
      icon={<ShoppingCart className="h-16 w-16" />}
      title="Your cart is empty"
      description="Looks like you haven't added anything to your cart yet. Start shopping to find great deals!"
      actionLabel="Continue Shopping"
      onAction={() => navigate(ROUTES.PRODUCTS)}
    />
  )
}
