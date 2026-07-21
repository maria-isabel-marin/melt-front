'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { corpusApi } from '@/lib/api'
import type { Corpus, CorpusAnalysisConfig } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Spinner, EmptyState } from '@/components/ui/accordion'
import { Plus, BookOpen, FileText, Trash2, Settings } from 'lucide-react'

const GENRES = ['Academic', 'Political', 'Journalistic', 'Literary', 'Legal', 'Social Media', 'Other']

export default function CorpusPage() {
  const router = useRouter()
  const [corpora, setCorpora] = useState<Corpus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [configTargetId, setConfigTargetId] = useState<string | null>(null)
  const [savingConfig, setSavingConfig] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', discursiveCommunity: '', textualGenre: '' })
  const [configDraft, setConfigDraft] = useState<CorpusAnalysisConfig>({
    regexPatterns: '',
    headersFooters: '',
    minLineLength: 30,
    inspectionMode: 'manual',
    inspectionSample: 5,
    inspectionChars: 100,
    inspectionPosition: 'ambos',
    inspectionDocs: 'none',
    footnoteSample: 20,
    footnoteDocs: 'none',
    minSentenceLength: 10,
    maxSentenceLength: 2000,
    batchSize: 500,
    language: 'español',
    corpusId: '',
    documentMetadata: '',
  })
  const [analysisConfigs, setAnalysisConfigs] = useState<Record<string, CorpusAnalysisConfig>>({})

  useEffect(() => {
    const loadCorpora = async () => {
      try {
        const persisted = localStorage.getItem('corpus-analysis-configs')
        let savedConfigs: Record<string, CorpusAnalysisConfig> = {}
        if (persisted) {
          savedConfigs = JSON.parse(persisted) as Record<string, CorpusAnalysisConfig>
        }

    const data = await corpusApi.list()
    const merged = data.map(corpus => ({
          ...corpus,
          analysisConfig: corpus.analysisConfig ?? savedConfigs[corpus.id],
        }))

        setCorpora(merged)
        setAnalysisConfigs({ ...savedConfigs, ...Object.fromEntries(merged.filter(c => c.analysisConfig).map(c => [c.id, c.analysisConfig!])) })  
 //     .then(setCorpora)
 //     .catch(e => setError(e.message))
 //     .finally(() => setLoading(false))
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load corpora')
      } finally {
        setLoading(false)
      }
    }

    loadCorpora()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('corpus-analysis-configs', JSON.stringify(analysisConfigs))
    }
  }, [analysisConfigs])

  const handleCreate = async () => {
    if (!form.name.trim()) return
    setCreating(true)
    try {
      const corpus = await corpusApi.create({
        name: form.name.trim(),
        description: form.description || undefined,
        discursiveCommunity: form.discursiveCommunity || undefined,
        textualGenre: form.textualGenre || undefined,
      })
      setCorpora(prev => [corpus, ...prev])
      setShowCreate(false)
      setForm({ name: '', description: '', discursiveCommunity: '', textualGenre: '' })
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to create corpus')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this corpus and all its documents?')) return
    setDeleting(id)
    try {
      await corpusApi.delete(id)
      setCorpora(prev => prev.filter(c => c.id !== id))
      setAnalysisConfigs(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete corpus')
    } finally {
      setDeleting(null)
    }
  }

  const handleOpenConfig = (corpus: Corpus, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfigTargetId(corpus.id)
    setConfigDraft(corpus.analysisConfig ?? {
      regexPatterns: '',
      headersFooters: '',
      minLineLength: 30,
      inspectionMode: 'manual',
      inspectionSample: 5,
      inspectionChars: 100,
      inspectionPosition: 'ambos',
      inspectionDocs: 'none',
      footnoteSample: 20,
      footnoteDocs: 'none',
      minSentenceLength: 10,
      maxSentenceLength: 2000,
      batchSize: 500,
      language: 'español',
      corpusId: corpus.id,
      documentMetadata: '',
    })
  }

  const handleSaveConfig = async () => {
    if (!configTargetId) return

    setSavingConfig(true)
    try {
      const nextConfig = {
        regexPatterns: configDraft.regexPatterns?.trim() || undefined,
        headersFooters: configDraft.headersFooters?.trim() || undefined,
        minLineLength: configDraft.minLineLength ?? 30,
        inspectionMode: configDraft.inspectionMode?.trim() || 'manual',
        inspectionSample: configDraft.inspectionSample ?? 5,
        inspectionChars: configDraft.inspectionChars ?? 100,
        inspectionPosition: configDraft.inspectionPosition?.trim() || 'ambos',
        inspectionDocs: configDraft.inspectionDocs?.trim() || 'none',
        footnoteSample: configDraft.footnoteSample ?? 20,
        footnoteDocs: configDraft.footnoteDocs?.trim() || 'none',
        minSentenceLength: configDraft.minSentenceLength ?? 10,
        maxSentenceLength: configDraft.maxSentenceLength ?? 2000,
        batchSize: configDraft.batchSize ?? 500,
        language: configDraft.language?.trim() || 'español',
        corpusId: configTargetId,
        documentMetadata: configDraft.documentMetadata?.trim() || undefined,
      }

      setCorpora(prev => prev.map(corpus =>
        corpus.id === configTargetId ? { ...corpus, analysisConfig: nextConfig } : corpus
      ))
      setAnalysisConfigs(prev => ({ ...prev, [configTargetId]: nextConfig }))

      try {
        await corpusApi.update(configTargetId, { analysisConfig: nextConfig })
      } catch (apiError) {
        console.warn('Corpus config could not be persisted remotely', apiError)
      }

      setConfigTargetId(null)
      setConfigDraft({
        regexPatterns: '',
        headersFooters: '',
        minLineLength: 30,
        inspectionMode: 'manual',
        inspectionSample: 5,
        inspectionChars: 100,
        inspectionPosition: 'ambos',
        inspectionDocs: 'none',
        footnoteSample: 20,
        footnoteDocs: 'none',
        minSentenceLength: 10,
        maxSentenceLength: 2000,
        batchSize: 500,
        language: 'español',
        corpusId: '',
        documentMetadata: '',
      })
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to save corpus configuration')
    } finally {
      setSavingConfig(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Corpora</h1>
          <p className="text-sm text-gray-500 mt-1">Organize your documents for metaphor analysis</p>
        </div>
        {corpora.length > 0 && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Corpus
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {!loading && !error && corpora.length === 0 && (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="No corpora yet"
          description="Create your first corpus to start organizing documents for metaphor analysis."
          action={<Button onClick={() => setShowCreate(true)}><Plus size={16} />New Corpus</Button>}
        />
      )}

      {!loading && corpora.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {corpora.map(corpus => (
            <Card
              key={corpus.id}
              className="cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => router.push(`/corpus/${corpus.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{corpus.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => handleOpenConfig(corpus, e)}
                      className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      aria-label={`Configure ${corpus.name}`}
                    >
                      <Settings size={14} />
                    </button>
                    <button
                      onClick={e => handleDelete(corpus.id, e)}
                      disabled={deleting === corpus.id}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      {deleting === corpus.id ? <Spinner size="sm" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
                {corpus.description && (
                  <CardDescription className="line-clamp-2">{corpus.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <FileText size={12} />
                    {corpus._count?.documents ?? 0} document{(corpus._count?.documents ?? 0) !== 1 ? 's' : ''}
                  </span>
                  {corpus.textualGenre && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {corpus.textualGenre}
                    </span>
                  )}
                </div>
                {corpus.discursiveCommunity && (
                  <p className="text-xs text-gray-400 mt-2 truncate">{corpus.discursiveCommunity}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Corpus Dialog */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="New Corpus">
        <DialogBody>
          <Input
            label="Name *"
            placeholder="e.g. Political speeches 2024"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          />
          <Textarea
            label="Description"
            placeholder="Brief description of the corpus"
            rows={3}
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          />
          <Input
            label="Discursive Community"
            placeholder="e.g. Political analysts, journalists"
            value={form.discursiveCommunity}
            onChange={e => setForm(p => ({ ...p, discursiveCommunity: e.target.value }))}
          />
          <Select
            label="Textual Genre"
            value={form.textualGenre}
            onChange={e => setForm(p => ({ ...p, textualGenre: e.target.value }))}
          >
            <option value="">Select genre…</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </Select>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={creating} disabled={!form.name.trim()}>
            Create Corpus
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!configTargetId} onClose={() => setConfigTargetId(null)} title="Analysis configuration" className="max-w-5xl">
        <DialogBody>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <Textarea
                label="Regular expressions to remove"
                placeholder="One pattern per line, e.g. ^Página\s+\d+"
                rows={3}
                value={configDraft.regexPatterns ?? ''}
                onChange={e => setConfigDraft(p => ({ ...p, regexPatterns: e.target.value }))}
              />
              <Textarea
                label="Headers / footers"
                placeholder="One phrase per line"
                rows={3}
                value={configDraft.headersFooters ?? ''}
                onChange={e => setConfigDraft(p => ({ ...p, headersFooters: e.target.value }))}
              />
              <Input
                label="Min. line length"
                type="number"
                min={1}
                value={configDraft.minLineLength ?? 30}
                onChange={e => setConfigDraft(p => ({ ...p, minLineLength: Number(e.target.value) || 30 }))}
              />
            </div>
            <div className="space-y-3">
              <Select
                label="Inspection mode"
                value={configDraft.inspectionMode ?? 'manual'}
                onChange={e => setConfigDraft(p => ({ ...p, inspectionMode: e.target.value }))}
              >
                <option value="manual">manual</option>
                <option value="aleatorio">aleatorio</option>
              </Select>
              <Input
                  label="Inspection Sample"
                  type="number"
                  min={1}
                  value={configDraft.inspectionSample ?? 5}
                  onChange={e => setConfigDraft(p => ({ ...p, inspectionSample: Number(e.target.value) || 5 }))}
                />
            <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  label="Inspection chars"
                  type="number"
                  min={1}
                  value={configDraft.inspectionChars ?? 100}
                  onChange={e => setConfigDraft(p => ({ ...p, inspectionChars: Number(e.target.value) || 100 }))}
                />
                <Select
                  label="Inspection position"
                  value={configDraft.inspectionPosition ?? 'ambos'}
                  onChange={e => setConfigDraft(p => ({ ...p, inspectionPosition: e.target.value }))}
                >
                  <option value="inicio">inicio</option>
                  <option value="final">final</option>
                  <option value="ambos">ambos</option>
                </Select>
                <Input
                  label="Inspection docs"
                  placeholder="none, all, or comma-separated doc names"
                  value={configDraft.inspectionDocs ?? 'none'}
                  onChange={e => setConfigDraft(p => ({ ...p, inspectionDocs: e.target.value || 'none' }))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  label="Footnote sample"
                  type="number"
                  min={1}
                  value={configDraft.footnoteSample ?? 20}
                  onChange={e => setConfigDraft(p => ({ ...p, footnoteSample: Number(e.target.value) || 20 }))}
                />
                <Input
                  label="Footnote Docs"
                  placeholder="none, all, or comma-separated document names"
                  type="text"
                  min={1}
                  value={configDraft.footnoteDocs ?? 'none'}
                  onChange={e => setConfigDraft(p => ({ ...p, footnoteDocs: e.target.value || 'none' }))}
                />
                <Input
                  label="Batch size"
                  type="number"
                  min={1}
                  value={configDraft.batchSize ?? 500}
                  onChange={e => setConfigDraft(p => ({ ...p, batchSize: Number(e.target.value) || 500 }))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Min. sentence len"
                  type="number"
                  min={1}
                  value={configDraft.minSentenceLength ?? 10}
                  onChange={e => setConfigDraft(p => ({ ...p, minSentenceLength: Number(e.target.value) || 10 }))}
                />
                <Input
                  label="Max. sentence len"
                  type="number"
                  min={1}
                  value={configDraft.maxSentenceLength ?? 2000}
                  onChange={e => setConfigDraft(p => ({ ...p, maxSentenceLength: Number(e.target.value) || 2000 }))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Language"
                  placeholder="español"
                  value={configDraft.language ?? 'español'}
                  onChange={e => setConfigDraft(p => ({ ...p, language: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            These parameters will be stored for this corpus and can be used as defaults when ingesting documents.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfigTargetId(null)}>Cancel</Button>
          <Button onClick={handleSaveConfig} loading={savingConfig}>
            Save configuration
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
