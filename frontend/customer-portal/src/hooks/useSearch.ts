import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchApi, productsApi } from '@/services/api'
import type { Product } from '@/types'
import { SEARCH_DEBOUNCE_MS } from '@/constants/config'
import { ROUTES } from '@/constants/routes'
import { useUIStore } from '@/store/ui.store'

export function useSearch() {
  const navigate = useNavigate()
  const { setSearchOpen } = useUIStore()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const search = useCallback((q: string) => {
    setQuery(q)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (q.trim().length < 2) {
      setSuggestions([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await productsApi.list({ search: q.trim(), limit: 5 })
        setSuggestions(res.data)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
  }, [])

  const submitSearch = useCallback((q?: string) => {
    const searchQuery = (q ?? query).trim()
    if (!searchQuery) return
    setSuggestions([])
    setSearchOpen(false)
    navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(searchQuery)}`)
    searchApi.logQuery({ query: searchQuery }).catch(() => {})
  }, [query, navigate, setSearchOpen])

  const clearSearch = useCallback(() => {
    setQuery('')
    setSuggestions([])
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  return { query, setQuery: search, suggestions, loading, submitSearch, clearSearch }
}
