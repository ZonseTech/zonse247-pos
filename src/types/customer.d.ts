interface Customer {
    uuid: string;
    name: string;
    clientId: string;
    shopId: string;
    userId: string;
    phone?: string;
    email?: string;
    address?: string;
    synced?: 0 | 1;
}