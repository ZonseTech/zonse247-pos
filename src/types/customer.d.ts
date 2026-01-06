interface Customer {
    customerId: string;
    name: string;
    tenantId: string;
    branchId: string;
    userId: string;
    phone?: string;
    email?: string;
    address?: string;
    isDefault?: boolean;
    synced?: 0 | 1;
}

interface CreateCustomerData {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    isDefault?: boolean;
    tenantId: string;
    branchId: string;
    userId: string;
}

interface UpdateCustomerData {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    isDefault?: boolean;
}

interface SearchConditions {
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
}