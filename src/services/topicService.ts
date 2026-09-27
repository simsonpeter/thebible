import { BIBLE_TOPICS, type BibleTopic } from "@/data/topics";

export function listTopics(): BibleTopic[] {
  return BIBLE_TOPICS;
}

export function getTopic(id: string): BibleTopic | undefined {
  return BIBLE_TOPICS.find((topic) => topic.id === id);
}
