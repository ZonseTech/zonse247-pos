import api from './http.service';
import { version } from '../../../package.json';
import { mapSettingsToApiPayload, mapApiResponseToSettings, getDefaultSettings } from '../pages/settings/constants/defaultValues';

const endpoints = {
	setup: 'setup',
	all: 'settings',
	store: 'settings/configure',
	update: 'settings',
	reset: 'settings/reset',
};

const settingsService = {
	endpoints,

	/**
	 * List settings with optional query parameters
	 * Returns raw API response (hierarchical JSON + selective columns)
	 */
	async list(query = {}): Promise<TerminalSettingsApiResponse> {
		return api
			.get<ApiResponse<TerminalSettingsApiResponse>>(endpoints.all, query)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Load settings and map to flat AppSettings format
	 * Converts hierarchical JSON + selective columns to flat structure
	 */
	async load(): Promise<AppSettings> {
		return api
			.get<ApiResponse<TerminalSettingsApiResponse>>(endpoints.all)
			.then((res) => {
				const apiResponse = res.data.data;
				const mappedSettings = mapApiResponseToSettings(apiResponse ?? null);
				return getDefaultSettings(mappedSettings);
			})
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Load raw settings as-is from API (hierarchical format)
	 */
	async loadRaw(): Promise<TerminalSettingsApiResponse | null> {
		return api
			.get<ApiResponse<TerminalSettingsApiResponse>>(endpoints.all)
			.then((res) => res.data.data ?? null)
			.catch((err) => {
				throw err;
			});
	},

	async setup(): Promise<SetupParams> {
		return api
			.get<ApiResponse<SetupParams>>(endpoints.setup)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	async store(params: {
		tenantId: string,
		branchId: string,
		terminalId: string
	}) {
		return api
			.post(endpoints.store, params as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	async saveSettingsLocally(params: {
		tenantId: string,
		branchId: string,
		terminalId: string,
		tenantSignature: string,
	}) {
		try {
			const settings = {
				...params,
				lastConfigured: new Date().toISOString(),
				configVersion: version,
				isConfigured: true
			};

			localStorage.setItem('terminalSettings', JSON.stringify(settings));

			return settings;
		} catch (error) {
			console.error('Failed to save settings locally:', error);
			throw new Error('Failed to save terminal settings locally');
		}
	},

	/**
	 * Update settings - converts flat AppSettings to hierarchical JSON format
	 */
	async update(params: AppSettings): Promise<TerminalSettingsApiResponse> {
		const apiPayload = mapSettingsToApiPayload(params);
		return api
			.put<ApiResponse<TerminalSettingsApiResponse>>(endpoints.update, apiPayload)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Partial update - updates specific JSON columns or selective columns
	 * Use this for updating only specific settings groups
	 */
	async partialUpdate(params: Partial<TerminalSettingsApiResponse>): Promise<TerminalSettingsApiResponse> {
		return api
			.patch<ApiResponse<TerminalSettingsApiResponse>>(endpoints.update, params)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Update a specific JSON settings group
	 * @param groupName - The JSON column name (e.g., 'transactionSettings', 'paymentSettings')
	 * @param settings - The settings object for that group
	 */
	async updateSettingsGroup<K extends keyof TerminalSettingsApiResponse>(
		groupName: K, 
		settings: TerminalSettingsApiResponse[K]
	): Promise<TerminalSettingsApiResponse> {
		const payload = { [groupName]: settings };
		return api
			.patch<ApiResponse<TerminalSettingsApiResponse>>(endpoints.update, payload)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	async reset(): Promise<TerminalSettingsApiResponse> {
		return api
			.post<ApiResponse<TerminalSettingsApiResponse>>(endpoints.reset)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Update a single selective column setting
	 */
	async updateSetting(key: string, value: any) {
		return api
			.patch(`${endpoints.update}/${key}`, { value })
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	async getSettingByKey(key: string) {
		return api
			.get(`${endpoints.all}/${key}`)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	}
};

export default settingsService;
