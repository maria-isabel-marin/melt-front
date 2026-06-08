/**
 * types/pipeline.ts
 * 
 * Tipos TypeScript para el pipeline N0 modular (step7_export.py)
 * 
 * Incluye:
 *  - Metadata del documento procesado
 *  - Estadísticas de análisis
 *  - Estructura de oraciones con NLP
 *  - Información de capítulos
 *  - Métricas de densidad textual
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export type PipelineJobStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type LanguageCode = 'es' | 'en' | 'pt' | 'fr'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export interface PipelineMetadata {
  title: string
  author: string
  language: LanguageCode
  processed_at: string  // ISO 8601
  source_file: string
}

// ─── Densidad Textual ─────────────────────────────────────────────────────────

export interface DensityStats {
  avg_words_per_sentence: number
  avg_sentences_per_page: number
  avg_tokens_per_word: number
  avg_entities_per_sentence: number
}

// ─── Estadísticas Globales ───────────────────────────────────────────────────

export interface PipelineStatistics {
  total_pages: number
  total_sentences: number
  total_words: number
  total_tokens: number
  total_characters: number
  total_chapters: number
  total_ner_entities: number
  density: DensityStats
}

// ─── Entidad NER ──────────────────────────────────────────────────────────────

export interface NEREntity {
  texto: string
  start: number
  end: number
  label: string
}

// ─── Oración ───────────────────────────────────────────────────────────────────

export interface Sentence {
  ID_oracion: string
  pagina: number
  capitulo: string
  oracion_texto: string
  n_palabras: number
  n_caracteres: number
  
  // Análisis lingüístico (paso 5)
  tokens: string[]
  lemas: string[]
  pos_tags: string[]
  entidades_NER: NEREntity[]
}

// ─── Capítulo ─────────────────────────────────────────────────────────────────

export interface ChapterStats {
  name: string
  start_page: number
  end_page: number
  n_pages: number
  n_sentences: number
  n_words: number
  n_tokens: number
  n_ner_entities: number
  
  // Métricas calculadas en step7
  avg_sentences_per_page?: number
  avg_words_per_sentence?: number
}

// ─── Ejecución ───────────────────────────────────────────────────────────────

export interface ExecutionInfo {
  step6_source: string
  pipeline_version: string
  language_model: string
}

// ─── Documento N0 Completo ───────────────────────────────────────────────────

export interface N0Document {
  metadata: PipelineMetadata
  statistics: PipelineStatistics
  chapters: ChapterStats[]
  sentences: Sentence[]
  execution: ExecutionInfo
}

// ─── Estado de Pipeline Job ───────────────────────────────────────────────────

export interface PipelineJob {
  id: string
  status: PipelineJobStatus
  progress?: number  // 0-100
  created_at: string
  updated_at: string
  error?: string
  result?: N0Document
}

// ─── Request para iniciar pipeline ────────────────────────────────────────────

export interface PipelineRequest {
  file: File
  title?: string
  author?: string
  language?: LanguageCode
}

// ─── Response de iniciar pipeline ─────────────────────────────────────────────

export interface PipelineResponse {
  job_id: string
  status: PipelineJobStatus
  created_at: string
}

// ─── Resultado final ──────────────────────────────────────────────────────────

export interface PipelineResult {
  job_id: string
  status: PipelineJobStatus
  document?: N0Document
  error?: string
  created_at: string
  completed_at?: string
}
