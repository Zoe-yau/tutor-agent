export const MAX_HINT_LEVEL = 4;
export type HintLevel = 1 | 2 | 3 | 4;

export interface HintState {
	level: HintLevel;
	concept: string | null;
}

export type HintEvent =
	| { type: 'stuck' }
	| { type: 'request_hint' }
	| { type: 'concept_changed'; concept: string };

export const initialHintState = (): HintState => ({ level: 1, concept: null });

/**
 * Hint-level state machine. The level rises one step only when the student is
 * stuck or asks for a hint (capped at 4), and resets to 1 when the concept changes.
 */
export function reduceHint(state: HintState, event: HintEvent): HintState {
	switch (event.type) {
		case 'stuck':
		case 'request_hint':
			return { ...state, level: Math.min(MAX_HINT_LEVEL, state.level + 1) as HintLevel };
		case 'concept_changed':
			if (event.concept === state.concept) return state;
			return { level: 1, concept: event.concept };
	}
}

const STUCK_PATTERNS = [
	/\bi\s*(do not|don'?t)\s*know\b/,
	/\bidk\b/,
	/\bno idea\b/,
	/\b(i'?m|i am|im)\s+(stuck|lost|confused)\b/,
	/\bstuck\b/,
	/\bgive up\b/,
	/\b(just )?tell me\b/,
	/\bi (do not|don'?t) (get|understand)\b/
];

/** Cheap heuristic for "the student is stuck" from their message text. */
export function detectStuck(text: string): boolean {
	const t = text.toLowerCase();
	return STUCK_PATTERNS.some((p) => p.test(t));
}

export const HINT_LEVEL_LABELS: Record<HintLevel, string> = {
	1: 'Probing question',
	2: 'Conceptual nudge',
	3: 'Worked partial step',
	4: 'Full explanation'
};
