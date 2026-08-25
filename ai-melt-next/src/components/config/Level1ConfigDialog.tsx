'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Bot,
  Boxes,
  Database,
  Settings2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/input'
import { useI18n } from '@/components/i18n/I18nProvider'

import type {
  Level1Approach,
  Level1Config,
  Level1ConfigOverrides,
  Level1ConfigSource,
  Level1SentenceSelectionStrategy,
} from '@/types'

import {
  buildLevel1Overrides,
  cloneLevel1Config,
  DEFAULT_LEVEL1_CONFIG,
} from '@/lib/level1-config'

type Props =
  | {
      open: boolean
      onClose: () => void
      scope: 'corpus'
      config?: Level1Config
      saving?: boolean
      disabled?: boolean
      onSave: (
        config: Level1Config,
      ) => Promise<void> | void
    }
  | {
      open: boolean
      onClose: () => void
      scope: 'document'
      corpusConfig?: Level1Config
      effectiveConfig?: Level1Config
      source?: Level1ConfigSource
      saving?: boolean
      disabled?: boolean
      onSave: (
        overrides: Level1ConfigOverrides | null,
      ) => Promise<void> | void
    }

type DocumentMode = 'CORPUS' | 'DOCUMENT'

const STRATEGIES: Level1SentenceSelectionStrategy[] = [
  'RANDOM',
  'DISTRIBUTED',
  'BY_CHAPTER',
  'FIRST',
]

function NumberField({
  label,
  description,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string
  description?: string
  value: number
  min: number
  max: number
  disabled?: boolean
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-800">
        {label}
      </span>

      {description && (
        <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">
          {description}
        </span>
      )}

      <input
        type="number"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
      />
    </label>
  )
}

