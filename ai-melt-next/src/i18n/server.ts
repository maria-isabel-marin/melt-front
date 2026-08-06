import { cookies, headers } from 'next/headers'
import {
  detectLocaleFromAcceptLanguage,
  getSupportedLocale,
  LOCALE_COOKIE,
  type Locale,
} from './config'

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const savedLocale = getSupportedLocale(
    cookieStore.get(LOCALE_COOKIE)?.value,
  )

  if (savedLocale) return savedLocale

  const headerStore = await headers()
  return detectLocaleFromAcceptLanguage(
    headerStore.get('accept-language'),
  )
}
