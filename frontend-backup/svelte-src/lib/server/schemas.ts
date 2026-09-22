import { Type, type Schema } from '@google/genai';
import type { Analysis, Misconception } from '$lib/types';

export const MAX_CONCEPTS = 5;

/** Gemini structured-output schema; mirrors `Analysis`. */
export const analysisResponseSchema: Schema = {
	type: Type.OBJECT,
	properties: {
		concepts: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Short names of concepts the student touched' },
		confidence: { type: Type.NUMBER, description: 'Understanding of those concepts, 0 to 1' },
		misconception: {
			type: Type.OBJECT,
			nullable: true,
			properties: {
				label: { type: Type.STRING, description: 'Short label, a few words' },
				explanation: { type: Type.STRING, description: 'One or two sentences on what is wrong' }
			},
			required: ['label', 'explanation']
		}
	},
	required: ['concepts', 'confidence', 'misconception']
};

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

/**
 * Validates model output. Accepts a JSON string (optionally fenced) or a parsed value.
 * Returns null when the shape is wrong so callers can fail gracefully.
 */
export function parseAnalysis(raw: unknown): Analysis | null {
	let value: unknown = raw;
	if (typeof raw === 'string') {
		const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
		try {
			value = JSON.parse(text);
		} catch {
			return null;
		}
	}
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
	const v = value as Record<string, unknown>;

	if (!Array.isArray(v.concepts) || !v.concepts.every(isNonEmptyString)) return null;
	const concepts = [...new Set((v.concepts as string[]).map((c) => c.trim()))].slice(0, MAX_CONCEPTS);
	if (concepts.length === 0) return null;

	if (typeof v.confidence !== 'number' || !Number.isFinite(v.confidence)) return null;
	if (v.confidence < 0 || v.confidence > 1) return null;

	let misconception: Misconception | null = null;
	if (v.misconception !== null && v.misconception !== undefined) {
		const m = v.misconception as Record<string, unknown>;
		if (typeof m !== 'object' || !isNonEmptyString(m.label) || !isNonEmptyString(m.explanation)) return null;
		misconception = { label: m.label.trim(), explanation: m.explanation.trim() };
	}

	return { concepts, confidence: v.confidence, misconception };
}
