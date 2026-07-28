"use client";

import { useMemo } from "react";
import type { Level0Data } from "@/types";
import { Spinner } from "@/components/ui/accordion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  BookOpen,
  MessageSquareText,
  Network,
  Tags,
} from "lucide-react";

type Props = {
  data: Level0Data | null;
  loading?: boolean;
  error?: string;
};

type CountRow = {
  label: string;
  value: number;
};

const NER_COLORS = [
  "#2563eb",
  "#0f766e",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#64748b",
];
const CLOUD_COLORS = [
  "#1d4ed8",
  "#0f766e",
  "#6d28d9",
  "#be123c",
  "#0369a1",
  "#4d7c0f",
];

const CONTENT_POS = new Set(["NOUN", "VERB", "ADJ"]);

const CONTENT_STOPWORDS = new Set([
  "ser",
  "estar",
  "haber",
  "tener",
  "hacer",
  "poder",
  "decir",
  "dar",
  "ver",
  "que",
  "como",
  "para",
  "por",
  "con",
  "sin",
  "del",
  "uno",
  "una",
  "este",
  "esta",
  "ese",
  "esa",
  "todo",
  "otro",
  "mismo",
  "cada",
  "más",
  "muy",
  "ya",
]);

const ENTITY_NOISE = new Set([
  "cómo",
  "qué",
  "cuál",
  "quién",
  "no",
  "sí",
  "cia",
  "etc",
  "p.e",
  "p.e.",
]);

function formatNumber(value?: number | null) {
  return typeof value === "number" ? value.toLocaleString() : "—";
}

