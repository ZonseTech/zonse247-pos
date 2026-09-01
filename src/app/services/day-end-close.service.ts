import api from './http.service';

const endpoints = {
    stockCountDetail: (variantId: string) => `stock-movements/variant/${variantId}/stock-count-detail`,
};

export interface StockCountDetailQuery {
    tenantId: string;
    branchId: string;
    tradingDate: string;
}

export interface StockCountDetail {
    bookBalance: number;
    goodsReceived: number;
    openingBalance: number;
}

const dayEndCloseService = {
    endpoints,
    async getStockCountDetail(
        variantId: string,
        query: StockCountDetailQuery
    ): Promise<StockCountDetail> {
        return api
            .get<ApiResponse<StockCountDetail>>(endpoints.stockCountDetail(variantId), query)
            .then((res) => res.data.data as StockCountDetail)
            .catch((err) => {
                throw err;
            });
    },
};

export default dayEndCloseService;
