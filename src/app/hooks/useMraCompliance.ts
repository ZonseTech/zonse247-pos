import { useState, useEffect, useCallback } from 'react';
import mraComplianceService from '../services/mra-compliance.service';

interface UseMraComplianceReturn {
    isMraEnabled: boolean;
    mraEnvironment: MraEnvironment | null;
    canSubmitInvoices: boolean;
    isLoading: boolean;
    error: string | null;
    checkStatus: () => Promise<void>;
}

export function useMraCompliance(): UseMraComplianceReturn {
    const [isMraEnabled, setIsMraEnabled] = useState(false);
    const [mraEnvironment, setMraEnvironment] = useState<MraEnvironment | null>(null);
    const [canSubmitInvoices, setCanSubmitInvoices] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkStatus = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const status = await mraComplianceService.getComplianceStatus();
            setIsMraEnabled(status.isMraEnabled);
            setMraEnvironment(status.mraEnvironment);
            setCanSubmitInvoices(status.canSubmitInvoices);
        } catch (err) {
            setIsMraEnabled(false);
            setMraEnvironment(null);
            setCanSubmitInvoices(false);
            setError(err instanceof Error ? err.message : 'Failed to check MRA status');
        } finally {
            setIsLoading(false);
        }
    }, []);

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
