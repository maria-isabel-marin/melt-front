'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { corpusApi } from '@/lib/api'
import type { Corpus } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Input,
  Select,
  Textarea,
} from '@/components/ui/input'
import {
  EmptyState,
  Spinner,
} from '@/components/ui/accordion'
import {
  BookOpen,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react'
import { useI18n } from '@/components/i18n/I18nProvider'

const GENRES = [
  { value: 'Academic', key: 'genres.academic' },
  { value: 'Political', key: 'genres.political' },
  { value: 'Journalistic', key: 'genres.journalistic' },
  { value: 'Literary', key: 'genres.literary' },
  { value: 'Legal', key: 'genres.legal' },
  { value: 'Social Media', key: 'genres.socialMedia' },
  { value: 'Other', key: 'genres.other' },
] as const

const GENRE_KEYS = Object.fromEntries(
  GENRES.map((genre) => [genre.value, genre.key]),
) as Record<string, string>

const EMPTY_FORM = {
  name: '',
  description: '',
  discursiveCommunity: '',
  textualGenre: '',
}

export default function CorpusPage() {
  const router = useRouter()
  const { t } = useI18n()

  const [corpora, setCorpora] = useState<Corpus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    corpusApi
      .list()
      .then(setCorpora)
      .catch((requestError: unknown) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Error',
        )
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!form.name.trim()) return

    setCreating(true)

    try {
      const newCorpus = await corpusApi.create({
        name: form.name.trim(),
        description: form.description || undefined,
        discursiveCommunity:
          form.discursiveCommunity || undefined,
        textualGenre: form.textualGenre || undefined,
      })

      setCorpora((previous) => [newCorpus, ...previous])
      setShowCreate(false)
      setForm(EMPTY_FORM)
    } catch (createError: unknown) {
      alert(
        createError instanceof Error
          ? createError.message
          : t('corpus.createError'),
      )
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (
    id: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation()

    if (!confirm(t('corpus.deleteConfirm'))) return

    setDeleting(id)

    try {
      await corpusApi.delete(id)
      setCorpora((previous) =>
        previous.filter((corpusItem) => corpusItem.id !== id),
      )
    } catch (deleteError: unknown) {
      alert(
        deleteError instanceof Error
          ? deleteError.message
          : t('corpus.deleteError'),
      )
    } finally {
      setDeleting(null)
    }
  }

  const translateGenre = (genre?: string) => {
    if (!genre) return ''
    const key = GENRE_KEYS[genre]
    return key ? t(key) : genre
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('corpus.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('corpus.subtitle')}
          </p>
        </div>

        {corpora.length > 0 && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            {t('corpus.newCorpus')}
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && corpora.length === 0 && (
        <EmptyState
          icon={<BookOpen size={48} />}
          title={t('corpus.noCorporaTitle')}
          description={t('corpus.noCorporaDescription')}
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              {t('corpus.createFirstCorpus')}
            </Button>
          }
        />
      )}

      {!loading && corpora.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {corpora.map((corpusItem) => {
            const documentCount =
              corpusItem._count?.documents ?? 0

            return (
              <Card
                key={corpusItem.id}
                className="group cursor-pointer transition-shadow hover:shadow-md"
                onClick={() =>
                  router.push(`/corpus/${corpusItem.id}`)
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {corpusItem.name}
                    </CardTitle>

                    <button
                      onClick={(event) =>
                        handleDelete(corpusItem.id, event)
                      }
                      disabled={deleting === corpusItem.id}
                      aria-label={t('corpus.deleteConfirm')}
                      className="rounded p-1 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    >
                      {deleting === corpusItem.id ? (
                        <Spinner size="sm" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>

                  {corpusItem.description && (
                    <CardDescription className="line-clamp-2">
                      {corpusItem.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <FileText size={12} />
                      {documentCount}{' '}
                      {documentCount === 1
                        ? t('corpus.document')
                        : t('corpus.documents')}
                    </span>

                    {corpusItem.textualGenre && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                        {translateGenre(corpusItem.textualGenre)}
                      </span>
                    )}
                  </div>

                  {corpusItem.discursiveCommunity && (
                    <p className="mt-2 truncate text-xs text-gray-400">
                      {corpusItem.discursiveCommunity}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('corpus.dialogTitle')}
      >
        <DialogBody>
          <Input
            label={t('corpus.name')}
            placeholder={t('corpus.namePlaceholder')}
            value={form.name}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
          />

          <Textarea
            label={t('corpus.description')}
            placeholder={t('corpus.descriptionPlaceholder')}
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                description: event.target.value,
              }))
            }
          />

          <Input
            label={t('corpus.discursiveCommunity')}
            placeholder={t(
              'corpus.discursiveCommunityPlaceholder',
            )}
            value={form.discursiveCommunity}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                discursiveCommunity: event.target.value,
              }))
            }
          />

          <Select
            label={t('corpus.textualGenre')}
            value={form.textualGenre}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                textualGenre: event.target.value,
              }))
            }
          >
            <option value="">
              {t('corpus.selectGenre')}
            </option>

            {GENRES.map((genre) => (
              <option key={genre.value} value={genre.value}>
                {t(genre.key)}
              </option>
            ))}
          </Select>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowCreate(false)}
          >
            {t('corpus.cancel')}
          </Button>

          <Button
            onClick={handleCreate}
            loading={creating}
            disabled={!form.name.trim()}
          >
            {t('corpus.create')}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
