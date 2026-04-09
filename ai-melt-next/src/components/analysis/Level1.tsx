'use client'
import { useState } from 'react'
import type { PrimaryMetaphor, ItemStatus } from '@/types'
import { ItemBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AccordionItem } from '@/components/ui/accordion'
import { analysisApi } from '@/lib/api'
import { Check, X, ChevronRight } from 'lucide-react'

interface Props {
  metaphors: PrimaryMetaphor[]
  onRefresh: () => void
}

function MetaField({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null
  return (
    <div>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <p className="text-sm text-gray-700 mt-0.5">{value}</p>
    </div>
  )
}

function ItemStatusRow({
  id, model, status, analystNote, onUpdate,
}: {
  id: string; model: string; status: ItemStatus; analystNote?: string; onUpdate: () => void
}) {
  const [loading, setLoading] = useState(false)

  const update = async (s: ItemStatus) => {
    setLoading(true)
    try { await analysisApi.updateItemStatus(model, id, s); onUpdate() }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
      <ItemBadge status={status} />
      {analystNote && <span className="text-xs text-gray-500 italic">{analystNote}</span>}
      <div className="flex gap-1 ml-auto">
        <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50 h-7" onClick={() => update('APPROVED')} disabled={loading || status === 'APPROVED'}>
          <Check size={13} /> Approve
        </Button>
        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 h-7" onClick={() => update('REJECTED')} disabled={loading || status === 'REJECTED'}>
          <X size={13} /> Reject
        </Button>
      </div>
    </div>
  )
}

export function Level1({ metaphors, onRefresh }: Props) {
  if (metaphors.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No primary metaphors found.</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{metaphors.length} primary metaphor{metaphors.length !== 1 ? 's' : ''} identified</p>
      {metaphors.map((m, i) => (
        <AccordionItem
          key={m.id}
          title={
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-xs text-gray-400 font-mono shrink-0">#{i + 1}</span>
              <span className="font-semibold text-gray-900 truncate">&ldquo;{m.metaphoricalExpression}&rdquo;</span>
              {m.page && <span className="text-xs text-gray-400 shrink-0">p.{m.page}</span>}
              <ItemBadge status={m.itemStatus} />
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <MetaField label="Context" value={m.context} />
            <MetaField label="Focus" value={m.focus} />
            <MetaField label="Contextual Meaning" value={m.contextualMeaning} />
            <MetaField label="Basic Meaning" value={m.basicMeaning} />
            <MetaField label="Source Domain" value={m.sourceDomain} />
            <MetaField label="Target Domain" value={m.targetDomain} />
          </div>
          {m.conceptualMetaphor && (
            <div className="mt-3 bg-blue-50 rounded-lg px-3 py-2">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Conceptual Metaphor</span>
              <p className="text-sm text-blue-900 font-medium mt-0.5">{m.conceptualMetaphor}</p>
            </div>
          )}

          {/* Ontological Mappings */}
          {m.ontologicalMappings && m.ontologicalMappings.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ontological Mappings</p>
              <div className="space-y-2">
                {m.ontologicalMappings.map(om => (
                  <div key={om.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded px-3 py-2">
                    <span className="text-gray-700">{om.sourceElement}</span>
                    <ChevronRight size={12} className="text-gray-400 shrink-0" />
                    <span className="text-gray-700">{om.targetElement}</span>
                    {om.textualEvidence && <span className="text-gray-400 text-xs ml-auto italic">&ldquo;{om.textualEvidence}&rdquo;</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Epistemic Mappings */}
          {m.epistemicMappings && m.epistemicMappings.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Epistemic Mappings</p>
              <div className="space-y-2">
                {m.epistemicMappings.map(em => (
                  <div key={em.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded px-3 py-2">
                    <span className="text-gray-700">{em.sourceRelation}</span>
                    <ChevronRight size={12} className="text-gray-400 shrink-0" />
                    <span className="text-gray-700">{em.targetInference}</span>
                    <span className="text-xs text-gray-400 ml-auto">{em.inferenceType}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ItemStatusRow id={m.id} model="primaryMetaphor" status={m.itemStatus} analystNote={m.analystNote} onUpdate={onRefresh} />
        </AccordionItem>
      ))}
    </div>
  )
}
