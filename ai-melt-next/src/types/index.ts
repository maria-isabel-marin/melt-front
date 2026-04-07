// ─── Enums ───────────────────────────────────────────────────────────────────

export type LevelStatus = 'PENDING' | 'PROCESSING' | 'PENDING_REVIEW' | 'APPROVED' | 'OUTDATED'
export type ItemStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'MODIFIED'
export type AiProvider = 'CLAUDE' | 'OPENAI' | 'HUGGINGFACE'
export type DocumentType =
  | 'ACADEMIC_ARTICLE' | 'POLITICAL_SPEECH' | 'NEWS' | 'EDITORIAL'
  | 'INTERVIEW' | 'OFFICIAL_DOCUMENT' | 'SOCIAL_MEDIA' | 'OTHER'
export type Language = 'SPANISH' | 'ENGLISH'

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
  createdAt: string
  updatedAt: string
  _count?: { documents: number }
  documents?: DocumentSummary[]
}

// ─── Documents ───────────────────────────────────────────────────────────────

export interface DocumentSummary {
  id: string
  title: string
  documentType?: DocumentType
  language: Language
  pageCount?: number
  tokenCount?: number
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

// ─── Level 1 — Primary Metaphors ─────────────────────────────────────────────

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
