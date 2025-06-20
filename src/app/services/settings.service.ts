import api from './http.service';

const endpoints: Record<string, string> = {
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

	async load(): Promise<Setting> {
		return api
			.get<ApiResponse<Setting>>(endpoints.all)
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
