'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/accordion'
import { LocalizedLevelBadge } from '@/components/i18n/LocalizedLevelBadge'
import { useI18n } from '@/components/i18n/I18nProvider'
import type { LevelStatus } from '@/types'
import {
  PlayCircle,
  CheckCheck,
  Check,
} from 'lucide-react'

interface Props {
  level: number
  status: LevelStatus
  onProcess: () => void
  onApproveAll: () => void
  onApprove: () => void
  processing: boolean
  approving: boolean
  children: React.ReactNode
}

export function LevelWrapper({
  level,
  status,
  onProcess,
  onApproveAll,
  onApprove,
  processing,
  approving,
  children,
}: Props) {
  const { t } = useI18n()

  const canProcess =
    status === 'PENDING' ||
    status === 'OUTDATED' ||
    status === 'PENDING_REVIEW'

  const canReview =
    status === 'PENDING_REVIEW'

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">
            {t('levelWrapper.level', {
              level,
            })}
          </span>

          <LocalizedLevelBadge
            status={status}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {canProcess && (
            <Button
              size="sm"
              onClick={onProcess}
              loading={processing}
              disabled={processing}
            >
              <PlayCircle size={14} />

              {status === 'PENDING'
                ? t('levelWrapper.process')
                : t('levelWrapper.reprocess')}
            </Button>
          )}

          {status === 'PROCESSING' && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner size="sm" />
              {t('levelWrapper.processing')}
            </div>
          )}

          {canReview && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={onApproveAll}
                loading={approving}
                disabled={approving}
              >
                <CheckCheck size={14} />
                {t('levelWrapper.approveAll')}
              </Button>

              <Button
                size="sm"
                onClick={onApprove}
                loading={approving}
                disabled={approving}
              >
                <Check size={14} />
                {t('levelWrapper.approveLevel')}
              </Button>
            </>
          )}
        </div>
      </div>

      {status === 'PENDING' &&
        !processing && (
          <div className="py-12 text-center text-sm text-gray-400">
            {t(
              'levelWrapper.pendingHint',
              {
                level,
              },
            )}
          </div>
        )}

      {status !== 'PENDING' &&
        children}
    </div>
  )
}