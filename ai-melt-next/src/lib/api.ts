import { getToken } from './auth'
import type {
  Corpus,
  Analysis,
  DocumentSummary,
  Document,
  Level0Data,
  PrimaryMetaphor,
  ConventionalMetaphor,
  MetaphoricalScenario,
  MetaphorRegime,
  CulturalNarrative,
  AiProvider,
  ItemStatus,
  Level0Config,
  Level0ConfigOverrides,
  DocumentLevel0ConfigResponse,
  Level1Config,
  Level1ConfigOverrides,
  DocumentLevel1ConfigResponse,
  Level1PreviewResponse,
  Level1MetadataResponse,
} from '@/types'

const BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api'

export type Level1ApiMode = 'MELT' | 'PERSONAL'
export type PersonalAiProvider = 'OPENAI' | 'CLAUDE'

export type PersonalAiCredentialInfo = {
  configured: boolean
  keyHint: string | null
}

export type AiCredentialsStatusResponse = {
  canUsePersonalCredentials: boolean
  credentials: {
    OPENAI: PersonalAiCredentialInfo
    CLAUDE: PersonalAiCredentialInfo
  }
}

export type Level1ApiProviderAccess = {
  required: boolean
  source?: Level1ApiMode
  configured: boolean
  ready: boolean
  keyHint: string | null
}

export type Level1ApiAccessResponse = {
  mode: Level1ApiMode
  canUsePersonalCredentials: boolean
  personalCredentialsReady: boolean
  selectedModeReady: boolean
  providers: {
    OPENAI: Level1ApiProviderAccess
    CLAUDE: Level1ApiProviderAccess
  }
}

export type Level1PreviewWithApiAccess = Level1PreviewResponse & {
  apiAccess: Level1ApiAccessResponse
}

