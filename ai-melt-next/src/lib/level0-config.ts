import type {
  Level0Config,
  Level0ConfigOverrides,
} from '@/types'

export const DEFAULT_LEVEL0_CONFIG: Level0Config = {
  chapterDetection: {
    enabled: true,
    method: 'AUTO',
  },
  cleaning: {
    repairHyphenation: true,
    detectRepeatedHeaders: true,
    repeatedHeaderThreshold: 0.3,
    excludeFrontMatter: true,
    minLineLength: 30,
    additionalHeadersFooters: [],
  },
  footnotes: {
    extract: true,
  },
  segmentation: {
    minChars: 10,
    maxChars: 2000,
  },
  excludedPageRanges: null,
}

export function cloneLevel0Config(
  config: Level0Config = DEFAULT_LEVEL0_CONFIG,
): Level0Config {
  return {
    chapterDetection: { ...config.chapterDetection },
    cleaning: {
      ...config.cleaning,
      additionalHeadersFooters: [
        ...(config.cleaning.additionalHeadersFooters ?? []),
      ],
    },
    footnotes: { ...config.footnotes },
    segmentation: { ...config.segmentation },
    excludedPageRanges: config.excludedPageRanges
      ? config.excludedPageRanges.map(
          ([start, end]) => [start, end] as [number, number],
        )
      : null,
  }
}

function sameStringArray(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

function samePageRanges(
  a: Array<[number, number]> | null,
  b: Array<[number, number]> | null,
) {
  if (a === null || b === null) return a === b
  if (a.length !== b.length) return false
  return a.every(
    ([aStart, aEnd], index) =>
      aStart === b[index][0] && aEnd === b[index][1],
  )
}

export function buildLevel0Overrides(
  config: Level0Config,
  corpusConfig: Level0Config,
): Level0ConfigOverrides {
  const overrides: Level0ConfigOverrides = {}

  if (
    config.chapterDetection.enabled !==
      corpusConfig.chapterDetection.enabled ||
    config.chapterDetection.method !==
      corpusConfig.chapterDetection.method
  ) {
    overrides.chapterDetection = {}

    if (
      config.chapterDetection.enabled !==
      corpusConfig.chapterDetection.enabled
    ) {
      overrides.chapterDetection.enabled =
        config.chapterDetection.enabled
    }

    if (
      config.chapterDetection.method !==
      corpusConfig.chapterDetection.method
    ) {
      overrides.chapterDetection.method =
        config.chapterDetection.method
    }
  }

  const cleaning: NonNullable<Level0ConfigOverrides['cleaning']> = {}

  if (
    config.cleaning.repairHyphenation !==
    corpusConfig.cleaning.repairHyphenation
  ) {
    cleaning.repairHyphenation = config.cleaning.repairHyphenation
  }

  if (
    config.cleaning.detectRepeatedHeaders !==
    corpusConfig.cleaning.detectRepeatedHeaders
  ) {
    cleaning.detectRepeatedHeaders =
      config.cleaning.detectRepeatedHeaders
  }

  if (
    config.cleaning.repeatedHeaderThreshold !==
    corpusConfig.cleaning.repeatedHeaderThreshold
  ) {
    cleaning.repeatedHeaderThreshold =
      config.cleaning.repeatedHeaderThreshold
  }

  if (
    config.cleaning.excludeFrontMatter !==
    corpusConfig.cleaning.excludeFrontMatter
  ) {
    cleaning.excludeFrontMatter = config.cleaning.excludeFrontMatter
  }

  if (
    config.cleaning.minLineLength !==
    corpusConfig.cleaning.minLineLength
  ) {
    cleaning.minLineLength = config.cleaning.minLineLength
  }

  if (
    !sameStringArray(
      config.cleaning.additionalHeadersFooters,
      corpusConfig.cleaning.additionalHeadersFooters,
    )
  ) {
    cleaning.additionalHeadersFooters = [
      ...config.cleaning.additionalHeadersFooters,
    ]
  }

  if (Object.keys(cleaning).length > 0) {
    overrides.cleaning = cleaning
  }

  if (config.footnotes.extract !== corpusConfig.footnotes.extract) {
    overrides.footnotes = {
      extract: config.footnotes.extract,
    }
  }

  const segmentation: NonNullable<
    Level0ConfigOverrides['segmentation']
  > = {}

  if (
    config.segmentation.minChars !==
    corpusConfig.segmentation.minChars
  ) {
    segmentation.minChars = config.segmentation.minChars
  }

  if (
    config.segmentation.maxChars !==
    corpusConfig.segmentation.maxChars
  ) {
    segmentation.maxChars = config.segmentation.maxChars
  }

  if (Object.keys(segmentation).length > 0) {
    overrides.segmentation = segmentation
  }

  if (
    !samePageRanges(
      config.excludedPageRanges,
      corpusConfig.excludedPageRanges,
    )
  ) {
    overrides.excludedPageRanges = config.excludedPageRanges
      ? config.excludedPageRanges.map(
          ([start, end]) => [start, end] as [number, number],
        )
      : null
  }

  return overrides
}

export function hasLevel0Overrides(overrides: Level0ConfigOverrides) {
  return Object.keys(overrides).length > 0
}
