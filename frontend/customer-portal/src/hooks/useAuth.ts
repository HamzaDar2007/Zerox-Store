import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/services/api'
import { ROUTES } from '@/constants/routes'
import { toast } from 'sonner'

export function useAuth() {
  const navigate = useNavigate()
  const { user, isAuthenticated, accessToken, refreshToken, setAuth, logout: storeLogout } = useAuthStore()

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    setAuth(res.user, res.accessToken, res.refreshToken)
    return res
  }, [setAuth])

  const register = useCallback(async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    await authApi.register(data)
  }, [])

  const logout = useCallback(async () => {
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => {})
    }
    storeLogout()
    navigate(ROUTES.HOME)
    toast.success('Logged out')
  }, [refreshToken, storeLogout, navigate])

  return { user, isAuthenticated, accessToken, login, register, logout }
}
