import axios, { AxiosError } from 'axios';
import NProgress from 'nprogress';
import type {
	AxiosInstance,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from 'axios';
import { isElectron } from '../../helpers/index.helper';
import { ROUTES } from '../utils/constants';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const LIVE_API_URL = import.meta.env.VITE_LIVE_API_URL;

// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null): void => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token!);
		}
	});
	failedQueue = [];
};

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

const getToken = async (): Promise<string | undefined> => {
	try {
		const value = sessionStorage?.getItem('token');
		if (!value) return undefined;

		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	} catch (error) {
		console.warn('Error getting token from sessionStorage:', error);
		return undefined;
	}
};

const getTenantId = async (): Promise<string | undefined> => {
	if (isElectron()) {
		try {
			const result = await window.electronAPI.settings.getSetup();

			if (result.success && result.data?.tenantId) {
				return result.data.tenantId;
			}
		} catch (error) {
			console.warn('Error getting tenantId from Electron:', error);
		}
	}

	try {
		const user = sessionStorage?.getItem('user');
		if (user) {
			return user ? JSON.parse(user).tenantId : undefined;
		}
	} catch (error) {
		console.warn('Error getting tenantId from sessionStorage:', error);
	}
};

const getActiveBranchId = async (): Promise<string | undefined> => {
	if (isElectron()) {
		try {
			const userResult = await window.electronAPI.settings.getActiveBranch();
			if (userResult.success && userResult.data) {
				return userResult.data.branchId || undefined;
			}
		} catch (error) {
			console.warn('Error getting branchId from Electron settings:', error);
		}
	}

	try {
		const user = sessionStorage?.getItem('user');
		if (user) {
			const userData = JSON.parse(user);
			return userData?.currentBranchId || userData?.branchId;
		}
	} catch (error) {
		console.warn('Error getting branchId from sessionStorage:', error);
	}
};

httpInstance.interceptors.request.use(
	async (config: InternalAxiosRequestConfig<any>) => {
		try {
			startProgress();

			const token = await getToken();
			const tenantId = await getTenantId();
			const activeBranchId = await getActiveBranchId();
			const clientType = import.meta.env.VITE_APP_CLIENT_TYPE || 'desktop';

			if (token)
				config.headers.Authorization = `Bearer ${token}`;

			if (tenantId) {
				config.headers['X-Tenant-Id'] = tenantId;
			}

			if (activeBranchId) {
				config.headers['X-Branch-Id'] = activeBranchId;
			}

			config.headers['X-Client-Type'] = clientType;

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

const handleAuthError = (): void => {
	sessionStorage.removeItem('user');
	sessionStorage.removeItem('token');
	sessionStorage.removeItem('tenantId');

	if (isElectron() && window.electronAPI?.session?.clear) {
		window.electronAPI.session.clear().catch(console.warn);
	}

	const currentHash = window.location.hash.replace('#', '');
	if (currentHash !== ROUTES.LOGIN) {
		window.location.hash = `#${ROUTES.LOGIN}`;
	}
};

/**
 * Update token in session storage and electron store
 * @param newToken - The new JWT token
 */
const updateToken = async (newToken: string): Promise<void> => {
	sessionStorage.setItem('token', JSON.stringify(newToken));

	if (isElectron() && window.electronAPI?.session?.setToken) {
		try {
			await window.electronAPI.session.setToken(newToken);
		} catch (err) {
			console.warn('Failed to update session token in electron:', err);
		}
	}
};

/**
 * Refresh the JWT token using the live API
 * @param currentToken - The current (possibly expired) token
 * @returns The new token
 */
const refreshToken = async (currentToken: string): Promise<string> => {
	try {
		const tenantId = await getTenantId();

		const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
			`${LIVE_API_URL}/auth/refresh-token`,
			{ token: currentToken },
			{
				headers: {
					'Content-Type': 'application/json',
					...(tenantId && { 'X-Tenant-Id': tenantId })
				},
				timeout: 30000
			}
		);

		const result = response.data;
		if (result?.data?.token) {
			return result.data.token;
		}

		throw new Error(result?.message || 'Token refresh failed');
	} catch (error: any) {
		console.error('[HTTP] Token refresh error:', error?.response?.data || error?.message);
		throw error;
	}
};

httpInstance.interceptors.response.use(
	(res: AxiosResponse<any, any>) => {
		stopProgress();
		return res;
	},
	async (error: AxiosError) => {
		stopProgress();

		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
		const { message, code, response } = error;
		const status = response?.status;

		if (status === 401 && !originalRequest._retry && LIVE_API_URL) {
			const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
				originalRequest.url?.includes('/auth/refresh-token') ||
				originalRequest.url?.includes('/auth/verify-token');

			if (!isAuthEndpoint) {
				originalRequest._retry = true;

				if (isRefreshing) {
					return new Promise((resolve, reject) => {
						failedQueue.push({ resolve, reject });
					}).then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return httpInstance(originalRequest);
					}).catch((err) => {
						return Promise.reject(err);
					});
				}

				isRefreshing = true;

				try {
					const currentToken = await getToken();
					if (!currentToken) {
						throw new Error('No token available for refresh');
					}

					const newToken = await refreshToken(currentToken);
					await updateToken(newToken);

					processQueue(null, newToken);

					originalRequest.headers.Authorization = `Bearer ${newToken}`;
					return httpInstance(originalRequest);
				} catch (refreshError) {
					processQueue(refreshError, null);
					handleAuthError();
					return Promise.reject({ error: refreshError });
				} finally {
					isRefreshing = false;
				}
			}
		}

		switch (status) {
			case 400:
				console.error(message);
				break;
			case 401:
				// Only handle auth error if refresh wasn't attempted or failed
				if (originalRequest._retry) {
					handleAuthError();
				}
				break;
			case 403:
				handleAuthError();
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

const responseBody = <T>(response: AxiosResponse<T>): AxiosResponse<T> => {
	return response;
};

const api: APIProps = {
	config: httpInstance,

	get: async <T>(
		url: string,
		params?: Record<string, any>,
		baseURL?: string,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		const response = await httpInstance.get<T>(url, { params, baseURL });
		return responseBody(response);
	},

	post: async <T>(
		url: string,
		body: T,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		const response = await httpInstance.post<T>(url, body, headers);
		return responseBody(response);
	},

	put: async <T>(
		url: string,
		body: T,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		const response = await httpInstance.put<T>(url, body, headers);
		return responseBody(response);
	},

	delete: async <T>(
		url: string,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
		const response = await httpInstance.delete<T>(url, headers);
		return responseBody(response);
	},

	patch: async <T>(
		url: string,
		body: T,
		headers?: Record<string, any>,
		options?: APIMethodOptions
	): Promise<AxiosResponse<T, any>> => {
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
	updateBaseUrl: (newBaseUrl: string) => {
		// httpInstance.defaults.baseURL = newBaseUrl;
		console.log(`API Base URL updated to: ${newBaseUrl}`);
	},
	getCurrentBaseUrl: () => httpInstance.defaults.baseURL,
};

export default api;