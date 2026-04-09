'use client'
import { useState } from 'react'
import type { MetaphoricalScenario, ItemStatus } from '@/types'
import { ItemBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AccordionItem } from '@/components/ui/accordion'
import { analysisApi } from '@/lib/api'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  scenarios: MetaphoricalScenario[]
  onRefresh: () => void
}

const statusColor: Record<string, string> = {
  DOMINANT: 'bg-blue-100 text-blue-800',
  CHALLENGER: 'bg-orange-100 text-orange-800',
  EMERGING: 'bg-green-100 text-green-800',
  PERIPHERAL: 'bg-gray-100 text-gray-600',
}

const valuationColor: Record<string, string> = {
  POSITIVE: 'text-green-600',
  NEGATIVE: 'text-red-500',
  NEUTRAL: 'text-gray-500',
}

export function Level3({ scenarios, onRefresh }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const update = async (id: string, status: ItemStatus) => {
    setLoading(id)
    try { await analysisApi.updateItemStatus('metaphoricalScenario', id, status); onRefresh() }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(null) }
  }

  if (scenarios.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No metaphorical scenarios found.</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''} identified</p>
      {scenarios.map(s => (
        <AccordionItem
          key={s.id}
          title={
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="font-semibold text-gray-900 truncate">{s.scenarioName}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', statusColor[s.status])}>{s.status}</span>
              <span className={cn('text-xs font-medium shrink-0', valuationColor[s.usageValuation])}>{s.usageValuation}</span>
              <ItemBadge status={s.itemStatus} />
            </div>
          }
        >
          {/* Social Groups */}
          {s.socialGroups && s.socialGroups.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Social Groups</p>
              <div className="space-y-2">
                {s.socialGroups.map(sg => (
                  <div key={sg.id} className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-sm font-medium text-gray-700">{sg.socialGroup}</p>
                    {sg.legitimizedActions.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {sg.legitimizedActions.map((a, i) => (
                          <li key={i} className="text-xs text-gray-500">• {a}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Narrative Sequence */}
          {s.narrativeSequence && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Narrative Sequence ({s.narrativeSequence.sequenceType})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Act 1 · Beginning', value: s.narrativeSequence.act1Beginning },
                  { label: 'Act 2 · Development', value: s.narrativeSequence.act2Development },
                  { label: 'Act 3 · Resolution', value: s.narrativeSequence.act3Resolution },
                ].map(act => (
                  <div key={act.label} className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-blue-500 font-medium mb-1">{act.label}</p>
                    <p className="text-xs text-blue-900">{act.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evaluative Bias */}
          {s.evaluativeBias && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Evaluative Bias</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-green-600 font-medium mb-1">Positive</p>
                  {s.evaluativeBias.positive.map((v, i) => <p key={i} className="text-xs text-green-800">• {v}</p>)}
                </div>
                <div className="bg-red-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-500 font-medium mb-1">Negative</p>
                  {s.evaluativeBias.negative.map((v, i) => <p key={i} className="text-xs text-red-700">• {v}</p>)}
                </div>
              </div>
            </div>
          )}

          {/* Affects */}
          {s.affects && s.affects.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Affects</p>
              <div className="space-y-2">
                {s.affects.map(a => (
                  <div key={a.id} className="bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">{a.affectName}</span>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded', a.affectType === 'FACILITATED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                        {a.affectType}
                      </span>
                    </div>
                    {a.description && <p className="text-xs text-gray-500">{a.description}</p>}
                    {a.socialFunction && <p className="text-xs text-gray-400 mt-1"><b>Function:</b> {a.socialFunction}</p>}
                    {a.linguisticMarkers && <p className="text-xs text-gray-400"><b>Markers:</b> {a.linguisticMarkers}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {s.analystNote && <p className="text-xs text-gray-500 italic mb-3">{s.analystNote}</p>}

          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <ItemBadge status={s.itemStatus} />
            <div className="flex gap-1 ml-auto">
              <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50 h-7" onClick={() => update(s.id, 'APPROVED')} disabled={loading === s.id || s.itemStatus === 'APPROVED'}>
                <Check size={13} /> Approve
              </Button>
              <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 h-7" onClick={() => update(s.id, 'REJECTED')} disabled={loading === s.id || s.itemStatus === 'REJECTED'}>
                <X size={13} /> Reject
              </Button>
            </div>
          </div>
        </AccordionItem>
      ))}
    </div>
  )
}
