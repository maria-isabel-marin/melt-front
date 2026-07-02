'use client'

import { useMemo, useState } from 'react'
import type { Level0Data } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/accordion'
import {
  RefreshCw,
  BookOpen,
  FileText,
  MessageSquareText,
  Search,
  ListTree,
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

export function Level0({ data, loading, error, onRefresh }: Props) {
  const [query, setQuery] = useState('')

  const topLemmas = useMemo(() => {
    if (!data?.sentences?.length) return []

    const freq = new Map<string, number>()

    for (const sentence of data.sentences) {
      for (const lemma of sentence.lemmas ?? []) {
        const clean = lemma?.trim()?.toLowerCase()
        if (!clean || clean.length < 3) continue
        freq.set(clean, (freq.get(clean) ?? 0) + 1)
      }
    }

    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
  }, [data])

  const filteredSentences = useMemo(() => {
    if (!data?.sentences?.length) return []

    const q = query.trim().toLowerCase()
    if (!q) return data.sentences.slice(0, 100)

    return data.sentences
      .filter((s) => {
        const text = s.text?.toLowerCase() ?? ''
        const chapter = s.chapter?.toLowerCase() ?? ''
        return text.includes(q) || chapter.includes(q)
      })
      .slice(0, 100)
  }, [data, query])

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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div>
          <h2 className="text-base font-semibold text-blue-900">
            Level 0 quality review
          </h2>
          <p className="mt-1 text-sm text-blue-900/80">
            Validate extraction quality, chapter detection, footnotes, and sentence
            segmentation before continuing with Levels 1–5.
          </p>
          {data.chapter_detection_method && (
            <p className="mt-2 text-xs text-blue-800">
              Chapter detection method: <strong>{data.chapter_detection_method}</strong>
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
          icon={<FileText size={16} />}
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="font-medium text-gray-900">Detected chapters</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-4 py-3">Chapter</th>
                  <th className="px-4 py-3">Start page</th>
                  <th className="px-4 py-3">End page</th>
                  <th className="px-4 py-3">Sentences</th>
                  <th className="px-4 py-3">Words</th>
                </tr>
              </thead>
              <tbody>
                {(data.chapters ?? []).map((chapter, idx) => (
                  <tr key={`${chapter.name}-${idx}`} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{chapter.name}</td>
                    <td className="px-4 py-3 text-gray-600">{chapter.start_page ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{chapter.end_page ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{chapter.sentence_count ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{chapter.word_count ?? '—'}</td>
                  </tr>
                ))}
                {(!data.chapters || data.chapters.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No chapters detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="font-medium text-gray-900">Top lemmas</h3>
          </div>

          <div className="flex flex-wrap gap-2 p-4">
            {topLemmas.map(([lemma, count]) => (
              <span
                key={lemma}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
              >
                {lemma} · {count}
              </span>
            ))}
            {topLemmas.length === 0 && (
              <p className="text-sm text-gray-500">No lemma data available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h3 className="font-medium text-gray-900">Sentence browser</h3>
          <p className="mt-1 text-sm text-gray-500">
            Search by chapter name or sentence content. Showing up to 100 rows.
          </p>
        </div>

        <div className="p-4">
          <div className="mb-4 max-w-md">
            <Input
              placeholder="Search sentences or chapters..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Page</th>
                  <th className="px-4 py-3">Chapter</th>
                  <th className="px-4 py-3">Sentence</th>
                  <th className="px-4 py-3">Words</th>
                </tr>
              </thead>
              <tbody>
                {filteredSentences.map((sentence) => (
                  <tr key={sentence.id} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{sentence.id}</td>
                    <td className="px-4 py-3 text-gray-600">{sentence.page ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{sentence.chapter ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-900">{sentence.text}</td>
                    <td className="px-4 py-3 text-gray-600">{sentence.n_words ?? '—'}</td>
                  </tr>
                ))}
                {filteredSentences.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No sentences match the current search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h3 className="font-medium text-gray-900">Extracted footnotes</h3>
        </div>

        <div className="space-y-3 p-4">
          {(data.footnotes ?? []).slice(0, 20).map((footnote, idx) => (
            <div key={`${footnote.page}-${idx}`} className="rounded-lg bg-gray-50 p-3">
              <div className="mb-1 text-xs font-medium text-gray-500">
                Page {footnote.page}
                {footnote.chapter ? ` · ${footnote.chapter}` : ''}
              </div>
              <p className="text-sm text-gray-800">{footnote.text}</p>
            </div>
          ))}
          {(!data.footnotes || data.footnotes.length === 0) && (
            <p className="text-sm text-gray-500">No footnotes were extracted.</p>
          )}
        </div>
      </div>
    </div>
  )
}