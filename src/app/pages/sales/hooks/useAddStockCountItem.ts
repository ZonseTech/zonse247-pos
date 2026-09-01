import { useCallback } from 'react';
import { Notify } from 'notiflix';
import dayEndCloseService from '../../../services/day-end-close.service';
import { useSettings } from '../../../hooks/useSettings';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { addPendingStockCountItem, resolveStockCountItem } from '../../../store/slices/dayEndCloseSlice';

export const useAddStockCountItem = (tradingDate: string) => {
    const dispatch = useAppDispatch();
    const { setup } = useSettings();
    const items = useAppSelector((state) => state.dayEndClose.items);

    const addItem = useCallback(async (item: InventoryItem) => {
        const id = item.id?.toString() || item.productId.toString();
        if (items.some((countItem) => countItem.id === id)) return;

        dispatch(addPendingStockCountItem(item));

        const tenantId = setup?.tenantId || '';
        const branchId = setup?.branchId || '';
        const fallbackBookBalance = parseFloat((item.availableQuantity ?? item.quantity ?? 0).toString());

        try {
            const detail = await dayEndCloseService.getStockCountDetail(id, {
                tenantId,
                branchId,
                tradingDate,
            });

            dispatch(resolveStockCountItem({ id, bookBalance: detail.bookBalance, goodsReceived: detail.goodsReceived }));
        } catch (error: any) {
            console.error('Error fetching stock count detail:', error);
            Notify.failure('Failed to fetch stock details for this item');
            // Resolve with the fallback quantity rather than leaving the row stuck loading.
            dispatch(resolveStockCountItem({ id, bookBalance: fallbackBookBalance, goodsReceived: 0 }));
        }
    }, [dispatch, items, setup, tradingDate]);

    return { addItem };
};
