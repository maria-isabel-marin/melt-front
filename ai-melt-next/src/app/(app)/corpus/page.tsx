'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { corpusApi } from '@/lib/api'
import type { Corpus } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Spinner, EmptyState } from '@/components/ui/accordion'
import { Plus, BookOpen, FileText, Trash2 } from 'lucide-react'

const GENRES = ['Academic', 'Political', 'Journalistic', 'Literary', 'Legal', 'Social Media', 'Other']

export default function CorpusPage() {
  const router = useRouter()
  const [corpora, setCorpora] = useState<Corpus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', discursiveCommunity: '', textualGenre: '' })

  useEffect(() => {
    corpusApi.list()
      .then(setCorpora)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

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
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete corpus')
    } finally {
      setDeleting(null)
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
                  <button
                    onClick={e => handleDelete(corpus.id, e)}
                    disabled={deleting === corpus.id}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    {deleting === corpus.id ? <Spinner size="sm" /> : <Trash2 size={14} />}
                  </button>
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
    </div>
  )
}
