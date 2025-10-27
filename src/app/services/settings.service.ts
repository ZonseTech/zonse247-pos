import api from './http.service';
import { version } from '../../../package.json';

const endpoints = {
	setup: 'setup',
	all: 'settings',
	store: 'settings/configure',
};

const settingsService = {
	endpoints,

	async list(query = {}): Promise<TerminalSettings> {
		return api
			.get<ApiResponse<TerminalSettings>>(endpoints.all, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	async load(): Promise<TerminalSettings> {
		return api
			.get<ApiResponse<TerminalSettings>>(endpoints.all)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	async setup(): Promise<SetupParams> {
		return api
			.get<ApiResponse<SetupParams>>(endpoints.setup)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	async store(params: {
		tenantId: string,
		branchId: string,
		terminalId: string
	}): Promise<Setting> {
		return api
			.post<ApiResponse<Setting>>(endpoints.store, params as any)
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

	async update(params: any) {

	},
	async reset() {

	}
};

export default settingsService;
