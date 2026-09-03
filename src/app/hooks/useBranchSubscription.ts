import { useEffect, useState } from 'react';
import { useBranch } from '../context/BranchContext';
import subscriptionService from '../services/subscriptions.service';
import { getSubscriptionUrgency, type SubscriptionUrgency } from '../utils/subscription';

export type { SubscriptionUrgency };

interface UseBranchSubscriptionResult {
    subscription: BranchSubscription | null;
    isLoading: boolean;
    daysLeft: number | null;
    urgency: SubscriptionUrgency | null;
    label: string | null;
}

/**
 * Resolves the subscription for the currently active branch, using the
 * branchSubscriptionId already present on currentBranch (from BranchContext).
 */
export function useBranchSubscription(): UseBranchSubscriptionResult {
    const { currentBranch } = useBranch();
    const [subscription, setSubscription] = useState<BranchSubscription | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const branchSubscriptionId = currentBranch?.branchSubscriptionId;
        if (!branchSubscriptionId) {
            setSubscription(null);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        subscriptionService.show(branchSubscriptionId)
            .then((result) => {
                if (!cancelled) setSubscription(result);
            })
            .catch(() => {
                if (!cancelled) setSubscription(null);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [currentBranch?.branchSubscriptionId]);

    const { daysLeft, urgency, label } = getSubscriptionUrgency(subscription);

    return { subscription, isLoading, daysLeft, urgency, label };
}

export default useBranchSubscription;
