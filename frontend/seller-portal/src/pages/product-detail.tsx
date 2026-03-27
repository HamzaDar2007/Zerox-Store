import { Navigate, useParams } from 'react-router-dom'

// Product detail is handled inline in the products page form view.
// This route simply redirects to the products list.
export default function ProductDetailPage() {
  const { id } = useParams()
  void id // The products page manages edit mode internally
  return <Navigate to="/products" replace />
}
