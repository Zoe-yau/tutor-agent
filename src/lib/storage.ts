import type { HintState } from '$lib/hintLadder';
import type { ConceptMastery, MisconceptionRecord } from '$lib/mastery';
import type { ChatMessage } from '$lib/types';

export interface StoredSession {
	id: string;
	topicId: string;
	topicTitle: string;
	/** Pasted study material for custom topics. */
	material?: string;
	messages: ChatMessage[];
	hint: HintState;
	/** Concept names touched during this session. */
	concepts: string[];
	startedAt: number;
	updatedAt: number;
}

export interface StoredProgress {
	mastery: Record<string, ConceptMastery>;
	misconceptions: MisconceptionRecord[];
}

/** Persistence boundary. Implement this against Cloudflare D1 to replace localStorage. */
export interface TutorStorage {
	listSessions(): Promise<StoredSession[]>;
	getSession(id: string): Promise<StoredSession | null>;
	saveSession(session: StoredSession): Promise<void>;
	deleteSession(id: string): Promise<void>;
	getProgress(): Promise<StoredProgress>;
	saveProgress(progress: StoredProgress): Promise<void>;
}

const SESSIONS_KEY = 'tutor:sessions';
const PROGRESS_KEY = 'tutor:progress';
const MAX_SESSIONS = 50;

function read<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

function write(key: string, value: unknown): void {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		/* storage full or unavailable: persistence is best-effort */
	}
}

export class LocalStorageAdapter implements TutorStorage {
	private sessions(): StoredSession[] {
		const list = read<unknown>(SESSIONS_KEY, []);
		return Array.isArray(list) ? (list as StoredSession[]).filter((s) => s && typeof s.id === 'string' && Array.isArray(s.messages)) : [];
	}

	async listSessions(): Promise<StoredSession[]> {
		return this.sessions().sort((a, b) => b.updatedAt - a.updatedAt);
	}

	async getSession(id: string): Promise<StoredSession | null> {
		return this.sessions().find((s) => s.id === id) ?? null;
	}

	async saveSession(session: StoredSession): Promise<void> {
		const others = this.sessions().filter((s) => s.id !== session.id);
		const next = [session, ...others].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_SESSIONS);
		write(SESSIONS_KEY, next);
	}

	async deleteSession(id: string): Promise<void> {
		write(SESSIONS_KEY, this.sessions().filter((s) => s.id !== id));
	}

	async getProgress(): Promise<StoredProgress> {
		const p = read<Partial<StoredProgress>>(PROGRESS_KEY, {});
		return {
			mastery: p.mastery && typeof p.mastery === 'object' ? p.mastery : {},
			misconceptions: Array.isArray(p.misconceptions) ? p.misconceptions : []
		};
	}

	async saveProgress(progress: StoredProgress): Promise<void> {
		write(PROGRESS_KEY, progress);
	}
}

/** Browser-only singleton; only call its methods from client code (onMount, event handlers). */
export const storage: TutorStorage = new LocalStorageAdapter();
