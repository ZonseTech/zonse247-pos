interface Customer {
    uuid: string;
    name: string;
    clientUuid: string;
    shopUuid: string;
    userUuid: string;
    phone?: string;
    email?: string;
    address?: string;
    synced?: 0 | 1;
}