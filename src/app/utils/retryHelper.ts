export async function withRetry<T>(
	fn: () => Promise<T>,
	maxRetries = 3,
	delay = 1000
): Promise<T> {
	let lastError: Error;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			if (attempt === maxRetries) {
				throw lastError;
			}

			const waitTime = delay * Math.pow(2, attempt - 1);
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}
	}

	throw lastError!;
}
