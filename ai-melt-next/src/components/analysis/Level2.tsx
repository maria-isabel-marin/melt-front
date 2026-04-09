'use client'
import { useState } from 'react'
import type { ConventionalMetaphor, ItemStatus } from '@/types'
import { ItemBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { analysisApi } from '@/lib/api'
import { Check, X, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  metaphors: ConventionalMetaphor[]
  onRefresh: () => void
}

const robustnessColor = {
  HIGH: 'bg-green-100 text-green-700',
  MODERATE: 'bg-yellow-100 text-yellow-700',
  WEAK: 'bg-gray-100 text-gray-500',
}

export function Level2({ metaphors, onRefresh }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const update = async (id: string, status: ItemStatus) => {
    setLoading(id)
    try { await analysisApi.updateItemStatus('conventionalMetaphor', id, status); onRefresh() }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(null) }
  }

  if (metaphors.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No conventional metaphors found.</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{metaphors.length} conventional metaphor{metaphors.length !== 1 ? 's' : ''} identified</p>
      {metaphors.map(m => (
        <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900">{m.conceptualMetaphor}</span>
                <ItemBadge status={m.itemStatus} />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">{m.sourceDomain}</span>
                <span className="text-gray-400">→</span>
                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">{m.targetDomain}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-gray-600">
                  <TrendingUp size={12} />
                  {m.absoluteFrequency} occurrences
                </span>
                <span className={cn('px-2 py-0.5 rounded-full font-medium', robustnessColor[m.robustness])}>
                  {m.robustness}
                </span>
                <span className="text-gray-400">{m.approach.replace('_', ' ')}</span>
              </div>
              {m.usageContext && <p className="text-xs text-gray-500 mt-2 italic">{m.usageContext}</p>}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50 h-7" onClick={() => update(m.id, 'APPROVED')} disabled={loading === m.id || m.itemStatus === 'APPROVED'}>
                <Check size={13} />
              </Button>
              <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 h-7" onClick={() => update(m.id, 'REJECTED')} disabled={loading === m.id || m.itemStatus === 'REJECTED'}>
                <X size={13} />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
