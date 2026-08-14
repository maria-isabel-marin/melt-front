import type { Locale } from './config'

const en = {
  language: {
    selector: 'Interface language',
    spanish: 'Español',
    english: 'English',
  },
  sidebar: {
    toolkit: 'Metaphor Toolkit',
    myCorpora: 'My Corpora',
    guest: 'Guest',
    guestSession: 'Guest session',
    signOut: 'Sign out',
  },
  login: {
    description:
      'AI-assisted metaphor analysis pipeline based on MIPVU, Musolff & Valdivia frameworks.',
    google: 'Sign in with Google',
    or: 'or',
    guest: 'Continue as Guest',
    guestWarning:
      'Guest sessions are temporary — export before closing.',
  },
  auth: {
    signingIn: 'Signing you in…',
  },
  common: {
    unknown: 'Unknown',
    noAnalysis: 'No analysis',
    processing: 'Processing…',
    unavailable: 'Unavailable',
    refresh: 'Refresh',
    page: 'Page',
    chapter: 'Chapter',
    start: 'Start',
    end: 'End',
    sample: 'Sample',
    total: 'Total',
    byChapter: 'By chapter',
  },
  statuses: {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    PENDING_REVIEW: 'Pending review',
    APPROVED: 'Approved',
    OUTDATED: 'Outdated',
    FAILED: 'Failed',
    pending: 'Pending',
    running: 'Running',
    done: 'Done',
    error: 'Error',
  },
  corpus: {
    title: 'My Corpora',
    subtitle: 'Organize your documents for metaphor analysis',
    newCorpus: 'New Corpus',
    noCorporaTitle: 'No corpora yet',
    noCorporaDescription:
      'Create your first corpus to start organizing documents for metaphor analysis.',
    createFirstCorpus: 'New Corpus',
    document: 'document',
    documents: 'documents',
    deleteConfirm: 'Delete this corpus and all its documents?',
    createError: 'Failed to create corpus',
    deleteError: 'Failed to delete corpus',
    dialogTitle: 'New Corpus',
    name: 'Name *',
    namePlaceholder: 'e.g. Political speeches 2024',
    description: 'Description',
    descriptionPlaceholder: 'Brief description of the corpus',
    discursiveCommunity: 'Discursive Community',
    discursiveCommunityPlaceholder:
      'e.g. Political analysts, journalists',
    textualGenre: 'Textual Genre',
    selectGenre: 'Select genre…',
    cancel: 'Cancel',
    create: 'Create Corpus',
  },
  genres: {
    academic: 'Academic',
    political: 'Political',
    journalistic: 'Journalistic',
    literary: 'Literary',
    legal: 'Legal',
    socialMedia: 'Social Media',
    other: 'Other',
  },
  corpusDetail: {
    back: 'Back to corpora',
    ingestDocument: 'Ingest document',
    noDocumentsTitle: 'No documents yet',
    noDocumentsDescription:
      'Upload your first document to start the MELT workflow.',
    title: 'Title',
    type: 'Type',
    language: 'Language',
    pages: 'Pages',
    status: 'Status',
    uploadSuccess:
      'Document uploaded successfully. Process Level 0 from the document view.',
    uploadError: 'Failed to upload document',
    deleteConfirm:
      'Delete this document and all its analysis data?',
    deleteError: 'Failed to delete document',
    dialogTitle: 'Ingest document',
    documentTitle: 'Title *',
    documentTitlePlaceholder: 'Document title',
    author: 'Author',
    authorPlaceholder: 'Author name',
    languageRequired: 'Language *',
    documentType: 'Document Type',
    selectType: 'Select type…',
    pageCount: 'Page Count',
    pageCountPlaceholder: 'e.g. 12',
    description: 'Description',
    descriptionPlaceholder: 'Short description',
    file: 'PDF or TXT file *',
    selectedFile: 'Selected file: {name}',
    cancel: 'Cancel',
  },
  documentTypes: {
    ACADEMIC_ARTICLE: 'Academic Article',
    POLITICAL_SPEECH: 'Political Speech',
    NEWS: 'News',
    EDITORIAL: 'Editorial',
    INTERVIEW: 'Interview',
    OFFICIAL_DOCUMENT: 'Official Document',
    SOCIAL_MEDIA: 'Social Media',
    OTHER: 'Other',
  },
  documentLanguages: {
    SPANISH: 'Spanish',
    ENGLISH: 'English',
  },
  documentPage: {
    back: 'Back to corpus',
    initializeLevels: 'Initialize Levels 1–5',
    initializeError: 'Failed to initialize analysis',
    processError: 'Failed to process',
    approveError: 'Failed to approve',
    level0LoadError: 'Failed to load Level 0 data',
    level0ProcessError: 'Failed to process Level 0',
    level0Failed: 'Level 0 processing failed',
    tabs: {
      level0: 'Level 0 · Ingestion',
      level1: 'Level 1 · Metaphors',
      level2: 'Level 2 · Conventional',
      level3: 'Level 3 · Scenarios',
      level4: 'Level 4 · Regimes',
      level5: 'Level 5 · Narrative',
    },
    summary: {
      title: 'Document summary',
      description: 'Basic information about the uploaded document.',
      author: 'Author',
      type: 'Type',
      language: 'Language',
      pages: 'Pages',
      tokens: 'Tokens',
      documentDescription: 'Description',
      viewFile: 'View document file',
      fileUnavailable: 'Original file unavailable',
    },
    level0Notice: {
      title: 'Process Level 0 first',
      description:
        'Run preprocessing and validate chapter detection, text cleaning, footnotes, and sentence segmentation before launching metaphor analysis.',
    },
    level0Pending: {
      title: 'Level 0 pending',
      description:
        'This document has been uploaded, but Level 0 preprocessing has not been run yet.',
      button: 'Process Level 0',
    },
    level0Processing: {
      title: 'Processing Level 0',
      description:
        'Running preprocessing in the backend. Progress will update below.',
      current: 'Processing…',
    },
    views: {
      processing: 'Processing',
      visualization: 'Visualization',
    },
    blocked:
      'Process and review Level 0 first before continuing with Levels 1–5.',
  },
  progressSteps: {
    document_ready: {
      title: 'Document ready',
      description: 'The file was uploaded and is ready to process.',
    },
    chapter_detection: {
      title: 'Chapter detection',
      description: 'Detecting the document structure and chapter ranges.',
    },
    text_cleaning: {
      title: 'Text cleaning',
      description: 'Removing noise and rebuilding the main text.',
    },
    footnote_extraction: {
      title: 'Footnote extraction',
      description: 'Detecting and separating footnotes from the main text.',
    },
    sentence_segmentation: {
      title: 'Sentence segmentation',
      description: 'Dividing the cleaned text into sentences.',
    },
    linguistic_preprocessing: {
      title: 'Linguistic preprocessing',
      description: 'Generating tokens, lemmas, POS tags and named entities.',
    },
    save_results: {
      title: 'Saving results',
      description: 'Saving the Level 0 results for review and visualization.',
    },
  },
  level0ProcessingView: {
    noData: 'No Level 0 data is available for this document yet.',
    qualityTitle: 'Level 0 quality review',
    qualityDescription:
      'Validate chapter detection, cleaning, footnotes, sentence segmentation, and linguistic preprocessing before continuing with Levels 1–5.',
    chapterMethod: 'Chapter detection method:',
    stats: {
      pages: 'Pages',
      cleanPages: 'Clean pages',
      excludedPages: 'Excluded pages',
      sentences: 'Sentences',
      words: 'Words',
      footnotes: 'Footnotes',
    },
    chapterDetection: {
      title: 'Chapter detection',
      description: 'Detected chapters with start and end pages.',
      method: 'Detection method',
      total: 'Total chapters',
      noChapters: 'No chapters detected.',
    },
    cleaning: {
      title: 'Cleaning summary',
      description: 'Compact overview of cleaning results.',
      pagesBefore: 'Pages before',
      pagesAfter: 'Pages after',
      charsBefore: 'Characters before',
      charsAfter: 'Characters after',
      reduction: 'Reduction',
      footnotesExtracted: 'Footnotes extracted',
    },
    footnotes: {
      title: 'Footnotes summary',
      description: 'Extracted footnotes overview and validation sample.',
      pagesWith: 'Pages with footnotes',
      chaptersWith: 'Chapters with footnotes',
      noDistribution: 'No chapter distribution available.',
      noFootnotes: 'No footnotes were extracted.',
    },
    nlp: {
      title: 'NLP summary',
      description: 'Linguistic preprocessing overview.',
      processedSentences: 'Processed sentences',
      uniqueLemmas: 'Unique lemmas',
      totalEntities: 'Total entities',
      topLemmas: 'Top lemmas',
      noLemmaData: 'No lemma data available.',
      topPosTags: 'Top POS tags',
      topEntityLabels: 'Top entity labels',
    },
    segmentation: {
      title: 'Sentence segmentation',
      description: 'Small validation sample of segmented sentences.',
      totalSentences: 'Total sentences',
      sampleShown: 'Sample shown',
      processed: 'Processed',
      noSample: 'No sentence sample available.',
    },
    methods: {
      printed_index: 'Printed index',
      toc_bookmarks: 'PDF table of contents / bookmarks',
      font_size: 'Font-size detection',
      fallback_filename: 'Document title or filename',
      ninguno: 'None',
      unknown: 'Unknown',
    },
  },
  level0Visualization: {
    noData: 'No Level 0 visualization data is available yet.',
    title: 'Level 0 visualization',
    description:
      'Explore the structure and linguistic profile of the processed document.',
    chapters: 'Chapters',
    sentences: 'Sentences',
    words: 'Words',
    averageWords: 'Average words',
    namedEntities: 'Named entities',
    frequency: 'Frequency',
    processedDocument: 'Processed document',
    unassigned: 'Unassigned',
    noDataAvailable: 'No data available.',
    sentencesByVolume: {
      title: 'Sentences by volume',
      description:
        'Total number of segmented sentences in the current document or volume.',
    },
    wordsByVolume: {
      title: 'Words by volume',
      description:
        'Total number of processed words in the current document or volume.',
    },
    sentencesByChapterTop: {
      title: 'Sentences by chapter — top {count}',
      description:
        'Detected chapters ranked from the highest to the lowest number of sentences.',
    },
    wordsByChapterTop: {
      title: 'Words by chapter — top {count}',
      description:
        'Detected chapters ranked from the highest to the lowest number of words.',
    },
    sentencesByChapterOrder: {
      title: 'Sentences by chapter — document order',
      description:
        'Sentence totals following the order in which chapters appear in the document.',
    },
    wordsByChapterOrder: {
      title: 'Words by chapter — document order',
      description:
        'Word totals following the order in which chapters appear in the document.',
    },
    sentenceLength: {
      title: 'Sentence length distribution',
      description: 'Median: {median} words · Average: {average} words.',
      noData: 'No sentence data available.',
    },
    nerDistribution: {
      title: 'Named entity distribution',
      description: 'Distribution of the entity labels detected by spaCy.',
      noData: 'No entity data available.',
    },
    topEntities: {
      title: 'Top named entities',
      description:
        'Most frequent entity texts after removing common extraction noise.',
      noData: 'No named entities available.',
    },
    posDistribution: {
      title: 'POS distribution',
      description:
        'Most frequent grammatical categories in the processed document.',
      noData: 'No POS data available.',
    },
    wordCloud: {
      title: 'Content lemma word cloud',
      description:
        'Frequent nouns, verbs, and adjectives. Functional words are excluded.',
      noData: 'No content lemmas are available.',
    },
  },
  level0Config: {
    configure: 'Level 0 configuration',
    change: 'Change',
    level0Configuration: 'Level 0 configuration',
    sourceCorpus: 'Inherited from the corpus',
    sourceDocument: 'Customized for this document',
    corpusTitle: 'Corpus Level 0 configuration',
    documentTitle: 'Document Level 0 configuration',
    aboutTitle: 'Preprocessing configuration',
    corpusDescription:
      'These values become the Level 0 defaults for documents in this corpus. Existing document-specific overrides remain in place.',
    documentDescription:
      'This document can inherit the corpus configuration or override only the values that need to be different.',
    useCorpus: 'Use corpus configuration',
    useCorpusDescription:
      'The document automatically follows the current Level 0 configuration of its corpus.',
    customizeDocument: 'Customize for this document',
    customizeDocumentDescription:
      'Change only the parameters this document needs. Unchanged values continue to inherit from the corpus.',
    sections: {
      chapters: 'Chapter detection',
      chaptersDescription:
        'Controls how MELT identifies the chapter structure of PDF documents.',
      cleaning: 'Text cleaning',
      cleaningDescription:
        'Controls cleanup rules applied before sentence segmentation and linguistic preprocessing.',
      footnotes: 'Footnotes',
      footnotesDescription:
        'Controls whether footnotes are detected and separated from the main text.',
      segmentation: 'Sentence segmentation',
      segmentationDescription:
        'Defines the accepted character-length range for segmented sentences.',
      pageExclusions: 'Page exclusions',
      pageExclusionsDescription:
        'Document-specific page ranges that should not enter Level 0 processing.',
    },
    chapterDetection: {
      enabled: 'Detect chapters',
      enabledDescription:
        'Identify chapter boundaries and assign processed pages and sentences to chapters.',
      method: 'Detection method',
    },
    methods: {
      AUTO: 'Automatic',
      TOC: 'PDF table of contents / bookmarks',
      PRINTED_INDEX: 'Printed index',
      FONT_SIZE: 'Typography / font size',
      NONE: 'Do not detect chapters',
    },
    methodDescriptions: {
      AUTO: 'Try PDF bookmarks first, then a printed index, then typography, and finally the document title as fallback.',
      TOC: 'Use only the PDF table of contents or bookmarks when available.',
      PRINTED_INDEX: 'Use the printed index or contents pages to infer chapter ranges.',
      FONT_SIZE: 'Infer chapter headings from typography and font-size differences.',
      NONE: 'Skip chapter detection and use the document title as the fallback label.',
    },
    cleaning: {
      repairHyphenation: 'Repair words split by line breaks',
      repairHyphenationDescription:
        'Joins words broken by PDF line wrapping or soft hyphens.',
      detectRepeatedHeaders: 'Detect repeated headers and footers',
      detectRepeatedHeadersDescription:
        'Automatically removes short lines repeated across many pages.',
      repeatedHeaderThreshold: 'Repeated-header threshold',
      repeatedHeaderThresholdDescription:
        'Fraction of pages in which a line must repeat to be treated as a header or footer (0.05–0.95).',
      excludeFrontMatter: 'Exclude front matter automatically',
      excludeFrontMatterDescription:
        'Attempts to remove covers, credits, indexes, bibliographies, and similar preliminary material.',
      minLineLength: 'Minimum line length',
      minLineLengthDescription:
        'Short lines below this length are removed only when they also look like noise.',
      additionalHeadersFooters: 'Additional headers / footers to remove',
      additionalHeadersFootersDescription:
        'Enter one exact header or footer per line. This is useful for corpus-specific repeated labels.',
      additionalHeadersFootersPlaceholder:
        'COMMISSION OF TRUTH\nFINAL REPORT\nDOCUMENT SERIES',
    },
    footnotes: {
      extract: 'Extract footnotes',
      extractDescription:
        'Detect footnotes using page position, font size, and footnote markers, and remove them from the main text.',
    },
    segmentation: {
      minChars: 'Minimum sentence length',
      minCharsDescription: 'Minimum accepted number of characters per sentence.',
      maxChars: 'Maximum sentence length',
      maxCharsDescription: 'Maximum accepted number of characters per sentence.',
    },
    pageExclusions: {
      explicitRanges: 'Use explicit page ranges for this document',
      explicitRangesDescription:
        'When enabled, the ranges below override inherited or filename-specific page exclusions. Leaving the list empty explicitly disables those exclusions.',
      from: 'From page',
      to: 'To page',
      add: 'Add range',
      remove: 'Remove range',
      emptyExplicit:
        'No ranges are listed. Saving this state means no pages will be explicitly excluded by the page-range rule.',
    },
    outdatedWarning:
      'Changing Level 0 configuration invalidates previously processed results. Any processed Level 0 and downstream levels will be marked as outdated and should be processed again.',
    processingLocked:
      'Configuration cannot be changed while Level 0 is processing.',
    cancel: 'Cancel',
    save: 'Save configuration',
    saveError: 'Failed to save Level 0 configuration',
  },
}

