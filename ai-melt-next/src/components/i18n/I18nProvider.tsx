'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from '@/i18n/config'
import { messages } from '@/i18n/messages'

type TranslationValues = Record<
  string,
  string | number | boolean | null | undefined
>

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, values?: TranslationValues) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function readMessage(locale: Locale, key: string): string {
  let current: unknown = messages[locale]

  for (const segment of key.split('.')) {
    if (
      typeof current !== 'object' ||
      current === null ||
      !(segment in current)
    ) {
      return key
    }

    current = (current as Record<string, unknown>)[segment]
  }

  return typeof current === 'string' ? current : key
}

function interpolate(
  message: string,
  values?: TranslationValues,
): string {
  if (!values) return message

  return message.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key]
    return value === null || value === undefined
      ? match
      : String(value)
  })
}

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  useEffect(() => {
    setLocaleState(initialLocale)
    document.documentElement.lang = initialLocale
  }, [initialLocale])

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale)
      document.documentElement.lang = nextLocale

      const secure =
        window.location.protocol === 'https:' ? '; Secure' : ''

      document.cookie =
        [
          `${LOCALE_COOKIE}=${nextLocale}`,
          'Path=/',
          `Max-Age=${LOCALE_COOKIE_MAX_AGE}`,
          'SameSite=Lax',
        ].join('; ') + secure

      router.refresh()
    },
    [router],
  )

  const t = useCallback(
    (key: string, values?: TranslationValues) =>
      interpolate(readMessage(locale, key), values),
    [locale],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used inside an I18nProvider.')
  }

  return context
}
