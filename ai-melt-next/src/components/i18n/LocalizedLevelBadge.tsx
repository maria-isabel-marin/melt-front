'use client'

import type { LevelStatus } from '@/types'
import { cn } from '@/lib/utils'
import { useI18n } from '@/components/i18n/I18nProvider'

const STATUS_STYLES: Record<LevelStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  PROCESSING: 'bg-amber-50 text-amber-700',
  PENDING_REVIEW: 'bg-blue-50 text-blue-700',
  APPROVED: 'bg-green-50 text-green-700',
  OUTDATED: 'bg-orange-50 text-orange-700',
}

export function LocalizedLevelBadge({
  status,
  className,
}: {
  status: LevelStatus
  className?: string
}) {
  const { t } = useI18n()

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
        STATUS_STYLES[status],
        className,
      )}
    >
      {t(`statuses.${status}`)}
    </span>
  )
}
