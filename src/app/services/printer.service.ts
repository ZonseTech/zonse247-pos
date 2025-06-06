import api from './http.service';

const endpoints: Record<string, string> = {
	all: 'printers/all',
	print: 'printers/print-receipt',
	default: 'printers/set-default',
};

const printerService = {
	endpoints,
	async list(): Promise<PrinterInfo[]> {
		return api
			.get<PrinterInfo[]>(endpoints.all)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async print(data: {
		transaction: Transaction;
		options: PrinterInfo;
		settings: Setting;
	}): Promise<any> {
		return api
			.post<{
				transaction: Transaction;
				options: PrinterInfo;
				settings: Setting;
			}>(endpoints.print, data)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async setDefault(printer: PrinterInfo): Promise<any> {
		return api
			.post<PrinterInfo>(endpoints.default, printer)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
};

export default printerService;
