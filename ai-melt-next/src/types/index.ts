// ─── Enums ───────────────────────────────────────────────────────────────────

export type LevelStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'OUTDATED'

export type ItemStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'MODIFIED'

export type AiProvider = 'CLAUDE' | 'OPENAI' | 'HUGGINGFACE'

export type DocumentType =
  | 'ACADEMIC_ARTICLE'
  | 'POLITICAL_SPEECH'
  | 'NEWS'
  | 'EDITORIAL'
  | 'INTERVIEW'
  | 'OFFICIAL_DOCUMENT'
  | 'SOCIAL_MEDIA'
  | 'OTHER'

export type Language = 'SPANISH' | 'ENGLISH'

// ─── Level 0 configuration ────────────────────────────────────────────────────

export type Level0ChapterDetectionMethod =
  | 'AUTO'
  | 'TOC'
  | 'PRINTED_INDEX'
  | 'FONT_SIZE'
  | 'NONE'

export interface Level0Config {
  chapterDetection: {
    enabled: boolean
    method: Level0ChapterDetectionMethod
  }
  cleaning: {
    repairHyphenation: boolean
    detectRepeatedHeaders: boolean
    repeatedHeaderThreshold: number
    excludeFrontMatter: boolean
    minLineLength: number
    additionalHeadersFooters: string[]
  }
  footnotes: {
    extract: boolean
  }
  segmentation: {
    minChars: number
    maxChars: number
  }
  excludedPageRanges: Array<[number, number]> | null
}

export interface Level0ConfigOverrides {
  chapterDetection?: Partial<Level0Config['chapterDetection']>
  cleaning?: Partial<Level0Config['cleaning']>
  footnotes?: Partial<Level0Config['footnotes']>
  segmentation?: Partial<Level0Config['segmentation']>
  excludedPageRanges?: Array<[number, number]> | null
}

export type Level0ConfigSource = 'CORPUS' | 'DOCUMENT'

export interface DocumentLevel0ConfigResponse {
  corpusConfig: Level0Config
  overrides: Level0ConfigOverrides | null
  effectiveConfig: Level0Config
  source: Level0ConfigSource
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string
  email: string
  isGuest: boolean
  iat?: number
  exp?: number
}

// ─── Corpus ───────────────────────────────────────────────────────────────────

export interface Corpus {
  id: string
  name: string
  description?: string
  wordCount?: number
  discursiveCommunity?: string
  textualGenre?: string
  level0Config?: Level0Config | null
  effectiveLevel0Config?: Level0Config
  createdAt: string
  updatedAt: string
  _count?: { documents: number }
  documents?: DocumentSummary[]
}

// ─── Documents ────────────────────────────────────────────────────────────────

export interface DocumentSummary {
  id: string
  title: string
  documentType?: DocumentType
  language: Language
  pageCount?: number
  tokenCount?: number
  level0ConfigOverrides?: Level0ConfigOverrides | null
  createdAt: string
  analysis?: AnalysisSummary | null
}

export interface Document extends DocumentSummary {
  corpusId: string
  description?: string
  author?: string
  fileUrl?: string
  updatedAt: string
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

export interface AnalysisSummary {
  id: string
  aiProvider: AiProvider
  level0Status: LevelStatus
  level1Status: LevelStatus
  level2Status: LevelStatus
  level3Status: LevelStatus
  level4Status: LevelStatus
  level5Status: LevelStatus
  updatedAt: string
}

export interface Analysis extends AnalysisSummary {
  documentId: string
  createdAt: string
}

// ─── Level 0 — Ingestion ──────────────────────────────────────────────────────

export interface Level0Chapter {
  name: string
  start_page?: number
  end_page?: number
  sentence_count?: number
  word_count?: number
}

export interface Level0ChapterRange {
  title: string
  start_page: number
  end_page: number
}

export interface Level0ChapterDetection {
  method?: string
  total_chapters: number
  chapters: Level0ChapterRange[]
}

export interface Level0CleaningSample {
  file?: string
  page: number
  chapter?: string
  total_chars: number
  start_excerpt: string
  end_excerpt?: string
  omitted_chars?: number
}

export interface Level0CleaningSummary {
  pages_before?: number
  pages_after?: number
  chars_before?: number
  chars_after?: number
  reduction_percent?: number
  extracted_footnotes?: number
  sample_pages: Level0CleaningSample[]
}

export interface Level0CountItem {
  label: string
  count: number
}

export interface Level0FootnotesSummary {
  total: number
  pages_with_footnotes: number
  chapters_with_footnotes: number
  by_chapter: Level0CountItem[]
}

export interface Level0Entity {
  text: string
  label: string
}

export interface Level0Sentence {
  id: string
  page?: number
  chapter?: string
  text: string
  n_words?: number
  n_chars?: number
  tokens?: string[]
  lemmas?: string[]
  pos_tags?: string[]
  entities?: Level0Entity[]
}

export interface Level0NlpSummary {
  processed_sentences: number
  unique_lemmas: number
  total_entities: number
  top_lemmas: Level0CountItem[]
  top_pos_tags: Level0CountItem[]
  top_entity_labels: Level0CountItem[]
}

export interface Level0Footnote {
  page: number
  text: string
  chapter?: string
}

export interface Level0Data {
  title?: string
  author?: string
  language?: string
  processed_at?: string
  level0_config?: Level0Config

