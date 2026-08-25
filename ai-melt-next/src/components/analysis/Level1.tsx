'use client'

import { useMemo, useState } from 'react'
import type {
  ItemStatus,
  PrimaryMetaphor,
} from '@/types'
import { ItemBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AccordionItem } from '@/components/ui/accordion'
import { analysisApi } from '@/lib/api'
import {
  Check,
  ChevronRight,
  GitCompareArrows,
  X,
} from 'lucide-react'
import { useI18n } from '@/components/i18n/I18nProvider'

interface Props {
  metaphors: PrimaryMetaphor[]
  onRefresh: () => void
}

function MetaField({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null
  }

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <p className="mt-0.5 text-sm leading-relaxed text-gray-700">
        {value}
      </p>
    </div>
  )
}

function ApproachBadge({
  approach,
}: {
  approach?: string
}) {
  const { t } = useI18n()

  if (!approach) return null

  return (
    <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
      {t(`level1.approaches.${approach}`)}
    </span>
  )
}

function ItemStatusRow({
  id,
  model,
  status,
  analystNote,
  onUpdate,
}: {
  id: string
  model: string
  status: ItemStatus
  analystNote?: string
  onUpdate: () => void
}) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)

  const update = async (nextStatus: ItemStatus) => {
    setLoading(true)

    try {
      await analysisApi.updateItemStatus(
        model,
        id,
        nextStatus,
      )
      onUpdate()
    } catch (error: unknown) {
      alert(
        error instanceof Error
          ? error.message
          : t('level1.updateError'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
      <ItemBadge status={status} />

      {analystNote && (
        <span className="text-xs italic text-gray-500">
          {analystNote}
        </span>
      )}

      <div className="ml-auto flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-green-600 hover:bg-green-50"
          onClick={() => update('APPROVED')}
          disabled={
            loading || status === 'APPROVED'
          }
        >
          <Check size={13} />
          {t('level1.actions.approve')}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-red-500 hover:bg-red-50"
          onClick={() => update('REJECTED')}
          disabled={
            loading || status === 'REJECTED'
          }
        >
          <X size={13} />
          {t('level1.actions.reject')}
        </Button>
      </div>
    </div>
  )
}

export function Level1({
  metaphors,
  onRefresh,
}: Props) {
  const { t } = useI18n()

  const approachCount = useMemo(
    () =>
      new Set(
        metaphors
          .map((item) => item.approach)
          .filter(Boolean),
      ).size,
    [metaphors],
  )

  if (metaphors.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 px-5 py-10 text-center">
        <p className="text-sm font-medium text-gray-700">
          {t('level1.emptyTitle')}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {t('level1.emptyDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500">
          {t('level1.resultCount', {
            count: metaphors.length,
          })}
        </p>

        {approachCount > 1 && (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-700">
            <GitCompareArrows size={13} />
            {t('level1.multiApproach')}
          </span>
        )}
      </div>

      {metaphors.map((metaphor, index) => (
        <AccordionItem
          key={metaphor.id}
          title={
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <span className="shrink-0 font-mono text-xs text-gray-400">
                #{index + 1}
              </span>

              <span className="min-w-0 flex-1 truncate font-semibold text-gray-900">
                &ldquo;
                {metaphor.metaphoricalExpression}
                &rdquo;
              </span>

              <ApproachBadge
                approach={metaphor.approach}
              />

              {metaphor.page && (
                <span className="shrink-0 text-xs text-gray-400">
                  {t('common.page')}{' '}
                  {metaphor.page}
                </span>
              )}

              <ItemBadge
                status={metaphor.itemStatus}
              />
            </div>
          }
        >
          <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
            <MetaField
              label={t('level1.fields.sentenceId')}
              value={metaphor.sentenceId}
            />

            <MetaField
              label={t('level1.fields.chapter')}
              value={metaphor.chapter}
            />

            <MetaField
              label={t('level1.fields.focus')}
              value={metaphor.focus}
            />

            <MetaField
              label={t('level1.fields.lemma')}
              value={metaphor.focusLemma}
            />

            <MetaField
              label={t('level1.fields.pos')}
              value={metaphor.focusPartOfSpeech}
            />

            <MetaField
              label={t('level1.fields.context')}
              value={metaphor.context}
            />

            <MetaField
              label={t(
                'level1.fields.contextualMeaning',
              )}
              value={
                metaphor.contextualMeaning
              }
            />

            <MetaField
              label={t(
                'level1.fields.basicMeaning',
              )}
              value={metaphor.basicMeaning}
            />

            <MetaField
              label={t(
                'level1.fields.sourceDomain',
              )}
              value={metaphor.sourceDomain}
            />

            <MetaField
              label={t(
                'level1.fields.targetDomain',
              )}
              value={metaphor.targetDomain}
            />
          </div>

          {metaphor.expandedContext && (
            <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t(
                  'level1.fields.expandedContext',
                )}
              </span>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                {metaphor.expandedContext}
              </p>
            </div>
          )}

          {metaphor.conceptualMetaphor && (
            <div className="mt-4 rounded-lg bg-blue-50 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                {t(
                  'level1.fields.conceptualMetaphor',
                )}
              </span>
              <p className="mt-0.5 text-sm font-medium text-blue-900">
                {metaphor.conceptualMetaphor}
              </p>
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-[11px] uppercase tracking-wide text-gray-400">
                {t('level1.fields.approach')}
              </span>
              <p className="mt-0.5 text-sm font-medium text-gray-800">
                {metaphor.approach
                  ? t(
                      `level1.approaches.${metaphor.approach}`,
                    )
                  : t('common.unknown')}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-[11px] uppercase tracking-wide text-gray-400">
                {t('level1.fields.model')}
              </span>
              <p className="mt-0.5 truncate text-sm font-medium text-gray-800">
                {metaphor.modelName ?? '—'}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-[11px] uppercase tracking-wide text-gray-400">
                {t(
                  'level1.fields.crossApproachConfidence',
                )}
              </span>
              <p className="mt-0.5 text-sm font-medium text-gray-800">
                {metaphor.crossApproachConfidence ?? 1}
              </p>
            </div>
          </div>

          {metaphor.ontologicalMappings &&
            metaphor.ontologicalMappings.length >
              0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t(
                    'level1.mappings.ontological',
                  )}
                </p>

                <div className="space-y-2">
                  {metaphor.ontologicalMappings.map(
                    (mapping) => (
                      <div
                        key={mapping.id}
                        className="flex flex-wrap items-center gap-2 rounded bg-gray-50 px-3 py-2 text-sm"
                      >
                        <span className="text-gray-700">
                          {mapping.sourceElement}
                        </span>
                        <ChevronRight
                          size={12}
                          className="shrink-0 text-gray-400"
                        />
                        <span className="text-gray-700">
                          {mapping.targetElement}
                        </span>

                        {mapping.textualEvidence && (
                          <span className="ml-auto text-xs italic text-gray-400">
                            &ldquo;
                            {
                              mapping.textualEvidence
                            }
                            &rdquo;
                          </span>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {metaphor.epistemicMappings &&
            metaphor.epistemicMappings.length >
              0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t(
                    'level1.mappings.epistemic',
                  )}
                </p>

                <div className="space-y-2">
                  {metaphor.epistemicMappings.map(
                    (mapping) => (
                      <div
                        key={mapping.id}
                        className="flex flex-wrap items-center gap-2 rounded bg-gray-50 px-3 py-2 text-sm"
                      >
                        <span className="text-gray-700">
                          {mapping.sourceRelation}
                        </span>
                        <ChevronRight
                          size={12}
                          className="shrink-0 text-gray-400"
                        />
                        <span className="text-gray-700">
                          {mapping.targetInference}
                        </span>
                        <span className="ml-auto text-xs text-gray-400">
                          {mapping.inferenceType}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          <ItemStatusRow
            id={metaphor.id}
            model="primaryMetaphor"
            status={metaphor.itemStatus}
            analystNote={metaphor.analystNote}
            onUpdate={onRefresh}
          />
        </AccordionItem>
      ))}
    </div>
  )
}