function truncate(text: string, max = 34) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function normalizeEntity(text: string) {
  return text
    .replace(/^[\s¿¡“”"'«»()[\]{}.,;:!?-]+/, "")
    .replace(/[\s¿¡“”"'«»()[\]{}.,;:!?-]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function countItems(items: string[], limit?: number): CountRow[] {
  const counts = new Map<string, number>();

  for (const raw of items) {
    const value = raw?.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const rows = [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  return typeof limit === "number" ? rows.slice(0, limit) : rows;
}

function VisualizationCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
        <span>{label}</span>
        <span className="text-gray-400">{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function HorizontalBarVisualization({
  data,
  dataKey,
  categoryKey,
  valueLabel,
  color = "#2563eb",
  height,
  categoryWidth = 260,
}: {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  categoryKey: string;
  valueLabel: string;
  color?: string;
  height: number;
  categoryWidth?: number;
}) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        No data available.
      </p>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 70, bottom: 22, left: 12 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            label={{ value: valueLabel, position: "insideBottom", offset: -12 }}
          />
          <YAxis
            type="category"
            dataKey={categoryKey}
            width={categoryWidth}
            tick={{ fontSize: 12 }}
            tickFormatter={(value: string | number) =>
              truncate(String(value), 42)
            }
          />
          <Tooltip formatter={(value) => Number(value).toLocaleString()} />
          <Bar dataKey={dataKey} fill={color} radius={[0, 6, 6, 0]}>
            <LabelList
              dataKey={dataKey}
              position="right"
              formatter={(value: string | number) =>
                Number(value).toLocaleString()
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Level0Visualization({ data, loading, error }: Props) {
  const sentences = useMemo(() => data?.sentences ?? [], [data?.sentences]);

  const sentenceLengths = useMemo(
    () =>
      sentences
        .map(
          (sentence) =>
            sentence.n_words ??
            sentence.text.trim().split(/\s+/).filter(Boolean).length,
        )
        .filter((value) => Number.isFinite(value) && value > 0),
    [sentences],
  );

  const chapterData = useMemo(() => {
    const chapterOrder = new Map<string, number>();

    (data?.chapter_detection?.chapters ?? []).forEach((chapter, index) => {
      chapterOrder.set(chapter.title, index);
    });
    (data?.chapters ?? []).forEach((chapter, index) => {
      if (!chapterOrder.has(chapter.name))
        chapterOrder.set(chapter.name, index);
    });

    const grouped = new Map<
      string,
      { chapter: string; sentences: number; words: number }
    >();

    for (const sentence of sentences) {
      const chapter = sentence.chapter?.trim() || "Unassigned";
      const current = grouped.get(chapter) ?? {
        chapter,
        sentences: 0,
        words: 0,
      };
      current.sentences += 1;
      current.words +=
        sentence.n_words ??
        sentence.text.trim().split(/\s+/).filter(Boolean).length;
      grouped.set(chapter, current);
    }

    return [...grouped.values()].sort((a, b) => {
      const aOrder = chapterOrder.get(a.chapter) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = chapterOrder.get(b.chapter) ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder || a.chapter.localeCompare(b.chapter);
    });
  }, [data?.chapter_detection?.chapters, data?.chapters, sentences]);

  const volumeData = useMemo(
    () => [
      {
        volume: data?.title?.trim() || "Processed document",
        sentences: data?.sentence_count ?? sentences.length,
        words:
          data?.word_count ??
          sentences.reduce(
            (sum, sentence) =>
              sum +
              (sentence.n_words ??
                sentence.text.trim().split(/\s+/).filter(Boolean).length),
            0,
          ),
      },
    ],
    [data?.sentence_count, data?.title, data?.word_count, sentences],
  );

  const rankedChapterSentences = useMemo(
    () =>
      [...chapterData]
        .sort(
          (a, b) =>
            b.sentences - a.sentences || a.chapter.localeCompare(b.chapter),
        )
        .slice(0, 30),
    [chapterData],
  );

  const rankedChapterWords = useMemo(
    () =>
      [...chapterData]
        .sort((a, b) => b.words - a.words || a.chapter.localeCompare(b.chapter))
        .slice(0, 30),
    [chapterData],
  );

  const histogramData = useMemo(() => {
    if (sentenceLengths.length === 0) return [];

    const maxLength = Math.max(...sentenceLengths);
    const desiredBins = 18;
    const rawStep = Math.max(5, Math.ceil(maxLength / desiredBins));
    const step = Math.ceil(rawStep / 5) * 5;
    const binCount = Math.ceil(maxLength / step);
    const bins = Array.from({ length: binCount }, (_, index) => ({
      label: `${index * step + 1}–${(index + 1) * step}`,
      value: 0,
    }));

    for (const length of sentenceLengths) {
      const index = Math.min(Math.floor((length - 1) / step), bins.length - 1);
      bins[index].value += 1;
    }

    return bins;
  }, [sentenceLengths]);

  const topEntities = useMemo(() => {
    const entities: string[] = [];

    for (const sentence of sentences) {
      for (const entity of sentence.entities ?? []) {
        const clean = normalizeEntity(entity.text);
        const normalized = clean.toLocaleLowerCase("es");

        if (clean.length < 3) continue;
        if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(clean)) continue;
        if (ENTITY_NOISE.has(normalized)) continue;

        entities.push(clean);
      }
    }

    return countItems(entities, 20);
  }, [sentences]);

  const nerDistribution = useMemo(() => {
    const labels: string[] = [];

    for (const sentence of sentences) {
      for (const entity of sentence.entities ?? []) {
        if (entity.label?.trim()) labels.push(entity.label.trim());
      }
    }

    if (labels.length > 0) return countItems(labels);

    return (data?.nlp_summary?.top_entity_labels ?? []).map((item) => ({
      label: item.label,
      value: item.count,
    }));
  }, [data?.nlp_summary?.top_entity_labels, sentences]);

  const posDistribution = useMemo(() => {
    const tags = sentences.flatMap((sentence) => sentence.pos_tags ?? []);

    if (tags.length > 0) return countItems(tags, 12);

    return (data?.nlp_summary?.top_pos_tags ?? []).map((item) => ({
      label: item.label,
      value: item.count,
    }));
  }, [data?.nlp_summary?.top_pos_tags, sentences]);

  const wordCloud = useMemo(() => {
    const lemmas: string[] = [];

    for (const sentence of sentences) {
      const sentenceLemmas = sentence.lemmas ?? [];
      const sentencePos = sentence.pos_tags ?? [];
      const size = Math.min(sentenceLemmas.length, sentencePos.length);

      for (let index = 0; index < size; index += 1) {
        if (!CONTENT_POS.has(sentencePos[index])) continue;

        const lemma = sentenceLemmas[index]
          ?.toLocaleLowerCase("es")
          .replace(/[^a-záéíóúüñ-]/gi, "")
          .trim();

        if (!lemma || lemma.length < 3) continue;
        if (CONTENT_STOPWORDS.has(lemma)) continue;

        lemmas.push(lemma);
      }
    }

    return countItems(lemmas, 80);
  }, [sentences]);

  const totalEntities = nerDistribution.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const averageSentenceLength = sentenceLengths.length
    ? sentenceLengths.reduce((sum, value) => sum + value, 0) /
      sentenceLengths.length
    : 0;
  const medianSentenceLength = median(sentenceLengths);
  const maxCloudCount = wordCloud[0]?.value ?? 1;
  const minCloudCount = wordCloud[wordCloud.length - 1]?.value ?? 1;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No Level 0 visualization data is available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <h2 className="font-semibold text-blue-900">Level 0 visualization</h2>
        <p className="mt-1 text-sm text-blue-900/80">
          Explore the structure and linguistic profile of the processed
          document.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Chapters"
          value={formatNumber(
            data.chapter_detection?.total_chapters ??
              data.chapters?.length ??
              0,
          )}
          icon={<BookOpen size={16} />}
        />
        <MetricCard
          label="Sentences"
          value={formatNumber(data.sentence_count ?? sentences.length)}
          icon={<MessageSquareText size={16} />}
        />
        <MetricCard
          label="Average words"
          value={averageSentenceLength ? averageSentenceLength.toFixed(1) : "—"}
          icon={<BarChart3 size={16} />}
        />
        <MetricCard
          label="Named entities"
          value={formatNumber(
            totalEntities || data.nlp_summary?.total_entities,
          )}
          icon={<Network size={16} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <VisualizationCard
          title="Sentences by volume"
          description="Total number of segmented sentences in the current document or volume."
        >
          <HorizontalBarVisualization
            data={volumeData}
            dataKey="sentences"
            categoryKey="volume"
            valueLabel="Sentences"
            color="#2563eb"
            height={300}
            categoryWidth={190}
          />
        </VisualizationCard>

        <VisualizationCard
          title="Words by volume"
          description="Total number of processed words in the current document or volume."
        >
          <HorizontalBarVisualization
            data={volumeData}
            dataKey="words"
            categoryKey="volume"
            valueLabel="Words"
            color="#0f766e"
            height={300}
            categoryWidth={190}
          />
        </VisualizationCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <VisualizationCard
          title={`Sentences by chapter — top ${rankedChapterSentences.length}`}
          description="Detected chapters ranked from the highest to the lowest number of sentences."
        >
          <HorizontalBarVisualization
            data={rankedChapterSentences}
            dataKey="sentences"
            categoryKey="chapter"
            valueLabel="Sentences"
            color="#db2777"
            height={Math.max(420, rankedChapterSentences.length * 45)}
          />
        </VisualizationCard>

        <VisualizationCard
          title={`Words by chapter — top ${rankedChapterWords.length}`}
          description="Detected chapters ranked from the highest to the lowest number of words."
        >
          <HorizontalBarVisualization
            data={rankedChapterWords}
            dataKey="words"
            categoryKey="chapter"
            valueLabel="Words"
            color="#ea580c"
            height={Math.max(420, rankedChapterWords.length * 45)}
          />
        </VisualizationCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <VisualizationCard
          title="Sentences by chapter — document order"
          description="Sentence totals following the order in which chapters appear in the document."
        >
          <HorizontalBarVisualization
            data={chapterData}
            dataKey="sentences"
            categoryKey="chapter"
            valueLabel="Sentences"
            color="#7c3aed"
            height={Math.max(420, chapterData.length * 45)}
          />
        </VisualizationCard>

        <VisualizationCard
          title="Words by chapter — document order"
          description="Word totals following the order in which chapters appear in the document."
        >
          <HorizontalBarVisualization
            data={chapterData}
            dataKey="words"
            categoryKey="chapter"
            valueLabel="Words"
            color="#4d7c0f"
            height={Math.max(420, chapterData.length * 45)}
          />
        </VisualizationCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <VisualizationCard
          title="Sentence length distribution"
          description={`Median: ${medianSentenceLength.toFixed(1)} words · Average: ${averageSentenceLength.toFixed(1)} words.`}
        >
          {histogramData.length > 0 ? (
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={histogramData}
                  margin={{ top: 10, right: 10, bottom: 45, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    name="Sentences"
                    fill="#0f766e"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-gray-500">
              No sentence data available.
            </p>
          )}
        </VisualizationCard>

        <VisualizationCard
          title="Named entity distribution"
          description="Distribution of the entity labels detected by spaCy."
        >
          {nerDistribution.length > 0 ? (
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nerDistribution}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={72}
                    outerRadius={120}
                    paddingAngle={2}
                  >
                    {nerDistribution.map((item, index) => (
                      <Cell
                        key={item.label}
                        fill={NER_COLORS[index % NER_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-gray-500">
              No entity data available.
            </p>
          )}
        </VisualizationCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <VisualizationCard
          title="Top named entities"
          description="Most frequent entity texts after removing common extraction noise."
        >
          {topEntities.length > 0 ? (
            <div style={{ height: Math.max(420, topEntities.length * 32) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topEntities}
                  layout="vertical"
                  margin={{ top: 5, right: 45, bottom: 15, left: 12 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={135}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: string | number) =>
                      truncate(String(value), 20)
                    }
                  />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    name="Frequency"
                    fill="#db2777"
                    radius={[0, 5, 5, 0]}
                  >
                    <LabelList dataKey="value" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-gray-500">
              No named entities available.
            </p>
          )}
        </VisualizationCard>

        <VisualizationCard
          title="POS distribution"
          description="Most frequent grammatical categories in the processed document."
        >
          {posDistribution.length > 0 ? (
            <div className="h-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={posDistribution}
                  margin={{ top: 10, right: 10, bottom: 35, left: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    angle={-35}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    name="Frequency"
                    fill="#7c3aed"
                    radius={[5, 5, 0, 0]}
                  >
                    <LabelList dataKey="value" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-gray-500">
              No POS data available.
            </p>
          )}
        </VisualizationCard>
      </div>

      <VisualizationCard
        title="Content lemma word cloud"
        description="Frequent nouns, verbs, and adjectives. Functional words are excluded."
      >
        {wordCloud.length > 0 ? (
          <div className="flex min-h-[360px] flex-wrap content-center items-center justify-center gap-x-5 gap-y-3 rounded-xl bg-gray-50 p-8 text-center">
            {wordCloud.map((item, index) => {
              const denominator = Math.max(
                1,
                Math.log(maxCloudCount) - Math.log(minCloudCount),
              );
              const ratio =
                (Math.log(item.value) - Math.log(minCloudCount)) / denominator;
              const fontSize = 14 + ratio * 42;

              return (
                <span
                  key={item.label}
                  title={`${item.label}: ${item.value.toLocaleString()}`}
                  className="cursor-default font-semibold leading-none transition-transform hover:scale-110"
                  style={{
                    color: CLOUD_COLORS[index % CLOUD_COLORS.length],
                    fontSize: `${fontSize}px`,
                  }}
                >
                  {item.label}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-gray-500">
            <Tags className="mx-auto mb-2" size={22} />
            No content lemmas are available.
          </div>
        )}
      </VisualizationCard>
    </div>
  );
}
