import axios, { AxiosError } from 'axios';
import NProgress from 'nprogress';
import type {
	AxiosInstance,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from 'axios';
import { Capacitor } from '@capacitor/core';
// import { Zonse247PosMobileApiPlugin } from 'zonse247-pos-mobile-api';

let RoomDb: any = null;
// if (Capacitor.isNativePlatform()) {
// 	import('zonse247-pos-mobile-api').then(module => {
// 		RoomDb = module.Zonse247PosMobileApi;
// 	});
// }

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

const httpInstance: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 50000,
});

enum HttpRequestResponseMessages {
	ECONNABORTED = 'Request timed out. Please try again.',
	ERR_NETWORK = 'Network error. Please check your connection.',
	ERR_BAD_REQUEST = 'Unauthorised user.',
	ERR_INVALID_URL = 'The API configurations are not valid. Please double check.',
}

httpInstance.interceptors.request.use(
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
			const tenantId = getFromStorage('tenantId');

			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}

			if (tenantId) {
				config.headers['X-Tenant-Id'] = tenantId;
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

httpInstance.interceptors.response.use(
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

// class SecureLocalAPI {
// 	static async request(method: string, endpoint: string, params?: Record<string, any>, body?: any): Promise<any> {
// 		if (Capacitor.isNativePlatform() && RoomDb) {
// 			const result = await RoomDb.apiRequest({
// 				method,
// 				endpoint,
// 				params: params || {},
// 				body: body || {}
// 			});

// 			if (!result.success) {
// 				throw new Error(result.error || result.message);
// 			}

// 			return {
// 				data: result.data,
// 				status: result.statusCode,
// 				statusText: 'OK',
// 				headers: {},
// 				config: {} as any,
// 			};
// 		} else {
// 			throw new Error('Local API not supported on this platform');
// 		}
// 	}
// }

const responseBody = <T>(response: AxiosResponse<T> | { data: T; status: number }): AxiosResponse<T> => {
	// if ('config' in response) {
	// 	return response;
	// }

	return {
		data: response.data,
		status: response.status,
		statusText: 'OK',
		headers: {},
		config: {} as any,
	} as AxiosResponse<T>;
};

// const extractParamsFromUrl = (url: string): { cleanUrl: string; pathParams: Record<string, string> } => {
// 	let cleanUrl = url;
// 	const pathParams: Record<string, string> = {};

// 	const idMatch = url.match(/\/(\d+)$/);
// 	if (idMatch) {
// 		pathParams.id = idMatch[1];
// 		cleanUrl = url.replace(/\/\d+$/, '/:id');
// 	}

// 	return { cleanUrl, pathParams };
// };

const api: APIProps = {
	config: httpInstance,

	get: async <T>(
		url: string,
		params?: Record<string, any>,
		baseURL?: string,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		// const shouldUseLocal = Capacitor.isNativePlatform() || options?.useLocal;

		// if (shouldUseLocal) {
		// 	try {
		// 		startProgress();

		// 		const { cleanUrl, pathParams } = extractParamsFromUrl(url);
		// 		const allParams = { ...pathParams, ...(params || {}) };

		// 		const response = await SecureLocalAPI.request('GET', cleanUrl, allParams);
		// 		stopProgress();
		// 		return responseBody({ data: response.data as T, status: response.status });
		// 	} catch (error) {
		// 		stopProgress();
		// 		throw error;
		// 	}
		// }

		// const shouldShowProgress = options?.showProgress !== false;

		// if (!shouldShowProgress) {
		// 	try {
		// 		startProgress();
		// 		const response = await httpInstance.get<T>(url, { params, baseURL });
		// 		stopProgress();
		// 		return responseBody(response);
		// 	} catch (error) {
		// 		stopProgress();
		// 		throw error;
		// 	}
		// }

		const response = await httpInstance.get<T>(url, { params, baseURL });
		return responseBody(response);
	},

	post: async <T>(
		url: string,
		body: T,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		// const shouldUseLocal = Capacitor.isNativePlatform() || options?.useLocal;

		// if (shouldUseLocal) {
		// 	try {
		// 		startProgress();

		// 		const response = await SecureLocalAPI.request('POST', url, {}, body);
		// 		stopProgress();
		// 		return responseBody({ data: response.data as T, status: response.status });
		// 	} catch (error) {
		// 		stopProgress();
		// 		throw error;
		// 	}
		// }

		const response = await httpInstance.post<T>(url, body, headers);
		return responseBody(response);
	},

	put: async <T>(
		url: string,
		body: T,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		// const shouldUseLocal = Capacitor.isNativePlatform() || options?.useLocal;

		// if (shouldUseLocal) {
		// 	try {
		// 		startProgress();

		// 		const { cleanUrl, pathParams } = extractParamsFromUrl(url);
		// 		const response = await SecureLocalAPI.request('PUT', cleanUrl, pathParams, body);
		// 		stopProgress();
		// 		return responseBody({ data: response.data as T, status: response.status });
		// 	} catch (error) {
		// 		stopProgress();
		// 		throw error;
		// 	}
		// }

		const response = await httpInstance.put<T>(url, body, headers);
		return responseBody(response);
	},

	delete: async <T>(
		url: string,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		// const shouldUseLocal = Capacitor.isNativePlatform() || options?.useLocal;

		// if (shouldUseLocal) {
		// 	try {
		// 		startProgress();

		// 		const { cleanUrl, pathParams } = extractParamsFromUrl(url);
		// 		const response = await SecureLocalAPI.request('DELETE', cleanUrl, pathParams);
		// 		stopProgress();
		// 		return responseBody({ data: response.data as T, status: response.status });
		// 	} catch (error) {
		// 		stopProgress();
		// 		throw error;
		// 	}
		// }

		const response = await httpInstance.delete<T>(url, headers);
		return responseBody(response);
	},

	patch: async <T>(
		url: string,
		body: T,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		// const shouldUseLocal = Capacitor.isNativePlatform() || options?.useLocal;

		// if (shouldUseLocal) {
		// 	try {
		// 		startProgress();

		// 		const { cleanUrl, pathParams } = extractParamsFromUrl(url);
		// 		const response = await SecureLocalAPI.request('PATCH', cleanUrl, pathParams, body);
		// 		stopProgress();
		// 		return responseBody({ data: response.data as T, status: response.status });
		// 	} catch (error) {
		// 		stopProgress();
		// 		throw error;
		// 	}
		// }

		const response = await httpInstance.patch<T>(url, body, headers);
		return responseBody(response);
	},
};

export const apiUtils = {
	startProgress,
	stopProgress,
	forceStopProgress: () => {
		activeRequests = 0;
		NProgress.done();
	},
	getActiveRequestCount: () => activeRequests,
	// SecureLocalAPI,
};

export default api;