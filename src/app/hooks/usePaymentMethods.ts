import { useState, useEffect, useMemo, useCallback } from 'react';
import paymentMethodService from '../services/payment-method.service';

interface UsePaymentMethodsReturn {
    paymentMethods: PaymentMethod[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

// Cache to store payment methods across component instances
let cachedPaymentMethods: PaymentMethod[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const usePaymentMethods = (): UsePaymentMethodsReturn => {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(cachedPaymentMethods || []);
    const [isLoading, setIsLoading] = useState<boolean>(!cachedPaymentMethods);
    const [error, setError] = useState<Error | null>(null);

    const isCacheValid = useCallback(() => {
        if (!cachedPaymentMethods || !cacheTimestamp) return false;
        return Date.now() - cacheTimestamp < CACHE_DURATION;
    }, []);

    const fetchPaymentMethods = useCallback(async () => {
        // Return cached data if valid
        if (isCacheValid()) {
            setPaymentMethods(cachedPaymentMethods!);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const methods = await paymentMethodService.list();

            // Update cache
            cachedPaymentMethods = methods;
            cacheTimestamp = Date.now();

            setPaymentMethods(methods);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to load payment methods');
            setError(error);
            console.error('Error loading payment methods:', error);

            // Clear cache on error
            cachedPaymentMethods = null;
            cacheTimestamp = null;
        } finally {
            setIsLoading(false);
        }
    }, [isCacheValid]);

    const refetch = useCallback(async () => {
        // Force cache invalidation
        cachedPaymentMethods = null;
        cacheTimestamp = null;
        await fetchPaymentMethods();
    }, [fetchPaymentMethods]);

    useEffect(() => {
        fetchPaymentMethods();
    }, [fetchPaymentMethods]);

    // Memoize the return value to prevent unnecessary re-renders
    return useMemo(() => ({
        paymentMethods,
        isLoading,
        error,
        refetch,
    }), [paymentMethods, isLoading, error, refetch]);
};

// Utility function to invalidate cache (useful for when payment methods are updated)
export const invalidatePaymentMethodsCache = () => {
    cachedPaymentMethods = null;
    cacheTimestamp = null;
};
