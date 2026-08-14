'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Info,
  Plus,
  Settings2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/accordion'
import { useI18n } from '@/components/i18n/I18nProvider'
import type {
  Level0ChapterDetectionMethod,
  Level0Config,
  Level0ConfigOverrides,
  Level0ConfigSource,
} from '@/types'
import {
  buildLevel0Overrides,
  cloneLevel0Config,
  DEFAULT_LEVEL0_CONFIG,
  hasLevel0Overrides,
} from '@/lib/level0-config'

type CommonProps = {
  open: boolean
  onClose: () => void
  saving?: boolean
  disabled?: boolean
}

type CorpusProps = CommonProps & {
  scope: 'corpus'
  config?: Level0Config | null
  onSave: (config: Level0Config) => Promise<void> | void
}

type DocumentProps = CommonProps & {
  scope: 'document'
  corpusConfig?: Level0Config | null
  effectiveConfig?: Level0Config | null
  source?: Level0ConfigSource
  onSave: (
    overrides: Level0ConfigOverrides | null,
  ) => Promise<void> | void
}

type Props = CorpusProps | DocumentProps

type DocumentMode = 'CORPUS' | 'DOCUMENT'

const METHODS: Level0ChapterDetectionMethod[] = [
  'AUTO',
  'TOC',
  'PRINTED_INDEX',
  'FONT_SIZE',
  'NONE',
]

