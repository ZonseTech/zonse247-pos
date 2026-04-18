import api from './http.service';

const BASE = 'staff';

const staffService = {
    async list(query: StaffListQuery = {}): Promise<StaffListResponse> {
        return api
            .get<ApiResponse<StaffListResponse>>(BASE, query)
            .then((res) => res.data.data);
    },

    async get(staffId: string): Promise<Staff> {
        return api
            .get<ApiResponse<Staff>>(`${BASE}/${staffId}`)
            .then((res) => res.data.data);
    },
};

export default staffService;
