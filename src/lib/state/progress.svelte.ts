import { updateMastery, type ConceptMastery, type MisconceptionRecord } from '$lib/mastery';
import type { Analysis } from '$lib/types';

export class Progress {
	mastery = $state<Record<string, ConceptMastery>>({});
	misconceptions = $state<MisconceptionRecord[]>([]);

	/** Concepts sorted weakest first. */
	get ranked(): [string, ConceptMastery][] {
		return Object.entries(this.mastery).sort((a, b) => a[1].score - b[1].score);
	}

	apply(analysis: Analysis, now = Date.now()): void {
		for (const concept of analysis.concepts) {
			this.mastery[concept] = updateMastery(this.mastery[concept], analysis.confidence, now);
		}
		const m = analysis.misconception;
		if (m && !this.misconceptions.some((x) => x.label === m.label && x.concept === analysis.concepts[0])) {
			this.misconceptions.push({ concept: analysis.concepts[0], ...m, at: now });
		}
	}

	reset(): void {
		this.mastery = {};
		this.misconceptions = [];
	}
}

export const progress = new Progress();
