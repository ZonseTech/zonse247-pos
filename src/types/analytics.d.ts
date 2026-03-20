interface MonthlySales {
    date: number;
    totalAmount: number;
}

interface TopProduct {
    productId: string;
    name: string;
    quantity: number;
    summedSellingPrice: number;
    categoryName: string;
}

type MonthlySales = {
    date: number;
    totalAmount: number;
};

type TopProduct = {
    uuid: string;
    name: string;
    quantity: number;
    summedSellingPrice: number;
    categoryName: string;
};