type Messages = typeof en

const es: Messages = {
  language: {
    selector: 'Idioma de la interfaz',
    spanish: 'Español',
    english: 'English',
  },
  sidebar: {
    toolkit: 'Kit de análisis metafórico',
    myCorpora: 'Mis corpus',
    guest: 'Invitado',
    guestSession: 'Sesión de invitado',
    signOut: 'Cerrar sesión',
  },
  login: {
    description:
      'Plataforma de análisis metafórico asistido por IA basada en los marcos MIPVU, Musolff y Valdivia.',
    google: 'Iniciar sesión con Google',
    or: 'o',
    guest: 'Continuar como invitado',
    guestWarning:
      'Las sesiones de invitado son temporales; exporta tus resultados antes de cerrar.',
  },
  auth: {
    signingIn: 'Iniciando sesión…',
  },
  common: {
    unknown: 'Desconocido',
    noAnalysis: 'Sin análisis',
    processing: 'Procesando…',
    unavailable: 'No disponible',
    refresh: 'Actualizar',
    page: 'Página',
    chapter: 'Capítulo',
    start: 'Inicio',
    end: 'Fin',
    sample: 'Muestra',
    total: 'Total',
    byChapter: 'Por capítulo',
  },
  statuses: {
    PENDING: 'Pendiente',
    PROCESSING: 'Procesando',
    PENDING_REVIEW: 'Pendiente de revisión',
    APPROVED: 'Aprobado',
    OUTDATED: 'Desactualizado',
    FAILED: 'Fallido',
    pending: 'Pendiente',
    running: 'En curso',
    done: 'Completado',
    error: 'Error',
  },
  corpus: {
    title: 'Mis corpus',
    subtitle: 'Organiza tus documentos para el análisis metafórico',
    newCorpus: 'Nuevo corpus',
    noCorporaTitle: 'Aún no hay corpus',
    noCorporaDescription:
      'Crea tu primer corpus para organizar documentos y comenzar el análisis metafórico.',
    createFirstCorpus: 'Nuevo corpus',
    document: 'documento',
    documents: 'documentos',
    deleteConfirm: '¿Eliminar este corpus y todos sus documentos?',
    createError: 'No fue posible crear el corpus',
    deleteError: 'No fue posible eliminar el corpus',
    dialogTitle: 'Nuevo corpus',
    name: 'Nombre *',
    namePlaceholder: 'Ej.: Discursos políticos de 2024',
    description: 'Descripción',
    descriptionPlaceholder: 'Descripción breve del corpus',
    discursiveCommunity: 'Comunidad discursiva',
    discursiveCommunityPlaceholder:
      'Ej.: Analistas políticos, periodistas',
    textualGenre: 'Género textual',
    selectGenre: 'Selecciona un género…',
    cancel: 'Cancelar',
    create: 'Crear corpus',
  },
  genres: {
    academic: 'Académico',
    political: 'Político',
    journalistic: 'Periodístico',
    literary: 'Literario',
    legal: 'Jurídico',
    socialMedia: 'Redes sociales',
    other: 'Otro',
  },
  corpusDetail: {
    back: 'Volver a los corpus',
    ingestDocument: 'Ingresar documento',
    noDocumentsTitle: 'Aún no hay documentos',
    noDocumentsDescription:
      'Carga tu primer documento para iniciar el flujo de trabajo de MELT.',
    title: 'Título',
    type: 'Tipo',
    language: 'Idioma',
    pages: 'Páginas',
    status: 'Estado',
    uploadSuccess:
      'Documento cargado correctamente. Procesa el Nivel 0 desde la vista del documento.',
    uploadError: 'No fue posible cargar el documento',
    deleteConfirm:
      '¿Eliminar este documento y todos sus datos de análisis?',
    deleteError: 'No fue posible eliminar el documento',
    dialogTitle: 'Ingresar documento',
    documentTitle: 'Título *',
    documentTitlePlaceholder: 'Título del documento',
    author: 'Autor',
    authorPlaceholder: 'Nombre del autor',
    languageRequired: 'Idioma *',
    documentType: 'Tipo de documento',
    selectType: 'Selecciona un tipo…',
    pageCount: 'Número de páginas',
    pageCountPlaceholder: 'Ej.: 12',
    description: 'Descripción',
    descriptionPlaceholder: 'Descripción breve',
    file: 'Archivo PDF o TXT *',
    selectedFile: 'Archivo seleccionado: {name}',
    cancel: 'Cancelar',
  },
  documentTypes: {
    ACADEMIC_ARTICLE: 'Artículo académico',
    POLITICAL_SPEECH: 'Discurso político',
    NEWS: 'Noticia',
    EDITORIAL: 'Editorial',
    INTERVIEW: 'Entrevista',
    OFFICIAL_DOCUMENT: 'Documento oficial',
    SOCIAL_MEDIA: 'Redes sociales',
    OTHER: 'Otro',
  },
  documentLanguages: {
    SPANISH: 'Español',
    ENGLISH: 'Inglés',
  },
  documentPage: {
    back: 'Volver al corpus',
    initializeLevels: 'Inicializar niveles 1–5',
    initializeError: 'No fue posible inicializar el análisis',
    processError: 'No fue posible procesar el nivel',
    approveError: 'No fue posible aprobar el nivel',
    level0LoadError: 'No fue posible cargar los datos del Nivel 0',
    level0ProcessError: 'No fue posible procesar el Nivel 0',
    level0Failed: 'El procesamiento del Nivel 0 falló',
    tabs: {
      level0: 'Nivel 0 · Ingesta',
      level1: 'Nivel 1 · Metáforas',
      level2: 'Nivel 2 · Convencionales',
      level3: 'Nivel 3 · Escenarios',
      level4: 'Nivel 4 · Regímenes',
      level5: 'Nivel 5 · Narrativa',
    },
    summary: {
      title: 'Resumen del documento',
      description: 'Información básica del documento cargado.',
      author: 'Autor',
      type: 'Tipo',
      language: 'Idioma',
      pages: 'Páginas',
      tokens: 'Tokens',
      documentDescription: 'Descripción',
      viewFile: 'Ver archivo del documento',
      fileUnavailable: 'Archivo original no disponible',
    },
    level0Notice: {
      title: 'Procesa primero el Nivel 0',
      description:
        'Ejecuta el preprocesamiento y valida la detección de capítulos, la limpieza del texto, las notas al pie y la segmentación en oraciones antes de iniciar el análisis metafórico.',
    },
    level0Pending: {
      title: 'Nivel 0 pendiente',
      description:
        'El documento fue cargado, pero todavía no se ha ejecutado el preprocesamiento del Nivel 0.',
      button: 'Procesar Nivel 0',
    },
    level0Processing: {
      title: 'Procesando Nivel 0',
      description:
        'El preprocesamiento se está ejecutando en el backend. El progreso se actualizará abajo.',
      current: 'Procesando…',
    },
    views: {
      processing: 'Procesamiento',
      visualization: 'Visualización',
    },
    blocked:
      'Procesa y revisa primero el Nivel 0 antes de continuar con los niveles 1–5.',
  },
  progressSteps: {
    document_ready: {
      title: 'Documento listo',
      description: 'El archivo fue cargado y está listo para procesarse.',
    },
    chapter_detection: {
      title: 'Detección de capítulos',
      description:
        'Se está detectando la estructura del documento y los rangos de capítulos.',
    },
    text_cleaning: {
      title: 'Limpieza del texto',
      description:
        'Se está eliminando el ruido y reconstruyendo el texto principal.',
    },
    footnote_extraction: {
      title: 'Extracción de notas al pie',
      description:
        'Se están detectando y separando las notas al pie del texto principal.',
    },
    sentence_segmentation: {
      title: 'Segmentación en oraciones',
      description: 'Se está dividiendo el texto limpio en oraciones.',
    },
    linguistic_preprocessing: {
      title: 'Preprocesamiento lingüístico',
      description:
        'Se están generando tokens, lemas, etiquetas gramaticales y entidades nombradas.',
    },
    save_results: {
      title: 'Guardado de resultados',
      description:
        'Se están guardando los resultados del Nivel 0 para revisión y visualización.',
    },
  },
  level0ProcessingView: {
    noData: 'Todavía no hay datos de Nivel 0 disponibles para este documento.',
    qualityTitle: 'Revisión de calidad del Nivel 0',
    qualityDescription:
      'Valida la detección de capítulos, la limpieza, las notas al pie, la segmentación de oraciones y el preprocesamiento lingüístico antes de continuar con los niveles 1–5.',
    chapterMethod: 'Método de detección de capítulos:',
    stats: {
      pages: 'Páginas',
      cleanPages: 'Páginas limpias',
      excludedPages: 'Páginas excluidas',
      sentences: 'Oraciones',
      words: 'Palabras',
      footnotes: 'Notas al pie',
    },
    chapterDetection: {
      title: 'Detección de capítulos',
      description: 'Capítulos detectados con sus páginas de inicio y fin.',
      method: 'Método de detección',
      total: 'Total de capítulos',
      noChapters: 'No se detectaron capítulos.',
    },
    cleaning: {
      title: 'Resumen de limpieza',
      description: 'Resumen compacto de los resultados de limpieza.',
      pagesBefore: 'Páginas antes',
      pagesAfter: 'Páginas después',
      charsBefore: 'Caracteres antes',
      charsAfter: 'Caracteres después',
      reduction: 'Reducción',
      footnotesExtracted: 'Notas extraídas',
    },
    footnotes: {
      title: 'Resumen de notas al pie',
      description: 'Resumen y muestra de validación de las notas extraídas.',
      pagesWith: 'Páginas con notas',
      chaptersWith: 'Capítulos con notas',
      noDistribution: 'No hay distribución por capítulo disponible.',
      noFootnotes: 'No se extrajeron notas al pie.',
    },
    nlp: {
      title: 'Resumen de PLN',
      description: 'Resumen del preprocesamiento lingüístico.',
      processedSentences: 'Oraciones procesadas',
      uniqueLemmas: 'Lemas únicos',
      totalEntities: 'Total de entidades',
      topLemmas: 'Lemas más frecuentes',
      noLemmaData: 'No hay datos de lemas disponibles.',
      topPosTags: 'Etiquetas POS más frecuentes',
      topEntityLabels: 'Tipos de entidad más frecuentes',
    },
    segmentation: {
      title: 'Segmentación de oraciones',
      description: 'Pequeña muestra para validar las oraciones segmentadas.',
      totalSentences: 'Total de oraciones',
      sampleShown: 'Muestra visible',
      processed: 'Procesadas',
      noSample: 'No hay una muestra de oraciones disponible.',
    },
    methods: {
      printed_index: 'Índice impreso',
      toc_bookmarks: 'Tabla de contenido / marcadores del PDF',
      font_size: 'Detección por tamaño de fuente',
      fallback_filename: 'Título o nombre del archivo',
      ninguno: 'Ninguno',
      unknown: 'Desconocido',
    },
  },
  level0Visualization: {
    noData: 'Todavía no hay datos de visualización del Nivel 0 disponibles.',
    title: 'Visualización del Nivel 0',
    description:
      'Explora la estructura y el perfil lingüístico del documento procesado.',
    chapters: 'Capítulos',
    sentences: 'Oraciones',
    words: 'Palabras',
    averageWords: 'Promedio de palabras',
    namedEntities: 'Entidades nombradas',
    frequency: 'Frecuencia',
    processedDocument: 'Documento procesado',
    unassigned: 'Sin asignar',
    noDataAvailable: 'No hay datos disponibles.',
    sentencesByVolume: {
      title: 'Oraciones por volumen',
      description:
        'Cantidad total de oraciones segmentadas en el documento o volumen actual.',
    },
    wordsByVolume: {
      title: 'Palabras por volumen',
      description:
        'Cantidad total de palabras procesadas en el documento o volumen actual.',
    },
    sentencesByChapterTop: {
      title: 'Oraciones por capítulo — top {count}',
      description:
        'Capítulos detectados ordenados desde la mayor hasta la menor cantidad de oraciones.',
    },
    wordsByChapterTop: {
      title: 'Palabras por capítulo — top {count}',
      description:
        'Capítulos detectados ordenados desde la mayor hasta la menor cantidad de palabras.',
    },
    sentencesByChapterOrder: {
      title: 'Oraciones por capítulo — orden del documento',
      description:
        'Totales de oraciones según el orden en que aparecen los capítulos en el documento.',
    },
    wordsByChapterOrder: {
      title: 'Palabras por capítulo — orden del documento',
      description:
        'Totales de palabras según el orden en que aparecen los capítulos en el documento.',
    },
    sentenceLength: {
      title: 'Distribución de longitud de oraciones',
      description: 'Mediana: {median} palabras · Promedio: {average} palabras.',
      noData: 'No hay datos de oraciones disponibles.',
    },
    nerDistribution: {
      title: 'Distribución de entidades nombradas',
      description: 'Distribución de los tipos de entidad detectados por spaCy.',
      noData: 'No hay datos de entidades disponibles.',
    },
    topEntities: {
      title: 'Entidades nombradas más frecuentes',
      description:
        'Textos de entidad más frecuentes después de eliminar ruido común de extracción.',
      noData: 'No hay entidades nombradas disponibles.',
    },
    posDistribution: {
      title: 'Distribución POS',
      description:
        'Categorías gramaticales más frecuentes del documento procesado.',
      noData: 'No hay datos POS disponibles.',
    },
    wordCloud: {
      title: 'Nube de lemas de contenido',
      description:
        'Sustantivos, verbos y adjetivos frecuentes. Se excluyen las palabras funcionales.',
      noData: 'No hay lemas de contenido disponibles.',
    },
  },
  level0Config: {
    configure: 'Configuración de Nivel 0',
    change: 'Cambiar',
    level0Configuration: 'Configuración de Nivel 0',
    sourceCorpus: 'Heredada del corpus',
    sourceDocument: 'Personalizada para este documento',
    corpusTitle: 'Configuración de Nivel 0 del corpus',
    documentTitle: 'Configuración de Nivel 0 del documento',
    aboutTitle: 'Configuración de preprocesamiento',
    corpusDescription:
      'Estos valores se convierten en la configuración predeterminada de Nivel 0 para los documentos del corpus. Las personalizaciones específicas de cada documento se conservan.',
    documentDescription:
      'Este documento puede heredar la configuración del corpus o sobrescribir únicamente los valores que necesiten ser diferentes.',
    useCorpus: 'Usar configuración del corpus',
    useCorpusDescription:
      'El documento sigue automáticamente la configuración de Nivel 0 vigente en su corpus.',
    customizeDocument: 'Personalizar para este documento',
    customizeDocumentDescription:
      'Cambia solo los parámetros que este documento necesita. Los valores no modificados continúan heredándose del corpus.',
    sections: {
      chapters: 'Detección de capítulos',
      chaptersDescription:
        'Controla cómo MELT identifica la estructura de capítulos de los documentos PDF.',
      cleaning: 'Limpieza del texto',
      cleaningDescription:
        'Controla las reglas de limpieza aplicadas antes de la segmentación y del procesamiento lingüístico.',
      footnotes: 'Notas al pie',
      footnotesDescription:
        'Controla si las notas al pie se detectan y se separan del texto principal.',
      segmentation: 'Segmentación de oraciones',
      segmentationDescription:
        'Define el rango de longitud en caracteres aceptado para las oraciones segmentadas.',
      pageExclusions: 'Exclusión de páginas',
      pageExclusionsDescription:
        'Rangos de páginas específicos del documento que no deben entrar al procesamiento de Nivel 0.',
    },
    chapterDetection: {
      enabled: 'Detectar capítulos',
      enabledDescription:
        'Identifica los límites de los capítulos y asigna las páginas y oraciones procesadas a cada capítulo.',
      method: 'Método de detección',
    },
    methods: {
      AUTO: 'Automático',
      TOC: 'Tabla de contenido / marcadores del PDF',
      PRINTED_INDEX: 'Índice impreso',
      FONT_SIZE: 'Tipografía / tamaño de fuente',
      NONE: 'No detectar capítulos',
    },
    methodDescriptions: {
      AUTO: 'Prueba primero los marcadores del PDF, luego el índice impreso, después la tipografía y finalmente usa el título del documento como respaldo.',
      TOC: 'Usa únicamente la tabla de contenido o los marcadores internos del PDF cuando estén disponibles.',
      PRINTED_INDEX: 'Usa las páginas de índice o contenido impresas para inferir los rangos de capítulos.',
      FONT_SIZE: 'Infiere los encabezados de capítulo mediante diferencias tipográficas y de tamaño de fuente.',
      NONE: 'Omite la detección de capítulos y usa el título del documento como etiqueta de respaldo.',
    },
    cleaning: {
      repairHyphenation: 'Reparar palabras cortadas por saltos de línea',
      repairHyphenationDescription:
        'Une palabras separadas por el ajuste de línea del PDF o por guiones suaves.',
      detectRepeatedHeaders: 'Detectar encabezados y pies repetidos',
      detectRepeatedHeadersDescription:
        'Elimina automáticamente líneas cortas que se repiten en muchas páginas.',
      repeatedHeaderThreshold: 'Umbral de encabezados repetidos',
      repeatedHeaderThresholdDescription:
        'Proporción de páginas en la que una línea debe repetirse para considerarse encabezado o pie (0,05–0,95).',
      excludeFrontMatter: 'Excluir materia preliminar automáticamente',
      excludeFrontMatterDescription:
        'Intenta eliminar portadas, créditos, índices, bibliografías y material preliminar similar.',
      minLineLength: 'Longitud mínima de línea',
      minLineLengthDescription:
        'Las líneas por debajo de esta longitud se eliminan solamente cuando además parecen ruido.',
      additionalHeadersFooters: 'Encabezados / pies adicionales a eliminar',
      additionalHeadersFootersDescription:
        'Escribe un encabezado o pie exacto por línea. Es útil para etiquetas repetidas específicas de un corpus.',
      additionalHeadersFootersPlaceholder:
        'COMISIÓN DE LA VERDAD\nINFORME FINAL\nSERIE DOCUMENTAL',
    },
    footnotes: {
      extract: 'Extraer notas al pie',
      extractDescription:
        'Detecta notas al pie mediante posición, tamaño de fuente y marcadores, y las separa del texto principal.',
    },
    segmentation: {
      minChars: 'Longitud mínima de oración',
      minCharsDescription: 'Cantidad mínima de caracteres aceptada por oración.',
      maxChars: 'Longitud máxima de oración',
      maxCharsDescription: 'Cantidad máxima de caracteres aceptada por oración.',
    },
    pageExclusions: {
      explicitRanges: 'Usar rangos de páginas explícitos para este documento',
      explicitRangesDescription:
        'Al activarlo, los rangos de abajo sustituyen las exclusiones heredadas o específicas del nombre del archivo. Una lista vacía desactiva explícitamente esas exclusiones.',
      from: 'Desde la página',
      to: 'Hasta la página',
      add: 'Agregar rango',
      remove: 'Eliminar rango',
      emptyExplicit:
        'No hay rangos agregados. Guardar este estado significa que la regla de rangos no excluirá ninguna página explícitamente.',
    },
    outdatedWarning:
      'Cambiar la configuración de Nivel 0 invalida los resultados procesados anteriormente. El Nivel 0 y los niveles posteriores que ya hayan sido procesados se marcarán como desactualizados y deberán procesarse de nuevo.',
    processingLocked:
      'La configuración no puede modificarse mientras el Nivel 0 está en procesamiento.',
    cancel: 'Cancelar',
    save: 'Guardar configuración',
    saveError: 'No se pudo guardar la configuración de Nivel 0',
  },

}

export const messages: Record<Locale, Messages> = {
  en,
  es,
}
