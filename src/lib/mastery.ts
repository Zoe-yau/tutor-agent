export interface ConceptMastery {
	/** 0-1 running estimate. */
	score: number;
	attempts: number;
	lastSeen: number;
}

export interface MisconceptionRecord {
	concept: string;
	label: string;
	explanation: string;
	at: number;
}

const ALPHA = 0.4;

/** Exponential moving average; the first observation seeds the score. */
export function updateMastery(prev: ConceptMastery | undefined, confidence: number, now = Date.now()): ConceptMastery {
	if (!prev) return { score: confidence, attempts: 1, lastSeen: now };
	return { score: prev.score + ALPHA * (confidence - prev.score), attempts: prev.attempts + 1, lastSeen: now };
}

export const masteryLabel = (score: number): 'Weak' | 'Developing' | 'Strong' =>
	score < 0.4 ? 'Weak' : score < 0.75 ? 'Developing' : 'Strong';
