import { describe, expect, it, vi } from 'vitest';
import { RateLimitedError, isRetryable, withRetry } from './gemini';

const err429 = () => Object.assign(new Error('quota'), { status: 429 });
const opts = () => ({ sleep: vi.fn(async (_ms: number) => {}), random: () => 1 });

describe('isRetryable', () => {
	it('accepts 429 and 503, rejects others', () => {
		expect(isRetryable(err429())).toBe(true);
		expect(isRetryable({ status: 503 })).toBe(true);
		expect(isRetryable(new Error('RESOURCE_EXHAUSTED'))).toBe(true);
		expect(isRetryable({ status: 400 })).toBe(false);
		expect(isRetryable(null)).toBe(false);
	});
});

describe('withRetry', () => {
	it('returns immediately on success', async () => {
		const o = opts();
		expect(await withRetry(async () => 'ok', o)).toBe('ok');
		expect(o.sleep).not.toHaveBeenCalled();
	});

	it('retries with exponentially growing delays, then succeeds', async () => {
		const o = opts();
		const fn = vi.fn().mockRejectedValueOnce(err429()).mockRejectedValueOnce(err429()).mockResolvedValue('ok');
		expect(await withRetry(fn, { ...o, baseMs: 100 })).toBe('ok');
		expect(o.sleep.mock.calls.map((c) => c[0])).toEqual([100, 200]);
	});

	it('caps delay at maxMs', async () => {
		const o = opts();
		const fn = vi.fn().mockRejectedValue(err429());
		await expect(withRetry(fn, { ...o, retries: 4, baseMs: 100, maxMs: 250 })).rejects.toBeInstanceOf(RateLimitedError);
		expect(Math.max(...o.sleep.mock.calls.map((c) => c[0]))).toBeLessThanOrEqual(250);
	});

	it('throws RateLimitedError after exhausting retries', async () => {
		const o = opts();
		const fn = vi.fn().mockRejectedValue(err429());
		await expect(withRetry(fn, { ...o, retries: 2 })).rejects.toBeInstanceOf(RateLimitedError);
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('does not retry non-retryable errors', async () => {
		const o = opts();
		const fn = vi.fn().mockRejectedValue(new Error('bad'));
		await expect(withRetry(fn, o)).rejects.toThrow('bad');
		expect(fn).toHaveBeenCalledTimes(1);
	});
});
