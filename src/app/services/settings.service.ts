import api from './http.service';

const endpoints: Record<string, string> = {
	all: 'settings/get',
	store: 'settings/post',
};

const settingsService = {
	endpoints,
	async list(query = {}): Promise<Setting> {
		return api
			.get<Setting>(endpoints.all, query)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async store(data: Setting): Promise<Setting> {
		return api
			.post(endpoints.store, data)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
};

export default settingsService;
