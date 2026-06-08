#!/usr/bin/env pwsh
# setup-frontend.ps1
# Creates necessary directories and copies page files for frontend integration

Write-Host "🚀 Setting up AI-MELT Frontend..." -ForegroundColor Green

$basePath = Join-Path (Get-Location) "src\app"

# Create directories
Write-Host "`n📁 Creating directory structure..." -ForegroundColor Blue
New-Item -ItemType Directory -Path "$basePath\upload" -Force | Out-Null
New-Item -ItemType Directory -Path "$basePath\corpus\[id]" -Force | Out-Null
New-Item -ItemType Directory -Path "$basePath\analysis" -Force | Out-Null

Write-Host "✅ Directories created" -ForegroundColor Green

# Create upload page
Write-Host "`n📝 Creating page files..." -ForegroundColor Blue

@"
'use client'

import { UploadPDF } from '@/components/UploadPDF'
import { PipelineProgress } from '@/components/PipelineProgress'
import Link from 'next/link'

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI-MELT Pipeline</h1>
          <p className="text-xl text-gray-600">Upload and process documents with advanced NLP</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Upload Document</h2>
            <UploadPDF />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Processing Status</h2>
            <PipelineProgress />
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/corpus"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View Corpus →
          </Link>
        </div>
      </div>
    </div>
  )
}
"@ | Out-File "$basePath\upload\page.tsx" -Encoding UTF8

Write-Host "✅ Created upload/page.tsx"

# Create corpus page
@"
'use client'

import { useCorpus } from '@/lib/useCustomHooks'
import Link from 'next/link'
import { FileText, Calendar, Hash } from 'lucide-react'

export default function CorpusPage() {
  const { documents, selectCorpusDocument } = useCorpus()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Document Corpus</h1>
          <p className="text-lg text-gray-600">Manage and analyze your processed documents</p>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No documents yet</h2>
            <p className="text-gray-600 mb-6">Upload a document to get started</p>
            <Link
              href="/upload"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Upload Document
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Link
                key={doc.metadata.id}
                href={\`/corpus/\${doc.metadata.id}\`}
                onClick={() => selectCorpusDocument(doc.metadata.id)}
              >
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {doc.metadata.filename}
                        </h3>
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            {doc.chapters.length} chapters
                          </div>
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            {doc.metadata.totalSentences || 0} sentences
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(doc.metadata.processedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Processed
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
"@ | Out-File "$basePath\corpus\page.tsx" -Encoding UTF8

Write-Host "✅ Created corpus/page.tsx"

# Create corpus detail page
@"
'use client'

import { useCorpus } from '@/lib/useCustomHooks'
import { ResultsViewer } from '@/components/ResultsViewer'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function DocumentPage() {
  const params = useParams()
  const docId = params?.id as string
  const { selectCorpusDocument, currentDocument } = useCorpus()

  useEffect(() => {
    if (docId) {
      selectCorpusDocument(docId)
    }
  }, [docId, selectCorpusDocument])

  if (!currentDocument) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Document not found</h2>
          <Link href="/corpus" className="text-blue-600 hover:text-blue-700">
            ← Back to Corpus
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/corpus" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Back to Corpus
        </Link>
        <ResultsViewer />
      </div>
    </div>
  )
}
"@ | Out-File "$basePath\corpus\[id]\page.tsx" -Encoding UTF8

Write-Host "✅ Created corpus/[id]/page.tsx"

# Create analysis page
@"
'use client'

import { useAnalysis, useJobsList } from '@/lib/useCustomHooks'
import { useCallback, useState } from 'react'
import Link from 'next/link'
import { BarChart3, AlertCircle, Loader } from 'lucide-react'

export default function AnalysisPage() {
  const { jobs, getJobsByStatus } = useJobsList()
  const { analyzeDocument, getAnalysisResult, isAnalyzing } = useAnalysis()
  const [analyzedJobId, setAnalyzedJobId] = useState<string | null>(null)

  const completedJobs = getJobsByStatus('completed')
  const analysisResult = analyzedJobId ? getAnalysisResult(analyzedJobId) : null

  const handleAnalyze = useCallback(
    async (jobId: string) => {
      try {
        await analyzeDocument(jobId)
        setAnalyzedJobId(jobId)
      } catch (error) {
        console.error('Analysis failed:', error)
      }
    },
    [analyzeDocument]
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Document Analysis</h1>
          <p className="text-lg text-gray-600">Advanced NLP analysis and insights</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Available Documents</h2>
              <div className="space-y-2">
                {completedJobs.length === 0 ? (
                  <p className="text-sm text-gray-600">No completed jobs yet</p>
                ) : (
                  completedJobs.map((job) => (
                    <button
                      key={job.jobId}
                      onClick={() => handleAnalyze(job.jobId)}
                      disabled={isAnalyzing}
                      className={\`w-full text-left p-3 rounded border transition \${
                        analyzedJobId === job.jobId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } \${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}\`}
                    >
                      <div className="font-medium text-sm truncate">
                        {job.document?.metadata.filename}
                      </div>
                      <div className="text-xs text-gray-500">
                        {job.document?.chapters.length} chapters
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {isAnalyzing && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">Analyzing document...</p>
              </div>
            )}

            {!isAnalyzing && analysisResult && (
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analysis Results
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <div className="text-sm text-blue-600">Total Entities</div>
                    <div className="text-3xl font-bold text-blue-900">
                      {analysisResult.totalEntities}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded border border-green-200">
                    <div className="text-sm text-green-600">Avg Density</div>
                    <div className="text-3xl font-bold text-green-900">
                      {(analysisResult.averageDensity * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Top Entities</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {analysisResult.topEntities.map((entity, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium text-sm">{entity.text}</p>
                          <p className="text-xs text-gray-500">{entity.type}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {entity.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isAnalyzing && !analysisResult && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a document to analyze</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/upload"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Upload New Document
          </Link>
        </div>
      </div>
    </div>
  )
}
"@ | Out-File "$basePath\analysis\page.tsx" -Encoding UTF8

Write-Host "✅ Created analysis/page.tsx"

Write-Host "`n✅ Frontend setup completed!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Blue
Write-Host "   1. npm install swr zustand" -ForegroundColor Cyan
Write-Host "   2. npm run dev" -ForegroundColor Cyan
Write-Host "`n🎉 Ready to go!" -ForegroundColor Green
