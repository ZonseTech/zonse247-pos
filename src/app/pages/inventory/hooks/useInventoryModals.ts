import { useState, useCallback } from 'react';

interface InventoryModalsState {
    isBulkActionsOpen: boolean;
    isAdjustQuantityOpen: boolean;
    isConvertToVariantOpen: boolean;
    isStockMovementOpen: boolean;
    selectedItemForAdjust: ApiProduct | null;
    selectedItemForConvert: ApiProduct | null;
    selectedItemForMovements: ApiProduct | null;
}

export const useInventoryModals = () => {
    const [state, setState] = useState<InventoryModalsState>({
        isBulkActionsOpen: false,
        isAdjustQuantityOpen: false,
        isConvertToVariantOpen: false,
        isStockMovementOpen: false,
        selectedItemForAdjust: null,
        selectedItemForConvert: null,
        selectedItemForMovements: null,
    });

    const openBulkActions = useCallback(() => {
        setState(prev => ({ ...prev, isBulkActionsOpen: true }));
    }, []);

    const closeBulkActions = useCallback(() => {
        setState(prev => ({ ...prev, isBulkActionsOpen: false }));
    }, []);

    const openAdjustQuantity = useCallback((item: ApiProduct) => {
        setState(prev => ({
            ...prev,
            isAdjustQuantityOpen: true,
            selectedItemForAdjust: item,
        }));
    }, []);

    const closeAdjustQuantity = useCallback(() => {
        setState(prev => ({
            ...prev,
            isAdjustQuantityOpen: false,
            selectedItemForAdjust: null,
        }));
    }, []);

    const openConvertToVariant = useCallback((item: ApiProduct) => {
        setState(prev => ({
            ...prev,
            isConvertToVariantOpen: true,
            selectedItemForConvert: item,
        }));
    }, []);

    const closeConvertToVariant = useCallback(() => {
        setState(prev => ({
            ...prev,
            isConvertToVariantOpen: false,
            selectedItemForConvert: null,
        }));
    }, []);

    const openStockMovement = useCallback((item: ApiProduct) => {
        setState(prev => ({
            ...prev,
            isStockMovementOpen: true,
            selectedItemForMovements: item,
        }));
    }, []);

    const closeStockMovement = useCallback(() => {
        setState(prev => ({
            ...prev,
            isStockMovementOpen: false,
            selectedItemForMovements: null,
        }));
    }, []);

    return {
        ...state,
        openBulkActions,
        closeBulkActions,
        openAdjustQuantity,
        closeAdjustQuantity,
        openConvertToVariant,
        closeConvertToVariant,
        openStockMovement,
        closeStockMovement,
    };
};
