import { describe, expect, it } from 'vitest';
import { masteryLabel, updateMastery } from './mastery';

describe('updateMastery', () => {
	it('seeds from the first observation', () => {
		expect(updateMastery(undefined, 0.8, 1)).toEqual({ score: 0.8, attempts: 1, lastSeen: 1 });
	});

	it('moves toward new confidence without jumping to it', () => {
		const next = updateMastery({ score: 0.2, attempts: 1, lastSeen: 0 }, 1, 5);
		expect(next.score).toBeCloseTo(0.52);
		expect(next.attempts).toBe(2);
	});
});

describe('masteryLabel', () => {
	it('buckets scores', () => {
		expect(masteryLabel(0.1)).toBe('Weak');
		expect(masteryLabel(0.5)).toBe('Developing');
		expect(masteryLabel(0.9)).toBe('Strong');
	});
});
