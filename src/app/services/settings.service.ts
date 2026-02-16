import api from './http.service';
import { version } from '../../../package.json';
import {
	mapSettingsToApiPayload,
	mapApiResponseToSettings,
	decodeHtmlEntities,
	toNumber,
	SettingsAppSettings,
	SettingsApiResponse,
	GroupedSettingsPayload,
	GroupedApiResponse
} from '../pages/settings/constants/defaultValues';
import { isElectron } from '../../helpers/index.helper';

const BASE_PATH = 'terminal-settings';

const endpoints = {
	base: BASE_PATH,
	configured: `${BASE_PATH}/configured`,
	getOrCreate: `${BASE_PATH}/get-or-create`,
	setup: 'setup',
};

/**
 * Get the current terminal ID from setup data
 * Retrieves from localStorage (web) or electron secure storage
 */
const getTerminalId = async (): Promise<string | null> => {
	try {
		if (isElectron() && window.electronAPI?.settings) {
			const result = await window.electronAPI.settings.getSetup();
			if (result.success && result.data?.terminalId) {
				return result.data.terminalId;
			}
		}

		const user = sessionStorage.getItem('user');
		if (user) {
			const s = JSON.parse(user);
			const tenantId = s.tenantId;
			const branchId = s.branchId;

			if (!tenantId || !branchId) {
				return null;
			}

			const storageKey = `primaryTerminalId_${tenantId}_${branchId}`;

			const cachedTerminalId = localStorage.getItem(storageKey);
			if (cachedTerminalId) {
				return cachedTerminalId;
			}

			const terminal = await api.get<string | null>(`branches/tenant-branch/primary-terminal-id`, {
				tenantId,
				branchId,
			}).then(res => res.data?.data);

			if (terminal?.primaryTerminalId) {
				localStorage.setItem(storageKey, terminal.primaryTerminalId);
				return terminal.primaryTerminalId;
			}
		}

		return null;
	} catch (error) {
		console.error('Error getting terminal ID:', error);
		return null;
	}
};

/**
 * Ensure terminal ID is available, throw error if not
 */
const requireTerminalId = async (): Promise<string> => {
	const terminalId = await getTerminalId();
	if (!terminalId) {
		throw new Error('Terminal not configured. Please complete setup first.');
	}
	return terminalId;
};

