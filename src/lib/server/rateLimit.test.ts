import { describe, expect, it } from 'vitest';
import { createLimiter } from './rateLimit';

describe('createLimiter', () => {
	it('blocks after the limit and recovers after the window', () => {
		let t = 0;
		const l = createLimiter(2, 1000, () => t);
		expect(l.check('a').ok).toBe(true);
		expect(l.check('a').ok).toBe(true);
		const blocked = l.check('a');
		expect(blocked).toEqual({ ok: false, retryAfterMs: 1000 });
		expect(l.check('b').ok).toBe(true);
		t = 1001;
		expect(l.check('a').ok).toBe(true);
	});
});
