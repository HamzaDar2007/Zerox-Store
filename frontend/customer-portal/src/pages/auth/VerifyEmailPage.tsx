import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authApi } from '@/services/api'
import { ROUTES } from '@/constants/routes'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error')

  useEffect(() => {
    if (!token) return
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        {status === 'loading' && <p className="text-lg text-gray-600">Verifying your email...</p>}
        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-4">Your email has been verified. You can now log in.</p>
            <Link to={ROUTES.LOGIN} className="text-[#007185] hover:text-[#C7511F]">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-4">The verification link is invalid or expired.</p>
            <Link to={ROUTES.HOME} className="text-[#007185] hover:text-[#C7511F]">Go Home</Link>
          </>
        )}
      </div>
    </div>
  )
}
