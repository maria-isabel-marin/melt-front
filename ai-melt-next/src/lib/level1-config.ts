import type {
  Level1Config,
  Level1ConfigOverrides,
} from '@/types'

export const DEFAULT_LEVEL1_CONFIG: Level1Config = {
  approaches: ['CLAUDE', 'OPENAI'],
  sentenceSelection: {
    mode: 'ALL',
    maxSentences: null,
    strategy: 'RANDOM',
    randomSeed: 42,
  },
  batchSize: 10,
  output: {
    ontologicalMappings: true,
    epistemicMappings: true,
  },
}

export function cloneLevel1Config(
  config: Level1Config,
): Level1Config {
  return {
    approaches: [...config.approaches],
    sentenceSelection: {
      ...config.sentenceSelection,
    },
    batchSize: config.batchSize,
    output: {
      ...config.output,
    },
  }
}

export function hasLevel1Overrides(
  overrides: Level1ConfigOverrides | null | undefined,
): boolean {
  if (!overrides) return false

  return (
    overrides.approaches !== undefined ||
    overrides.batchSize !== undefined ||
    (overrides.sentenceSelection !== undefined &&
      Object.keys(overrides.sentenceSelection).length > 0) ||
    (overrides.output !== undefined &&
      Object.keys(overrides.output).length > 0)
  )
}

function arraysEqual<T>(a: T[], b: T[]) {
  if (a.length !== b.length) return false
  const right = new Set(b)
  return a.every((value) => right.has(value))
}

export function buildLevel1Overrides(
  corpusConfig: Level1Config,
  documentConfig: Level1Config,
): Level1ConfigOverrides | null {
  const overrides: Level1ConfigOverrides = {}

  if (
    !arraysEqual(
      corpusConfig.approaches,
      documentConfig.approaches,
    )
  ) {
    overrides.approaches = [
      ...documentConfig.approaches,
    ]
  }

  const sentenceSelection: NonNullable<
    Level1ConfigOverrides['sentenceSelection']
  > = {}

  if (
    corpusConfig.sentenceSelection.mode !==
    documentConfig.sentenceSelection.mode
  ) {
    sentenceSelection.mode =
      documentConfig.sentenceSelection.mode
  }

  if (
    corpusConfig.sentenceSelection.maxSentences !==
    documentConfig.sentenceSelection.maxSentences
  ) {
    sentenceSelection.maxSentences =
      documentConfig.sentenceSelection.maxSentences
  }

  if (
    corpusConfig.sentenceSelection.strategy !==
    documentConfig.sentenceSelection.strategy
  ) {
    sentenceSelection.strategy =
      documentConfig.sentenceSelection.strategy
  }

  if (
    corpusConfig.sentenceSelection.randomSeed !==
    documentConfig.sentenceSelection.randomSeed
  ) {
    sentenceSelection.randomSeed =
      documentConfig.sentenceSelection.randomSeed
  }

  if (Object.keys(sentenceSelection).length > 0) {
    overrides.sentenceSelection = sentenceSelection
  }

  if (corpusConfig.batchSize !== documentConfig.batchSize) {
    overrides.batchSize = documentConfig.batchSize
  }

  const output: NonNullable<
    Level1ConfigOverrides['output']
  > = {}

  if (
    corpusConfig.output.ontologicalMappings !==
    documentConfig.output.ontologicalMappings
  ) {
    output.ontologicalMappings =
      documentConfig.output.ontologicalMappings
  }

  if (
    corpusConfig.output.epistemicMappings !==
    documentConfig.output.epistemicMappings
  ) {
    output.epistemicMappings =
      documentConfig.output.epistemicMappings
  }

  if (Object.keys(output).length > 0) {
    overrides.output = output
  }

  return hasLevel1Overrides(overrides)
    ? overrides
    : null
}
