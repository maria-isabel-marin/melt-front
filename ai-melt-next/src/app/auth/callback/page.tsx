'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/auth'
import { Spinner } from '@/components/ui/accordion'
import { Suspense } from 'react'

function CallbackInner() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      setToken(token)
      router.replace('/corpus')
    } else {
      router.replace('/')
    }
  }, [params, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
      <Spinner size="lg" />
      <p className="text-sm">Signing you in…</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <CallbackInner />
    </Suspense>
  )
}
