import api from './http.service';

interface District {
    id: number;
    districtId: string;
    name: string;
    region: string;
    code: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface DistrictOption {
    label: string;
    value: string;
}

const endpoints: Record<string, string> = {
    all: 'districts',
};

const districtService = {
    endpoints,

    async list(): Promise<Array<District>> {
        try {
            const response = await api.get<ApiResponse<{ districts: Array<District>; pagination?: any }>>(endpoints.all);
            return response.data.data?.districts || [];
        } catch (err) {
            console.error('Error fetching districts:', err);
            throw err;
        }
    },

    async getOptions(): Promise<Array<DistrictOption>> {
        try {
            const districts = await this.list();
            return districts.map(district => ({
                label: district.name,
                value: district.districtId
            }));
        } catch (err) {
            console.error('Error fetching district options:', err);
            return [];
        }
    },
};

export default districtService;
