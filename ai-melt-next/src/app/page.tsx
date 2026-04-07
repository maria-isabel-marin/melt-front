'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn, setToken } from '@/lib/auth'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [loadingGuest, setLoadingGuest] = useState(false)

  useEffect(() => {
    if (isLoggedIn()) router.replace('/corpus')
  }, [router])

  const handleGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'}/auth/google`
  }

  const handleGuest = async () => {
    setLoadingGuest(true)
    try {
      const res = await authApi.createGuest()
      setToken(res.token)
      router.push('/corpus')
    } finally {
      setLoadingGuest(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-900 text-white text-3xl font-black flex items-center justify-center mx-auto mb-4">
            M
          </div>
          <h1 className="text-3xl font-bold text-blue-900 tracking-tight">MELT</h1>
          <p className="text-xs text-gray-400 mt-1 italic">
            Metaphor Extraction &amp; Language Toolkit
          </p>
        </div>

        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          AI-assisted metaphor analysis pipeline based on MIPVU, Musolff &amp; Valdivia frameworks.
        </p>

        <div className="flex flex-col gap-3">
          <Button className="w-full h-11" onClick={handleGoogle}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>

          <div className="flex items-center gap-3 text-gray-300">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Button variant="outline" className="w-full h-11" onClick={handleGuest} loading={loadingGuest}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Continue as Guest
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-5">
          Guest sessions are temporary — export before closing.
        </p>
      </div>
    </div>
  )
}
