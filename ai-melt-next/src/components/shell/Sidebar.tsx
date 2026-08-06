'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearToken, getUser } from '@/lib/auth'
import { authApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { BookOpen, LogOut, User } from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { useI18n } from '@/components/i18n/I18nProvider'

const NAV = [
  {
    href: '/corpus',
    labelKey: 'sidebar.myCorpora',
    icon: BookOpen,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getUser()
  const { t } = useI18n()

  const handleLogout = async () => {
    try {
      await authApi.guestLogout()
    } catch {
      // Ignore logout errors and remove the local session.
    }

    clearToken()
    router.replace('/')
  }

  return (
    <aside className="flex min-h-screen w-60 shrink-0 flex-col bg-blue-900 text-white">
      <div className="border-b border-blue-800 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg font-black text-blue-900">
            M
          </div>

          <div>
            <div className="text-base font-bold leading-tight">MELT</div>
            <div className="text-xs leading-tight text-blue-300">
              {t('sidebar.toolkit')}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV.map(({ href, labelKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href)
                ? 'bg-white/15 text-white'
                : 'text-blue-200 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon size={16} />
            {t(labelKey)}
          </Link>
        ))}
      </nav>

      <div className="border-t border-blue-800 px-4 py-4">
        <LanguageSwitcher variant="sidebar" />
      </div>

      <div className="border-t border-blue-800 px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700">
            <User size={14} />
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {user?.email ?? t('sidebar.guest')}
            </div>

            {user?.isGuest && (
              <div className="text-xs text-blue-300">
                {t('sidebar.guestSession')}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-blue-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={14} />
          {t('sidebar.signOut')}
        </button>
      </div>
    </aside>
  )
}
