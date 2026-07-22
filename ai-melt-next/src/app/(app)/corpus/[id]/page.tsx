'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { corpusApi, documentApi } from '@/lib/api'
import type { Corpus, DocumentSummary } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Input, Select, Textarea } from '@/components/ui/input'
import { LevelBadge } from '@/components/ui/badge'
import { Spinner, EmptyState } from '@/components/ui/accordion'
import { ArrowLeft, FileText, Trash2, UploadCloud } from 'lucide-react'
import { docTypeLabel } from '@/lib/utils'

const LANGUAGES = ['ENGLISH', 'SPANISH']
const DOC_TYPES = [
  'ACADEMIC_ARTICLE',
  'POLITICAL_SPEECH',
  'NEWS',
  'EDITORIAL',
  'INTERVIEW',
  'OFFICIAL_DOCUMENT',
  'SOCIAL_MEDIA',
  'OTHER',
]

export default function CorpusDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [corpus, setCorpus] = useState<Corpus | null>(null)
  const [docs, setDocs] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const [deleting, setDeleting] = useState<string | null>(null)

  const [uploadForm, setUploadForm] = useState({
    title: '',
    author: '',
    language: 'SPANISH',
    documentType: '',
    description: '',
    pageCount: '',
  })

  useEffect(() => {
    Promise.all([corpusApi.get(id), documentApi.list(id)])
      .then(([c, d]) => {
        setCorpus(c)
        setDocs(d)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleUploadDocument = async () => {
    if (!uploadFile || !uploadForm.title.trim()) return

    setUploading(true)
    try {
      const doc = await documentApi.uploadLevel0({
        corpusId: id,
        title: uploadForm.title.trim(),
        file: uploadFile,
        author: uploadForm.author || undefined,
        language: uploadForm.language,
        documentType: uploadForm.documentType || undefined,
        description: uploadForm.description || undefined,
        pageCount: uploadForm.pageCount ? Number(uploadForm.pageCount) : undefined,
      })

      setDocs((prev) => [doc, ...prev])
      setShowUpload(false)
      setUploadFile(null)
      setUploadForm({
        title: '',
        author: '',
        language: 'SPANISH',
        documentType: '',
        description: '',
        pageCount: '',
      })

      alert('Document uploaded successfully. Process Level 0 from the document view.')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this document and all its analysis data?')) return

    setDeleting(docId)
    try {
      await documentApi.delete(docId)
      setDocs((prev) => prev.filter((d) => d.id !== docId))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

  const overallStatus = (doc: DocumentSummary) => {
    if (!doc.analysis) return null

    const a = doc.analysis
    const statuses = [
      a.level0Status,
      a.level1Status,
      a.level2Status,
      a.level3Status,
      a.level4Status,
      a.level5Status,
    ]

    if (statuses.every((s) => s === 'APPROVED')) return 'APPROVED' as const
    if (statuses.some((s) => s === 'PROCESSING')) return 'PROCESSING' as const
    if (statuses.some((s) => s === 'PENDING_REVIEW')) return 'PENDING_REVIEW' as const
    if (statuses.some((s) => s === 'OUTDATED')) return 'OUTDATED' as const
    return 'PENDING' as const
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <button
        onClick={() => router.push('/corpus')}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Back to corpora
      </button>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {corpus && (
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{corpus.name}</h1>

              {corpus.description && (
                <p className="mt-1 text-sm text-gray-500">{corpus.description}</p>
              )}

              <div className="mt-2 flex gap-4 text-xs text-gray-400">
                {corpus.discursiveCommunity && <span>{corpus.discursiveCommunity}</span>}
                {corpus.textualGenre && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-600">
                    {corpus.textualGenre}
                  </span>
                )}
              </div>
            </div>

            {docs.length > 0 && (
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-blue-700 text-white hover:bg-blue-800"
              >
                <UploadCloud size={16} /> Ingest document
              </Button>
            )}
          </div>
        </div>
      )}

      {docs.length === 0 && !loading && (
        <EmptyState
          icon={<FileText size={48} />}
          title="No documents yet"
          description="Upload your first document to start the MELT workflow."
          action={
            <Button
              onClick={() => setShowUpload(true)}
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              <UploadCloud size={16} />
              Ingest document
            </Button>
          }
        />
      )}

      {docs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Language</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Pages</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>

            <tbody>
              {docs.map((doc) => {
                const status = overallStatus(doc)

                return (
                  <tr
                    key={doc.id}
                    className="group cursor-pointer border-b border-gray-50 hover:bg-gray-50"
                    onClick={() => router.push(`/corpus/${id}/document/${doc.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{doc.title}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {docTypeLabel(doc.documentType)}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-500">
                      {doc.language?.toLowerCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{doc.pageCount ?? '—'}</td>
                    <td className="px-4 py-3">
                      {status ? (
                        <LevelBadge status={status} />
                      ) : (
                        <span className="text-xs text-gray-400">No analysis</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        disabled={deleting === doc.id}
                        className="rounded p-1 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
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

      <Dialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        title="Ingest document"
        className="max-w-2xl"
      >
        <DialogBody>
          <Input
            label="Title *"
            placeholder="Document title"
            value={uploadForm.title}
            onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))}
          />

          <Input
            label="Author"
            placeholder="Author name"
            value={uploadForm.author}
            onChange={(e) => setUploadForm((p) => ({ ...p, author: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Language *"
              value={uploadForm.language}
              onChange={(e) => setUploadForm((p) => ({ ...p, language: e.target.value }))}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0) + l.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>

            <Select
              label="Document Type"
              value={uploadForm.documentType}
              onChange={(e) => setUploadForm((p) => ({ ...p, documentType: e.target.value }))}
            >
              <option value="">Select type…</option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {docTypeLabel(t as never)}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Page Count"
            type="number"
            min={1}
            placeholder="e.g. 12"
            value={uploadForm.pageCount}
            onChange={(e) => setUploadForm((p) => ({ ...p, pageCount: e.target.value }))}
          />

          <Textarea
            label="Description"
            placeholder="Short description"
            rows={4}
            value={uploadForm.description}
            onChange={(e) => setUploadForm((p) => ({ ...p, description: e.target.value }))}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">PDF or TXT file *</label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {uploadFile && (
              <p className="text-xs text-gray-500">
                Selected file: <strong>{uploadFile.name}</strong>
              </p>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowUpload(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUploadDocument}
            loading={uploading}
            disabled={!uploadFile || !uploadForm.title.trim()}
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            Ingest document
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}