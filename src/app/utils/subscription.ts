import dayjs from 'dayjs';

export type SubscriptionUrgency = 'ok' | 'warning' | 'critical' | 'expired';

const URGENCY_THRESHOLD_DAYS = { critical: 3, warning: 7 };

export interface SubscriptionUrgencyInfo {
    daysLeft: number | null;
    urgency: SubscriptionUrgency | null;
    label: string | null;
}

/**
 * Computes days-remaining and an urgency level from a branch subscription's
 * endsAt date. Shared by anywhere a subscription's expiry needs to be shown
 * (current-branch banner, branch cards, admin subscription lists).
 */
export function getSubscriptionUrgency(
    subscription: BranchSubscription | null | undefined,
): SubscriptionUrgencyInfo {
    if (!subscription || !subscription.endsAt) {
        return { daysLeft: null, urgency: null, label: null };
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

    return { daysLeft, urgency, label };
}
