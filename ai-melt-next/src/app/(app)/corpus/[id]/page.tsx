'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { corpusApi, documentApi } from '@/lib/api'
import type {
  Corpus,
  DocumentSummary,
  DocumentType,
  Language,
  Level0Config,
} from '@/types'
import { Button } from '@/components/ui/button'
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
  ArrowLeft,
  FileText,
  Trash2,
  UploadCloud,
  Settings2,
} from 'lucide-react'
import { LocalizedLevelBadge } from '@/components/i18n/LocalizedLevelBadge'
import { useI18n } from '@/components/i18n/I18nProvider'
import { Level0ConfigDialog } from '@/components/config/Level0ConfigDialog'
import { DEFAULT_LEVEL0_CONFIG } from '@/lib/level0-config'

const LANGUAGES: Language[] = ['ENGLISH', 'SPANISH']

const DOC_TYPES: DocumentType[] = [
  'ACADEMIC_ARTICLE',
  'POLITICAL_SPEECH',
  'NEWS',
  'EDITORIAL',
  'INTERVIEW',
  'OFFICIAL_DOCUMENT',
  'SOCIAL_MEDIA',
  'OTHER',
]

const EMPTY_UPLOAD_FORM = {
  title: '',
  author: '',
  language: 'SPANISH' as Language,
  documentType: '',
  description: '',
  pageCount: '',
}

