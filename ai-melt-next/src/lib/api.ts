import { getToken } from './auth'
import type {
  Corpus, Analysis, DocumentSummary, Document,
  PrimaryMetaphor, ConventionalMetaphor, MetaphoricalScenario,
  MetaphorRegime, CulturalNarrative, AiProvider, ItemStatus,
} from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
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

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  createGuest: () =>
    request<{ token: string; user: { id: string; isGuest: boolean } }>('/auth/guest', { method: 'POST' }),
  guestLogout: () =>
    request<{ message: string }>('/auth/guest/logout', { method: 'POST' }),
}

// ─── Corpus ───────────────────────────────────────────────────────────────────

export const corpusApi = {
  list: () => request<Corpus[]>('/corpus'),
  get: (id: string) => request<Corpus>(`/corpus/${id}`),
  create: (data: { name: string; description?: string; discursiveCommunity?: string; textualGenre?: string }) =>
    request<Corpus>('/corpus', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ name: string; description: string }>) =>
    request<Corpus>(`/corpus/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<Corpus>(`/corpus/${id}`, { method: 'DELETE' }),
}

// ─── Documents ───────────────────────────────────────────────────────────────

export const documentApi = {
  list: (corpusId: string) => request<DocumentSummary[]>(`/documentos?corpusId=${corpusId}`),
  get: (id: string) => request<Document>(`/documentos/${id}`),
  create: (data: {
    corpusId: string; title: string; description?: string; author?: string;
    language: string; documentType?: string; pageCount?: number; fileUrl?: string
  }) => request<Document>('/documentos', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request<Document>(`/documentos/${id}`, { method: 'DELETE' }),
  initAnalysis: (id: string, aiProvider: AiProvider = 'CLAUDE') =>
    request<Analysis>(`/documentos/${id}/analisis`, { method: 'POST', body: JSON.stringify({ aiProvider }) }),
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

export const analysisApi = {
  get: (id: string) => request<Analysis>(`/analisis/${id}`),
  process: (id: string, level: 1 | 2 | 3 | 4 | 5) =>
    request<unknown>(`/analisis/${id}/nivel/${level}/process`, { method: 'POST' }),
  getLevel1: (id: string) => request<PrimaryMetaphor[]>(`/analisis/${id}/nivel/1`),
  getLevel2: (id: string) => request<ConventionalMetaphor[]>(`/analisis/${id}/nivel/2`),
  getLevel3: (id: string) => request<MetaphoricalScenario[]>(`/analisis/${id}/nivel/3`),
  getLevel4: (id: string) => request<MetaphorRegime[]>(`/analisis/${id}/nivel/4`),
  getLevel5: (id: string) => request<CulturalNarrative>(`/analisis/${id}/nivel/5`),
  approveAll: (id: string, level: 1 | 2 | 3 | 4 | 5) =>
    request<Analysis>(`/analisis/${id}/nivel/${level}/approve-all`, { method: 'POST' }),
  approve: (id: string, level: 1 | 2 | 3 | 4 | 5) =>
    request<Analysis>(`/analisis/${id}/nivel/${level}/approve`, { method: 'POST' }),
  updateItemStatus: (model: string, itemId: string, status: ItemStatus, analystNote?: string) =>
    request<unknown>(`/analisis/items/${model}/${itemId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, analystNote }),
    }),
}
