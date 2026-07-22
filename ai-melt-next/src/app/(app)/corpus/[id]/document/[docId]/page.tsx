"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  documentApi,
  analysisApi,
  type Level0ProgressResponse,
} from "@/lib/api";
import type {
  Document,
  Analysis,
  PrimaryMetaphor,
  ConventionalMetaphor,
  MetaphoricalScenario,
  MetaphorRegime,
  CulturalNarrative,
  LevelStatus,
  Level0Data,
} from "@/types";
import { LevelBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/accordion";
import { LevelWrapper } from "@/components/analysis/LevelWrapper";
import { Level0 } from "@/components/analysis/Level0";
import { Level1 } from "@/components/analysis/Level1";
import { Level2 } from "@/components/analysis/Level2";
import { Level3 } from "@/components/analysis/Level3";
import { Level4 } from "@/components/analysis/Level4";
import { Level5 } from "@/components/analysis/Level5";
import { ArrowLeft, FileText, SearchCheck, Zap } from "lucide-react";
import { docTypeLabel, cn } from "@/lib/utils";

type Tab = 0 | 1 | 2 | 3 | 4 | 5;

const TAB_LABELS: Record<Tab, string> = {
  0: "Level 0 · Ingestion",
  1: "Level 1 · Metaphors",
  2: "Level 2 · Conventional",
  3: "Level 3 · Scenarios",
  4: "Level 4 · Regimes",
  5: "Level 5 · Narrative",
};

export default function DocumentPage() {
  const router = useRouter();
  const { id: corpusId, docId } = useParams<{ id: string; docId: string }>();

  const [doc, setDoc] = useState<Document | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tab, setTab] = useState<Tab>(0);
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);
  const [processingLevel0, setProcessingLevel0] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [level0, setLevel0] = useState<Level0Data | null>(null);
  const [level0Loading, setLevel0Loading] = useState(false);
  const [level0Error, setLevel0Error] = useState("");
  const [level0Progress, setLevel0Progress] =
    useState<Level0ProgressResponse | null>(null);

  const [l1, setL1] = useState<PrimaryMetaphor[]>([]);
  const [l2, setL2] = useState<ConventionalMetaphor[]>([]);
  const [l3, setL3] = useState<MetaphoricalScenario[]>([]);
  const [l4, setL4] = useState<MetaphorRegime[]>([]);
  const [l5, setL5] = useState<CulturalNarrative | null>(null);

  const fetchAnalysis = useCallback(async (analysisId: string) => {
    const a = await analysisApi.get(analysisId);
    setAnalysis(a);
    return a;
  }, []);

  const loadDocument = useCallback(async () => {
    const d = await documentApi.get(docId);
    setDoc(d);

    if (d.analysis) {
      const a = await analysisApi.get(d.analysis.id);
      setAnalysis(a);
      return { doc: d, analysis: a };
    }

    setAnalysis(null);
    return { doc: d, analysis: null };
  }, [docId]);

  const loadLevelData = useCallback(
    async (analysisId: string, level: Exclude<Tab, 0>) => {
      try {
        if (level === 1) setL1(await analysisApi.getLevel1(analysisId));
        else if (level === 2) setL2(await analysisApi.getLevel2(analysisId));
        else if (level === 3) setL3(await analysisApi.getLevel3(analysisId));
        else if (level === 4) setL4(await analysisApi.getLevel4(analysisId));
        else if (level === 5) setL5(await analysisApi.getLevel5(analysisId));
      } catch {
        // ignore for now
      }
    },
    [],
  );

  const loadLevel0 = useCallback(async () => {
    setLevel0Loading(true);
    setLevel0Error("");

    try {
      const data = await documentApi.getLevel0(docId);
      setLevel0(data);
    } catch (e: unknown) {
      setLevel0(null);
      setLevel0Error(
        e instanceof Error ? e.message : "Failed to load Level 0 data",
      );
    } finally {
      setLevel0Loading(false);
    }
  }, [docId]);

  const loadLevel0Progress = useCallback(async () => {
    try {
      const data = await documentApi.getLevel0Progress(docId);
      setLevel0Progress(data);
      return data;
    } catch {
      return null;
    }
  }, [docId]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const result = await loadDocument();
        if (cancelled) return;

        await loadLevel0Progress();

        if (result.analysis?.level0Status === "APPROVED") {
          await loadLevel0();
        }
      } catch {
        // ignore for now
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [loadDocument, loadLevel0, loadLevel0Progress]);

  useEffect(() => {
    if (!analysis) return;

    const statuses = [
      analysis.level1Status,
      analysis.level2Status,
      analysis.level3Status,
      analysis.level4Status,
      analysis.level5Status,
    ];

    const hasProcessing = statuses.some((s) => s === "PROCESSING");

    if (hasProcessing && !pollingRef.current) {
      pollingRef.current = setInterval(async () => {
        if (!analysis) return;

        const a = await fetchAnalysis(analysis.id);
        const stillProcessing = [
          a.level1Status,
          a.level2Status,
          a.level3Status,
          a.level4Status,
          a.level5Status,
        ].some((s) => s === "PROCESSING");

        if (!stillProcessing) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;

          if (tab > 0 && getLevelStatus(0) === "APPROVED") {
            await loadLevelData(a.id, tab as Exclude<Tab, 0>);
          }
        }
      }, 4000);
    } else if (!hasProcessing && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [analysis, fetchAnalysis, loadLevelData, tab]);

  useEffect(() => {
    if (analysis && tab > 0 && getLevelStatus(0) === "APPROVED") {
      loadLevelData(analysis.id, tab as Exclude<Tab, 0>);
    }
  }, [tab, analysis, loadLevelData]);

  useEffect(() => {
    if (!(processingLevel0 || analysis?.level0Status === "PROCESSING")) return;

    const interval = setInterval(async () => {
      const progress = await loadLevel0Progress();

      if (progress?.status === "APPROVED") {
        clearInterval(interval);
        setProcessingLevel0(false);
        await loadDocument();
        await loadLevel0();
      }

      if (progress?.status === "FAILED") {
        clearInterval(interval);
        setProcessingLevel0(false);
        setLevel0Error(progress.error || "Level 0 processing failed");
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [
    processingLevel0,
    analysis?.level0Status,
    loadLevel0Progress,
    loadDocument,
    loadLevel0,
  ]);

  const handleInitAnalysis = async () => {
    if (!doc) return;

    setInitLoading(true);
    try {
      const a = await documentApi.initAnalysis(doc.id);
      setAnalysis(a);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to initialize analysis");
    } finally {
      setInitLoading(false);
    }
  };

  const handleProcessLevel0 = async () => {
    if (!doc || processingLevel0) return;

    setProcessingLevel0(true);
    setLevel0Error("");
    setLevel0(null);

    try {
      await documentApi.processLevel0(doc.id);
      await loadLevel0Progress();
    } catch (e: unknown) {
      setProcessingLevel0(false);
      alert(e instanceof Error ? e.message : "Failed to process Level 0");
    }
  };

  const handleProcess = async (level: 1 | 2 | 3 | 4 | 5) => {
    if (!analysis) return;

    setProcessing(level);
    try {
      await analysisApi.process(analysis.id, level);
      await fetchAnalysis(analysis.id);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to process");
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveAll = async (level: 1 | 2 | 3 | 4 | 5) => {
    if (!analysis) return;

    setApproving(level);
    try {
      await analysisApi.approveAll(analysis.id, level);
      await fetchAnalysis(analysis.id);
      await loadLevelData(analysis.id, level);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setApproving(null);
    }
  };

  const handleApprove = async (level: 1 | 2 | 3 | 4 | 5) => {
    if (!analysis) return;

    setApproving(level);
    try {
      await analysisApi.approve(analysis.id, level);
      await fetchAnalysis(analysis.id);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setApproving(null);
    }
  };

  const getLevelStatus = (level: Tab): LevelStatus => {
    if (!analysis) {
      return level === 0 && level0 ? "APPROVED" : "PENDING";
    }

    const map: Record<Tab, LevelStatus> = {
      0: analysis.level0Status,
      1: analysis.level1Status,
      2: analysis.level2Status,
      3: analysis.level3Status,
      4: analysis.level4Status,
      5: analysis.level5Status,
    };

    return map[level];
  };

  const level0Status = getLevelStatus(0);
  const level0Ready = level0Status === "APPROVED";
  const level0IsProcessing =
    processingLevel0 ||
    analysis?.level0Status === "PROCESSING" ||
    level0Progress?.status === "PROCESSING";

  const API_BASE = (
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api"
  ).replace(/\/api$/, "");

  const documentFileHref = doc?.fileUrl
    ? doc.fileUrl.startsWith("http")
      ? doc.fileUrl
      : `${API_BASE}${doc.fileUrl.startsWith("/") ? "" : "/"}${doc.fileUrl}`
    : null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <button
        onClick={() => router.push(`/corpus/${corpusId}`)}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Back to corpus
      </button>

      {doc && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <FileText size={18} className="text-blue-700" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900">{doc.title}</h1>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  {doc.author && <span>{doc.author}</span>}
                  {doc.documentType && (
                    <span>{docTypeLabel(doc.documentType)}</span>
                  )}
                  <span className="capitalize">
                    {doc.language?.toLowerCase()}
                  </span>
                  {doc.pageCount && <span>{doc.pageCount} pages</span>}
                  {doc.tokenCount && (
                    <span>{doc.tokenCount.toLocaleString()} tokens</span>
                  )}
                </div>

                {doc.description && (
                  <p className="mt-1 max-w-3xl text-sm text-gray-500">
                    {doc.description}
                  </p>
                )}
              </div>
            </div>

            {!analysis && level0Ready && (
              <Button
                onClick={handleInitAnalysis}
                loading={initLoading}
                disabled={initLoading}
              >
                <Zap size={15} /> Initialize Levels 1–5
              </Button>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <div className="flex items-center gap-2 font-medium">
              <SearchCheck size={16} />
              Process Level 0 first
            </div>
            <p className="mt-1 text-blue-900/90">
              Use the Level 0 tab to run preprocessing and validate chapter
              detection, text cleaning, footnotes, and sentence segmentation
              before launching metaphor analysis.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            {([0, 1, 2, 3, 4, 5] as const).map((l) => (
              <div
                key={l}
                className="flex items-center gap-1.5 text-xs text-gray-500"
              >
                <span>{l === 0 ? "N0" : `L${l}`}</span>
                <LevelBadge status={getLevelStatus(l)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!level0Ready && !level0IsProcessing && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Level 0 has not been processed yet. Run{" "}
          <strong>Process Level 0</strong> from the Level 0 tab before
          continuing with the rest of the workflow.
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {([0, 1, 2, 3, 4, 5] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                tab === t
                  ? "border-b-2 border-blue-700 bg-blue-50/50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
              )}
            >
              {TAB_LABELS[t]}
              <LevelBadge status={getLevelStatus(t)} />
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 0 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-base font-semibold text-gray-800">
                  Document summary
                </h2>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  {doc?.title && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-gray-400">
                        Title
                      </span>
                      <p className="mt-0.5 text-gray-800">{doc.title}</p>
                    </div>
                  )}

                  {doc?.author && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-gray-400">
                        Author
                      </span>
                      <p className="mt-0.5 text-gray-800">{doc.author}</p>
                    </div>
                  )}

                  {doc?.documentType && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-gray-400">
                        Type
                      </span>
                      <p className="mt-0.5 text-gray-800">
                        {docTypeLabel(doc.documentType)}
                      </p>
                    </div>
                  )}

                  {doc?.language && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-gray-400">
                        Language
                      </span>
                      <p className="mt-0.5 capitalize text-gray-800">
                        {doc.language.toLowerCase()}
                      </p>
                    </div>
                  )}

                  {typeof doc?.pageCount === "number" && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-gray-400">
                        Pages
                      </span>
                      <p className="mt-0.5 text-gray-800">{doc.pageCount}</p>
                    </div>
                  )}

                  {typeof doc?.tokenCount === "number" && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-gray-400">
                        Tokens
                      </span>
                      <p className="mt-0.5 text-gray-800">
                        {doc.tokenCount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {doc?.description && (
                  <div className="mt-4">
                    <span className="text-xs uppercase tracking-wide text-gray-400">
                      Description
                    </span>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">
                      {doc.description}
                    </p>
                  </div>
                )}

                {documentFileHref ? (
                  <div className="mt-4">
                    <a
                      href={documentFileHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <FileText size={14} />
                      View document file
                    </a>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-500">
                    No original file URL is available for this document.
                  </div>
                )}
              </div>

              {!level0Ready && !level0IsProcessing && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="text-base font-semibold text-amber-900">
                    Level 0 pending
                  </h3>
                  <p className="mt-2 text-sm text-amber-900/90">
                    This document has been uploaded, but Level 0 preprocessing
                    has not been run yet.
                  </p>
                  <div className="mt-4">
                    <Button
                      onClick={handleProcessLevel0}
                      className="bg-blue-700 text-white hover:bg-blue-800"
                    >
                      Process Level 0
                    </Button>
                  </div>
                </div>
              )}

              {level0IsProcessing && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex items-center gap-3">
                    <Spinner size="sm" />
                    <div className="w-full">
                      <h3 className="text-base font-semibold text-blue-900">
                        Processing Level 0
                      </h3>
                      <p className="text-sm text-blue-900/80">
                        Running preprocessing in the backend. Progress will
                        update below.
                      </p>

                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between text-xs font-medium text-blue-900">
                          <span>
                            {level0Progress?.message || "Processing..."}
                          </span>
                          <span>{level0Progress?.progress ?? 0}%</span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
                          <div
                            className="h-full rounded-full bg-blue-700 transition-all duration-500"
                            style={{
                              width: `${level0Progress?.progress ?? 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {(level0Progress?.steps ?? []).map((step) => (
                      <div
                        key={step.key}
                        className="rounded-lg border border-blue-100 bg-white px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-medium text-gray-900">
                            {step.label}
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium",
                              step.status === "done" &&
                                "bg-green-100 text-green-700",
                              step.status === "running" &&
                                "bg-blue-100 text-blue-700",
                              step.status === "pending" &&
                                "bg-gray-100 text-gray-600",
                              step.status === "error" &&
                                "bg-red-100 text-red-700",
                            )}
                          >
                            {step.status}
                          </span>
                        </div>

                        {step.message && (
                          <p className="mt-1 text-sm text-gray-600">
                            {step.message}
                          </p>
                        )}
                      </div>
                    ))}

                    {level0Progress?.error && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {level0Progress.error}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {level0Ready && (
                <Level0
                  data={level0}
                  loading={level0Loading}
                  error={
                    level0Error.includes("No processed data found")
                      ? ""
                      : level0Error
                  }
                  onRefresh={loadLevel0}
                />
              )}
            </div>
          )}

          {tab > 0 && !level0Ready && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Process and review <strong>Level 0</strong> first before
              continuing with Levels 1–5.
            </div>
          )}

          {level0Ready && analysis && tab === 1 && (
            <LevelWrapper
              level={1}
              status={getLevelStatus(1)}
              onProcess={() => handleProcess(1)}
              onApproveAll={() => handleApproveAll(1)}
              onApprove={() => handleApprove(1)}
              processing={processing === 1}
              approving={approving === 1}
            >
              <Level1
                metaphors={l1}
                onRefresh={() => analysis && loadLevelData(analysis.id, 1)}
              />
            </LevelWrapper>
          )}

          {level0Ready && analysis && tab === 2 && (
            <LevelWrapper
              level={2}
              status={getLevelStatus(2)}
              onProcess={() => handleProcess(2)}
              onApproveAll={() => handleApproveAll(2)}
              onApprove={() => handleApprove(2)}
              processing={processing === 2}
              approving={approving === 2}
            >
              <Level2
                metaphors={l2}
                onRefresh={() => analysis && loadLevelData(analysis.id, 2)}
              />
            </LevelWrapper>
          )}

          {level0Ready && analysis && tab === 3 && (
            <LevelWrapper
              level={3}
              status={getLevelStatus(3)}
              onProcess={() => handleProcess(3)}
              onApproveAll={() => handleApproveAll(3)}
              onApprove={() => handleApprove(3)}
              processing={processing === 3}
              approving={approving === 3}
            >
              <Level3
                scenarios={l3}
                onRefresh={() => analysis && loadLevelData(analysis.id, 3)}
              />
            </LevelWrapper>
          )}

          {level0Ready && analysis && tab === 4 && (
            <LevelWrapper
              level={4}
              status={getLevelStatus(4)}
              onProcess={() => handleProcess(4)}
              onApproveAll={() => handleApproveAll(4)}
              onApprove={() => handleApprove(4)}
              processing={processing === 4}
              approving={approving === 4}
            >
              <Level4
                regimes={l4}
                onRefresh={() => analysis && loadLevelData(analysis.id, 4)}
              />
            </LevelWrapper>
          )}

          {level0Ready && analysis && tab === 5 && (
            <LevelWrapper
              level={5}
              status={getLevelStatus(5)}
              onProcess={() => handleProcess(5)}
              onApproveAll={() => handleApproveAll(5)}
              onApprove={() => handleApprove(5)}
              processing={processing === 5}
              approving={approving === 5}
            >
              <Level5
                narrative={l5}
                onRefresh={() => analysis && loadLevelData(analysis.id, 5)}
              />
            </LevelWrapper>
          )}
        </div>
      </div>
    </div>
  );
}
