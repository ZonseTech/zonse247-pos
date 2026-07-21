import { useState, useEffect, useMemo, useCallback } from 'react';
import paymentServiceProviderService from '../services/payment-service-provider.service';

interface UsePaymentServiceProvidersReturn {
    providers: PaymentServiceProvider[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

// Cache per methodId, since the backend resolves channel leaves (e.g. POS,
// Bank Transfer) to their shared root (Bank) - the same list is reused for
// both channels.
const cache: Record<string, { providers: PaymentServiceProvider[]; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Providers (banks, mobile money networks) for a given payment method.
 * Pass a channel leaf id (e.g. 'pos', 'bank-transfer') or a root id
 * (e.g. 'mobile-money') - the backend resolves either to the right list.
 */
export const usePaymentServiceProviders = (methodId?: string): UsePaymentServiceProvidersReturn => {
    const cached = methodId ? cache[methodId] : undefined;
    const [providers, setProviders] = useState<PaymentServiceProvider[]>(cached?.providers || []);
    const [isLoading, setIsLoading] = useState<boolean>(!!methodId && !cached);
    const [error, setError] = useState<Error | null>(null);

    const isCacheValid = useCallback((id: string) => {
        const entry = cache[id];
        if (!entry) return false;
        return Date.now() - entry.timestamp < CACHE_DURATION;
    }, []);

    const fetchProviders = useCallback(async () => {
        if (!methodId) {
            setProviders([]);
            setIsLoading(false);
            return;
        }

        if (isCacheValid(methodId)) {
            setProviders(cache[methodId].providers);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const result = await paymentServiceProviderService.listByMethod(methodId);

            cache[methodId] = { providers: result, timestamp: Date.now() };
            setProviders(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to load payment service providers');
            setError(error);
            console.error('Error loading payment service providers:', error);
            delete cache[methodId];
        } finally {
            setIsLoading(false);
        }
    }, [methodId, isCacheValid]);

    const refetch = useCallback(async () => {
        if (methodId) delete cache[methodId];
        await fetchProviders();
    }, [methodId, fetchProviders]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    return useMemo(() => ({
        providers,
        isLoading,
        error,
        refetch,
    }), [providers, isLoading, error, refetch]);
};
