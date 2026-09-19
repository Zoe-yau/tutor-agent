import type { ConceptMastery } from '$lib/mastery';
import type { StoredSession } from '$lib/storage';
import type { Topic } from '$lib/topics';

export interface Suggestion {
	topic: Topic;
	reason: string;
}

const STRONG = 0.75;

/** Ranks built-in topics: weak reviewed topics first, then topics not yet started. */
export function suggestTopics(
	topics: Topic[],
	sessions: StoredSession[],
	mastery: Record<string, ConceptMastery>,
	limit = 3
): Suggestion[] {
	const scored: (Suggestion & { priority: number })[] = [];
	for (const topic of topics) {
		const mine = sessions.filter((s) => s.topicId === topic.id);
		if (mine.length === 0) {
			scored.push({ topic, reason: 'Not started yet', priority: 0.5 });
			continue;
		}
		const scores = [...new Set(mine.flatMap((s) => s.concepts))]
			.map((c) => mastery[c]?.score)
			.filter((s): s is number => s !== undefined);
		if (scores.length === 0) continue;
		const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
		if (avg < STRONG) scored.push({ topic, reason: `Worth reviewing: ${Math.round(avg * 100)}% mastery so far`, priority: 1 - avg });
	}
	return scored
		.sort((a, b) => b.priority - a.priority)
		.slice(0, limit)
		.map(({ topic, reason }) => ({ topic, reason }));
}
