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

export const isRetryableError = (error) => {
	const retryableErrors = [
		'NetworkError',
		'Request timeout',
		'Failed to fetch',
		'ERR_NETWORK',
		'ERR_INTERNET_DISCONNECTED'
	]

	return retryableErrors.some(retryableError =>
		error.message?.includes(retryableError) || error.name === retryableError
	)
}

export const validateSettingsResponse = (settings: WorkstatSettings) => {
	if (!settings) return false

	const requiredFields = ['uuid', 'clientUuid', 'isActive']

	if (typeof settings === 'object' && !Array.isArray(settings)) {
		sessionStorage.setItem('clientUuid', settings.clientUuid)
		return requiredFields.every(field => settings.hasOwnProperty(field))
	}

	return false
}