export type Level0ProgressResponse = {
  documentId: string
  status:
    | 'PENDING'
    | 'PROCESSING'
    | 'APPROVED'
    | 'FAILED'
  currentStep: string | null
  progress: number
  message?: string
  startedAt?: string
  completedAt?: string
  error?: string
  steps: Array<{
    key: string
    label: string
    status:
      | 'pending'
      | 'running'
      | 'done'
      | 'error'
    message?: string
  }>
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    cache: options.cache ?? 'no-store',

    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new Error(msg || `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

export const authApi = {
  createGuest: () =>
    request<{
      token: string
      user: {
        id: string
        isGuest: boolean
      }
    }>('/auth/guest', {
      method: 'POST',
    }),

  guestLogout: () =>
    request<{ message: string }>(
      '/auth/guest/logout',
      {
        method: 'POST',
      },
    ),
}

export const aiCredentialsApi = {
  getStatus: () =>
    request<AiCredentialsStatusResponse>(
      '/ai-credentials',
    ),

  save: (
    provider: PersonalAiProvider,
    apiKey: string,
  ) =>
    request<{
      provider: PersonalAiProvider
      configured: true
      keyHint: string | null
    }>('/ai-credentials', {
      method: 'PUT',
      body: JSON.stringify({
        provider,
        apiKey,
      }),
    }),

  delete: (provider: PersonalAiProvider) =>
    request<{
      provider: PersonalAiProvider
      configured: false
      keyHint: null
    }>(`/ai-credentials/${provider}`, {
      method: 'DELETE',
    }),
}

export const corpusApi = {
  list: () =>
    request<Corpus[]>('/corpus'),

  get: (id: string) =>
    request<Corpus>(`/corpus/${id}`),

  create: (data: {
    name: string
    description?: string
    discursiveCommunity?: string
    textualGenre?: string
  }) =>
    request<Corpus>('/corpus', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Partial<{
      name: string
      description: string
    }>,
  ) =>
    request<Corpus>(`/corpus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateLevel0Config: (
    id: string,
    config: Level0Config,
  ) =>
    request<Corpus>(
      `/corpus/${id}/level0-config`,
      {
        method: 'PUT',
        body: JSON.stringify({ config }),
      },
    ),

  updateLevel1Config: (
    id: string,
    config: Level1Config,
  ) =>
    request<Corpus>(
      `/corpus/${id}/level1-config`,
      {
        method: 'PUT',
        body: JSON.stringify({ config }),
      },
    ),

  delete: (id: string) =>
    request<void>(`/corpus/${id}`, {
      method: 'DELETE',
    }),
}

export const documentApi = {
  list: (corpusId: string) =>
    request<DocumentSummary[]>(
      `/documentos?corpusId=${corpusId}`,
    ),

  get: (id: string) =>
    request<Document>(
      `/documentos/${id}`,
    ),

  getLevel0: (id: string) =>
    request<Level0Data>(
      `/documentos/${id}/level0`,
    ),

  getLevel0Progress: (id: string) =>
    request<Level0ProgressResponse>(
      `/documentos/${id}/level0/progress`,
    ),

  getLevel0Config: (id: string) =>
    request<DocumentLevel0ConfigResponse>(
      `/documentos/${id}/level0/config`,
    ),

  updateLevel0Config: (
    id: string,
    overrides:
      | Level0ConfigOverrides
      | null,
  ) =>
    request<DocumentLevel0ConfigResponse>(
      `/documentos/${id}/level0/config`,
      {
        method: 'PUT',
        body: JSON.stringify({
          overrides,
        }),
      },
    ),

  getLevel1Config: (id: string) =>
    request<DocumentLevel1ConfigResponse>(
      `/documentos/${id}/level1/config`,
    ),

  updateLevel1Config: (
    id: string,
    overrides:
      | Level1ConfigOverrides
      | null,
  ) =>
    request<DocumentLevel1ConfigResponse>(
      `/documentos/${id}/level1/config`,
      {
        method: 'PUT',
        body: JSON.stringify({
          overrides,
        }),
      },
    ),

  getLevel1ApiAccess: (id: string) =>
    request<Level1ApiAccessResponse>(
      `/documentos/${id}/level1/api-access`,
    ),

  updateLevel1ApiAccess: (
    id: string,
    mode: Level1ApiMode,
  ) =>
    request<Level1ApiAccessResponse>(
      `/documentos/${id}/level1/api-access`,
      {
        method: 'PUT',
        body: JSON.stringify({ mode }),
      },
    ),

  uploadLevel0: async (payload: {
    corpusId: string
    title: string
    file: File
    author?: string
    language?: string
    documentType?: string
    description?: string
    pageCount?: number
  }): Promise<DocumentSummary> => {
    const token = getToken()
    const formData = new FormData()

    formData.append(
      'file',
      payload.file,
    )
    formData.append(
      'corpusId',
      payload.corpusId,
    )
    formData.append(
      'title',
      payload.title,
    )

    if (payload.author) {
      formData.append(
        'author',
        payload.author,
      )
    }

    if (payload.language) {
      formData.append(
        'language',
        payload.language,
      )
    }

    if (payload.documentType) {
      formData.append(
        'documentType',
        payload.documentType,
      )
    }

    if (payload.description) {
      formData.append(
        'description',
        payload.description,
      )
    }

    if (
      typeof payload.pageCount ===
      'number'
    ) {
      formData.append(
        'pageCount',
        String(payload.pageCount),
      )
    }

    const res = await fetch(
      `${BASE}/documentos/upload`,
      {
        method: 'POST',
        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: formData,
      },
    )

    if (!res.ok) {
      const msg = await res
        .text()
        .catch(() => res.statusText)

      throw new Error(
        msg || `HTTP ${res.status}`,
      )
    }

    return res.json()
  },

  processLevel0: (id: string) =>
    request<{ started: true }>(
      `/documentos/${id}/level0/process`,
      {
        method: 'POST',
      },
    ),

  create: (data: {
    corpusId: string
    title: string
    description?: string
    author?: string
    language: string
    documentType?: string
    pageCount?: number
    fileUrl?: string
  }) =>
    request<Document>('/documentos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(
      `/documentos/${id}`,
      {
        method: 'DELETE',
      },
    ),

  initAnalysis: (
    id: string,
    aiProvider: AiProvider = 'CLAUDE',
  ) =>
    request<Analysis>(
      `/documentos/${id}/analisis`,
      {
        method: 'POST',
        body: JSON.stringify({
          aiProvider,
        }),
      },
    ),
}

export const analysisApi = {
  get: (id: string) =>
    request<Analysis>(
      `/analisis/${id}`,
    ),

  process: (
    id: string,
    level: 1 | 2 | 3 | 4 | 5,
  ) =>
    request(
      `/analisis/${id}/nivel/${level}/process`,
      {
        method: 'POST',
      },
    ),

  getLevel1Preview: (id: string) =>
    request<Level1PreviewWithApiAccess>(
      `/analisis/${id}/nivel/1/preview`,
    ),

  getLevel1Metadata: (id: string) =>
    request<Level1MetadataResponse>(
      `/analisis/${id}/nivel/1/metadata`,
    ),

  getLevel1: (id: string) =>
    request<PrimaryMetaphor[]>(
      `/analisis/${id}/nivel/1`,
    ),

  getLevel2: (id: string) =>
    request<ConventionalMetaphor[]>(
      `/analisis/${id}/nivel/2`,
    ),

  getLevel3: (id: string) =>
    request<MetaphoricalScenario[]>(
      `/analisis/${id}/nivel/3`,
    ),

  getLevel4: (id: string) =>
    request<MetaphorRegime[]>(
      `/analisis/${id}/nivel/4`,
    ),

  getLevel5: (id: string) =>
    request<CulturalNarrative>(
      `/analisis/${id}/nivel/5`,
    ),

  approveAll: (
    id: string,
    level: 1 | 2 | 3 | 4 | 5,
  ) =>
    request(
      `/analisis/${id}/nivel/${level}/approve-all`,
      {
        method: 'POST',
      },
    ),

  approve: (
    id: string,
    level: 1 | 2 | 3 | 4 | 5,
  ) =>
    request(
      `/analisis/${id}/nivel/${level}/approve`,
      {
        method: 'POST',
      },
    ),

  updateItemStatus: (
    model: string,
    itemId: string,
    status: ItemStatus,
    analystNote?: string,
  ) =>
    request(
      `/analisis/items/${model}/${itemId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          analystNote,
        }),
      },
    ),
}
