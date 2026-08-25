'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  Level1RunMetadata,
  PrimaryMetaphor,
} from '@/types'
import { useI18n } from '@/components/i18n/I18nProvider'

interface Props {
  metaphors: PrimaryMetaphor[]
  metadata?: Level1RunMetadata | null
}

function normalize(value?: string | null) {
  return value?.trim() || ''
}

function countBy(
  values: Array<string | undefined | null>,
  limit = 10,
) {
  const counts = new Map<string, number>()

  for (const value of values) {
    const clean = normalize(value)
    if (!clean) continue
    counts.set(clean, (counts.get(clean) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count,
    }))
}

function consolidatedRows(
  metaphors: PrimaryMetaphor[],
) {
  const result = new Map<
    string,
    PrimaryMetaphor
  >()

  for (const metaphor of metaphors) {
    const focus =
      normalize(
        metaphor.focus ??
          metaphor.focusLemma ??
          metaphor.metaphoricalExpression,
      ).toLowerCase()

    const key = [
      metaphor.sentenceId ?? metaphor.context,
      focus,
    ].join('::')

    const existing = result.get(key)

    if (
      !existing ||
      (metaphor.crossApproachConfidence ?? 1) >
        (existing.crossApproachConfidence ?? 1)
    ) {
      result.set(key, metaphor)
    }
  }

  return [...result.values()]
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string
  value: string | number
  description?: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <p className="mt-1 text-2xl font-semibold text-gray-900">
        {value}
      </p>
      {description && (
        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  )
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900">
        {title}
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export function Level1Visualization({
  metaphors,
  metadata,
}: Props) {
  const { t } = useI18n()

  const consolidated = useMemo(
    () => consolidatedRows(metaphors),
    [metaphors],
  )

  const sourceDomains = useMemo(
    () =>
      countBy(
        consolidated.map(
          (item) => item.sourceDomain,
        ),
      ),
    [consolidated],
  )

  const targetDomains = useMemo(
    () =>
      countBy(
        consolidated.map(
          (item) => item.targetDomain,
        ),
      ),
    [consolidated],
  )

  const conceptual = useMemo(
    () =>
      countBy(
        consolidated.map(
          (item) =>
            item.conceptualMetaphor,
        ),
      ),
    [consolidated],
  )

  const pos = useMemo(
    () =>
      countBy(
        consolidated.map(
          (item) =>
            item.focusPartOfSpeech,
        ),
        8,
      ),
    [consolidated],
  )

  const chapters = useMemo(
    () =>
      countBy(
        consolidated.map(
          (item) => item.chapter,
        ),
        15,
      ),
    [consolidated],
  )

  const approachCounts = useMemo(
    () =>
      countBy(
        metaphors.map(
          (item) => item.approach,
        ),
        5,
      ),
    [metaphors],
  )

  const inferenceTypes = useMemo(
    () =>
      countBy(
        consolidated.flatMap((item) =>
          (
            item.epistemicMappings ?? []
          ).map(
            (mapping) =>
              mapping.inferenceType,
          ),
        ),
        10,
      ),
    [consolidated],
  )

  const sourceTargetMatrix = useMemo(() => {
    const sourceLabels = sourceDomains
      .slice(0, 6)
      .map((item) => item.label)
    const targetLabels = targetDomains
      .slice(0, 6)
      .map((item) => item.label)

    const counts = new Map<string, number>()

    for (const item of consolidated) {
      const source = normalize(item.sourceDomain)
      const target = normalize(item.targetDomain)
      if (!source || !target) continue
      const key = `${source}::${target}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    return {
      sourceLabels,
      targetLabels,
      counts,
    }
  }, [consolidated, sourceDomains, targetDomains])

  const crossAgreement = useMemo(() => {
    const totalApproaches =
      metadata?.config?.approaches.length ??
      new Set(
        metaphors
          .map((item) => item.approach)
          .filter(Boolean),
      ).size

    if (totalApproaches < 2) {
      return null
    }

    const agreed =
      consolidated.filter(
        (item) =>
          (item.crossApproachConfidence ??
            1) >= totalApproaches,
      ).length

    return {
      agreed,
      total: consolidated.length,
      percent:
        consolidated.length === 0
          ? 0
          : Math.round(
              (agreed /
                consolidated.length) *
                100,
            ),
    }
  }, [consolidated, metadata, metaphors])

  const firstComparison =
    metadata?.comparisons?.[0]

  if (metaphors.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500">
        {t('level1Visualization.noData')}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          {t('level1Visualization.title')}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          {t(
            'level1Visualization.description',
          )}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t(
            'level1Visualization.stats.consolidated',
          )}
          value={consolidated.length}
        />
        <StatCard
          label={t(
            'level1Visualization.stats.rows',
          )}
          value={metaphors.length}
        />
        <StatCard
          label={t(
            'level1Visualization.stats.approaches',
          )}
          value={
            metadata?.config?.approaches
              .length ??
            new Set(
              metaphors
                .map(
                  (item) =>
                    item.approach,
                )
                .filter(Boolean),
            ).size
          }
        />
        <StatCard
          label={t(
            'level1Visualization.stats.kappa',
          )}
          value={
            firstComparison?.kappaSentence ??
            '—'
          }
          description={
            firstComparison
              ? `${firstComparison.approachA} ↔ ${firstComparison.approachB}`
              : undefined
          }
        />
      </div>

      {crossAgreement && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-950">
            {t(
              'level1Visualization.agreement.title',
            )}
          </p>
          <p className="mt-1 text-xs text-blue-900/80">
            {t(
              'level1Visualization.agreement.description',
              {
                agreed: crossAgreement.agreed,
                total: crossAgreement.total,
                percent: crossAgreement.percent,
              },
            )}
          </p>
        </div>
      )}

      {metadata?.approachStats && metadata.approachStats.length > 0 && (
        <ChartCard
          title={t('level1Visualization.runStats.title')}
          description={t('level1Visualization.runStats.description')}
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metadata.approachStats.map((stats) => (
              <div
                key={stats.approach}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {t(`level1.approaches.${stats.approach}`)}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {stats.model ?? '—'}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">
                      {t('level1Visualization.runStats.requests')}
                    </span>
                    <p className="font-semibold text-gray-800">{stats.requests}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">
                      {t('level1Visualization.runStats.tokens')}
                    </span>
                    <p className="font-semibold text-gray-800">
                      {(stats.inputTokens + stats.outputTokens).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">
                      {t('level1Visualization.runStats.time')}
                    </span>
                    <p className="font-semibold text-gray-800">
                      {(stats.elapsedMs / 1000).toFixed(1)} s
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">
                      {t('level1Visualization.runStats.metaphors')}
                    </span>
                    <p className="font-semibold text-gray-800">{stats.metaphorCount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title={t(
            'level1Visualization.chapters.title',
          )}
          description={t(
            'level1Visualization.chapters.description',
          )}
        >
          {chapters.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={chapters}
                  layout="vertical"
                  margin={{
                    left: 20,
                    right: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#2563eb"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              {t(
                'level1Visualization.noDataAvailable',
              )}
            </p>
          )}
        </ChartCard>

        <ChartCard
          title={t(
            'level1Visualization.approaches.title',
          )}
          description={t(
            'level1Visualization.approaches.description',
          )}
        >
          {approachCounts.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={approachCounts}
                    dataKey="count"
                    nameKey="label"
                    outerRadius={90}
                    label
                  >
                    {approachCounts.map(
                      (entry, index) => (
                        <Cell
                          key={entry.label}
                          fill={
                            index % 2 === 0
                              ? '#2563eb'
                              : '#7c3aed'
                          }
                        />
                      ),
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              {t(
                'level1Visualization.noDataAvailable',
              )}
            </p>
          )}
        </ChartCard>

        <ChartCard
          title={t(
            'level1Visualization.sourceDomains.title',
          )}
          description={t(
            'level1Visualization.sourceDomains.description',
          )}
        >
          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={sourceDomains}
                layout="vertical"
                margin={{
                  left: 25,
                  right: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#0f766e"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title={t(
            'level1Visualization.targetDomains.title',
          )}
          description={t(
            'level1Visualization.targetDomains.description',
          )}
        >
          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={targetDomains}
                layout="vertical"
                margin={{
                  left: 25,
                  right: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#b45309"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title={t(
            'level1Visualization.pos.title',
          )}
          description={t(
            'level1Visualization.pos.description',
          )}
        >
          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={pos}>
                <CartesianGrid
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title={t(
            'level1Visualization.inferenceTypes.title',
          )}
          description={t(
            'level1Visualization.inferenceTypes.description',
          )}
        >
          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={inferenceTypes}>
                <CartesianGrid
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#9333ea"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {sourceTargetMatrix.sourceLabels.length > 0 &&
        sourceTargetMatrix.targetLabels.length > 0 && (
          <ChartCard
            title={t('level1Visualization.matrix.title')}
            description={t('level1Visualization.matrix.description')}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border border-gray-100 bg-gray-50 px-2 py-2 text-left font-medium text-gray-500">
                      {t('level1Visualization.matrix.sourceTarget')}
                    </th>
                    {sourceTargetMatrix.targetLabels.map((target) => (
                      <th
                        key={target}
                        className="border border-gray-100 bg-gray-50 px-2 py-2 font-medium text-gray-600"
                      >
                        {target}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sourceTargetMatrix.sourceLabels.map((source) => (
                    <tr key={source}>
                      <th className="border border-gray-100 bg-gray-50 px-2 py-2 text-left font-medium text-gray-600">
                        {source}
                      </th>
                      {sourceTargetMatrix.targetLabels.map((target) => {
                        const count =
                          sourceTargetMatrix.counts.get(`${source}::${target}`) ?? 0
                        return (
                          <td
                            key={target}
                            className="border border-gray-100 px-2 py-2 text-center text-gray-700"
                          >
                            {count || '—'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        )}

      <ChartCard
        title={t(
          'level1Visualization.conceptual.title',
        )}
        description={t(
          'level1Visualization.conceptual.description',
        )}
      >
        {conceptual.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {conceptual.map(
              (item, index) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 py-2.5"
                >
                  <span className="w-6 text-xs text-gray-400">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-gray-800">
                    {item.label}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {item.count}
                  </span>
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            {t(
              'level1Visualization.noDataAvailable',
            )}
          </p>
        )}
      </ChartCard>
    </div>
  )
}
