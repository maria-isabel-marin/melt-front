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
  DocumentLevel0ConfigResponse,
  Level0ConfigOverrides,
} from "@/types";
import { LocalizedLevelBadge } from "@/components/i18n/LocalizedLevelBadge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/accordion";
import { LevelWrapper } from "@/components/analysis/LevelWrapper";
import { Level0 } from "@/components/analysis/Level0";
import { Level0Visualization } from "@/components/analysis/Level0Visualization";
import { Level1 } from "@/components/analysis/Level1";
import { Level2 } from "@/components/analysis/Level2";
import { Level3 } from "@/components/analysis/Level3";
import { Level4 } from "@/components/analysis/Level4";
import { Level5 } from "@/components/analysis/Level5";
import { ArrowLeft, FileText, SearchCheck, Settings2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Level0ConfigDialog } from "@/components/config/Level0ConfigDialog";

type Tab = 0 | 1 | 2 | 3 | 4 | 5;
type Level0View = "processing" | "visualization";


export default function DocumentPage() {
  const router = useRouter();
  const { id: corpusId, docId } = useParams<{ id: string; docId: string }>();
  const { t, locale } = useI18n();

  const [doc, setDoc] = useState<Document | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tab, setTab] = useState<Tab>(0);
  const [level0View, setLevel0View] = useState<Level0View>("processing");
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

  const [level0ConfigInfo, setLevel0ConfigInfo] =
    useState<DocumentLevel0ConfigResponse | null>(null);
  const [showLevel0Config, setShowLevel0Config] = useState(false);
  const [savingLevel0Config, setSavingLevel0Config] = useState(false);

  const [l1, setL1] = useState<PrimaryMetaphor[]>([]);
  const [l2, setL2] = useState<ConventionalMetaphor[]>([]);
  const [l3, setL3] = useState<MetaphoricalScenario[]>([]);
  const [l4, setL4] = useState<MetaphorRegime[]>([]);
  const [l5, setL5] = useState<CulturalNarrative | null>(null);

  const tabLabels: Record<Tab, string> = {
    0: t("documentPage.tabs.level0"),
    1: t("documentPage.tabs.level1"),
    2: t("documentPage.tabs.level2"),
    3: t("documentPage.tabs.level3"),
    4: t("documentPage.tabs.level4"),
    5: t("documentPage.tabs.level5"),
  };

  const numberLocale = locale === "es" ? "es-CO" : "en-US";

  const documentTypeLabel = (value?: string) =>
    value ? t(`documentTypes.${value}`) : t("common.unknown");

  const documentLanguageLabel = (value?: string) =>
    value ? t(`documentLanguages.${value}`) : t("common.unknown");

  const progressStepTitle = (key: string, fallback: string) => {
    const translated = t(`progressSteps.${key}.title`);
    return translated === `progressSteps.${key}.title`
      ? fallback
      : translated;
  };

  const progressStepDescription = (key: string) => {
    const translated = t(`progressSteps.${key}.description`);
    return translated === `progressSteps.${key}.description`
      ? ""
      : translated;
  };

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
        e instanceof Error ? e.message : t("documentPage.level0LoadError"),
      );
    } finally {
      setLevel0Loading(false);
    }
  }, [docId, t]);

  const loadLevel0Progress = useCallback(async () => {
    try {
      const data = await documentApi.getLevel0Progress(docId);
      setLevel0Progress(data);
      return data;
    } catch {
      return null;
    }
  }, [docId]);

  const loadLevel0Config = useCallback(async () => {
    try {
      const data = await documentApi.getLevel0Config(docId);
      setLevel0ConfigInfo(data);
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

        await Promise.all([
          loadLevel0Progress(),
          loadLevel0Config(),
        ]);

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
  }, [
    loadDocument,
    loadLevel0,
    loadLevel0Progress,
    loadLevel0Config,
  ]);

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

          if (tab > 0 && a.level0Status === "APPROVED") {
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
    if (analysis && tab > 0 && analysis.level0Status === "APPROVED") {
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
        setLevel0View("processing");
      }

      if (progress?.status === "FAILED") {
        clearInterval(interval);
        setProcessingLevel0(false);
        setLevel0Error(progress.error || t("documentPage.level0Failed"));
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [
    processingLevel0,
    analysis?.level0Status,
    loadLevel0Progress,
    loadDocument,
    loadLevel0,
    t,
  ]);

  const handleInitAnalysis = async () => {
    if (!doc) return;

    setInitLoading(true);
    try {
      const a = await documentApi.initAnalysis(doc.id);
      setAnalysis(a);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : t("documentPage.initializeError"));
    } finally {
      setInitLoading(false);
    }
  };

  const handleSaveLevel0Config = async (
    overrides: Level0ConfigOverrides | null,
  ) => {
    setSavingLevel0Config(true);

    try {
      const updatedConfig = await documentApi.updateLevel0Config(
        docId,
        overrides,
      );

      setLevel0ConfigInfo(updatedConfig);
      setLevel0(null);
      setLevel0Error("");
      setLevel0View("processing");
      setShowLevel0Config(false);

      await loadDocument();
    } catch (configError: unknown) {
      alert(
        configError instanceof Error
          ? configError.message
          : t("level0Config.saveError"),
      );
    } finally {
      setSavingLevel0Config(false);
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
      alert(e instanceof Error ? e.message : t("documentPage.level0ProcessError"));
    }
  };

  const handleProcess = async (level: 1 | 2 | 3 | 4 | 5) => {
    if (!analysis) return;

    setProcessing(level);
    try {
      await analysisApi.process(analysis.id, level);
      await fetchAnalysis(analysis.id);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : t("documentPage.processError"));
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
      alert(e instanceof Error ? e.message : t("documentPage.approveError"));
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
      alert(e instanceof Error ? e.message : t("documentPage.approveError"));
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
        <ArrowLeft size={16} /> {t("documentPage.back")}
      </button>

      {doc && (
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {doc.title}
          </h1>

          {!analysis && level0Ready && (
            <Button
              onClick={handleInitAnalysis}
              loading={initLoading}
              disabled={initLoading}
            >
              <Zap size={15} /> {t("documentPage.initializeLevels")}
            </Button>
          )}
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
              {tabLabels[t]}
              <LocalizedLevelBadge status={getLevelStatus(t)} />
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 0 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {t("documentPage.summary.title")}
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {t("documentPage.summary.description")}
                    </p>
                  </div>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                  <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                    <span className="text-[11px] uppercase tracking-wide text-gray-400">
                      {t("documentPage.summary.author")}
                    </span>
                    <p className="mt-0.5 truncate text-sm font-medium text-gray-800">
                      {doc?.author || t("common.unknown")}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                    <span className="text-[11px] uppercase tracking-wide text-gray-400">
                      {t("documentPage.summary.type")}
                    </span>
                    <p className="mt-0.5 truncate text-sm font-medium text-gray-800">
                      {documentTypeLabel(doc?.documentType)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                    <span className="text-[11px] uppercase tracking-wide text-gray-400">
                      {t("documentPage.summary.language")}
                    </span>
                    <p className="mt-0.5 capitalize text-sm font-medium text-gray-800">
                      {documentLanguageLabel(doc?.language)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                    <span className="text-[11px] uppercase tracking-wide text-gray-400">
                      {t("documentPage.summary.pages")}
                    </span>
                    <p className="mt-0.5 text-sm font-medium text-gray-800">
                      {typeof doc?.pageCount === "number"
                        ? doc.pageCount.toLocaleString(numberLocale)
                        : "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                    <span className="text-[11px] uppercase tracking-wide text-gray-400">
                      {t("documentPage.summary.tokens")}
                    </span>
                    <p className="mt-0.5 text-sm font-medium text-gray-800">
                      {typeof doc?.tokenCount === "number"
                        ? doc.tokenCount.toLocaleString(numberLocale)
                        : level0IsProcessing
                          ? t("common.processing")
                          : "—"}
                    </p>
                  </div>
                </div>

                {doc?.description && (
                  <div className="mt-3 flex flex-col gap-1 border-t border-gray-100 pt-3 sm:flex-row sm:items-start sm:gap-3">
                    <span className="shrink-0 text-[11px] uppercase tracking-wide text-gray-400">
                      {t("documentPage.summary.documentDescription")}
                    </span>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {doc.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                {documentFileHref ? (
                  <a
                    href={documentFileHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <FileText size={14} />
                    {t("documentPage.summary.viewFile")}
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">
                    {t("documentPage.summary.fileUnavailable")}
                  </span>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowLevel0Config(true)}
                  disabled={level0IsProcessing}
                >
                  <Settings2 size={15} />
                  {t("level0Config.configure")}
                </Button>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t("level0Config.level0Configuration")}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {level0ConfigInfo?.source === "DOCUMENT"
                        ? t("level0Config.sourceDocument")
                        : t("level0Config.sourceCorpus")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLevel0Config(true)}
                    disabled={level0IsProcessing}
                    className="inline-flex items-center gap-2 self-start text-sm font-medium text-blue-700 transition hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-400 sm:self-auto"
                  >
                    <Settings2 size={14} />
                    {t("level0Config.change")}
                  </button>
                </div>
              </div>

              {!level0Ready && !level0IsProcessing && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
                  <div className="flex items-center gap-2 font-medium">
                    <SearchCheck size={16} />
                    {t("documentPage.level0Notice.title")}
                  </div>
                  <p className="mt-1 text-blue-900/90">
                    {t("documentPage.level0Notice.description")}
                  </p>
                </div>
              )}

              {!level0Ready && !level0IsProcessing && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="text-base font-semibold text-amber-900">
                    {t("documentPage.level0Pending.title")}
                  </h3>
                  <p className="mt-2 text-sm text-amber-900/90">
                    {t("documentPage.level0Pending.description")}
                  </p>
                  <div className="mt-4">
                    <Button
                      onClick={handleProcessLevel0}
                      className="bg-blue-700 text-white hover:bg-blue-800"
                    >
                      {t("documentPage.level0Pending.button")}
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
                        {t("documentPage.level0Processing.title")}
                      </h3>
                      <p className="text-sm text-blue-900/80">
                        {t("documentPage.level0Processing.description")}
                      </p>

                      <div className="mt-4">
                        <div className="mb-1 flex items-center justify-between text-xs font-medium text-blue-900">
                          <span>
                            {t("documentPage.level0Processing.current")}
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
                            {progressStepTitle(step.key, step.label)}
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
                            {t(`statuses.${step.status}`)}
                          </span>
                        </div>

                        {(progressStepDescription(step.key) ||
                          (step.status === "error" && step.message)) && (
                          <p className="mt-1 text-sm text-gray-600">
                            {step.status === "error" && step.message
                              ? step.message
                              : progressStepDescription(step.key)}
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
                <div className="space-y-6">
                  <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                    <button
                      type="button"
                      onClick={() => setLevel0View("processing")}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                        level0View === "processing"
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-gray-500 hover:text-gray-800",
                      )}
                    >
                      {t("documentPage.views.processing")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLevel0View("visualization")}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                        level0View === "visualization"
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-gray-500 hover:text-gray-800",
                      )}
                    >
                      {t("documentPage.views.visualization")}
                    </button>
                  </div>

                  {level0View === "processing" && (
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

                  {level0View === "visualization" && (
                    <Level0Visualization
                      data={level0}
                      loading={level0Loading}
                      error={
                        level0Error.includes("No processed data found")
                          ? ""
                          : level0Error
                      }
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {tab > 0 && !level0Ready && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {t("documentPage.blocked")}
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

      <Level0ConfigDialog
        open={showLevel0Config}
        onClose={() => setShowLevel0Config(false)}
        scope="document"
        corpusConfig={level0ConfigInfo?.corpusConfig}
        effectiveConfig={level0ConfigInfo?.effectiveConfig}
        source={level0ConfigInfo?.source}
        saving={savingLevel0Config}
        disabled={level0IsProcessing}
        onSave={handleSaveLevel0Config}
      />
    </div>
  );
}