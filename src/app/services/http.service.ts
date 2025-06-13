import axios, { AxiosError } from 'axios';
import type {
	AxiosInstance,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from 'axios';

const host = '139.59.103.109';
const port = 2025;

const instance: AxiosInstance = axios.create({
	baseURL: 'http://' + host + ':' + port,
	timeout: 50000,
});

enum HttpRequestResponseMessages {
	ECONNABORTED = 'Request timed out. Please try again.',
	ERR_NETWORK = 'Network error. Please check your connection.',
	ERR_BAD_REQUEST = 'Unauthorised user.',
	ERR_INVALID_URL = 'The API configurations are not valid. Please double check.',
}

const getBaseUrl = () => {
	const api = 'http://' + host + ':' + port + '/api/';

	return api;
};

instance.interceptors.request.use(
	async (config: InternalAxiosRequestConfig<any>) => {
		let token: string | undefined;

		if (sessionStorage.user)
			token = JSON.parse(sessionStorage.user)?.access_token;

		if (token) config.headers.Authorization = `Bearer ${token}`;

		config.baseURL = getBaseUrl();

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

instance.interceptors.response.use(
	(res: AxiosResponse<any, any>) => {
		return res;
	},
	(error: AxiosError) => {
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

const api: APIProps = {
	config: instance,
	get: async <T>(
		url: string,
		params?: Record<string, any>,
		baseURL?: string
	): Promise<AxiosResponse<T, any>> => {
		const response = await instance.get<T>(url, {
			params,
			baseURL,
		});
		return responseBody(response);
	},
	post: async <T>(
		url: string,
		body: T,
		headers?: Record<string, any>
	): Promise<AxiosResponse<T, any>> => {
		const response = await instance.post<T>(url, body, headers);
		return responseBody(response);
	},
	put: async <T>(
		url: string,
		body: T,
		headers?: Record<string, any>
	): Promise<AxiosResponse<T, any>> => {
		const response = await instance.put<T>(url, body, headers);
		return responseBody(response);
	},
	delete: async <T>(
		url: string,
		headers?: Record<string, any>
	): Promise<AxiosResponse<T, any>> => {
		const response = await instance.delete<T>(url, headers);
		return responseBody(response);
	},
	patch: async <T>(
		url: string,
		body: T,
		headers?: Record<string, any>
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
		baseURL?: string
	) => Promise<AxiosResponse<T, any>>;
	post: <T>(
		url: string,
		body: T,
		headers?: Record<string, any>
	) => Promise<AxiosResponse<T, any>>;
	put: <T>(
		url: string,
		body: T,
		headers?: Record<string, any>
	) => Promise<AxiosResponse<T, any>>;
	delete: <T>(
		url: string,
		headers?: Record<string, any>
	) => Promise<AxiosResponse<T, any>>;
	patch: <T>(
		url: string,
		body: T,
		headers?: Record<string, any>
	) => Promise<AxiosResponse<T, any>>;
};

export default api;