const settingsService = {
	endpoints,
	getTerminalId,

	/**
	 * GET / - Get all terminal settings (for admin/listing purposes)
	 * Returns array of all terminal settings
	 */
	async getAllSettings(query: Record<string, any> = {}): Promise<SettingsApiResponse[]> {
		return api
			.get<ApiResponse<SettingsApiResponse[]>>(endpoints.base, query)
			.then((res) => res.data.data || [])
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /configured - Check if current terminal is configured
	 * Returns configuration status
	 */
	async isConfigured(): Promise<{ configured: boolean; terminalId?: string }> {
		return api
			.get<ApiResponse<{ configured: boolean; terminalId?: string }>>(endpoints.configured)
			.then((res) => res.data.data || { configured: false })
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * POST /get-or-create - Get existing settings or create new ones
	 * Useful for initial terminal setup
	 */
	async getOrCreateSettings(params: {
		terminalId: string;
		tenantId?: string;
		branchId?: string;
		defaults?: Partial<SettingsApiResponse>;
	}): Promise<SettingsApiResponse> {
		return api
			.post<ApiResponse<SettingsApiResponse>>(endpoints.getOrCreate, params as any)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /:terminalId - Get settings for specific terminal
	 * @param terminalId - Optional, uses current terminal if not provided
	 */
	async getSettings(terminalId?: string): Promise<SettingsApiResponse> {
		const id = terminalId || await requireTerminalId();
		return api
			.get<ApiResponse<SettingsApiResponse>>(`${endpoints.base}/${id}`)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * POST / - Create new terminal settings
	 */
	async createSettings(params: Partial<SettingsApiResponse> & { terminalId: string }): Promise<SettingsApiResponse> {
		return api
			.post<ApiResponse<SettingsApiResponse>>(endpoints.base, params as any)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * PUT /:terminalId - Update all settings for terminal
	 * Converts flat SettingsAppSettings to hierarchical JSON format
	 * @param params - Flat SettingsAppSettings or hierarchical SettingsApiResponse
	 * @param terminalId - Optional, uses current terminal if not provided
	 */
	async updateSettings(
		params: SettingsAppSettings | Partial<SettingsApiResponse>,
		terminalId?: string
	): Promise<SettingsApiResponse> {
		const id = terminalId || await requireTerminalId();

		// Check if it's SettingsAppSettings (flat) - convert to grouped format
		const isAppSettings = 'storeName' in params && !('general' in params);
		const apiPayload: GroupedSettingsPayload | Partial<SettingsApiResponse> = isAppSettings
			? mapSettingsToApiPayload(params as SettingsAppSettings)
			: params;

		return api
			.put<ApiResponse<SettingsApiResponse>>(`${endpoints.base}/${id}`, apiPayload as any)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * PATCH /:terminalId/group/:groupName - Update specific settings group
	 * @param groupName - JSON column name (e.g., 'transactionSettings', 'paymentSettings')
	 * @param settings - The settings object for that group
	 * @param terminalId - Optional, uses current terminal if not provided
	 */
	async updateSettingsGroup<K extends keyof SettingsApiResponse>(
		groupName: K,
		settings: SettingsApiResponse[K],
		terminalId?: string
	): Promise<SettingsApiResponse> {
		const id = terminalId || await requireTerminalId();
		return api
			.patch<ApiResponse<SettingsApiResponse>>(
				`${endpoints.base}/${id}/group/${String(groupName)}`,
				settings as any
			)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * PATCH /:terminalId/deactivate - Deactivate terminal settings
	 * @param terminalId - Optional, uses current terminal if not provided
	 * @param reason - Optional reason for deactivation
	 */
	async deactivateSettings(terminalId?: string, reason?: string): Promise<SettingsApiResponse> {
		const id = terminalId || await requireTerminalId();
		return api
			.patch<ApiResponse<SettingsApiResponse>>(
				`${endpoints.base}/${id}/deactivate`,
				{ reason } as any
			)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * DELETE /:terminalId - Delete terminal settings
	 * @param terminalId - Optional, uses current terminal if not provided
	 */
	async deleteSettings(terminalId?: string): Promise<{ success: boolean }> {
		const id = terminalId || await requireTerminalId();
		return api
			.delete<ApiResponse<{ success: boolean }>>(`${endpoints.base}/${id}`)
			.then((res) => res.data.data || { success: true })
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Load settings and map to flat SettingsAppSettings format
	 * Handles both grouped and flat API response formats
	 * Uses current terminal ID
	 */
	async load(): Promise<SettingsAppSettings> {
		const terminalId = await requireTerminalId();
		return api
			.get<ApiResponse<GroupedApiResponse | SettingsApiResponse>>(`${endpoints.base}/${terminalId}`)
			.then((res) => {
				const apiResponse = res.data.data;
				const mappedSettings = mapApiResponseToSettings(apiResponse ?? null);
				return {
					...mappedSettings,
					terminalId,
				};
			})
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Load raw settings as-is from API (hierarchical format)
	 * Uses current terminal ID
	 */
	async loadRaw(): Promise<SettingsApiResponse | null> {
		const terminalId = await requireTerminalId();
		return api
			.get<ApiResponse<SettingsApiResponse>>(`${endpoints.base}/${terminalId}`)
			.then((res) => res.data.data ?? null)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Update settings - converts flat SettingsAppSettings to hierarchical JSON format
	 * Alias for updateSettings for backward compatibility
	 */
	async update(params: SettingsAppSettings): Promise<SettingsApiResponse> {
		return this.updateSettings(params);
	},

	/**
	 * Partial update - updates specific JSON columns or selective columns
	 * Use this for updating only specific settings groups
	 */
	async partialUpdate(
		params: Partial<SettingsApiResponse>,
		terminalId?: string
	): Promise<SettingsApiResponse> {
		const id = terminalId || await requireTerminalId();
		return api
			.put<ApiResponse<SettingsApiResponse>>(`${endpoints.base}/${id}`, params as any)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Get setup parameters from server
	 */
	async setup(): Promise<SetupParams> {
		return api
			.get<ApiResponse<SetupParams>>(endpoints.setup)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Save terminal settings locally
	 */
	async saveSettingsLocally(params: {
		tenantId: string;
		branchId: string;
		terminalId: string;
		tenantSignature: string;
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
	 * Reset settings to defaults
	 * Creates new settings or resets existing ones for current terminal
	 */
	async resetSettings(): Promise<SettingsApiResponse> {
		const terminalId = await requireTerminalId();
		return await api
			.post<ApiResponse<SettingsApiResponse>>(`${endpoints.base}/${terminalId}/reset`)
			.then((res) => res.data.data!)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Get a specific setting value by key from current terminal
	 * @deprecated Use load() and access property directly
	 */
	async getSettingByKey(key: keyof SettingsAppSettings): Promise<any> {
		const settings = await this.load();
		return settings[key];
	}
};

// Export helper utilities for use in other parts of the application
export { decodeHtmlEntities, toNumber };

export default settingsService;
