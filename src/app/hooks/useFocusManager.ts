import { useState, useCallback } from 'react';

export type FocusableComponent = 'barcode' | 'quantity' | 'cash' | null;

interface FocusManagerState {
    activeComponent: FocusableComponent;
    activeItemId?: string;
}

export const useFocusManager = () => {
    const [focusState, setFocusState] = useState<FocusManagerState>({
        activeComponent: null
    });

    const setActiveComponent = useCallback((component: FocusableComponent, itemId?: string) => {
        setFocusState({
            activeComponent: component,
            activeItemId: itemId
        });
    }, []);

    const clearFocus = useCallback(() => {
        setFocusState({
            activeComponent: null
        });
    }, []);

    const isActive = useCallback((component: FocusableComponent, itemId?: string) => {
        if (component === 'quantity' && itemId) {
            return focusState.activeComponent === 'quantity' && focusState.activeItemId === itemId;
        }

        return focusState.activeComponent === component;
    }, [focusState]);

    return {
        activeComponent: focusState.activeComponent,
        activeItemId: focusState.activeItemId,
        setActiveComponent,
        clearFocus,
        isActive
    };
};