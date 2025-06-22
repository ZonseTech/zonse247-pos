type Transaction = {
    uuid: string;
    refNumber?: string;
    discount: number;
    subtotal: number;
    tax: number;
    date: string;
    tillUuid: string;
    customerUuid?: string;
    paymentServiceProviderUuid?: string;
    transactionId?: string;
    paymentMethodUuid?: string;
    userUuid: string;
    phoneNumber: string;
    total: number;
    paid: number;
    changeAmount: number;

    status?: string;
    createdAt?: Date;
    updatedAt?: Date;

    customer?: Customer;
    paymentMethod?: PaymentMethod;
    items?: CartItem[];
    user?: User;
    synced?: 1 | 0;
};

type TransactionValues = {
    paymentMethodUuid?: string;
    paymentServiceProviderUuid?: string;
    phoneNumber: string;
    transactionId: string;
};

interface DateRangeFilters {
    startDate: Date;
    endDate: Date;
    status?: number;
    user?: number;
    till?: number;
    includeItems: boolean;
}
