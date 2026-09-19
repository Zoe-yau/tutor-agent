export interface Limiter {
	check(key: string): { ok: true } | { ok: false; retryAfterMs: number };
}

/**
 * Sliding-window limiter. State is in memory per Worker isolate, so it is
 * best-effort on Cloudflare (isolates can be recycled or duplicated).
 */
export function createLimiter(limit: number, windowMs: number, now: () => number = Date.now): Limiter {
	const hits = new Map<string, number[]>();
	return {
		check(key) {
			const t = now();
			const recent = (hits.get(key) ?? []).filter((h) => t - h < windowMs);
			if (recent.length >= limit) {
				hits.set(key, recent);
				return { ok: false, retryAfterMs: windowMs - (t - recent[0]) };
			}
			recent.push(t);
			hits.set(key, recent);
			if (hits.size > 5_000) {
				for (const [k, v] of hits) if (v.every((h) => t - h >= windowMs)) hits.delete(k);
			}
			return { ok: true };
		}
	};
}
