/**
 * lib/http.ts
 * 
 * Cliente HTTP mejorado basado en Fetch API
 * 
 * Características:
 *  - Interceptores para request/response
 *  - Retry automático con exponential backoff
 *  - Timeouts configurables
 *  - Manejo de errores tipado
 *  - Logging en desarrollo
 */

import type { PipelineJob, PipelineResult } from '@/types/pipeline'
import { getToken } from './auth'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface HttpClientConfig {
  baseURL: string
  timeout?: number
  retries?: number
  retryDelay?: number
}

export class HttpError extends Error {
  status: number
  statusText: string
  data?: unknown
}

// ─── Configuración ────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: HttpClientConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function calculateBackoff(attempt: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempt)
}

function isRetryableStatus(status: number): boolean {
  // Retryable: 408 (timeout), 429 (rate limit), 5xx (server error)
  return status === 408 || status === 429 || status >= 500
}

async function throwHttpError(response: Response): Promise<never> {
  let data: unknown
  try {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }
  } catch (err) {
    // Ignorar errores al parsear body
  }

  const error: HttpError = new Error(
    data instanceof Object && 'message' in data ? String(data.message) : response.statusText
  ) as HttpError
  error.status = response.status
  error.statusText = response.statusText
  error.data = data
  throw error
}

// ─── Cliente HTTP ─────────────────────────────────────────────────────────────

export class HttpClient {
  private config: Required<HttpClientConfig>

  constructor(config: Partial<HttpClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<HttpClientConfig>
  }

  /**
   * Hacer un request con reintentos automáticos
   */
  async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${path}`
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        return await this.fetchWithTimeout<T>(url, options, attempt)
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))

        // Si es un error HTTP con status no retryable, lanzar inmediatamente
        if (err instanceof HttpError && !isRetryableStatus(err.status)) {
          throw err
        }

        // Si es el último intento, lanzar el error
        if (attempt >= this.config.retries) {
          throw lastError
        }

        // Esperar antes del siguiente intento
        const backoff = calculateBackoff(attempt, this.config.retryDelay)
        if (process.env.NODE_ENV === 'development') {
          console.debug(`[HTTP] Reintentando en ${backoff}ms (intento ${attempt + 1}/${this.config.retries})`)
        }
        await sleep(backoff)
      }
    }

    throw lastError
  }

  /**
   * Fetch con timeout
   */
  private async fetchWithTimeout<T>(
    url: string,
    options: RequestInit,
    attempt: number
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(this.getAuthHeader()),
          ...options.headers,
        },
      })

      if (!response.ok) {
        await throwHttpError(response)
      }

      if (response.status === 204) {
        return undefined as T
      }

      return await response.json() as T
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Get token del auth context
   */
  private getAuthHeader(): Record<string, string> {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // ─── Métodos HTTP ──────────────────────────────────────────────────────────

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  async post<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }

  /**
   * Upload de archivo multipart
   */
  async uploadFile<T>(
    path: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    // Agregar datos adicionales
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(`${this.config.baseURL}${path}`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          ...this.getAuthHeader(),
        },
        body: formData,
      })

      if (!response.ok) {
        await throwHttpError(response)
      }

      return await response.json() as T
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

// ─── Instancia Global ─────────────────────────────────────────────────────────

export const httpClient = new HttpClient()

// ─── Exportar tipo de error ───────────────────────────────────────────────────

export type { HttpError }





