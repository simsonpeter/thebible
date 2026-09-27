import { BIBLE_TOPICS, type BibleTopic, type TopicVerse } from "@/data/topics";
import { getVerse } from "@/services/bibleService";
import { searchBible, type SearchHit } from "@/services/searchService";
import { normalizeForSearch } from "@/utils/text";
import type { VerseRecord } from "@/types/bible";

export interface TopicVerseContent {
  ref: TopicVerse;
  tamil?: VerseRecord;
  english?: VerseRecord;
}

export interface TopicStudyResult {
  topic?: BibleTopic;
  query: string;
  curated: TopicVerseContent[];
  related: SearchHit[];
  matchedTopics: BibleTopic[];
}

export function listTopics(): BibleTopic[] {
  return BIBLE_TOPICS;
}

export function getTopic(id: string): BibleTopic | undefined {
  return BIBLE_TOPICS.find((topic) => topic.id === id);
}

function topicHaystack(topic: BibleTopic): string {
  return normalizeForSearch(
    [topic.id, topic.title, topic.titleTamil, topic.summary, topic.summaryTamil, ...topic.keywords].join(" "),
  );
}

/** Ranked topic matches for a typed query (English or Tamil). */
export function findTopics(query: string): BibleTopic[] {
  const needle = normalizeForSearch(query);
  if (!needle) return BIBLE_TOPICS;

  const scored = BIBLE_TOPICS.map((topic) => {
    const hay = topicHaystack(topic);
    let score = 0;
    if (normalizeForSearch(topic.id) === needle || normalizeForSearch(topic.title) === needle) score += 100;
    if (normalizeForSearch(topic.titleTamil) === needle) score += 100;
    if (hay.includes(needle)) score += 40;
    for (const word of needle.split(/\s+/).filter(Boolean)) {
      if (hay.includes(word)) score += 12;
      if (topic.keywords.some((kw) => normalizeForSearch(kw).includes(word))) score += 20;
    }
    return { topic, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((row) => row.topic);
}

export async function loadTopicVerses(verses: TopicVerse[]): Promise<TopicVerseContent[]> {
  const rows: TopicVerseContent[] = [];
  for (const ref of verses) {
    const [tamil, english] = await Promise.all([
      getVerse("bsi-ov", ref.bookId, ref.chapter, ref.verse),
      getVerse("kjv", ref.bookId, ref.chapter, ref.verse),
    ]);
    rows.push({
      ref,
      tamil: tamil && !tamil.isPlaceholder ? tamil : undefined,
      english: english && !english.isPlaceholder ? english : undefined,
    });
  }
  return rows;
}

function verseKey(bookId: string, chapter: number, verse: number): string {
  return `${bookId}:${chapter}:${verse}`;
}

/**
 * Resolve a topic id or free-text topic into curated verses (with text)
 * plus related Bible search hits for more content.
 */
export async function resolveTopicStudy(input: {
  topicId?: string;
  query?: string;
  translationId?: string;
}): Promise<TopicStudyResult> {
  const query = (input.query ?? "").trim();
  const topic = input.topicId ? getTopic(input.topicId) : findTopics(query)[0];
  const matchedTopics = query ? findTopics(query) : topic ? [topic] : [];

  const curatedRefs = topic?.verses ?? [];
  const curated = curatedRefs.length ? await loadTopicVerses(curatedRefs) : [];

  const searchTerms = topic
    ? [topic.title, ...(topic.keywords.filter((kw) => /^[\x00-\x7F]+$/.test(kw)).slice(0, 2))]
    : query
      ? [query]
      : [];

  const known = new Set(curatedRefs.map((ref) => verseKey(ref.bookId, ref.chapter, ref.verse)));
  const related: SearchHit[] = [];
  const seenHit = new Set<string>();

  for (const term of searchTerms) {
    if (term.trim().length < 2) continue;
    const hits = await searchBible({
      text: term,
      translationId: input.translationId ?? "kjv",
      scope: "both",
      language: "both",
    });
    for (const hit of hits) {
      const key = verseKey(hit.verse.bookId, hit.verse.chapter, hit.verse.number);
      if (known.has(key) || seenHit.has(`${hit.verse.translationId}:${key}`)) continue;
      seenHit.add(`${hit.verse.translationId}:${key}`);
      related.push(hit);
      if (related.length >= 24) break;
    }
    if (related.length >= 24) break;
  }

  return {
    topic,
    query: query || topic?.title || "",
    curated,
    related,
    matchedTopics,
  };
}
