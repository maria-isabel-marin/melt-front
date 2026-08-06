'use client'

import { Languages } from 'lucide-react'
import { useI18n } from './I18nProvider'
import type { Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'

type Variant = 'sidebar' | 'overlay' | 'default'

export function LanguageSwitcher({
  variant = 'default',
}: {
  variant?: Variant
}) {
  const { locale, setLocale, t } = useI18n()

  const isSidebar = variant === 'sidebar'
  const isOverlay = variant === 'overlay'

  return (
    <label
      className={cn(
        'flex items-center gap-2 rounded-lg',
        isSidebar &&
          'w-full bg-white/10 px-3 py-2 text-blue-100',
        isOverlay &&
          'border border-white/20 bg-white/10 px-3 py-2 text-white backdrop-blur-sm',
        variant === 'default' &&
          'border border-gray-200 bg-white px-3 py-2 text-gray-700',
      )}
    >
      <Languages size={15} className="shrink-0" />
      <span className="sr-only">{t('language.selector')}</span>

      <select
        value={locale}
        aria-label={t('language.selector')}
        onChange={(event) =>
          setLocale(event.target.value as Locale)
        }
        className={cn(
          'min-w-0 flex-1 cursor-pointer bg-transparent text-xs font-medium outline-none',
          (isSidebar || isOverlay) && '[color-scheme:dark]',
        )}
      >
        <option value="es">{t('language.spanish')}</option>
        <option value="en">{t('language.english')}</option>
      </select>
    </label>
  )
}
