export const getSubscriptionStatusColor = (status: string): string => {
    switch (status) {
        case 'active': return 'text-green-800 bg-green-100';
        case 'trial': return 'text-sky-800 bg-sky-100';
        case 'suspended': return 'text-red-800 bg-red-100';
        case 'inactive': return 'text-gray-800 dark:text-gray-400 bg-gray-100';
        default: return 'text-gray-600 bg-gray-100';
    }
};

export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'active': return 'text-green-800 bg-green-100';
        case 'pending': return 'text-yellow-800 bg-green-100';
        case 'suspended': return 'text-red-800 bg-red-100';
        case 'cancelled': return 'text-gray-800 dark:text-gray-400 bg-gray-100';
        default: return 'text-gray-600 bg-gray-100';
    }
};

export const businessTypes = [
    { label: 'Product Based', value: 'PRODUCT_BASED' },
    { label: 'Service Based', value: 'SERVICE_BASED' }
];

export const statuses = [
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Cancelled', value: 'cancelled' }
];

export const msonkhoStatuses = [
    { label: 'Verified', value: 'VERIFIED' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Failed', value: 'FAILED' }
];