function CheckRow({
  checked,
  title,
  description,
  disabled,
  onChange,
}: {
  checked: boolean
  title: string
  description: string
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      className={[
        'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition',
        checked
          ? 'border-blue-200 bg-blue-50'
          : 'border-gray-200 bg-white',
        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'hover:border-blue-200',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-0.5 h-4 w-4 rounded border-gray-300"
      />

      <span>
        <span className="block text-sm font-semibold text-gray-900">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-relaxed text-gray-500">
          {description}
        </span>
      </span>
    </label>
  )
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {title}
          </h3>

          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {children}
      </div>
    </section>
  )
}

export function Level1ConfigDialog(props: Props) {
  const { t } = useI18n()

  /*
   * Extraemos primero las propiedades específicas de cada scope.
   *
   * Esto evita expresiones condicionales dentro del array de
   * dependencias del useEffect y permite que
   * react-hooks/exhaustive-deps las analice correctamente.
   */
  const corpusScopeConfig =
    props.scope === 'corpus'
      ? props.config
      : undefined

  const documentCorpusConfig =
    props.scope === 'document'
      ? props.corpusConfig
      : undefined

  const documentEffectiveConfig =
    props.scope === 'document'
      ? props.effectiveConfig
      : undefined

  const documentSource =
    props.scope === 'document'
      ? props.source
      : undefined

  /*
   * Configuración base del corpus.
   */
  const corpusConfig =
    props.scope === 'document'
      ? documentCorpusConfig ??
        DEFAULT_LEVEL1_CONFIG
      : corpusScopeConfig ??
        DEFAULT_LEVEL1_CONFIG

  /*
   * Configuración que debe mostrarse al abrir
   * el diálogo.
   */
  const initialConfig =
    props.scope === 'document'
      ? documentEffectiveConfig ??
        corpusConfig
      : corpusScopeConfig ??
        DEFAULT_LEVEL1_CONFIG

  const initialMode: DocumentMode =
    props.scope === 'document' &&
    documentSource === 'DOCUMENT'
      ? 'DOCUMENT'
      : 'CORPUS'

  const [config, setConfig] =
    useState<Level1Config>(() =>
      cloneLevel1Config(initialConfig),
    )

  const [documentMode, setDocumentMode] =
    useState<DocumentMode>(initialMode)

  /*
   * Cada vez que el diálogo se abre o cambia la
   * configuración proveniente del backend,
   * sincronizamos el estado local.
   */
  useEffect(() => {
    if (!props.open) return

    const nextCorpusConfig =
      props.scope === 'document'
        ? documentCorpusConfig ??
          DEFAULT_LEVEL1_CONFIG
        : corpusScopeConfig ??
          DEFAULT_LEVEL1_CONFIG

    const nextConfig =
      props.scope === 'document'
        ? documentEffectiveConfig ??
          nextCorpusConfig
        : corpusScopeConfig ??
          DEFAULT_LEVEL1_CONFIG

    const nextMode: DocumentMode =
      props.scope === 'document' &&
      documentSource === 'DOCUMENT'
        ? 'DOCUMENT'
        : 'CORPUS'

    setConfig(
      cloneLevel1Config(nextConfig),
    )

    setDocumentMode(nextMode)
  }, [
    props.open,
    props.scope,
    corpusScopeConfig,
    documentCorpusConfig,
    documentEffectiveConfig,
    documentSource,
  ])

  /*
   * En un documento que hereda la configuración
   * del corpus mostramos los controles, pero no
   * permitimos modificarlos.
   */
  const readOnly =
    Boolean(props.disabled) ||
    (props.scope === 'document' &&
      documentMode === 'CORPUS')

  /*
   * Estimación local de llamadas.
   *
   * La estimación definitiva antes de procesar
   * seguirá viniendo del endpoint /preview del
   * backend.
   */
  const requestsPerBatch =
    config.approaches.length

  const limitedCount =
    config.sentenceSelection.mode ===
    'LIMITED'
      ? config.sentenceSelection
          .maxSentences ?? 50
      : null

  const estimatedLimitedRequests =
    useMemo(() => {
      if (limitedCount === null) {
        return null
      }

      const batchSize = Math.max(
        config.batchSize,
        1,
      )

      return (
        Math.ceil(
          limitedCount / batchSize,
        ) * requestsPerBatch
      )
    }, [
      limitedCount,
      config.batchSize,
      requestsPerBatch,
    ])

  const setApproach = (
    approach: Level1Approach,
    enabled: boolean,
  ) => {
    setConfig((previous) => {
      const approaches = enabled
        ? Array.from(
            new Set([
              ...previous.approaches,
              approach,
            ]),
          )
        : previous.approaches.filter(
            (item) =>
              item !== approach,
          )

      return {
        ...previous,
        approaches,
      }
    })
  }

  const handleDocumentMode = (
    mode: DocumentMode,
  ) => {
    if (props.scope !== 'document') {
      return
    }

    setDocumentMode(mode)

    if (mode === 'CORPUS') {
      /*
       * Al volver a herencia mostramos
       * inmediatamente los valores vigentes
       * del corpus.
       */
      setConfig(
        cloneLevel1Config(
          corpusConfig,
        ),
      )

      return
    }

    /*
     * Al personalizar partimos de la
     * configuración efectiva actual para que
     * el usuario modifique solo lo necesario.
     */
    setConfig(
      cloneLevel1Config(
        documentEffectiveConfig ??
          corpusConfig,
      ),
    )
  }

  const handleSave = async () => {
    /*
     * Debe existir al menos un enfoque.
     */
    if (
      config.approaches.length === 0
    ) {
      alert(
        t(
          'level1Config.validation.approachRequired',
        ),
      )
      return
    }

    /*
     * En modo limitado debe existir al menos
     * una oración seleccionada.
     */
    if (
      config.sentenceSelection.mode ===
        'LIMITED' &&
      (!config.sentenceSelection
        .maxSentences ||
        config.sentenceSelection
          .maxSentences < 1)
    ) {
      alert(
        t(
          'level1Config.validation.maxSentences',
        ),
      )
      return
    }

    /*
     * El tamaño del lote debe ser válido.
     */
    if (
      !Number.isFinite(
        config.batchSize,
      ) ||
      config.batchSize < 1 ||
      config.batchSize > 100
    ) {
      return
    }

    if (props.scope === 'corpus') {
      await props.onSave(config)
      return
    }

    /*
     * null = eliminar overrides y volver
     * completamente a la herencia del corpus.
     */
    if (
      documentMode === 'CORPUS'
    ) {
      await props.onSave(null)
      return
    }

    /*
     * Guardamos únicamente las diferencias
     * respecto del corpus.
     */
    await props.onSave(
      buildLevel1Overrides(
        corpusConfig,
        config,
      ),
    )
  }

  const dialogTitle =
    props.scope === 'corpus'
      ? t(
          'level1Config.corpusTitle',
        )
      : t(
          'level1Config.documentTitle',
        )

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      title={dialogTitle}
      className="max-h-[calc(100dvh-2rem)] max-w-3xl overflow-hidden"
    >
      <DialogBody>
        <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto overscroll-contain pr-1">
          <div className="space-y-5">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex gap-3">
                <Settings2
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-700"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-950">
                    {t(
                      'level1Config.aboutTitle',
                    )}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-blue-900/75">
                    {props.scope ===
                    'corpus'
                      ? t(
                          'level1Config.corpusDescription',
                        )
                      : t(
                          'level1Config.documentDescription',
                        )}
                  </p>
                </div>
              </div>
            </div>

            {props.scope ===
              'document' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    handleDocumentMode(
                      'CORPUS',
                    )
                  }
                  disabled={
                    props.disabled ||
                    props.saving
                  }
                  className={[
                    'rounded-xl border p-4 text-left transition',
                    documentMode ===
                    'CORPUS'
                      ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100'
                      : 'border-gray-200 bg-white hover:border-blue-200',
                  ].join(' ')}
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {t(
                      'level1Config.useCorpus',
                    )}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {t(
                      'level1Config.useCorpusDescription',
                    )}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDocumentMode(
                      'DOCUMENT',
                    )
                  }
                  disabled={
                    props.disabled ||
                    props.saving
                  }
                  className={[
                    'rounded-xl border p-4 text-left transition',
                    documentMode ===
                    'DOCUMENT'
                      ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100'
                      : 'border-gray-200 bg-white hover:border-blue-200',
                  ].join(' ')}
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {t(
                      'level1Config.customizeDocument',
                    )}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {t(
                      'level1Config.customizeDocumentDescription',
                    )}
                  </p>
                </button>
              </div>
            )}

            {props.scope ===
              'document' &&
              documentMode ===
                'CORPUS' && (
                <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-950">
                      {t(
                        'level1Config.sourceCorpus',
                      )}
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-blue-900/75">
                      {t(
                        'level1Config.inheritedLocked',
                      )}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() =>
                      handleDocumentMode(
                        'DOCUMENT',
                      )
                    }
                    disabled={
                      props.disabled ||
                      props.saving
                    }
                    className="shrink-0 border-blue-200 bg-white text-blue-700 hover:bg-blue-100"
                  >
                    {t(
                      'level1Config.customizeDocument',
                    )}
                  </Button>
                </div>
              )}

            <Section
              icon={
                <Bot size={16} />
              }
              title={t(
                'level1Config.sections.approaches',
              )}
              description={t(
                'level1Config.sections.approachesDescription',
              )}
            >
              <CheckRow
                checked={config.approaches.includes(
                  'OPENAI',
                )}
                title={t(
                  'level1Config.approaches.OPENAI',
                )}
                description={t(
                  'level1Config.approaches.OPENAIDescription',
                )}
                disabled={readOnly}
                onChange={(checked) =>
                  setApproach(
                    'OPENAI',
                    checked,
                  )
                }
              />

              <CheckRow
                checked={config.approaches.includes(
                  'CLAUDE',
                )}
                title={t(
                  'level1Config.approaches.CLAUDE',
                )}
                description={t(
                  'level1Config.approaches.CLAUDEDescription',
                )}
                disabled={readOnly}
                onChange={(checked) =>
                  setApproach(
                    'CLAUDE',
                    checked,
                  )
                }
              />
            </Section>

            <Section
              icon={
                <Database size={16} />
              }
              title={t(
                'level1Config.sections.sentences',
              )}
              description={t(
                'level1Config.sections.sentencesDescription',
              )}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() =>
                    setConfig(
                      (previous) => ({
                        ...previous,
                        sentenceSelection:
                          {
                            ...previous.sentenceSelection,
                            mode: 'ALL',
                            maxSentences:
                              null,
                          },
                      }),
                    )
                  }
                  className={[
                    'rounded-xl border p-4 text-left transition',
                    config
                      .sentenceSelection
                      .mode === 'ALL'
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-white',
                    readOnly
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:border-blue-200',
                  ].join(' ')}
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {t(
                      'level1Config.sentences.all',
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {t(
                      'level1Config.sentences.allDescription',
                    )}
                  </p>
                </button>

                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() =>
                    setConfig(
                      (previous) => ({
                        ...previous,
                        sentenceSelection:
                          {
                            ...previous.sentenceSelection,
                            mode: 'LIMITED',
                            maxSentences:
                              previous
                                .sentenceSelection
                                .maxSentences ??
                              50,
                          },
                      }),
                    )
                  }
                  className={[
                    'rounded-xl border p-4 text-left transition',
                    config
                      .sentenceSelection
                      .mode === 'LIMITED'
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-white',
                    readOnly
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:border-blue-200',
                  ].join(' ')}
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {t(
                      'level1Config.sentences.limited',
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {t(
                      'level1Config.sentences.limitedDescription',
                    )}
                  </p>
                </button>
              </div>

              {config
                .sentenceSelection
                .mode === 'LIMITED' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    label={t(
                      'level1Config.sentences.maxSentences',
                    )}
                    description={t(
                      'level1Config.sentences.maxSentencesDescription',
                    )}
                    value={
                      config
                        .sentenceSelection
                        .maxSentences ??
                      50
                    }
                    min={1}
                    max={100000}
                    disabled={
                      readOnly
                    }
                    onChange={(
                      value,
                    ) =>
                      setConfig(
                        (
                          previous,
                        ) => ({
                          ...previous,
                          sentenceSelection:
                            {
                              ...previous.sentenceSelection,
                              maxSentences:
                                Math.max(
                                  1,
                                  Math.round(
                                    value ||
                                      1,
                                  ),
                                ),
                            },
                        }),
                      )
                    }
                  />

                  <div>
                    <Select
                      label={t(
                        'level1Config.sentences.strategy',
                      )}
                      value={
                        config
                          .sentenceSelection
                          .strategy
                      }
                      disabled={
                        readOnly
                      }
                      onChange={(
                        event,
                      ) =>
                        setConfig(
                          (
                            previous,
                          ) => ({
                            ...previous,
                            sentenceSelection:
                              {
                                ...previous.sentenceSelection,
                                strategy:
                                  event
                                    .target
                                    .value as Level1SentenceSelectionStrategy,
                              },
                          }),
                        )
                      }
                    >
                      {STRATEGIES.map(
                        (
                          strategy,
                        ) => (
                          <option
                            key={
                              strategy
                            }
                            value={
                              strategy
                            }
                          >
                            {t(
                              `level1Config.strategies.${strategy}`,
                            )}
                          </option>
                        ),
                      )}
                    </Select>

                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      {t(
                        `level1Config.strategyDescriptions.${config.sentenceSelection.strategy}`,
                      )}
                    </p>
                  </div>
                </div>
              )}

              {config
                .sentenceSelection
                .mode === 'LIMITED' &&
                config
                  .sentenceSelection
                  .strategy ===
                  'RANDOM' && (
                  <NumberField
                    label={t(
                      'level1Config.sentences.randomSeed',
                    )}
                    description={t(
                      'level1Config.sentences.randomSeedDescription',
                    )}
                    value={
                      config
                        .sentenceSelection
                        .randomSeed
                    }
                    min={0}
                    max={
                      2147483647
                    }
                    disabled={
                      readOnly
                    }
                    onChange={(
                      value,
                    ) =>
                      setConfig(
                        (
                          previous,
                        ) => ({
                          ...previous,
                          sentenceSelection:
                            {
                              ...previous.sentenceSelection,
                              randomSeed:
                                Math.max(
                                  0,
                                  Math.round(
                                    value ||
                                      0,
                                  ),
                                ),
                            },
                        }),
                      )
                    }
                  />
                )}
            </Section>

            <Section
              icon={
                <Boxes size={16} />
              }
              title={t(
                'level1Config.sections.execution',
              )}
              description={t(
                'level1Config.sections.executionDescription',
              )}
            >
              <NumberField
                label={t(
                  'level1Config.execution.batchSize',
                )}
                description={t(
                  'level1Config.execution.batchSizeDescription',
                )}
                value={
                  config.batchSize
                }
                min={1}
                max={100}
                disabled={readOnly}
                onChange={(value) =>
                  setConfig(
                    (previous) => ({
                      ...previous,
                      batchSize:
                        Math.max(
                          1,
                          Math.min(
                            100,
                            Math.round(
                              value ||
                                1,
                            ),
                          ),
                        ),
                    }),
                  )
                }
              />

              {estimatedLimitedRequests !==
                null && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                  {t(
                    'level1Config.execution.estimate',
                    {
                      sentences:
                        limitedCount ??
                        0,
                      approaches:
                        config
                          .approaches
                          .length,
                      requests:
                        estimatedLimitedRequests,
                    },
                  )}
                </div>
              )}
            </Section>

            <Section
              icon={
                <Settings2
                  size={16}
                />
              }
              title={t(
                'level1Config.sections.output',
              )}
              description={t(
                'level1Config.sections.outputDescription',
              )}
            >
              <CheckRow
                checked={
                  config.output
                    .ontologicalMappings
                }
                title={t(
                  'level1Config.output.ontologicalMappings',
                )}
                description={t(
                  'level1Config.output.ontologicalMappingsDescription',
                )}
                disabled={readOnly}
                onChange={(checked) =>
                  setConfig(
                    (previous) => ({
                      ...previous,
                      output: {
                        ...previous.output,
                        ontologicalMappings:
                          checked,
                      },
                    }),
                  )
                }
              />

              <CheckRow
                checked={
                  config.output
                    .epistemicMappings
                }
                title={t(
                  'level1Config.output.epistemicMappings',
                )}
                description={t(
                  'level1Config.output.epistemicMappingsDescription',
                )}
                disabled={readOnly}
                onChange={(checked) =>
                  setConfig(
                    (previous) => ({
                      ...previous,
                      output: {
                        ...previous.output,
                        epistemicMappings:
                          checked,
                      },
                    }),
                  )
                }
              />
            </Section>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
              {t(
                'level1Config.outdatedWarning',
              )}
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={props.onClose}
          disabled={props.saving}
        >
          {t(
            'level1Config.cancel',
          )}
        </Button>

        <Button
          onClick={handleSave}
          loading={props.saving}
          disabled={
            props.disabled ||
            props.saving
          }
          className="bg-blue-700 text-white hover:bg-blue-800"
        >
          {t(
            'level1Config.save',
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}