function SwitchRow({
  checked,
  onChange,
  title,
  description,
  disabled,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  title: string
  description?: string
  disabled?: boolean
}) {
  return (
    <label
      className={`flex items-start justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3 ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
    >
      <span>
        <span className="block text-sm font-medium text-gray-900">
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">
            {description}
          </span>
        )}
      </span>

      <span className="relative mt-0.5 inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-blue-700 peer-disabled:bg-gray-100" />
        <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-3 p-5">{children}</div>
    </section>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  description,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  disabled?: boolean
  description?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-800">
        {label}
      </span>
      {description && (
        <span className="mt-0.5 block text-xs text-gray-500">
          {description}
        </span>
      )}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        value={value}
        onChange={(event) => {
          const parsed = Number(event.target.value)
          if (Number.isFinite(parsed)) onChange(parsed)
        }}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
      />
    </label>
  )
}

export function Level0ConfigDialog(props: Props) {
  const { t } = useI18n()

  const corpusConfigProp =
    props.scope === 'corpus' ? props.config : props.corpusConfig
  const effectiveConfigProp =
    props.scope === 'document' ? props.effectiveConfig : undefined
  const sourceProp =
    props.scope === 'document' ? props.source : undefined

  const initialConfig = useMemo(() => {
    if (props.scope === 'corpus') {
      return cloneLevel0Config(
        corpusConfigProp ?? DEFAULT_LEVEL0_CONFIG,
      )
    }

    return cloneLevel0Config(
      effectiveConfigProp ??
        corpusConfigProp ??
        DEFAULT_LEVEL0_CONFIG,
    )
  }, [props.scope, corpusConfigProp, effectiveConfigProp])

  const [config, setConfig] = useState<Level0Config>(
    initialConfig,
  )
  const [documentMode, setDocumentMode] =
    useState<DocumentMode>('CORPUS')
  const [useExplicitPageRanges, setUseExplicitPageRanges] =
    useState(false)

  useEffect(() => {
    if (!props.open) return

    setConfig(initialConfig)

    if (props.scope === 'document') {
      setDocumentMode(
        sourceProp === 'DOCUMENT' ? 'DOCUMENT' : 'CORPUS',
      )
      setUseExplicitPageRanges(
        initialConfig.excludedPageRanges !== null,
      )
    } else {
      setDocumentMode('CORPUS')
      setUseExplicitPageRanges(false)
    }
  }, [props.open, props.scope, initialConfig, sourceProp, corpusConfigProp])

  const readOnly =
    props.disabled ||
    (props.scope === 'document' && documentMode === 'CORPUS')

  const setChapterDetection = (
    patch: Partial<Level0Config['chapterDetection']>,
  ) => {
    setConfig((previous) => ({
      ...previous,
      chapterDetection: {
        ...previous.chapterDetection,
        ...patch,
      },
    }))
  }

  const setCleaning = (
    patch: Partial<Level0Config['cleaning']>,
  ) => {
    setConfig((previous) => ({
      ...previous,
      cleaning: {
        ...previous.cleaning,
        ...patch,
      },
    }))
  }

  const setSegmentation = (
    patch: Partial<Level0Config['segmentation']>,
  ) => {
    setConfig((previous) => ({
      ...previous,
      segmentation: {
        ...previous.segmentation,
        ...patch,
      },
    }))
  }

  const handleDocumentMode = (mode: DocumentMode) => {
    if (props.scope !== 'document') return

    setDocumentMode(mode)

    if (mode === 'CORPUS') {
      const inherited = cloneLevel0Config(
        props.corpusConfig ?? DEFAULT_LEVEL0_CONFIG,
      )
      setConfig(inherited)
      setUseExplicitPageRanges(
        inherited.excludedPageRanges !== null,
      )
      return
    }

    setConfig(
      cloneLevel0Config(
        props.effectiveConfig ??
          props.corpusConfig ??
          DEFAULT_LEVEL0_CONFIG,
      ),
    )
  }

  const setPageRangesEnabled = (enabled: boolean) => {
    setUseExplicitPageRanges(enabled)
    setConfig((previous) => ({
      ...previous,
      excludedPageRanges: enabled
        ? previous.excludedPageRanges ?? []
        : null,
    }))
  }

  const addPageRange = () => {
    setConfig((previous) => ({
      ...previous,
      excludedPageRanges: [
        ...(previous.excludedPageRanges ?? []),
        [1, 1],
      ],
    }))
  }

  const updatePageRange = (
    index: number,
    side: 0 | 1,
    value: number,
  ) => {
    setConfig((previous) => {
      const ranges = [
        ...(previous.excludedPageRanges ?? []),
      ].map(([start, end]) => [start, end] as [number, number])

      if (!ranges[index]) return previous
      ranges[index][side] = Math.max(1, Math.round(value))

      return {
        ...previous,
        excludedPageRanges: ranges,
      }
    })
  }

  const removePageRange = (index: number) => {
    setConfig((previous) => ({
      ...previous,
      excludedPageRanges: (
        previous.excludedPageRanges ?? []
      ).filter((_, rangeIndex) => rangeIndex !== index),
    }))
  }

  const handleSave = async () => {
    const normalizedConfig: Level0Config = {
      ...config,
      cleaning: {
        ...config.cleaning,
        repeatedHeaderThreshold: Math.min(
          0.95,
          Math.max(0.05, config.cleaning.repeatedHeaderThreshold),
        ),
        minLineLength: Math.max(
          0,
          Math.round(config.cleaning.minLineLength),
        ),
        additionalHeadersFooters:
          config.cleaning.additionalHeadersFooters
            .map((value) => value.replace(/\s+/g, ' ').trim())
            .filter(Boolean),
      },
      segmentation: {
        minChars: Math.max(
          1,
          Math.round(config.segmentation.minChars),
        ),
        maxChars: Math.max(
          Math.max(1, Math.round(config.segmentation.minChars)),
          Math.round(config.segmentation.maxChars),
        ),
      },
      excludedPageRanges:
        props.scope === 'document' && useExplicitPageRanges
          ? (config.excludedPageRanges ?? []).map(
              ([start, end]) =>
                [
                  Math.min(start, end),
                  Math.max(start, end),
                ] as [number, number],
            )
          : config.excludedPageRanges,
    }

    if (props.scope === 'corpus') {
      await props.onSave(normalizedConfig)
      return
    }

    if (documentMode === 'CORPUS') {
      await props.onSave(null)
      return
    }

    const corpusConfig =
      props.corpusConfig ?? DEFAULT_LEVEL0_CONFIG
    const overrides = buildLevel0Overrides(
      normalizedConfig,
      corpusConfig,
    )

    await props.onSave(
      hasLevel0Overrides(overrides) ? overrides : null,
    )
  }

  const dialogTitle =
    props.scope === 'corpus'
      ? t('level0Config.corpusTitle')
      : t('level0Config.documentTitle')

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      title={dialogTitle}
      className="max-w-3xl max-h-[calc(100dvh-2rem)] overflow-hidden"
    >
      <DialogBody>
        <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto overscroll-contain pr-1">
          <div className="space-y-5">
          <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            <Info size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">
                {t('level0Config.aboutTitle')}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-blue-900/80">
                {props.scope === 'corpus'
                  ? t('level0Config.corpusDescription')
                  : t('level0Config.documentDescription')}
              </p>
            </div>
          </div>

          {props.scope === 'document' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={props.disabled}
                onClick={() => handleDocumentMode('CORPUS')}
                className={`rounded-xl border p-4 text-left transition ${
                  documentMode === 'CORPUS'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full border ${
                      documentMode === 'CORPUS'
                        ? 'border-blue-700 bg-blue-700'
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    {t('level0Config.useCorpus')}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  {t('level0Config.useCorpusDescription')}
                </p>
              </button>

              <button
                type="button"
                disabled={props.disabled}
                onClick={() => handleDocumentMode('DOCUMENT')}
                className={`rounded-xl border p-4 text-left transition ${
                  documentMode === 'DOCUMENT'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full border ${
                      documentMode === 'DOCUMENT'
                        ? 'border-blue-700 bg-blue-700'
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    {t('level0Config.customizeDocument')}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  {t('level0Config.customizeDocumentDescription')}
                </p>
              </button>
            </div>
          )}

          {props.scope === 'document' && documentMode === 'CORPUS' && (
            <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-950">
                  {t('level0Config.useCorpus')}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-blue-900/75">
                  {t('level0Config.useCorpusDescription')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleDocumentMode('DOCUMENT')}
                disabled={props.disabled || props.saving}
                className="shrink-0 border-blue-200 bg-white text-blue-700 hover:bg-blue-100"
              >
                {t('level0Config.customizeDocument')}
              </Button>
            </div>
          )}

          <Section
            title={t('level0Config.sections.chapters')}
            description={t(
              'level0Config.sections.chaptersDescription',
            )}
          >
            <SwitchRow
              checked={config.chapterDetection.enabled}
              disabled={readOnly}
              onChange={(enabled) =>
                setChapterDetection({ enabled })
              }
              title={t('level0Config.chapterDetection.enabled')}
              description={t(
                'level0Config.chapterDetection.enabledDescription',
              )}
            />

            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                {t('level0Config.chapterDetection.method')}
              </span>
              <select
                value={config.chapterDetection.method}
                disabled={readOnly || !config.chapterDetection.enabled}
                onChange={(event) =>
                  setChapterDetection({
                    method: event.target
                      .value as Level0ChapterDetectionMethod,
                  })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
              >
                {METHODS.map((method) => (
                  <option key={method} value={method}>
                    {t(`level0Config.methods.${method}`)}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-gray-500">
                {t(
                  `level0Config.methodDescriptions.${config.chapterDetection.method}`,
                )}
              </span>
            </label>
          </Section>

          <Section
            title={t('level0Config.sections.cleaning')}
            description={t(
              'level0Config.sections.cleaningDescription',
            )}
          >
            <SwitchRow
              checked={config.cleaning.repairHyphenation}
              disabled={readOnly}
              onChange={(repairHyphenation) =>
                setCleaning({ repairHyphenation })
              }
              title={t('level0Config.cleaning.repairHyphenation')}
              description={t(
                'level0Config.cleaning.repairHyphenationDescription',
              )}
            />

            <SwitchRow
              checked={config.cleaning.detectRepeatedHeaders}
              disabled={readOnly}
              onChange={(detectRepeatedHeaders) =>
                setCleaning({ detectRepeatedHeaders })
              }
              title={t(
                'level0Config.cleaning.detectRepeatedHeaders',
              )}
              description={t(
                'level0Config.cleaning.detectRepeatedHeadersDescription',
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                label={t(
                  'level0Config.cleaning.repeatedHeaderThreshold',
                )}
                description={t(
                  'level0Config.cleaning.repeatedHeaderThresholdDescription',
                )}
                value={config.cleaning.repeatedHeaderThreshold}
                min={0.05}
                max={0.95}
                step={0.05}
                disabled={
                  readOnly ||
                  !config.cleaning.detectRepeatedHeaders
                }
                onChange={(repeatedHeaderThreshold) =>
                  setCleaning({ repeatedHeaderThreshold })
                }
              />

              <NumberField
                label={t('level0Config.cleaning.minLineLength')}
                description={t(
                  'level0Config.cleaning.minLineLengthDescription',
                )}
                value={config.cleaning.minLineLength}
                min={0}
                max={500}
                disabled={readOnly}
                onChange={(minLineLength) =>
                  setCleaning({ minLineLength })
                }
              />
            </div>

            <SwitchRow
              checked={config.cleaning.excludeFrontMatter}
              disabled={readOnly}
              onChange={(excludeFrontMatter) =>
                setCleaning({ excludeFrontMatter })
              }
              title={t('level0Config.cleaning.excludeFrontMatter')}
              description={t(
                'level0Config.cleaning.excludeFrontMatterDescription',
              )}
            />

            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                {t(
                  'level0Config.cleaning.additionalHeadersFooters',
                )}
              </span>
              <span className="mt-0.5 block text-xs text-gray-500">
                {t(
                  'level0Config.cleaning.additionalHeadersFootersDescription',
                )}
              </span>
              <textarea
                rows={5}
                disabled={readOnly}
                value={config.cleaning.additionalHeadersFooters.join(
                  '\n',
                )}
                onChange={(event) =>
                  setCleaning({
                    additionalHeadersFooters:
                      event.target.value.split(/\r?\n/),
                  })
                }
                placeholder={t(
                  'level0Config.cleaning.additionalHeadersFootersPlaceholder',
                )}
                className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </label>
          </Section>

          <Section
            title={t('level0Config.sections.footnotes')}
            description={t(
              'level0Config.sections.footnotesDescription',
            )}
          >
            <SwitchRow
              checked={config.footnotes.extract}
              disabled={readOnly}
              onChange={(extract) =>
                setConfig((previous) => ({
                  ...previous,
                  footnotes: { extract },
                }))
              }
              title={t('level0Config.footnotes.extract')}
              description={t(
                'level0Config.footnotes.extractDescription',
              )}
            />
          </Section>

          <Section
            title={t('level0Config.sections.segmentation')}
            description={t(
              'level0Config.sections.segmentationDescription',
            )}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                label={t('level0Config.segmentation.minChars')}
                description={t(
                  'level0Config.segmentation.minCharsDescription',
                )}
                value={config.segmentation.minChars}
                min={1}
                max={5000}
                disabled={readOnly}
                onChange={(minChars) =>
                  setSegmentation({ minChars })
                }
              />

              <NumberField
                label={t('level0Config.segmentation.maxChars')}
                description={t(
                  'level0Config.segmentation.maxCharsDescription',
                )}
                value={config.segmentation.maxChars}
                min={2}
                max={20000}
                disabled={readOnly}
                onChange={(maxChars) =>
                  setSegmentation({ maxChars })
                }
              />
            </div>
          </Section>

          {props.scope === 'document' && (
            <Section
              title={t('level0Config.sections.pageExclusions')}
              description={t(
                'level0Config.sections.pageExclusionsDescription',
              )}
            >
              <SwitchRow
                checked={useExplicitPageRanges}
                disabled={readOnly}
                onChange={setPageRangesEnabled}
                title={t(
                  'level0Config.pageExclusions.explicitRanges',
                )}
                description={t(
                  'level0Config.pageExclusions.explicitRangesDescription',
                )}
              />

              {useExplicitPageRanges && (
                <div className="space-y-3">
                  {(config.excludedPageRanges ?? []).map(
                    ([start, end], index) => (
                      <div
                        key={`${index}-${start}-${end}`}
                        className="grid grid-cols-[1fr_1fr_auto] items-end gap-3"
                      >
                        <NumberField
                          label={t(
                            'level0Config.pageExclusions.from',
                          )}
                          value={start}
                          min={1}
                          max={100000}
                          disabled={readOnly}
                          onChange={(value) =>
                            updatePageRange(index, 0, value)
                          }
                        />
                        <NumberField
                          label={t(
                            'level0Config.pageExclusions.to',
                          )}
                          value={end}
                          min={1}
                          max={100000}
                          disabled={readOnly}
                          onChange={(value) =>
                            updatePageRange(index, 1, value)
                          }
                        />
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => removePageRange(index)}
                          aria-label={t(
                            'level0Config.pageExclusions.remove',
                          )}
                          className="mb-0.5 rounded-lg border border-gray-200 p-2 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ),
                  )}

                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={addPageRange}
                    className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus size={15} />
                    {t('level0Config.pageExclusions.add')}
                  </button>

                  {(config.excludedPageRanges ?? []).length === 0 && (
                    <p className="text-xs leading-relaxed text-amber-700">
                      {t(
                        'level0Config.pageExclusions.emptyExplicit',
                      )}
                    </p>
                  )}
                </div>
              )}
            </Section>
          )}

          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
            <Settings2 size={17} className="shrink-0" />
            <p>{t('level0Config.outdatedWarning')}</p>
          </div>

          {props.disabled && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <Spinner size="sm" />
              {t('level0Config.processingLocked')}
            </div>
          )}
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={props.onClose}
          disabled={props.saving}
        >
          {t('level0Config.cancel')}
        </Button>
        <Button
          onClick={handleSave}
          loading={props.saving}
          disabled={props.saving || props.disabled}
          className="bg-blue-700 text-white hover:bg-blue-800"
        >
          {t('level0Config.save')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
