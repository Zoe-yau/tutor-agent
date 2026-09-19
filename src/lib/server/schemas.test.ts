import { describe, expect, it } from 'vitest';
import { parseAnalysis } from './schemas';

const valid = { concepts: ['fractions'], confidence: 0.7, misconception: null };

describe('parseAnalysis', () => {
	it('accepts a valid object and a JSON string', () => {
		expect(parseAnalysis(valid)).toEqual(valid);
		expect(parseAnalysis(JSON.stringify(valid))).toEqual(valid);
	});

	it('strips markdown code fences', () => {
		expect(parseAnalysis('```json\n' + JSON.stringify(valid) + '\n```')).toEqual(valid);
	});

	it('accepts a misconception and trims strings', () => {
		const a = parseAnalysis({ ...valid, misconception: { label: ' Adds denominators ', explanation: 'They add both parts.' } });
		expect(a?.misconception).toEqual({ label: 'Adds denominators', explanation: 'They add both parts.' });
	});

	it('treats a missing misconception as null', () => {
		expect(parseAnalysis({ concepts: ['a'], confidence: 0.5 })?.misconception).toBeNull();
	});

	it('dedupes and caps concepts', () => {
		const a = parseAnalysis({ ...valid, concepts: ['a', 'a', 'b', 'c', 'd', 'e', 'f'] });
		expect(a?.concepts).toEqual(['a', 'b', 'c', 'd', 'e']);
	});

	it.each([
		['invalid JSON', '{nope'],
		['non-object', '42'],
		['array', '[]'],
		['null', null],
		['missing concepts', { confidence: 0.5, misconception: null }],
		['empty concepts', { ...valid, concepts: [] }],
		['blank concept', { ...valid, concepts: [' '] }],
		['non-string concept', { ...valid, concepts: [1] }],
		['string confidence', { ...valid, confidence: '0.5' }],
		['confidence above 1', { ...valid, confidence: 1.2 }],
		['negative confidence', { ...valid, confidence: -0.1 }],
		['NaN confidence', { ...valid, confidence: NaN }],
		['misconception missing explanation', { ...valid, misconception: { label: 'x' } }],
		['misconception not an object', { ...valid, misconception: 'oops' }]
	])('rejects %s', (_name, input) => {
		expect(parseAnalysis(input)).toBeNull();
	});
});
