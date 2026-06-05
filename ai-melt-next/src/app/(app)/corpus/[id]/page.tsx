'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { corpusApi, documentApi } from '@/lib/api'
import type { Corpus, DocumentSummary } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Input, Select } from '@/components/ui/input'
import { LevelBadge } from '@/components/ui/badge'
import { Spinner, EmptyState } from '@/components/ui/accordion'
import { ArrowLeft, Plus, FileText, Trash2 } from 'lucide-react'
import { docTypeLabel } from '@/lib/utils'

const LANGUAGES = ['ENGLISH', 'SPANISH']
const DOC_TYPES = [
  'ACADEMIC_ARTICLE', 'POLITICAL_SPEECH', 'NEWS', 'EDITORIAL',
  'INTERVIEW', 'OFFICIAL_DOCUMENT', 'SOCIAL_MEDIA', 'OTHER',
]

export default function CorpusDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [corpus, setCorpus] = useState<Corpus | null>(null)
  const [docs, setDocs] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: '', author: '', language: 'SPANISH', documentType: '', pageCount: '', fileUrl: '', description: '',
  })

  useEffect(() => {
    Promise.all([corpusApi.get(id), documentApi.list(id)])
      .then(([c, d]) => { setCorpus(c); setDocs(d) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleCreate = async () => {
    if (!form.title.trim()) return
    if (!file) {
      alert('Please select a PDF or TXT file to process.')
      return
    }
    setCreating(true)
    try {
      const res = await documentApi.upload({
        corpusId: id,
        title: form.title.trim(),
        file,
        author: form.author || undefined,
        language: form.language,
        documentType: form.documentType || undefined,
        description: form.description || undefined,
      })
      setDocs(prev => [res.document, ...prev])
      setShowCreate(false)
      setForm({ title: '', author: '', language: 'SPANISH', documentType: '', pageCount: '', fileUrl: '', description: '' })
      setFile(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to upload and process document')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this document and all its analysis data?')) return
    setDeleting(docId)
    try {
      await documentApi.delete(docId)
      setDocs(prev => prev.filter(d => d.id !== docId))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

  const overallStatus = (doc: DocumentSummary) => {
    if (!doc.analysis) return null
    const a = doc.analysis
    const statuses = [a.level1Status, a.level2Status, a.level3Status, a.level4Status, a.level5Status]
    if (statuses.every(s => s === 'APPROVED')) return 'APPROVED' as const
    if (statuses.some(s => s === 'PROCESSING')) return 'PROCESSING' as const
    if (statuses.some(s => s === 'PENDING_REVIEW')) return 'PENDING_REVIEW' as const
    if (statuses.some(s => s === 'OUTDATED')) return 'OUTDATED' as const
    return 'PENDING' as const
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        onClick={() => router.push('/corpus')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to corpora
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-6">{error}</div>
      )}

      {corpus && (
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{corpus.name}</h1>
              {corpus.description && <p className="text-gray-500 mt-1 text-sm">{corpus.description}</p>}
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                {corpus.discursiveCommunity && <span>{corpus.discursiveCommunity}</span>}
                {corpus.textualGenre && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{corpus.textualGenre}</span>}
              </div>
            </div>
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Add Document
            </Button>
          </div>
        </div>
      )}

      {docs.length === 0 && !loading && (
        <EmptyState
          icon={<FileText size={48} />}
          title="No documents yet"
          description="Add your first document to start the MELT analysis pipeline."
          action={<Button onClick={() => setShowCreate(true)}><Plus size={16} />Add Document</Button>}
        />
      )}

      {docs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Language</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pages</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => {
                const status = overallStatus(doc)
                return (
                  <tr
                    key={doc.id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer group"
                    onClick={() => router.push(`/corpus/${id}/document/${doc.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{doc.title}</td>
                    <td className="px-4 py-3 text-gray-500">{docTypeLabel(doc.documentType)}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{doc.language?.toLowerCase()}</td>
                    <td className="px-4 py-3 text-gray-500">{doc.pageCount ?? '—'}</td>
                    <td className="px-4 py-3">
                      {status ? <LevelBadge status={status} /> : <span className="text-gray-400 text-xs">No analysis</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => handleDelete(doc.id, e)}
                        disabled={deleting === doc.id}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        {deleting === doc.id ? <Spinner size="sm" /> : <Trash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Document Dialog */}
      <Dialog open={showCreate} onClose={() => {
        setShowCreate(false)
        setFile(null)
      }} title="Add Document">
        <DialogBody>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Document File (PDF/TXT) *</label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={e => {
                const selectedFile = e.target.files?.[0]
                setFile(selectedFile || null)
                if (selectedFile && !form.title.trim()) {
                  const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "")
                  setForm(p => ({ ...p, title: nameWithoutExt.replace(/_/g, ' ') }))
                }
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-200 rounded-lg p-2 bg-gray-50/50"
            />
          </div>
          <Input
            label="Title *"
            placeholder="Document title"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          />
          <Input
            label="Author"
            placeholder="Author name"
            value={form.author}
            onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Language *"
              value={form.language}
              onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>)}
            </Select>
            <Select
              label="Document Type"
              value={form.documentType}
              onChange={e => setForm(p => ({ ...p, documentType: e.target.value }))}
            >
              <option value="">Select type…</option>
              {DOC_TYPES.map(t => <option key={t} value={t}>{docTypeLabel(t)}</option>)}
            </Select>
          </div>
          <Input
            label="Description / Abstract"
            placeholder="Brief description of the document contents"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setShowCreate(false)
            setFile(null)
          }}>Cancel</Button>
          <Button onClick={handleCreate} loading={creating} disabled={!form.title.trim() || !file}>
            Add and Process
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
