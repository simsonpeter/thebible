import { db } from "@/db";
import { searchBible, type SearchHit, type SearchQuery } from "@/services/searchService";
import { nowIso } from "@/utils/misc";

export type { SearchHit, SearchQuery };

export async function indexedSearch(query: SearchQuery): Promise<SearchHit[]> {
  const hits = await searchBible(query);
  if (query.text.trim().length >= 2) {
    await db.recentSearches.add({ query: query.text.trim(), createdAt: nowIso() });
    const extra = await db.recentSearches.orderBy("createdAt").reverse().offset(30).toArray();
    if (extra.length) {
      await db.recentSearches.bulkDelete(
        extra.map((row) => row.id).filter((id): id is number => typeof id === "number"),
      );
    }
  }
  return hits;
}

export async function listRecentSearches(limit = 8): Promise<string[]> {
  const rows = await db.recentSearches.orderBy("createdAt").reverse().limit(limit * 2).toArray();
  return [...new Set(rows.map((row) => row.query))].slice(0, limit);
}
