import type { useFocusManager } from '../../../../hooks/useFocusManager';

export interface StaffPickerProps {
    staffList: Staff[];
    selectedStaffId: string;
    onChange: (staffId: string) => void;
    compact?: boolean;
}

export interface CartRowProps {
    item: CartItem;
    isService: boolean;
    availableStock: number;
    staff: Staff[];
    staffAssignment: string;
    onStaffChange: (variantId: string, staffId: string) => void;
    focusManager: ReturnType<typeof useFocusManager>;
    customPriceInput: string;
    onPriceChange: (productId: string, value: string) => void;
    onRemove: (variantId: string) => void;
    onUpdateQuantity: (variantId: string, qty: number) => void;
    compact: boolean;
}

export interface ServiceCartTableProps {
    focusManager: ReturnType<typeof useFocusManager>;
    customPriceInputs: Record<string, string>;
    onPriceChange: (productId: string, value: string) => void;
    onStaffAssignmentsChange?: (assignments: Record<string, string>) => void;
    compact?: boolean;
}
