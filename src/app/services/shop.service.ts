import api from './http.service';

interface IShop {
    id?: number;
    uuid: string;
    client_id: string;
    shop_code: string;
    name: string;
    description?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
    email?: string;
    tax_number?: string;
    currency_code: string;
    currency_symbol: string;
    tax_rate: number;
    charge_tax: boolean;
    receipt_footer?: string;
    logo_url?: string;
    status: 'active' | 'inactive' | 'suspended';
    created_at?: string;
    updated_at?: string;
}

const endpoints: Record<string, string> = {
    all: 'shops/all',
    store: 'shops/post',
    update: 'shops/update',
    show: 'shops/shop',
    delete: 'shops/shop',
};

const shopsService = {
    endpoints,

    async list(query = {}): Promise<IShop[]> {
        return api
            .get<IShop[]>(endpoints.all, query)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async store(data: Omit<IShop, 'id' | 'created_at' | 'updated_at'>): Promise<IShop> {
        return api
            .post(endpoints.store, data)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async update(id: string, data: Partial<IShop>): Promise<IShop> {
        return api
            .put<IShop>(`${endpoints.update}/${id}`, data as any)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async show(id: string): Promise<IShop> {
        return api
            .get<IShop>(`${endpoints.show}/${id}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async delete(id: string): Promise<{ status: boolean }> {
        return api
            .delete(`${endpoints.delete}/${id}`)
            .then((res) => res.data as { status: boolean })
            .catch((err) => {
                throw err;
            });
    },
};

export default shopsService;
export type { IShop };