  page_count?: number
  pages_excluded?: number
  pages_clean?: number
  word_count?: number
  token_count?: number
  sentence_count?: number
  footnote_count?: number

  chapter_detection_method?: string
  chapter_detection?: Level0ChapterDetection
  cleaning_summary?: Level0CleaningSummary
  footnotes_summary?: Level0FootnotesSummary
  nlp_summary?: Level0NlpSummary

  chapters?: Level0Chapter[]
  footnotes?: Level0Footnote[]
  sentences?: Level0Sentence[]
}

export type Level0ProgressStatus =
  | 'IDLE'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'

export type Level0StepStatus =
  | 'pending'
  | 'processing'
  | 'done'
  | 'error'

export interface Level0ProgressStep {
  key: string
  label: string
  status: Level0StepStatus
  message?: string
}

export interface Level0Progress {
  documentId: string
  status: Level0ProgressStatus
  progress: number
  message?: string
  error?: string
  startedAt?: string
  updatedAt?: string
  steps: Level0ProgressStep[]
}

// ─── Level 1 — Primary Metaphors ──────────────────────────────────────────────

export interface OntologicalMapping {
  id: string
  primaryMetaphorId: string
  sourceElement: string
  targetElement: string
  textualEvidence?: string
  itemStatus: ItemStatus
  analystNote?: string
}

export interface EpistemicMapping {
  id: string
  primaryMetaphorId: string
  sourceRelation: string
  targetInference: string
  inferenceType: string
  textualEvidence?: string
  itemStatus: ItemStatus
  analystNote?: string
}

export interface PrimaryMetaphor {
  id: string
  analysisId: string
  page?: number
  metaphoricalExpression: string
  context?: string
  focus?: string
  focusLemma?: string
  focusPartOfSpeech?: string
  contextualMeaning?: string
  basicMeaning?: string
  sourceDomain?: string
  targetDomain?: string
  conceptualMetaphor?: string
  itemStatus: ItemStatus
  analystNote?: string
  aiGenerated: boolean
  ontologicalMappings?: OntologicalMapping[]
  epistemicMappings?: EpistemicMapping[]
}

// ─── Level 2 — Conventional Metaphors ────────────────────────────────────────

export interface ConventionalMetaphor {
  id: string
  analysisId: string
  conceptualMetaphor: string
  sourceDomain: string
  targetDomain: string
  approach: 'FREQUENCY' | 'THEMATIC_CLUSTER'
  absoluteFrequency: number
  robustness: 'HIGH' | 'MODERATE' | 'WEAK'
  usageContext?: string
  itemStatus: ItemStatus
  analystNote?: string
  aiGenerated: boolean
}

// ─── Level 3 — Metaphorical Scenarios ────────────────────────────────────────

export interface SocialGroup {
  id: string
  scenarioId: string
  socialGroup: string
  legitimizedActions: string[]
  itemStatus: ItemStatus
}

export interface NarrativeSequence {
  id: string
  scenarioId: string
  act1Beginning: string
  act2Development: string
  act3Resolution: string
  sequenceType: 'TEMPORAL' | 'CAUSAL'
  itemStatus: ItemStatus
}

export interface EvaluativeBias {
  id: string
  scenarioId: string
  positive: string[]
  negative: string[]
  itemStatus: ItemStatus
}

export interface Affect {
  id: string
  scenarioId: string
  affectType: 'FACILITATED' | 'INHIBITED'
  affectName: string
  description?: string
  socialFunction?: string
  linguisticMarkers?: string
  itemStatus: ItemStatus
}

export interface MetaphoricalScenario {
  id: string
  analysisId: string
  conventionalMetaphorId: string
  scenarioName: string
  status: 'DOMINANT' | 'CHALLENGER' | 'EMERGING' | 'PERIPHERAL'
  usageValuation: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  itemStatus: ItemStatus
  analystNote?: string
  aiGenerated: boolean
  socialGroups?: SocialGroup[]
  narrativeSequence?: NarrativeSequence
  evaluativeBias?: EvaluativeBias
  affects?: Affect[]
}

// ─── Level 4 — Metaphor Regimes ──────────────────────────────────────────────

export interface RegimeDerivedMetaphor {
  id: string
  regimeId: string
  derivedMetaphor: string
  itemStatus: ItemStatus
}

export interface ValueAxis {
  id: string
  regimeId: string
  axisName: string
  positivePolarity: string[]
  negativePolarity: string[]
  evidence?: string
  itemStatus: ItemStatus
}

export interface MetaphorRegime {
  id: string
  analysisId: string
  regimeName: string
  aggregateFrequency: number
  metaphors: string[]
  itemStatus: ItemStatus
  analystNote?: string
  aiGenerated: boolean
  scenarios?: { scenario: MetaphoricalScenario }[]
  derivedMetaphors?: RegimeDerivedMetaphor[]
  valueAxis?: ValueAxis
}

// ─── Level 5 — Cultural Narrative ────────────────────────────────────────────

export interface CulturalNarrative {
  id: string
  analysisId: string
  regimeId: string
  name: string
  description?: string
  textualDistribution: string[]
  itemStatus: ItemStatus
  analystNote?: string
  aiGenerated: boolean
  regime?: MetaphorRegime
}
