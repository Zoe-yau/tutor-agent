// Single place for model IDs and limits. Verify against
// https://ai.google.dev/gemini-api/docs/models and /pricing before changing.
// Flash-Lite models are paid-tier only, so analysis also uses a free Flash model.
export const MODELS = {
	tutor: 'gemini-3.8-flash',
	analysis: 'gemini-3.5-flash'
} as const;

export const LIMITS = {
	/** Per-client requests per window (free tier is roughly 10-15 RPM overall). */
	requestsPerWindow: 10,
	windowMs: 60_000,
	maxMessages: 40,
	maxMessageChars: 4_000
} as const;