export default function CorpusDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { t } = useI18n()

  const [corpus, setCorpus] = useState<Corpus | null>(null)
  const [docs, setDocs] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(
    null,
  )
  const [deleting, setDeleting] = useState<string | null>(
    null,
  )
  const [uploadForm, setUploadForm] = useState(
    EMPTY_UPLOAD_FORM,
  )
  const [showLevel0Config, setShowLevel0Config] = useState(false)
  const [savingLevel0Config, setSavingLevel0Config] = useState(false)

  useEffect(() => {
    Promise.all([
      corpusApi.get(id),
      documentApi.list(id),
    ])
      .then(([loadedCorpus, loadedDocuments]) => {
        setCorpus(loadedCorpus)
        setDocs(loadedDocuments)
      })
      .catch((requestError: unknown) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Error',
        )
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleUploadDocument = async () => {
    if (!uploadFile || !uploadForm.title.trim()) return

    setUploading(true)

    try {
      const document = await documentApi.uploadLevel0({
        corpusId: id,
        title: uploadForm.title.trim(),
        file: uploadFile,
        author: uploadForm.author || undefined,
        language: uploadForm.language,
        documentType:
          uploadForm.documentType || undefined,
        description: uploadForm.description || undefined,
        pageCount: uploadForm.pageCount
          ? Number(uploadForm.pageCount)
          : undefined,
      })

      setDocs((previous) => [document, ...previous])
      setShowUpload(false)
      setUploadFile(null)
      setUploadForm(EMPTY_UPLOAD_FORM)

      alert(t('corpusDetail.uploadSuccess'))
    } catch (uploadError: unknown) {
      alert(
        uploadError instanceof Error
          ? uploadError.message
          : t('corpusDetail.uploadError'),
      )
    } finally {
      setUploading(false)
    }
  }

  const handleSaveLevel0Config = async (config: Level0Config) => {
    setSavingLevel0Config(true)

    try {
      const updatedCorpus = await corpusApi.updateLevel0Config(id, config)
      setCorpus(updatedCorpus)
      setShowLevel0Config(false)

      const refreshedDocuments = await documentApi.list(id)
      setDocs(refreshedDocuments)
    } catch (configError: unknown) {
      alert(
        configError instanceof Error
          ? configError.message
          : t('level0Config.saveError'),
      )
    } finally {
      setSavingLevel0Config(false)
    }
  }

  const handleDelete = async (
    documentId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation()

    if (!confirm(t('corpusDetail.deleteConfirm'))) {
      return
    }

    setDeleting(documentId)

    try {
      await documentApi.delete(documentId)
      setDocs((previous) =>
        previous.filter(
          (document) => document.id !== documentId,
        ),
      )
    } catch (deleteError: unknown) {
      alert(
        deleteError instanceof Error
          ? deleteError.message
          : t('corpusDetail.deleteError'),
      )
    } finally {
      setDeleting(null)
    }
  }

  const overallStatus = (document: DocumentSummary) => {
    if (!document.analysis) return null

    const analysis = document.analysis
    const statuses = [
      analysis.level0Status,
      analysis.level1Status,
      analysis.level2Status,
      analysis.level3Status,
      analysis.level4Status,
      analysis.level5Status,
    ]

    if (statuses.every((status) => status === 'APPROVED')) {
      return 'APPROVED' as const
    }

    if (
      statuses.some((status) => status === 'PROCESSING')
    ) {
      return 'PROCESSING' as const
    }

    if (
      statuses.some(
        (status) => status === 'PENDING_REVIEW',
      )
    ) {
      return 'PENDING_REVIEW' as const
    }

    if (statuses.some((status) => status === 'OUTDATED')) {
      return 'OUTDATED' as const
    }

    return 'PENDING' as const
  }

  const documentTypeLabel = (
    documentType?: DocumentType,
  ) =>
    documentType
      ? t(`documentTypes.${documentType}`)
      : t('common.unknown')

  const documentLanguageLabel = (language?: Language) =>
    language
      ? t(`documentLanguages.${language}`)
      : t('common.unknown')

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
        <ArrowLeft size={16} />
        {t('corpusDetail.back')}
      </button>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {corpus && (
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {corpus.name}
              </h1>

              {corpus.description && (
                <p className="mt-1 text-sm text-gray-500">
                  {corpus.description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-400">
                {corpus.discursiveCommunity && (
                  <span>
                    {corpus.discursiveCommunity}
                  </span>
                )}

                {corpus.textualGenre && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-600">
                    {corpus.textualGenre}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowLevel0Config(true)}
              >
                <Settings2 size={16} />
                {t('level0Config.configure')}
              </Button>

              {docs.length > 0 && (
                <Button
                  onClick={() => setShowUpload(true)}
                  className="bg-blue-700 text-white hover:bg-blue-800"
                >
                  <UploadCloud size={16} />
                  {t('corpusDetail.ingestDocument')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {docs.length === 0 && !loading && (
        <EmptyState
          icon={<FileText size={48} />}
          title={t('corpusDetail.noDocumentsTitle')}
          description={t(
            'corpusDetail.noDocumentsDescription',
          )}
          action={
            <Button
              onClick={() => setShowUpload(true)}
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              <UploadCloud size={16} />
              {t('corpusDetail.ingestDocument')}
            </Button>
          }
        />
      )}

      {docs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    {t('corpusDetail.title')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    {t('corpusDetail.type')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    {t('corpusDetail.language')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    {t('corpusDetail.pages')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    {t('corpusDetail.status')}
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {docs.map((document) => {
                  const status = overallStatus(document)

                  return (
                    <tr
                      key={document.id}
                      className="group cursor-pointer border-b border-gray-50 hover:bg-gray-50"
                      onClick={() =>
                        router.push(
                          `/corpus/${id}/document/${document.id}`,
                        )
                      }
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {document.title}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {documentTypeLabel(
                          document.documentType,
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {documentLanguageLabel(
                          document.language,
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {document.pageCount ?? '—'}
                      </td>

                      <td className="px-4 py-3">
                        {status ? (
                          <LocalizedLevelBadge
                            status={status}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">
                            {t('common.noAnalysis')}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={(event) =>
                            handleDelete(
                              document.id,
                              event,
                            )
                          }
                          disabled={
                            deleting === document.id
                          }
                          aria-label={t(
                            'corpusDetail.deleteConfirm',
                          )}
                          className="rounded p-1 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        >
                          {deleting === document.id ? (
                            <Spinner size="sm" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}


      <Level0ConfigDialog
        open={showLevel0Config}
        onClose={() => setShowLevel0Config(false)}
        scope="corpus"
        config={
          corpus?.effectiveLevel0Config ??
          corpus?.level0Config ??
          DEFAULT_LEVEL0_CONFIG
        }
        saving={savingLevel0Config}
        onSave={handleSaveLevel0Config}
      />

      <Dialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        title={t('corpusDetail.dialogTitle')}
        className="max-w-2xl"
      >
        <DialogBody>
          <Input
            label={t('corpusDetail.documentTitle')}
            placeholder={t(
              'corpusDetail.documentTitlePlaceholder',
            )}
            value={uploadForm.title}
            onChange={(event) =>
              setUploadForm((previous) => ({
                ...previous,
                title: event.target.value,
              }))
            }
          />

          <Input
            label={t('corpusDetail.author')}
            placeholder={t(
              'corpusDetail.authorPlaceholder',
            )}
            value={uploadForm.author}
            onChange={(event) =>
              setUploadForm((previous) => ({
                ...previous,
                author: event.target.value,
              }))
            }
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label={t('corpusDetail.languageRequired')}
              value={uploadForm.language}
              onChange={(event) =>
                setUploadForm((previous) => ({
                  ...previous,
                  language:
                    event.target.value as Language,
                }))
              }
            >
              {LANGUAGES.map((language) => (
                <option
                  key={language}
                  value={language}
                >
                  {documentLanguageLabel(language)}
                </option>
              ))}
            </Select>

            <Select
              label={t('corpusDetail.documentType')}
              value={uploadForm.documentType}
              onChange={(event) =>
                setUploadForm((previous) => ({
                  ...previous,
                  documentType: event.target.value,
                }))
              }
            >
              <option value="">
                {t('corpusDetail.selectType')}
              </option>

              {DOC_TYPES.map((documentType) => (
                <option
                  key={documentType}
                  value={documentType}
                >
                  {documentTypeLabel(documentType)}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label={t('corpusDetail.pageCount')}
            type="number"
            min={1}
            placeholder={t(
              'corpusDetail.pageCountPlaceholder',
            )}
            value={uploadForm.pageCount}
            onChange={(event) =>
              setUploadForm((previous) => ({
                ...previous,
                pageCount: event.target.value,
              }))
            }
          />

          <Textarea
            label={t('corpusDetail.description')}
            placeholder={t(
              'corpusDetail.descriptionPlaceholder',
            )}
            rows={4}
            value={uploadForm.description}
            onChange={(event) =>
              setUploadForm((previous) => ({
                ...previous,
                description: event.target.value,
              }))
            }
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              {t('corpusDetail.file')}
            </label>

            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(event) =>
                setUploadFile(
                  event.target.files?.[0] ?? null,
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />

            {uploadFile && (
              <p className="text-xs text-gray-500">
                {t('corpusDetail.selectedFile', {
                  name: uploadFile.name,
                })}
              </p>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowUpload(false)}
          >
            {t('corpusDetail.cancel')}
          </Button>

          <Button
            onClick={handleUploadDocument}
            loading={uploading}
            disabled={
              !uploadFile ||
              !uploadForm.title.trim()
            }
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            {t('corpusDetail.ingestDocument')}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
