'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/auth'
import { Spinner } from '@/components/ui/accordion'
import { useI18n } from '@/components/i18n/I18nProvider'

function CallbackInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { t } = useI18n()

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-gray-500">
      <Spinner size="lg" />
      <p className="text-sm">{t('auth.signingIn')}</p>
    </div>
  )
}

function CallbackFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <CallbackInner />
    </Suspense>
  )
}
