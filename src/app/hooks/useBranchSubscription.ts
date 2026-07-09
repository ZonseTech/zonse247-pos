import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useBranch } from '../context/BranchContext';
import subscriptionService from '../services/subscriptions.service';

export type SubscriptionUrgency = 'ok' | 'warning' | 'critical' | 'expired';

const URGENCY_THRESHOLD_DAYS = { critical: 3, warning: 7 };

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

    if (!subscription || !subscription.endsAt) {
        return { subscription, isLoading, daysLeft: null, urgency: null, label: null };
    }

    const daysLeft = Math.ceil(dayjs(subscription.endsAt).diff(dayjs(), 'hour') / 24);
    const isExpired = subscription.status === 'expired' || daysLeft < 0;

    const urgency: SubscriptionUrgency = isExpired
        ? 'expired'
        : daysLeft <= URGENCY_THRESHOLD_DAYS.critical
            ? 'critical'
            : daysLeft <= URGENCY_THRESHOLD_DAYS.warning
                ? 'warning'
                : 'ok';

    const label = isExpired
        ? 'Subscription expired'
        : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;

    return { subscription, isLoading, daysLeft, urgency, label };
}

export default useBranchSubscription;
