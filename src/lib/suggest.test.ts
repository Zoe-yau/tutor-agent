import { describe, expect, it } from 'vitest';
import type { StoredSession } from './storage';
import { suggestTopics } from './suggest';
import type { Topic } from './topics';

const topics: Topic[] = ['a', 'b', 'c'].map((id) => ({ id, title: id, description: '' }));
const session = (topicId: string, concepts: string[]): StoredSession => ({
	id: topicId,
	topicId,
	topicTitle: topicId,
	messages: [],
	hint: { level: 1, concept: null },
	concepts,
	startedAt: 0,
	updatedAt: 0
});
const m = (score: number) => ({ score, attempts: 1, lastSeen: 0 });

describe('suggestTopics', () => {
	it('suggests everything when nothing has started', () => {
		expect(suggestTopics(topics, [], {}).map((s) => s.topic.id)).toEqual(['a', 'b', 'c']);
	});

	it('ranks weak started topics above unstarted ones and hides strong ones', () => {
		const out = suggestTopics(topics, [session('a', ['x']), session('b', ['y'])], { x: m(0.2), y: m(0.9) });
		expect(out.map((s) => s.topic.id)).toEqual(['a', 'c']);
		expect(out[0].reason).toContain('20%');
	});

	it('respects the limit', () => {
		expect(suggestTopics(topics, [], {}, 1)).toHaveLength(1);
	});
});
