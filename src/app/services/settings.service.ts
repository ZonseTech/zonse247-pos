import api from './http.service';

const endpoints = {
	setup: 'setup',
	all: 'settings',
	store: 'settings/post',
};

const settingsService = {
	endpoints,

	async list(query = {}): Promise<Setting> {
		return api
			.get<ApiResponse<Setting>>(endpoints.all, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	async load(): Promise<WorkstatSettings> {
		return api
			.get<ApiResponse<WorkstatSettings>>(endpoints.all)
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
		clientUuid: string,
		shopUuid: string,
		workstationUuid: string
	}): Promise<Setting> {
		return api
			.post<ApiResponse<Setting>>(endpoints.store, params as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},
};

export default settingsService;
