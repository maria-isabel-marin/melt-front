'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearToken, getUser } from '@/lib/auth'
import { authApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { BookOpen, LogOut, User } from 'lucide-react'

const NAV = [
  { href: '/corpus', label: 'My Corpora', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getUser()

  const handleLogout = async () => {
    try { await authApi.guestLogout() } catch { /* ignore */ }
    clearToken()
    router.replace('/')
  }

  return (
    <aside className="w-60 min-h-screen bg-blue-900 flex flex-col text-white shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-blue-900 text-lg font-black flex items-center justify-center">
            M
          </div>
          <div>
            <div className="font-bold text-base leading-tight">MELT</div>
            <div className="text-blue-300 text-xs leading-tight">Metaphor Toolkit</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href)
                ? 'bg-white/15 text-white'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center shrink-0">
            <User size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user?.email ?? 'Guest'}</div>
            {user?.isGuest && (
              <div className="text-xs text-blue-300">Guest session</div>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-blue-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
