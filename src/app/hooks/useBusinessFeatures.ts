import { useMemo } from 'react';
import { useBranch } from '../context/BranchContext';

export interface BusinessFeatures {
    /** Current branch business type (defaults to PRODUCT_BASED) */
    businessType: BusinessType;
    /** Show retail POS, inventory, procurement */
    showRetail: boolean;
    /** Show service orders, service catalog */
    showServices: boolean;
    /** Show appointment scheduling */
    showAppointments: boolean;
}

/**
 * Which business types enable which feature sets.
 *
 * PRODUCT_BASED  → retail only
 * SERVICE_BASED  → services + appointments only
 * Everything else (HYBRID, SALON, REPAIR, …) → retail + services + appointments
 */
const FEATURE_MAP: Record<BusinessType, Pick<BusinessFeatures, 'showRetail' | 'showServices' | 'showAppointments'>> = {
    PRODUCT_BASED: { showRetail: true, showServices: false, showAppointments: false },
    SERVICE_BASED: { showRetail: false, showServices: true, showAppointments: true },
    HYBRID: { showRetail: false, showServices: true, showAppointments: true },
    SALON: { showRetail: false, showServices: true, showAppointments: true },
    REPAIR: { showRetail: false, showServices: true, showAppointments: false },
    TATTOO: { showRetail: false, showServices: true, showAppointments: true },
    MED_SPA: { showRetail: false, showServices: true, showAppointments: true },
    FITNESS: { showRetail: false, showServices: true, showAppointments: true },
};

const DEFAULT_TYPE: BusinessType = 'PRODUCT_BASED';

const useBusinessFeatures = (): BusinessFeatures => {
    const { currentBranch } = useBranch();

    return useMemo<BusinessFeatures>(() => {
        const bt: BusinessType = currentBranch?.businessType ?? DEFAULT_TYPE;
        const flags = FEATURE_MAP[bt] ?? FEATURE_MAP[DEFAULT_TYPE];
        return { businessType: bt, ...flags };
    }, [currentBranch?.businessType]);
};

export default useBusinessFeatures;
