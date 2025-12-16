import api from './http.service';
import { version } from '../../../package.json';

const endpoints = {
	setup: 'setup',
	all: 'settings',
	store: 'settings/configure',
	update: 'settings',
	reset: 'settings/reset',
};

const settingsService = {
	endpoints,

	async list(query = {}) {
		return api
			.get(endpoints.all, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	async load() {
		return api
			.get(endpoints.all)
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

	async update(params: Partial<AppSettings>) {
		return api
			.put(endpoints.update, params)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	async reset() {
		return api
			.post(endpoints.reset)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

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
