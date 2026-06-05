'use client'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { documentApi, analysisApi } from '@/lib/api'
import type {
  Document, Analysis, PrimaryMetaphor, ConventionalMetaphor,
  MetaphoricalScenario, MetaphorRegime, CulturalNarrative, LevelStatus,
} from '@/types'
import { LevelBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/accordion'
import { LevelWrapper } from '@/components/analysis/LevelWrapper'
import { Level1 } from '@/components/analysis/Level1'
import { Level2 } from '@/components/analysis/Level2'
import { Level3 } from '@/components/analysis/Level3'
import { Level4 } from '@/components/analysis/Level4'
import { Level5 } from '@/components/analysis/Level5'
import { ArrowLeft, FileText, Zap, Search, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { docTypeLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Tab = 0 | 'level0' | 1 | 2 | 3 | 4 | 5

const TAB_LABELS: Record<Tab, string> = {
  0: 'Summary',
  'level0': 'Level 0 · Preprocessing',
  1: 'Level 1 · Metaphors',
  2: 'Level 2 · Conventional',
  3: 'Level 3 · Scenarios',
  4: 'Level 4 · Regimes',
  5: 'Level 5 · Narrative',
}

export default function DocumentPage() {
  const router = useRouter()
  const { id: corpusId, docId } = useParams<{ id: string; docId: string }>()
  const [doc, setDoc] = useState<Document | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [tab, setTab] = useState<Tab>(0)
  const [loading, setLoading] = useState(true)
  const [initLoading, setInitLoading] = useState(false)
  const [processing, setProcessing] = useState<number | null>(null)
  const [approving, setApproving] = useState<number | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Level data
  const [l0, setL0] = useState<any>(null)
  const [l0Loading, setL0Loading] = useState(false)
  const [l0ActiveSubTab, setL0ActiveSubTab] = useState<'sentences' | 'chapters' | 'footnotes'>('sentences')
  const [sentSearch, setSentSearch] = useState('')
  const [sentPage, setSentPage] = useState(1)
  const [expandedSent, setExpandedSent] = useState<string | null>(null)

  const [l1, setL1] = useState<PrimaryMetaphor[]>([])
  const [l2, setL2] = useState<ConventionalMetaphor[]>([])
  const [l3, setL3] = useState<MetaphoricalScenario[]>([])
  const [l4, setL4] = useState<MetaphorRegime[]>([])
  const [l5, setL5] = useState<CulturalNarrative | null>(null)

  const fetchAnalysis = useCallback(async (analysisId: string) => {
    const a = await analysisApi.get(analysisId)
    setAnalysis(a)
    return a
  }, [])

  const loadLevelData = useCallback(async (analysisId: string, level: Tab) => {
    try {
      if (level === 1) setL1(await analysisApi.getLevel1(analysisId))
      else if (level === 2) setL2(await analysisApi.getLevel2(analysisId))
      else if (level === 3) setL3(await analysisApi.getLevel3(analysisId))
      else if (level === 4) setL4(await analysisApi.getLevel4(analysisId))
      else if (level === 5) setL5(await analysisApi.getLevel5(analysisId))
    } catch { /* ignore */ }
  }, [])

  // Load document + analysis (single effect)
  useEffect(() => {
    let cancelled = false
    const loadDoc = async () => {
      try {
        const d = await documentApi.get(docId)
        if (cancelled) return
        setDoc(d)
        if (d.analysis) {
          const a = await analysisApi.get(d.analysis.id)
          if (!cancelled) setAnalysis(a)
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false) }
    }
    loadDoc()
    return () => { cancelled = true }
  }, [docId])

  // Poll when a level is PROCESSING
  useEffect(() => {
    if (!analysis) return
    const statuses = [
      analysis.level1Status, analysis.level2Status, analysis.level3Status,
      analysis.level4Status, analysis.level5Status,
    ]
    const hasProcessing = statuses.some(s => s === 'PROCESSING')
    if (hasProcessing && !pollingRef.current) {
      pollingRef.current = setInterval(async () => {
        if (!analysis) return
        const a = await fetchAnalysis(analysis.id)
        const stillProcessing = [a.level1Status, a.level2Status, a.level3Status, a.level4Status, a.level5Status]
          .some(s => s === 'PROCESSING')
        if (!stillProcessing) {
          if (pollingRef.current) clearInterval(pollingRef.current)
          pollingRef.current = null
          // reload current level data
          if (typeof tab === 'number' && tab > 0) loadLevelData(a.id, tab)
        }
      }, 4000)
    } else if (!hasProcessing && pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    return () => {
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
    }
  }, [analysis, fetchAnalysis, loadLevelData, tab])

  const loadLevel0Data = useCallback(async () => {
    setL0Loading(true)
    try {
      const data = await documentApi.getLevel0(docId)
      console.log('[DEBUG Level0] Raw response:', data)
      console.log('[DEBUG Level0] sentences count:', data?.sentences?.length)
      console.log('[DEBUG Level0] chapters count:', data?.chapters?.length)
      console.log('[DEBUG Level0] first sentence:', data?.sentences?.[0])
      setL0(data)
    } catch (e) {
      console.error('[DEBUG Level0] ERROR fetching level0:', e)
    } finally {
      setL0Loading(false)
    }
  }, [docId])

  // Load level data on tab switch
  useEffect(() => {
    if (tab === 'level0' && !l0) {
      loadLevel0Data()
    } else if (analysis && tab !== 0 && tab !== 'level0') {
      loadLevelData(analysis.id, tab as any)
    }
  }, [tab, analysis, loadLevelData, l0, loadLevel0Data])

  const handleInitAnalysis = async () => {
    if (!doc) return
    setInitLoading(true)
    try {
      const a = await documentApi.initAnalysis(doc.id)
      setAnalysis(a)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to initialize analysis')
    } finally {
      setInitLoading(false)
    }
  }

  const handleProcess = async (level: 1 | 2 | 3 | 4 | 5) => {
    if (!analysis) return
    setProcessing(level)
    try {
      await analysisApi.process(analysis.id, level)
      await fetchAnalysis(analysis.id)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to process')
    } finally {
      setProcessing(null)
    }
  }

  const handleApproveAll = async (level: 1 | 2 | 3 | 4 | 5) => {
    if (!analysis) return
    setApproving(level)
    try {
      await analysisApi.approveAll(analysis.id, level)
      await fetchAnalysis(analysis.id)
      await loadLevelData(analysis.id, level)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed')
    } finally {
      setApproving(null)
    }
  }

  const handleApprove = async (level: 1 | 2 | 3 | 4 | 5) => {
    if (!analysis) return
    setApproving(level)
    try {
      await analysisApi.approve(analysis.id, level)
      await fetchAnalysis(analysis.id)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed')
    } finally {
      setApproving(null)
    }
  }

  const getLevelStatus = (level: Tab): LevelStatus => {
    if (!analysis) return 'PENDING'
    const map: Record<Tab, LevelStatus> = {
      0: analysis.level0Status,
      'level0': analysis.level0Status,
      1: analysis.level1Status,
      2: analysis.level2Status,
      3: analysis.level3Status,
      4: analysis.level4Status,
      5: analysis.level5Status,
    }
    return map[level]
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <button
        onClick={() => router.push(`/corpus/${corpusId}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to corpus
      </button>

      {/* Document Header */}
      {doc && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-blue-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{doc.title}</h1>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  {doc.author && <span>{doc.author}</span>}
                  {doc.documentType && <span>{docTypeLabel(doc.documentType)}</span>}
                  <span className="capitalize">{doc.language?.toLowerCase()}</span>
                  {doc.pageCount && <span>{doc.pageCount} pages</span>}
                  {doc.tokenCount && <span>{doc.tokenCount.toLocaleString()} tokens</span>}
                </div>
                {doc.description && <p className="text-sm text-gray-500 mt-1">{doc.description}</p>}
              </div>
            </div>
            {!analysis && (
              <Button onClick={handleInitAnalysis} loading={initLoading} disabled={initLoading}>
                <Zap size={15} /> Initialize Analysis
              </Button>
            )}
          </div>

          {/* Level status overview */}
          {analysis && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              {([1, 2, 3, 4, 5] as const).map(l => (
                <div key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span>L{l}</span>
                  <LevelBadge status={getLevelStatus(l)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!analysis && !loading && !initLoading && (
        <div className="text-center py-16 text-gray-500">
          <Zap size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No analysis yet</p>
          <p className="text-sm mt-1">Initialize the analysis to start the MELT pipeline.</p>
        </div>
      )}

      {analysis && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {([0, 'level0', 1, 2, 3, 4, 5] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2',
                  tab === t
                    ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                {TAB_LABELS[t]}
                {t !== 0 && <LevelBadge status={getLevelStatus(t)} />}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {tab === 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-800 mb-3">Document Summary</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {doc?.title && <div><span className="text-gray-400 text-xs uppercase tracking-wide">Title</span><p className="text-gray-800 mt-0.5">{doc.title}</p></div>}
                  {doc?.author && <div><span className="text-gray-400 text-xs uppercase tracking-wide">Author</span><p className="text-gray-800 mt-0.5">{doc.author}</p></div>}
                  {doc?.documentType && <div><span className="text-gray-400 text-xs uppercase tracking-wide">Type</span><p className="text-gray-800 mt-0.5">{docTypeLabel(doc.documentType)}</p></div>}
                  {doc?.language && <div><span className="text-gray-400 text-xs uppercase tracking-wide">Language</span><p className="text-gray-800 mt-0.5 capitalize">{doc.language.toLowerCase()}</p></div>}
                  {doc?.pageCount && <div><span className="text-gray-400 text-xs uppercase tracking-wide">Pages</span><p className="text-gray-800 mt-0.5">{doc.pageCount}</p></div>}
                  {doc?.tokenCount && <div><span className="text-gray-400 text-xs uppercase tracking-wide">Tokens</span><p className="text-gray-800 mt-0.5">{doc.tokenCount.toLocaleString()}</p></div>}
                </div>
                {doc?.description && (
                  <div className="mt-4">
                    <span className="text-gray-400 text-xs uppercase tracking-wide">Description</span>
                    <p className="text-gray-700 text-sm mt-1 leading-relaxed">{doc.description}</p>
                  </div>
                )}
                {doc?.fileUrl && (
                  <div className="mt-4">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <FileText size={14} /> View document file
                    </a>
                  </div>
                )}
              </div>
            )}

            {tab === 'level0' && (
              <div className="space-y-6">
                {l0Loading && <div className="flex justify-center py-10"><Spinner size="lg" /></div>}
                {!l0Loading && !l0 && (
                  <div className="text-center py-10 text-gray-500">
                    No processed data available for this document.
                  </div>
                )}
                {!l0Loading && l0 && (
                  <div>
                    {/* General Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Sentences</span>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{l0.sentences?.length ?? 0}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Words</span>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{l0.word_count?.toLocaleString() ?? 0}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Avg Words/Sent</span>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                          {l0.sentences?.length ? (l0.word_count / l0.sentences.length).toFixed(1) : 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Chapters</span>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{l0.chapters?.length ?? 0}</p>
                      </div>
                    </div>

                    {/* Subtabs */}
                    <div className="flex gap-2 border-b border-gray-200 mb-4 pb-2">
                      <button
                        onClick={() => setL0ActiveSubTab('sentences')}
                        className={cn(
                          "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                          l0ActiveSubTab === 'sentences' ? "bg-blue-100 text-blue-800" : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        Sentences ({l0.sentences?.length ?? 0})
                      </button>
                      <button
                        onClick={() => setL0ActiveSubTab('chapters')}
                        className={cn(
                          "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                          l0ActiveSubTab === 'chapters' ? "bg-blue-100 text-blue-800" : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        Chapters ({l0.chapters?.length ?? 0})
                      </button>
                      <button
                        onClick={() => setL0ActiveSubTab('footnotes')}
                        className={cn(
                          "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                          l0ActiveSubTab === 'footnotes' ? "bg-blue-100 text-blue-800" : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        Footnotes ({l0.footnotes?.length ?? 0})
                      </button>
                    </div>

                    {/* Subtab Content */}
                    {l0ActiveSubTab === 'sentences' && (
                      <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search sentences or lemmas..."
                            value={sentSearch}
                            onChange={e => { setSentSearch(e.target.value); setSentPage(1); }}
                            className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* Sentences Table */}
                        {(() => {
                          const filtered = l0.sentences?.filter((s: any) =>
                            s.text.toLowerCase().includes(sentSearch.toLowerCase()) ||
                            s.lemas?.some((l: string) => l.toLowerCase().includes(sentSearch.toLowerCase()))
                          ) ?? [];

                          const PAGE_SIZE = 15;
                          const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
                          const paginated = filtered.slice((sentPage - 1) * PAGE_SIZE, sentPage * PAGE_SIZE);

                          return (
                            <div className="space-y-3">
                              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-xs text-left">
                                  <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                                      <th className="p-3 w-16">ID</th>
                                      <th className="p-3 w-16">Page</th>
                                      <th className="p-3 w-40">Chapter</th>
                                      <th className="p-3">Sentence Text</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {paginated.map((s: any) => {
                                      const isExpanded = expandedSent === s.id;
                                      return (
                                        <Fragment key={s.id}>
                                          <tr
                                            onClick={() => setExpandedSent(isExpanded ? null : s.id)}
                                            className="border-b border-gray-50 hover:bg-blue-50/20 cursor-pointer transition-colors"
                                          >
                                            <td className="p-3 font-mono text-gray-400">{s.id}</td>
                                            <td className="p-3 text-gray-600">{s.page}</td>
                                            <td className="p-3 text-gray-500 truncate max-w-[150px]" title={s.chapter}>{s.chapter}</td>
                                            <td className="p-3 font-medium text-gray-800">{s.text}</td>
                                          </tr>
                                          {isExpanded && (
                                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                              <td colSpan={4} className="p-4 space-y-4">
                                                {/* POS Tags */}
                                                <div>
                                                  <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">POS Tags (Categorías Gramaticales)</h4>
                                                  <div className="flex flex-wrap gap-1">
                                                    {s.tokens.map((tok: string, idx: number) => {
                                                      const pos = s.pos_tags?.[idx] ?? '';
                                                      const lemma = s.lemas?.[idx] ?? '';
                                                      let colorClass = 'bg-gray-100 text-gray-600 border-gray-200';
                                                      if (pos === 'NOUN') colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                                                      else if (pos === 'VERB') colorClass = 'bg-blue-50 text-blue-800 border-blue-200';
                                                      else if (pos === 'ADJ') colorClass = 'bg-orange-50 text-orange-800 border-orange-200';
                                                      else if (pos === 'ADV') colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
                                                      else if (pos === 'PRON') colorClass = 'bg-indigo-50 text-indigo-800 border-indigo-200';
                                                      
                                                      return (
                                                        <span
                                                          key={idx}
                                                          className={cn("px-2 py-1 text-[11px] rounded border flex flex-col items-center", colorClass)}
                                                          title={`Lema: ${lemma}`}
                                                        >
                                                          <span className="font-semibold">{tok}</span>
                                                          <span className="text-[9px] opacity-75 font-mono">{pos}</span>
                                                        </span>
                                                      );
                                                    })}
                                                  </div>
                                                </div>

                                                {/* NER Entities */}
                                                {s.entities && s.entities.length > 0 && (
                                                  <div>
                                                    <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">Named Entities (Entidades Nombradas)</h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                      {s.entities.map((e: any, idx: number) => (
                                                        <span
                                                          key={idx}
                                                          className="px-2 py-1 text-[11px] bg-rose-50 text-rose-800 border border-rose-200 rounded-md font-semibold"
                                                        >
                                                          {e.text} <span className="text-[9px] opacity-75 font-mono">[{e.label}]</span>
                                                        </span>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Lemmas list */}
                                                <div>
                                                  <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Lemas de contenido</h4>
                                                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 font-mono">
                                                    {s.tokens.map((tok: string, idx: number) => {
                                                      const pos = s.pos_tags?.[idx] ?? '';
                                                      const lemma = s.lemas?.[idx] ?? '';
                                                      if (['NOUN', 'VERB', 'ADJ'].includes(pos) && lemma.length > 2) {
                                                        return (
                                                          <span key={idx} className="bg-white px-2 py-0.5 border border-gray-200 rounded shadow-xs">
                                                            <span className="text-gray-400 mr-1">{tok} →</span>
                                                            <span className="font-semibold text-gray-700">{lemma}</span>
                                                          </span>
                                                        );
                                                      }
                                                      return null;
                                                    })}
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          )}
                                        </Fragment>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Pagination Controls */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-between px-2 text-xs text-gray-500">
                                  <span>Showing {((sentPage - 1) * PAGE_SIZE) + 1} to {Math.min(sentPage * PAGE_SIZE, filtered.length)} of {filtered.length} sentences</span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setSentPage(p => Math.max(1, p - 1))}
                                      disabled={sentPage === 1}
                                      className="p-1 border border-gray-200 rounded disabled:opacity-50 hover:bg-gray-50"
                                    >
                                      <ChevronLeft size={16} />
                                    </button>
                                    <span>Page {sentPage} of {totalPages}</span>
                                    <button
                                      onClick={() => setSentPage(p => Math.min(totalPages, p + 1))}
                                      disabled={sentPage === totalPages}
                                      className="p-1 border border-gray-200 rounded disabled:opacity-50 hover:bg-gray-50"
                                    >
                                      <ChevronRight size={16} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {l0ActiveSubTab === 'chapters' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {l0.chapters && l0.chapters.length > 0 ? (
                          l0.chapters.map((ch: any, idx: number) => (
                            <div key={idx} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <BookOpen size={16} className="text-blue-600" />
                                <span className="font-semibold text-gray-800 text-sm">{ch.name}</span>
                              </div>
                              <span className="text-xs text-gray-500 bg-white border border-gray-100 px-2 py-0.5 rounded-full">
                                pp. {ch.start_page} - {ch.end_page}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-6 text-gray-500 text-sm">
                            No chapters detected. The whole document is processed as a single chapter.
                          </div>
                        )}
                      </div>
                    )}

                    {l0ActiveSubTab === 'footnotes' && (
                      <div className="space-y-3">
                        {l0.footnotes && l0.footnotes.length > 0 ? (
                          l0.footnotes.map((fn: any, idx: number) => (
                            <div key={idx} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 flex gap-4 items-start">
                              <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wider select-none">
                                Page {fn.page}
                              </span>
                              <blockquote className="text-xs text-gray-600 italic leading-relaxed">
                                "{fn.text}"
                              </blockquote>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            No footnotes extracted.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === 1 && (
              <LevelWrapper
                level={1}
                status={getLevelStatus(1)}
                onProcess={() => handleProcess(1)}
                onApproveAll={() => handleApproveAll(1)}
                onApprove={() => handleApprove(1)}
                processing={processing === 1}
                approving={approving === 1}
              >
                <Level1 metaphors={l1} onRefresh={() => analysis && loadLevelData(analysis.id, 1)} />
              </LevelWrapper>
            )}

            {tab === 2 && (
              <LevelWrapper
                level={2}
                status={getLevelStatus(2)}
                onProcess={() => handleProcess(2)}
                onApproveAll={() => handleApproveAll(2)}
                onApprove={() => handleApprove(2)}
                processing={processing === 2}
                approving={approving === 2}
              >
                <Level2 metaphors={l2} onRefresh={() => analysis && loadLevelData(analysis.id, 2)} />
              </LevelWrapper>
            )}

            {tab === 3 && (
              <LevelWrapper
                level={3}
                status={getLevelStatus(3)}
                onProcess={() => handleProcess(3)}
                onApproveAll={() => handleApproveAll(3)}
                onApprove={() => handleApprove(3)}
                processing={processing === 3}
                approving={approving === 3}
              >
                <Level3 scenarios={l3} onRefresh={() => analysis && loadLevelData(analysis.id, 3)} />
              </LevelWrapper>
            )}

            {tab === 4 && (
              <LevelWrapper
                level={4}
                status={getLevelStatus(4)}
                onProcess={() => handleProcess(4)}
                onApproveAll={() => handleApproveAll(4)}
                onApprove={() => handleApprove(4)}
                processing={processing === 4}
                approving={approving === 4}
              >
                <Level4 regimes={l4} onRefresh={() => analysis && loadLevelData(analysis.id, 4)} />
              </LevelWrapper>
            )}

            {tab === 5 && (
              <LevelWrapper
                level={5}
                status={getLevelStatus(5)}
                onProcess={() => handleProcess(5)}
                onApproveAll={() => handleApproveAll(5)}
                onApprove={() => handleApprove(5)}
                processing={processing === 5}
                approving={approving === 5}
              >
                <Level5 narrative={l5} onRefresh={() => analysis && loadLevelData(analysis.id, 5)} />
              </LevelWrapper>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
