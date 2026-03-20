import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { getErrorMessage } from '../utils/api-error-handler';
import parkedSalesService from '../services/parked-sales.service';
import { useAuth } from '../context/AuthProvider';

/**
 * Hook for managing parked sales
 */
export const useParkedSales = () => {
    const { user, activeBranchId } = useAuth();
    const [parkedSales, setParkedSales] = useState<ParkedSale[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parkedSalesCount, setParkedSalesCount] = useState(0);

    /**
     * Fetch parked sales for current user/branch
     */
    const fetchParkedSales = useCallback(async () => {
        if (!activeBranchId) {
            setError('Branch information is missing');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const query: ParkedSaleListQuery = {
                tenantId: user?.tenantId || '',
                branchId: activeBranchId,
                status: 'PARKED',
            };

            if (user?.userId) {
                query.userId = user.userId.toString();
            }

            const result = await parkedSalesService.list(query);
            const sales = result?.parkedSales || [];

            setParkedSales(sales);
            setParkedSalesCount(sales.length);
        } catch (err: any) {
            console.error('Error fetching parked sales:', err);
            const errorMessage = getErrorMessage(err, 'Failed to load parked sales');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [activeBranchId, user?.userId, user?.tenantId]);

    /**
     * Get count of parked sales
     */
    const getParkedSalesCount = useCallback(async () => {
        if (!activeBranchId) return 0;

        try {
            const result = await parkedSalesService.getCount({
                branchId: activeBranchId,
                userId: user?.userId?.toString(),
                status: 'PARKED',
            });
            const count = result?.parked || 0;
            setParkedSalesCount(count);
            return count;
        } catch {
            return parkedSalesCount;
        }
    }, [activeBranchId, user?.userId, parkedSalesCount]);

    /**
     * Park a sale
     */
    const parkSale = useCallback(async (payload: Omit<CreateParkedSalePayload, 'tenantId' | 'branchId' | 'userId'>) => {
        if (!user?.userId || !activeBranchId) {
            Notify.failure('User or branch information is missing');
            return null;
        }

        setIsLoading(true);

        try {
            const fullPayload: CreateParkedSalePayload = {
                ...payload,
                tenantId: user.tenantId || '',
                branchId: activeBranchId,
                userId: user.userId.toString(),
            };

            const result = await parkedSalesService.create(fullPayload);

            // Update local state
            setParkedSales(prev => [result, ...prev]);
            setParkedSalesCount(prev => prev + 1);

            return result;
        } catch (err: any) {
            console.error('Error parking sale:', err);
            const errorMessage = getErrorMessage(err, 'Failed to park sale');
            Notify.failure(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeBranchId, user]);

    /**
     * Resume a parked sale
     */
    const resumeParkedSale = useCallback(async (saleId: string): Promise<ParkedSale | null> => {
        if (!user?.userId || !activeBranchId) {
            Notify.failure('User or branch information is missing');
            return null;
        }

        setIsLoading(true);

        try {
            const result = await parkedSalesService.resume(saleId, {
                tenantId: user.tenantId || '',
                branchId: activeBranchId,
                resumedBy: user.userId.toString(),
            });

            // Update local state
            setParkedSales(prev => prev.filter(s => s.id !== saleId));
            setParkedSalesCount(prev => Math.max(0, prev - 1));

            return result;
        } catch (err: any) {
            console.error('Error resuming parked sale:', err);
            const errorMessage = getErrorMessage(err, 'Failed to resume parked sale');
            Notify.failure(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [activeBranchId, user]);

    /**
     * Delete a parked sale
     */
    const deleteParkedSale = useCallback(async (saleId: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            await parkedSalesService.delete(saleId);

            // Update local state
            setParkedSales(prev => prev.filter(s => s.id !== saleId));
            setParkedSalesCount(prev => Math.max(0, prev - 1));

            return true;
        } catch (err: any) {
            console.error('Error deleting parked sale:', err);
            const errorMessage = getErrorMessage(err, 'Failed to delete parked sale');
            Notify.failure(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Get a specific parked sale
     */
    const getParkedSale = useCallback(async (saleId: string): Promise<ParkedSale | null> => {
        try {
            return await parkedSalesService.show(saleId);
        } catch (err: any) {
            console.error('Error getting parked sale:', err);
            return null;
        }
    }, []);

    // Initial fetch of count
    useEffect(() => {
        if (activeBranchId) {
            getParkedSalesCount();
        }
    }, [activeBranchId, getParkedSalesCount]);

    return {
        parkedSales,
        parkedSalesCount,
        isLoading,
        error,
        fetchParkedSales,
        getParkedSalesCount,
        parkSale,
        resumeParkedSale,
        deleteParkedSale,
        getParkedSale,
        refresh: fetchParkedSales,
    };
};

export default useParkedSales;
