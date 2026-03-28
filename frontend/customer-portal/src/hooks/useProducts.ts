import { useState, useEffect, useCallback } from 'react'
import { productsApi } from '@/services/api'
import type { Product, PaginatedResponse } from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/constants/config'

interface UseProductsParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  brandId?: string
  storeId?: string
}

export function useProducts(params: UseProductsParams = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { page = 1, limit = DEFAULT_PAGE_SIZE, search, categoryId, brandId, storeId } = params

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res: PaginatedResponse<Product> = await productsApi.list({
        page,
        limit,
        search,
        categoryId,
        brandId,
        storeId,
      })
      setProducts(res.data)
      setTotal(res.total)
    } catch {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, categoryId, brandId, storeId])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const totalPages = Math.ceil(total / limit)

  return { products, total, totalPages, loading, error, refetch: fetchProducts }
}
