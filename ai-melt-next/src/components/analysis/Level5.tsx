'use client'
import { useState } from 'react'
import type { CulturalNarrative, ItemStatus } from '@/types'
import { ItemBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { analysisApi } from '@/lib/api'
import { Check, X, Globe } from 'lucide-react'

interface Props {
  narrative: CulturalNarrative | null
  onRefresh: () => void
}

export function Level5({ narrative, onRefresh }: Props) {
  const [loading, setLoading] = useState(false)

  const update = async (status: ItemStatus) => {
    if (!narrative) return
    setLoading(true)
    try { await analysisApi.updateItemStatus('culturalNarrative', narrative.id, status); onRefresh() }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  if (!narrative) {
    return <p className="text-sm text-gray-500 text-center py-8">No cultural narrative found.</p>
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Globe size={18} className="text-blue-700" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{narrative.name}</h3>
            {narrative.regime && (
              <p className="text-xs text-gray-500 mt-0.5">Regime: {narrative.regime.regimeName}</p>
            )}
          </div>
        </div>
        <ItemBadge status={narrative.itemStatus} />
      </div>

      {narrative.description && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
          <p className="text-sm text-gray-700 leading-relaxed">{narrative.description}</p>
        </div>
      )}

      {narrative.textualDistribution.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Textual Distribution</p>
          <div className="space-y-1.5">
            {narrative.textualDistribution.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded px-3 py-1.5">
                <span className="text-gray-400 shrink-0">{i + 1}.</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {narrative.analystNote && (
        <p className="text-xs text-gray-500 italic mb-4">{narrative.analystNote}</p>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        <ItemBadge status={narrative.itemStatus} />
        <div className="flex gap-1 ml-auto">
          <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50 h-7" onClick={() => update('APPROVED')} disabled={loading || narrative.itemStatus === 'APPROVED'}>
            <Check size={13} /> Approve
          </Button>
          <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 h-7" onClick={() => update('REJECTED')} disabled={loading || narrative.itemStatus === 'REJECTED'}>
            <X size={13} /> Reject
          </Button>
        </div>
      </div>
    </div>
  )
}
