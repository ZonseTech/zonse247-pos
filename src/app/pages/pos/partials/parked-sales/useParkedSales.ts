import { useState, useCallback } from 'react';
import { Confirm, Report } from 'notiflix';
import parkedSalesService from '../../../../services/parked-sales.service';
import { UseParkedSalesReturn, ResumeCallbacks } from './types';

export const useParkedSales = (
    tenantId: string,
    branchId: string,
    userId?: string
): UseParkedSalesReturn => {
    const [parkedSales, setParkedSales] = useState<ParkedSale[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSale, setSelectedSale] = useState<ParkedSale | null>(null);

    const fetchParkedSales = useCallback(async () => {
        if (!branchId) {
            setError("Branch information is missing");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const query: ParkedSaleListQuery = {
                tenantId,
                branchId,
                status: 'PARKED',
            };

            if (userId) {
                query.userId = userId.toString();
            }

            const result = await parkedSalesService.list(query);
            const sales = result?.parkedSales || [];

            setParkedSales(sales);
        } catch (error: any) {
            console.error("Error fetching parked sales:", error);
            const errorMessage = error?.response?.data?.message || "Failed to load parked sales";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [tenantId, branchId, userId]);

    const handleResumeSale = useCallback((sale: ParkedSale, callbacks: ResumeCallbacks) => {
        const { clearCart, inventory, addToCart, setCart, onSuccess } = callbacks;

        Confirm.show(
            'Resume Sale',
            `Load "${sale.reference}" into your cart? This will replace your current cart.`,
            'Yes, Resume',
            'Cancel',
            async () => {
                setIsLoading(true);

                try {
                    // Clear current cart first
                    clearCart();

                    // Resume the parked sale via API
                    if (userId && branchId) {
                        await parkedSalesService.resume(sale.id, {
                            tenantId,
                            branchId,
                            resumedBy: userId.toString(),
                        });
                    }

                    // Load items into cart
                    if (sale.items && sale.items.length > 0) {
                        sale.items.forEach(item => {
                            const inventoryItem = inventory.find(inv => inv.productId === item.productId);

                            if (inventoryItem) {
                                const itemToAdd = {
                                    ...inventoryItem,
                                    orderItems: item.quantity,
                                    sellPrice: item.sellPrice || item.unitPrice,
                                    variancePrice: item.variancePrice,
                                };
                                addToCart(itemToAdd as InventoryItem);
                            } else {
                                const cartItem: CartItem = {
                                    productId: item.productId,
                                    barcode: item.barcode,
                                    name: item.name,
                                    categoryId: item.categoryId,
                                    quantity: item.quantity,
                                    sellPrice: item.sellPrice || item.unitPrice,
                                    purchasePrice: item.purchasePrice,
                                    discount: item.discount || 0,
                                    variancePrice: item.variancePrice,
                                };
                                setCart([cartItem]);
                            }
                        });
                    }

                    // Remove from parked sales list
                    setParkedSales(prev => prev.filter(s => s.id !== sale.id));

                    Report.success(
                        "Sale Resumed",
                        `"${sale.reference}" has been loaded into your cart`,
                        "Ok"
                    );

                    onSuccess();

                } catch (error: any) {
                    console.error("Error resuming parked sale:", error);
                    const errorMessage = error?.response?.data?.message || "Failed to resume the sale";
                    Report.failure("Error", errorMessage, "Ok");
                } finally {
                    setIsLoading(false);
                }
            },
            () => {
                // Cancelled - do nothing
            },
            {
                titleColor: '#f59e0b',
                okButtonBackground: '#f59e0b',
            }
        );
    }, [tenantId, branchId, userId]);

    const handleDeleteSale = useCallback((sale: ParkedSale) => {
        Confirm.show(
            'Delete Parked Sale',
            `Are you sure you want to delete "${sale.reference}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                setIsLoading(true);

                try {
                    await parkedSalesService.delete(sale.id);
                    setParkedSales(prev => prev.filter(s => s.id !== sale.id));

                    Report.success("Deleted", "Parked sale has been removed", "Ok");
                } catch (error: any) {
                    console.error("Error deleting parked sale:", error);
                    const errorMessage = error?.response?.data?.message || "Failed to delete the parked sale";
                    Report.failure("Error", errorMessage, "Ok");
                } finally {
                    setIsLoading(false);
                }
            },
            () => {
                // Cancelled - do nothing
            },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    }, []);

    const handleViewDetails = useCallback((sale: ParkedSale) => {
        setSelectedSale(prev => prev?.id === sale.id ? null : sale);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedSale(null);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        parkedSales,
        isLoading,
        error,
        selectedSale,
        fetchParkedSales,
        handleResumeSale,
        handleDeleteSale,
        handleViewDetails,
        clearSelection,
        clearError,
    };
};
