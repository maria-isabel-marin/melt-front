'use client'

import type { Level0Data } from '@/types'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/accordion'
import {
  RefreshCw,
  BookOpen,
  FileText,
  MessageSquareText,
  ListTree,
  Tags,
  Braces,
  Layers3,
} from 'lucide-react'

type Props = {
  data: Level0Data | null
  loading?: boolean
  error?: string
  onRefresh?: () => void
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  )
}

function MiniMetric({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-gray-900">{value}</div>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Chip({
  children,
  tone = 'gray',
}: {
  children: React.ReactNode
  tone?: 'gray' | 'blue' | 'green'
}) {
  const styles =
    tone === 'blue'
      ? 'bg-blue-50 text-blue-700'
      : tone === 'green'
        ? 'bg-green-50 text-green-700'
        : 'bg-gray-100 text-gray-700'

  return (
    <span className={`rounded-full px-3 py-1 text-xs ${styles}`}>
      {children}
    </span>
  )
}

function formatNumber(value?: number | null) {
  if (typeof value !== 'number') return '—'
  return value.toLocaleString()
}

function truncate(text?: string | null, max = 100) {
  if (!text) return '—'
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export function Level0({ data, loading, error, onRefresh }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No Level 0 data is available for this document yet.
      </div>
    )
  }

  const chapterRows =
    (data.chapter_detection?.chapters ?? []).length > 0
      ? data.chapter_detection!.chapters
      : (data.chapters ?? []).map((chapter) => ({
          title: chapter.name,
          start_page: chapter.start_page,
          end_page: chapter.end_page,
        }))

  const totalChapters =
    data.chapter_detection?.total_chapters ??
    chapterRows.length ??
    0

  const pagesBefore = data.cleaning_summary?.pages_before ?? data.page_count ?? 0
  const pagesAfter = data.cleaning_summary?.pages_after ?? data.pages_clean ?? 0
  const charsBefore = data.cleaning_summary?.chars_before
  const charsAfter = data.cleaning_summary?.chars_after
  const reduction =
    typeof data.cleaning_summary?.reduction_percent === 'number'
      ? `${data.cleaning_summary.reduction_percent}%`
      : '—'
  const extractedFootnotes =
    data.cleaning_summary?.extracted_footnotes ?? data.footnote_count ?? 0

  const footnoteSample = (data.footnotes ?? []).slice(0, 3)
  const sentenceSample = (data.sentences ?? []).slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div>
          <h2 className="text-base font-semibold text-blue-900">
            Level 0 quality review
          </h2>
          <p className="mt-1 text-sm text-blue-900/80">
            Validate chapter detection, cleaning, footnotes, sentence segmentation,
            and linguistic preprocessing before continuing with Levels 1–5.
          </p>

          {(data.chapter_detection?.method || data.chapter_detection_method) && (
            <p className="mt-2 text-xs text-blue-800">
              Chapter detection method:{' '}
              <strong>
                {data.chapter_detection?.method || data.chapter_detection_method}
              </strong>
            </p>
          )}
        </div>

        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw size={14} />
            Refresh
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Pages"
          value={data.page_count ?? 0}
          icon={<FileText size={16} />}
        />
        <StatCard
          label="Clean pages"
          value={data.pages_clean ?? 0}
          icon={<BookOpen size={16} />}
        />
        <StatCard
          label="Excluded pages"
          value={data.pages_excluded ?? 0}
          icon={<Layers3 size={16} />}
        />
        <StatCard
          label="Sentences"
          value={data.sentence_count ?? 0}
          icon={<MessageSquareText size={16} />}
        />
        <StatCard
          label="Words"
          value={data.word_count ?? 0}
          icon={<ListTree size={16} />}
        />
        <StatCard
          label="Footnotes"
          value={data.footnote_count ?? 0}
          icon={<MessageSquareText size={16} />}
        />
      </div>

      <Section
        title="Chapter detection"
        description="Detected chapters with start and end pages."
      >
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <MiniMetric
            label="Detection method"
            value={data.chapter_detection?.method || data.chapter_detection_method || '—'}
          />
          <MiniMetric
            label="Total chapters"
            value={totalChapters}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600">
                <th className="px-4 py-3">Chapter</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
              </tr>
            </thead>
            <tbody>
              {chapterRows.map((chapter, idx) => (
                <tr key={`${chapter.title}-${idx}`} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {truncate(chapter.title, 100)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{chapter.start_page ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{chapter.end_page ?? '—'}</td>
                </tr>
              ))}

              {chapterRows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    No chapters detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Cleaning summary"
        description="Compact overview of cleaning results."
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <MiniMetric label="Pages before" value={formatNumber(pagesBefore)} />
          <MiniMetric label="Pages after" value={formatNumber(pagesAfter)} />
          <MiniMetric label="Chars before" value={formatNumber(charsBefore)} />
          <MiniMetric label="Chars after" value={formatNumber(charsAfter)} />
          <MiniMetric label="Reduction" value={reduction} />
          <MiniMetric label="Footnotes extracted" value={formatNumber(extractedFootnotes)} />
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section
          title="Footnotes summary"
          description="Extracted footnotes overview and validation sample."
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MiniMetric
                label="Total"
                value={formatNumber(data.footnotes_summary?.total ?? data.footnote_count)}
              />
              <MiniMetric
                label="Pages with footnotes"
                value={formatNumber(data.footnotes_summary?.pages_with_footnotes)}
              />
              <MiniMetric
                label="Chapters with footnotes"
                value={formatNumber(data.footnotes_summary?.chapters_with_footnotes)}
              />
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-900">By chapter</h4>
              <div className="space-y-2">
                {(data.footnotes_summary?.by_chapter ?? []).slice(0, 6).map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
                    <span className="truncate text-gray-700">{item.label}</span>
                    <span className="font-medium text-gray-900">{item.count}</span>
                  </div>
                ))}

                {(!data.footnotes_summary?.by_chapter ||
                  data.footnotes_summary.by_chapter.length === 0) && (
                  <p className="text-sm text-gray-500">No chapter distribution available.</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-900">Sample</h4>
              <div className="space-y-3">
                {footnoteSample.map((footnote, idx) => (
                  <div key={`${footnote.page}-${idx}`} className="rounded-lg bg-gray-50 p-3">
                    <div className="mb-1 text-xs font-medium text-gray-500">
                      Page {footnote.page}
                      {footnote.chapter ? ` · ${truncate(footnote.chapter, 60)}` : ''}
                    </div>
                    <p className="text-sm text-gray-800">{truncate(footnote.text, 150)}</p>
                  </div>
                ))}

                {footnoteSample.length === 0 && (
                  <p className="text-sm text-gray-500">No footnotes were extracted.</p>
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="NLP summary"
          description="Linguistic preprocessing overview."
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MiniMetric
                label="Processed sentences"
                value={formatNumber(data.nlp_summary?.processed_sentences ?? data.sentence_count)}
              />
              <MiniMetric
                label="Unique lemmas"
                value={formatNumber(data.nlp_summary?.unique_lemmas)}
              />
              <MiniMetric
                label="Total entities"
                value={formatNumber(data.nlp_summary?.total_entities)}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                <Tags size={14} />
                Top lemmas
              </div>
              <div className="flex flex-wrap gap-2">
                {(data.nlp_summary?.top_lemmas ?? []).slice(0, 15).map((item) => (
                  <Chip key={item.label}>
                    {item.label} · {item.count}
                  </Chip>
                ))}
                {(!data.nlp_summary?.top_lemmas ||
                  data.nlp_summary.top_lemmas.length === 0) && (
                  <p className="text-sm text-gray-500">No lemma data available.</p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                <Braces size={14} />
                Top POS tags
              </div>
              <div className="flex flex-wrap gap-2">
                {(data.nlp_summary?.top_pos_tags ?? []).slice(0, 10).map((item) => (
                  <Chip key={item.label} tone="blue">
                    {item.label} · {item.count}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                <MessageSquareText size={14} />
                Top entity labels
              </div>
              <div className="flex flex-wrap gap-2">
                {(data.nlp_summary?.top_entity_labels ?? []).slice(0, 10).map((item) => (
                  <Chip key={item.label} tone="green">
                    {item.label} · {item.count}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section
        title="Sentence segmentation"
        description="Small validation sample of segmented sentences."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MiniMetric
              label="Total sentences"
              value={formatNumber(data.sentence_count)}
            />
            <MiniMetric
              label="Sample shown"
              value={sentenceSample.length}
            />
            <MiniMetric
              label="Processed"
              value={formatNumber(data.nlp_summary?.processed_sentences ?? data.sentence_count)}
            />
          </div>

          <div className="space-y-3">
            {sentenceSample.map((sentence) => (
              <div key={sentence.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="mb-1 text-xs font-medium text-gray-500">
                  Page {sentence.page ?? '—'}
                  {sentence.chapter ? ` · ${truncate(sentence.chapter, 70)}` : ''}
                </div>
                <p className="text-sm leading-relaxed text-gray-800">
                  {truncate(sentence.text, 220)}
                </p>
              </div>
            ))}

            {sentenceSample.length === 0 && (
              <p className="text-sm text-gray-500">No sentence sample available.</p>
            )}
          </div>
        </div>
      </Section>
    </div>
  )
}