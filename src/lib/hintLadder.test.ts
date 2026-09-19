import { describe, expect, it } from 'vitest';
import { detectStuck, initialHintState, reduceHint, type HintState } from './hintLadder';

describe('reduceHint', () => {
	it('starts at level 1', () => {
		expect(initialHintState().level).toBe(1);
	});

	it('rises one level on stuck or hint request', () => {
		let s = initialHintState();
		s = reduceHint(s, { type: 'stuck' });
		expect(s.level).toBe(2);
		s = reduceHint(s, { type: 'request_hint' });
		expect(s.level).toBe(3);
	});

	it('caps at level 4', () => {
		let s: HintState = { level: 4, concept: 'x' };
		s = reduceHint(s, { type: 'stuck' });
		expect(s.level).toBe(4);
	});

	it('resets when the concept changes', () => {
		const s = reduceHint({ level: 3, concept: 'fractions' }, { type: 'concept_changed', concept: 'decimals' });
		expect(s).toEqual({ level: 1, concept: 'decimals' });
	});

	it('keeps the level when the concept is unchanged', () => {
		const s: HintState = { level: 3, concept: 'fractions' };
		expect(reduceHint(s, { type: 'concept_changed', concept: 'fractions' })).toBe(s);
	});

	it('does not mutate the input state', () => {
		const s = initialHintState();
		reduceHint(s, { type: 'stuck' });
		expect(s.level).toBe(1);
	});
});

describe('detectStuck', () => {
	it.each(["I don't know", 'idk', "I'm stuck", 'no idea', 'just tell me', 'I give up'])('detects %s', (t) => {
		expect(detectStuck(t)).toBe(true);
	});
	it.each(['I think it is 12', 'Is it because of gravity?', 'Can you check my work?'])('ignores %s', (t) => {
		expect(detectStuck(t)).toBe(false);
	});
});
