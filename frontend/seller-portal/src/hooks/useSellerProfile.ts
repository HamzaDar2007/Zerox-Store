import { useQuery } from '@tanstack/react-query'
import { sellerApi, storeApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'

export function useSellerProfile() {
  const user = useAuthStore((s) => s.user)

  const sellerQuery = useQuery({
    queryKey: ['seller-profile', user?.id],
    queryFn: () => sellerApi.getMyProfile(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })

  const storeQuery = useQuery({
    queryKey: ['my-store', sellerQuery.data?.id],
    queryFn: () => storeApi.getMyStore(sellerQuery.data!.id),
    enabled: !!sellerQuery.data?.id,
    staleTime: 5 * 60 * 1000,
  })

  return {
    seller: sellerQuery.data ?? null,
    store: storeQuery.data ?? null,
    isLoading: sellerQuery.isLoading || storeQuery.isLoading,
    hasProfile: !!sellerQuery.data,
    hasStore: !!storeQuery.data,
    refetchSeller: sellerQuery.refetch,
    refetchStore: storeQuery.refetch,
  }
}
