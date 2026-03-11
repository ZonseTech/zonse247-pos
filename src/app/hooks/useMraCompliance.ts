import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthProvider';
import mraComplianceService from '../services/mra-compliance.service';

interface UseMraComplianceReturn {
    isMraEnabled: boolean;
    mraEnvironment: MraEnvironment | null;
    canSubmitInvoices: boolean;
    isLoading: boolean;
    error: string | null;
    checkStatus: () => Promise<void>;
}

/**
 * Hook to check and manage MRA compliance status for the current tenant
 * 
 * Usage:
 * ```tsx
 * const { isMraEnabled, mraEnvironment, isLoading } = useMraCompliance();
 * 
 * if (isMraEnabled) {
 *   // Show MRA-specific UI elements
 * }
 * ```
 */
export function useMraCompliance(): UseMraComplianceReturn {
    const { user } = useAuth();
    const [isMraEnabled, setIsMraEnabled] = useState(false);
    const [mraEnvironment, setMraEnvironment] = useState<MraEnvironment | null>(null);
    const [canSubmitInvoices, setCanSubmitInvoices] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkStatus = useCallback(async () => {
        if (!user?.tenantId) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const status = await mraComplianceService.getComplianceStatus(user.tenantId);
            setIsMraEnabled(status.isMraEnabled);
            setMraEnvironment(status.mraEnvironment);
            setCanSubmitInvoices(status.canSubmitInvoices);
        } catch (err) {
            console.warn('Failed to check MRA compliance status:', err);
            // Default to non-MRA compliant on error
            setIsMraEnabled(false);
            setMraEnvironment(null);
            setCanSubmitInvoices(false);
            setError(err instanceof Error ? err.message : 'Failed to check MRA status');
        } finally {
            setIsLoading(false);
        }
    }, [user?.tenantId]);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    return {
        isMraEnabled,
        mraEnvironment,
        canSubmitInvoices,
        isLoading,
        error,
        checkStatus,
    };
}

export default useMraCompliance;
