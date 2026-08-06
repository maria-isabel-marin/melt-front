export const SUPPORTED_LOCALES = ['es', 'en'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'es'
export const LOCALE_COOKIE = 'MELT_LOCALE'
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function getSupportedLocale(value?: string | null): Locale | null {
  if (!value) return null

  const normalized = value.trim().toLowerCase().replace('_', '-')
  const baseLanguage = normalized.split('-')[0]

  return SUPPORTED_LOCALES.includes(baseLanguage as Locale)
    ? (baseLanguage as Locale)
    : null
}

export function detectLocaleFromAcceptLanguage(
  acceptLanguage?: string | null,
): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE

  const candidates = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [languageTag, ...parameters] = part.trim().split(';')
      const qParameter = parameters.find((parameter) =>
        parameter.trim().startsWith('q='),
      )
      const quality = qParameter
        ? Number.parseFloat(qParameter.trim().slice(2))
        : 1

      return {
        languageTag,
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      }
    })
    .sort((a, b) => b.quality - a.quality || a.index - b.index)

  for (const candidate of candidates) {
    const locale = getSupportedLocale(candidate.languageTag)
    if (locale) return locale
  }

  return DEFAULT_LOCALE
}
