import axios, { AxiosError } from 'axios';
import NProgress from 'nprogress';
import type {
	AxiosInstance,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

NProgress.configure({
	showSpinner: false,
	speed: 300,
	minimum: 0.1,
	trickleSpeed: 200,
});

let activeRequests = 0;
const startProgress = (): void => {
	if (activeRequests === 0) {
		NProgress.start();
	}
	activeRequests++;
};

const stopProgress = (): void => {
	activeRequests--;
	if (activeRequests <= 0) {
		activeRequests = 0;
		NProgress.done();
	}
};

const instance: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 50000,
});

enum HttpRequestResponseMessages {
	ECONNABORTED = 'Request timed out. Please try again.',
	ERR_NETWORK = 'Network error. Please check your connection.',
	ERR_BAD_REQUEST = 'Unauthorised user.',
	ERR_INVALID_URL = 'The API configurations are not valid. Please double check.',
}

instance.interceptors.request.use(
	async (config: InternalAxiosRequestConfig<any>) => {
		try {
			startProgress();

			const getFromStorage = (key: string): string | undefined => {
				try {
					const value = sessionStorage?.getItem(key);
					if (!value) return undefined;

					try {
						return JSON.parse(value);
					} catch {
						return value;
					}
				} catch (error) {
					console.warn(`Error getting ${key} from sessionStorage:`, error);
					return undefined;
				}
			};

			const token = getFromStorage('token');
			const clientUuid = getFromStorage('clientUuid');

			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}

			if (clientUuid) {
				config.headers['X-Client-Uuid'] = clientUuid;
			}

			return config;
		} catch (error) {
			console.error('Error in request interceptor:', error);
			stopProgress();
			return config;
		}
	},
	(error) => {
		stopProgress();
		return Promise.reject(error);
	}
);

instance.interceptors.response.use(
	(res: AxiosResponse<any, any>) => {
		stopProgress();
		return res;
	},
	(error: AxiosError) => {
		stopProgress();

		const { message, code, response } = error;
		const status = response?.status;

		switch (status) {
			case 400:
				console.error(message);
				break;

			case 401:
				break;

			case 403:
				sessionStorage.clear();
				break;

			case 404:
				error.message = (response?.data as any)?.message || message || '';
				break;

			case 422:
				error.message = (response?.data as any)?.message || message || '';
				break;

			case 500:
				error.message = `Internal Server Error - ${message}`;
				break;

			default:
				if (code === AxiosError.ECONNABORTED) {
					error.message = HttpRequestResponseMessages.ECONNABORTED;
				}

				if (code === AxiosError.ERR_NETWORK) {
					error.message = HttpRequestResponseMessages.ERR_NETWORK;
				}

				if (code === AxiosError.ERR_BAD_REQUEST) {
					error.message = HttpRequestResponseMessages.ERR_BAD_REQUEST;
				}

				if (code === AxiosError.ERR_INVALID_URL) {
					error.message = HttpRequestResponseMessages.ERR_INVALID_URL;
				}

				break;
		}

		return Promise.reject({ error });
	}
);

const responseBody = <T>(response: AxiosResponse<T>) => response;

interface APIMethodOptions {
	showProgress?: boolean;
	progressMessage?: string;
}

const api: APIProps = {
	config: instance,
	get: async <T>(
		url: string,
		params?: Record<string, any>,
		baseURL?: string,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		const shouldShowProgress = options?.showProgress !== false;

		if (!shouldShowProgress) {
			try {
				startProgress();
				const response = await instance.get<T>(url, {
					params,
					baseURL,
				});
				stopProgress();
				return responseBody(response);
			} catch (error) {
				stopProgress();
				throw error;
			}
		}

		const response = await instance.get<T>(url, {
			params,
			baseURL,
		});
		return responseBody(response);
	},
	post: async <T>(
		url: string,
		body: T,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		const response = await instance.post<T>(url, body, headers);
		return responseBody(response);
	},
	put: async <T>(
		url: string,
		body: T,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		const response = await instance.put<T>(url, body, headers);
		return responseBody(response);
	},
	delete: async <T>(
		url: string,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		const response = await instance.delete<T>(url, headers);
		return responseBody(response);
	},
	patch: async <T>(
		url: string,
		body: T,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		const response = await instance.patch<T>(url, body, headers);
		return responseBody(response);
	},
};

export type APIProps = {
	config: AxiosInstance;
	get: <T>(
		url: string,
		params?: Record<string, any>,
		baseURL?: string,
		options?: APIMethodOptions
	) => Promise<AxiosResponse<T, any>>;
	post: <T>(
		url: string,
		body: T,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	) => Promise<AxiosResponse<T, any>>;
	put: <T>(
		url: string,
		body: T,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	) => Promise<AxiosResponse<T, any>>;
	delete: <T>(
		url: string,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	) => Promise<AxiosResponse<T, any>>;
	patch: <T>(
		url: string,
		body: T,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	) => Promise<AxiosResponse<T, any>>;
};

export const apiUtils = {
	startProgress,
	stopProgress,
	forceStopProgress: () => {
		activeRequests = 0;
		NProgress.done();
	},
	getActiveRequestCount: () => activeRequests,
};

export default api;