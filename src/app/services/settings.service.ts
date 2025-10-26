import api from './http.service';

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
	async update(params: any) {

	},
	async reset() {

	}
};

export default settingsService;
