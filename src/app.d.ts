declare global {
	namespace App {
		interface Platform {
			env: {
				GEMINI_API_KEY: string;
			};
		}
	}
}

export {};
