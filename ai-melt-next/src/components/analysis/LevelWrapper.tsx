'use client'
import { LevelBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/accordion'
import type { LevelStatus } from '@/types'
import { PlayCircle, CheckCheck, Check } from 'lucide-react'

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

export function LevelWrapper({ level, status, onProcess, onApproveAll, onApprove, processing, approving, children }: Props) {
  const canProcess = status === 'PENDING' || status === 'OUTDATED'
  const canReview = status === 'PENDING_REVIEW'

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Level {level} Status</span>
          <LevelBadge status={status} />
        </div>
        <div className="flex items-center gap-2">
          {canProcess && (
            <Button size="sm" onClick={onProcess} loading={processing} disabled={processing}>
              <PlayCircle size={14} />
              {status === 'OUTDATED' ? 'Re-process' : 'Process with AI'}
            </Button>
          )}
          {status === 'PROCESSING' && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner size="sm" /> Processing…
            </div>
          )}
          {canReview && (
            <>
              <Button size="sm" variant="outline" onClick={onApproveAll} loading={approving} disabled={approving}>
                <CheckCheck size={14} />
                Approve All Items
              </Button>
              <Button size="sm" onClick={onApprove} loading={approving} disabled={approving}>
                <Check size={14} />
                Approve Level
              </Button>
            </>
          )}
        </div>
      </div>
      {status === 'PENDING' && !processing && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Click &quot;Process with AI&quot; to start Level {level} analysis.
        </div>
      )}
      {status !== 'PENDING' && children}
    </div>
  )
}
