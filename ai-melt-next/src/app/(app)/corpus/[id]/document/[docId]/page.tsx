'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import { ArrowLeft, FileText, Zap } from 'lucide-react'
import { docTypeLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Tab = 0 | 1 | 2 | 3 | 4 | 5

const TAB_LABELS: Record<Tab, string> = {
  0: 'Summary',
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

  useEffect(() => {
    Promise.all([documentApi.get(docId)])
      .then(async ([d]) => {
        setDoc(d)
        // fetch or init analysis
        try {
          // try to get existing analysis from document
          const docFull = await documentApi.get(docId)
          if (docFull) setDoc(docFull)
        } catch { /* ignore */ }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [docId])

  // Load document with embedded analysis
  useEffect(() => {
    const loadDoc = async () => {
      try {
        const d = await documentApi.get(docId)
        setDoc(d)
        if (d.analysis) {
          const a = await analysisApi.get(d.analysis.id)
          setAnalysis(a)
        }
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    loadDoc()
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
          if (tab > 0) loadLevelData(a.id, tab)
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

  // Load level data on tab switch
  useEffect(() => {
    if (analysis && tab > 0) loadLevelData(analysis.id, tab)
  }, [tab, analysis, loadLevelData])

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
            {([0, 1, 2, 3, 4, 5] as Tab[]).map(t => (
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
                {t > 0 && <LevelBadge status={getLevelStatus(t)} />}
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
