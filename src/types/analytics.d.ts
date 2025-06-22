interface MonthlySales {
    date: number;
    totalAmount: number;
}

interface Product {
    uuid: string | number;
    name: string;
    categoryId?: string | number;
    quantity: number;
    status: string;
    expirationDate: string;
    categoryDetails?: Category;
}

interface Category {
    uuid: string;
    name: string;
}

interface TopProduct {
    uuid: string;
    name: string;
    quantity: number;
    summedSellPrice: number;
    categoryName: string;
}

interface DashboardCounts {
    totalSales: number | string;
    stock: number;
    totalUsers: number;
    allCustomers: number;
    expiredProducts: number;
    myTotalTransactions: number;
}