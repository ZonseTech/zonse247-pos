export interface ParkedSalesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResumeSuccess?: () => void;
}

export interface ParkedSaleCardProps {
    sale: ParkedSale;
    isSelected: boolean;
    isLoading: boolean;
    onViewDetails: (sale: ParkedSale) => void;
    onResume: (sale: ParkedSale) => void;
    onDelete: (sale: ParkedSale) => void;
}

export interface ParkedSaleItemsProps {
    items: ParkedSaleItem[];
    notes?: string;
}

export interface ModalHeaderProps {
    salesCount: number;
    isLoading: boolean;
    onRefresh: () => void;
}

export interface ModalFooterProps {
    onClose: () => void;
}

export interface EmptyStateProps {
    message?: string;
    subMessage?: string;
}

export interface ErrorStateProps {
    error: string;
    onRetry: () => void;
}

export interface LoadingStateProps {
    message?: string;
}

export interface UseParkedSalesReturn {
    parkedSales: ParkedSale[];
    isLoading: boolean;
    error: string | null;
    selectedSale: ParkedSale | null;
    fetchParkedSales: () => Promise<void>;
    handleResumeSale: (sale: ParkedSale, callbacks: ResumeCallbacks) => void;
    handleDeleteSale: (sale: ParkedSale) => void;
    handleViewDetails: (sale: ParkedSale) => void;
    clearSelection: () => void;
    clearError: () => void;
}

export interface ResumeCallbacks {
    clearCart: () => void;
    inventory: InventoryItem[];
    addToCart: (item: InventoryItem) => void;
    setCart: (items: CartItem[]) => void;
    onSuccess: () => void;
}
