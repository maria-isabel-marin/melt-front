'use client'
import { useState } from 'react'
import type { MetaphorRegime, ItemStatus } from '@/types'
import { ItemBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AccordionItem } from '@/components/ui/accordion'
import { analysisApi } from '@/lib/api'
import { Check, X, BarChart2 } from 'lucide-react'

interface Props {
  regimes: MetaphorRegime[]
  onRefresh: () => void
}

export function Level4({ regimes, onRefresh }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const update = async (id: string, status: ItemStatus) => {
    setLoading(id)
    try { await analysisApi.updateItemStatus('metaphorRegime', id, status); onRefresh() }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(null) }
  }

  if (regimes.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No metaphor regimes found.</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{regimes.length} regime{regimes.length !== 1 ? 's' : ''} identified</p>
      {regimes.map(r => (
        <AccordionItem
          key={r.id}
          title={
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="font-semibold text-gray-900 truncate">{r.regimeName}</span>
              <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                <BarChart2 size={12} /> {r.aggregateFrequency}
              </span>
              <ItemBadge status={r.itemStatus} />
            </div>
          }
        >
          {/* Metaphors list */}
          {r.metaphors.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Metaphors</p>
              <div className="flex flex-wrap gap-2">
                {r.metaphors.map((m, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* Derived Metaphors */}
          {r.derivedMetaphors && r.derivedMetaphors.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Derived Metaphors</p>
              <div className="flex flex-wrap gap-2">
                {r.derivedMetaphors.map(dm => (
                  <span key={dm.id} className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full">{dm.derivedMetaphor}</span>
                ))}
              </div>
            </div>
          )}

          {/* Value Axis */}
          {r.valueAxis && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Value Axis: {r.valueAxis.axisName}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-green-600 font-medium mb-1">Positive Polarity</p>
                  {r.valueAxis.positivePolarity.map((v, i) => <p key={i} className="text-xs text-green-800">• {v}</p>)}
                </div>
                <div className="bg-red-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-500 font-medium mb-1">Negative Polarity</p>
                  {r.valueAxis.negativePolarity.map((v, i) => <p key={i} className="text-xs text-red-700">• {v}</p>)}
                </div>
              </div>
              {r.valueAxis.evidence && (
                <p className="text-xs text-gray-500 mt-2 italic">&ldquo;{r.valueAxis.evidence}&rdquo;</p>
              )}
            </div>
          )}

          {/* Linked Scenarios */}
          {r.scenarios && r.scenarios.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Linked Scenarios</p>
              <div className="flex flex-wrap gap-2">
                {r.scenarios.map(({ scenario }) => (
                  <span key={scenario.id} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{scenario.scenarioName}</span>
                ))}
              </div>
            </div>
          )}

          {r.analystNote && <p className="text-xs text-gray-500 italic mb-3">{r.analystNote}</p>}

          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <ItemBadge status={r.itemStatus} />
            <div className="flex gap-1 ml-auto">
              <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50 h-7" onClick={() => update(r.id, 'APPROVED')} disabled={loading === r.id || r.itemStatus === 'APPROVED'}>
                <Check size={13} /> Approve
              </Button>
              <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 h-7" onClick={() => update(r.id, 'REJECTED')} disabled={loading === r.id || r.itemStatus === 'REJECTED'}>
                <X size={13} /> Reject
              </Button>
            </div>
          </div>
        </AccordionItem>
      ))}
    </div>
  )
}
