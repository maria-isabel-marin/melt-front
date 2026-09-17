'use client'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  Bot,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from 'lucide-react'

import {
  aiCredentialsApi,
  documentApi,
  type Level1ApiAccessResponse,
  type Level1ApiMode,
  type PersonalAiProvider,
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/accordion'
import { useI18n } from '@/components/i18n/I18nProvider'
import { cn } from '@/lib/utils'

interface Props {
  documentId: string
  disabled?: boolean
  onChanged?: () => Promise<void> | void
}

const PROVIDERS: PersonalAiProvider[] = [
  'OPENAI',
  'CLAUDE',
]

export function Level1ApiAccessCard({
  documentId,
  disabled = false,
  onChanged,
}: Props) {
  const { t } = useI18n()

  const [access, setAccess] =
    useState<Level1ApiAccessResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [modeSaving, setModeSaving] = useState(false)
  const [credentialProvider, setCredentialProvider] =
    useState<PersonalAiProvider | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [savingCredential, setSavingCredential] =
    useState(false)
  const [deletingProvider, setDeletingProvider] =
    useState<PersonalAiProvider | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await documentApi.getLevel1ApiAccess(
        documentId,
      )
      setAccess(data)
      return data
    } catch (requestError: unknown) {
      setAccess(null)
      setError(
        requestError instanceof Error
          ? requestError.message
          : t('level1ApiAccess.refreshError'),
      )
      return null
    } finally {
      setLoading(false)
    }
  }, [documentId, t])

  useEffect(() => {
    load()
  }, [load])

  const refreshEverything = async () => {
    await load()
    await onChanged?.()
  }

  const handleModeChange = async (
    mode: Level1ApiMode,
  ) => {
    if (
      !access ||
      disabled ||
      modeSaving ||
      access.mode === mode
    ) {
      return
    }

    setModeSaving(true)
    setError('')

    try {
      const updated =
        await documentApi.updateLevel1ApiAccess(
          documentId,
          mode,
        )

      setAccess(updated)
      await onChanged?.()
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t('level1ApiAccess.modeError'),
      )
    } finally {
      setModeSaving(false)
    }
  }

  const openCredentialDialog = (
    provider: PersonalAiProvider,
  ) => {
    setCredentialProvider(provider)
    setApiKey('')
    setError('')
  }

  const closeCredentialDialog = () => {
    if (savingCredential) return

    setCredentialProvider(null)
    setApiKey('')
  }

  const handleSaveCredential = async () => {
    if (
      !credentialProvider ||
      !apiKey.trim() ||
      savingCredential
    ) {
      return
    }

    setSavingCredential(true)
    setError('')

    try {
      await aiCredentialsApi.save(
        credentialProvider,
        apiKey.trim(),
      )

      setApiKey('')
      setCredentialProvider(null)
      await refreshEverything()
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t('level1ApiAccess.saveError'),
      )
    } finally {
      setSavingCredential(false)
    }
  }

  const handleDeleteCredential = async (
    provider: PersonalAiProvider,
  ) => {
    if (
      deletingProvider ||
      !confirm(
        t('level1ApiAccess.deleteConfirm', {
          provider: providerLabel(provider),
        }),
      )
    ) {
      return
    }

    setDeletingProvider(provider)
    setError('')

    try {
      await aiCredentialsApi.delete(provider)
      await refreshEverything()
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t('level1ApiAccess.deleteError'),
      )
    } finally {
      setDeletingProvider(null)
    }
  }

  const providerLabel = (
    provider: PersonalAiProvider,
  ) =>
    provider === 'OPENAI'
      ? t('level1ApiAccess.providers.OPENAI')
      : t('level1ApiAccess.providers.CLAUDE')

  const providerInfo = credentialProvider
    ? access?.providers[credentialProvider]
    : null

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={18}
                className="text-blue-700"
              />
              <h2 className="text-base font-semibold text-gray-900">
                {t('level1ApiAccess.title')}
              </h2>
            </div>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-gray-500">
              {t('level1ApiAccess.description')}
            </p>
          </div>

          {(loading || modeSaving) && (
            <Spinner size="sm" />
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {access && (
          <>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <button
                type="button"
                onClick={() => handleModeChange('MELT')}
                disabled={disabled || modeSaving}
                className={cn(
                  'rounded-xl border p-4 text-left transition-colors',
                  access.mode === 'MELT'
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                  (disabled || modeSaving) &&
                    'cursor-not-allowed opacity-60',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                      access.mode === 'MELT'
                        ? 'border-blue-700'
                        : 'border-gray-300',
                    )}
                  >
                    {access.mode === 'MELT' && (
                      <span className="h-2 w-2 rounded-full bg-blue-700" />
                    )}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <Bot size={15} />
                      <p className="text-sm font-semibold text-gray-900">
                        {t('level1ApiAccess.melt.title')}
                      </p>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      {t('level1ApiAccess.melt.description')}
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('PERSONAL')}
                disabled={
                  disabled ||
                  modeSaving ||
                  !access.canUsePersonalCredentials
                }
                className={cn(
                  'rounded-xl border p-4 text-left transition-colors',
                  access.mode === 'PERSONAL'
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                  (disabled ||
                    modeSaving ||
                    !access.canUsePersonalCredentials) &&
                    'cursor-not-allowed opacity-60',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                      access.mode === 'PERSONAL'
                        ? 'border-blue-700'
                        : 'border-gray-300',
                    )}
                  >
                    {access.mode === 'PERSONAL' && (
                      <span className="h-2 w-2 rounded-full bg-blue-700" />
                    )}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <KeyRound size={15} />
                      <p className="text-sm font-semibold text-gray-900">
                        {t('level1ApiAccess.personal.title')}
                      </p>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      {t('level1ApiAccess.personal.description')}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {!access.canUsePersonalCredentials && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {t('level1ApiAccess.guestUnavailable')}
              </div>
            )}

            <div className="mt-5 divide-y divide-gray-100 rounded-xl border border-gray-200">
              {PROVIDERS.map((provider) => {
                const info = access.providers[provider]
                const deleting = deletingProvider === provider

                return (
                  <div
                    key={provider}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {providerLabel(provider)}
                        </p>

                        {info.required && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                            {t('level1ApiAccess.required')}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        {info.configured ? (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <CheckCircle2 size={13} />
                            {t('level1ApiAccess.configured')}
                            {info.keyHint
                              ? ` · ${info.keyHint}`
                              : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500">
                            <TriangleAlert size={13} />
                            {t('level1ApiAccess.notConfigured')}
                          </span>
                        )}

                        {access.mode === 'PERSONAL' &&
                          info.required &&
                          !info.ready && (
                            <span className="text-amber-700">
                              {t('level1ApiAccess.missingRequiredKey')}
                            </span>
                          )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openCredentialDialog(provider)}
                        disabled={
                          disabled ||
                          !access.canUsePersonalCredentials ||
                          deleting
                        }
                      >
                        <KeyRound size={13} />
                        {info.configured
                          ? t('level1ApiAccess.replace')
                          : t('level1ApiAccess.add')}
                      </Button>

                      {info.configured && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCredential(provider)}
                          disabled={
                            disabled ||
                            !access.canUsePersonalCredentials ||
                            deleting
                          }
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          {deleting ? (
                            <Spinner size="sm" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          {t('level1ApiAccess.delete')}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2.5 text-xs leading-relaxed text-gray-600">
              {access.mode === 'MELT'
                ? t('level1ApiAccess.melt.limitNotice')
                : t('level1ApiAccess.personal.billingNotice')}
            </div>
          </>
        )}
      </div>

      <Dialog
        open={credentialProvider !== null}
        onClose={closeCredentialDialog}
        title={
          credentialProvider
            ? providerInfo?.configured
              ? t('level1ApiAccess.dialog.replaceTitle', {
                  provider: providerLabel(credentialProvider),
                })
              : t('level1ApiAccess.dialog.addTitle', {
                  provider: providerLabel(credentialProvider),
                })
            : t('level1ApiAccess.title')
        }
        className="max-w-lg"
      >
        <DialogBody>
          <Input
            label={t('level1ApiAccess.dialog.apiKeyLabel')}
            type="password"
            autoComplete="off"
            placeholder={t('level1ApiAccess.dialog.apiKeyPlaceholder')}
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
          />

          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs leading-relaxed text-blue-900">
            {t('level1ApiAccess.dialog.securityNotice')}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeCredentialDialog}
            disabled={savingCredential}
          >
            {t('level1ApiAccess.cancel')}
          </Button>

          <Button
            onClick={handleSaveCredential}
            loading={savingCredential}
            disabled={!apiKey.trim() || savingCredential}
          >
            {t('level1ApiAccess.save')}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}