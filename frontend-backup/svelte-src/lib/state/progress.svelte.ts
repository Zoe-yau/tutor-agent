import { updateMastery, type ConceptMastery, type MisconceptionRecord } from '$lib/mastery';
import { storage } from '$lib/storage';
import type { Analysis } from '$lib/types';

export class Progress {
	mastery = $state<Record<string, ConceptMastery>>({});
	misconceptions = $state<MisconceptionRecord[]>([]);
	private loaded = false;

	/** Loads persisted progress once; call from client code (onMount). */
	async init(): Promise<void> {
		if (this.loaded) return;
		const saved = await storage.getProgress();
		this.mastery = saved.mastery;
		this.misconceptions = saved.misconceptions;
		this.loaded = true;
	}

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
		void this.save();
	}

	reset(): void {
		this.mastery = {};
		this.misconceptions = [];
		void this.save();
	}

	private save(): Promise<void> {
		return storage.saveProgress({
			mastery: $state.snapshot(this.mastery),
			misconceptions: $state.snapshot(this.misconceptions)
		});
	}
}

export const progress = new Progress();
