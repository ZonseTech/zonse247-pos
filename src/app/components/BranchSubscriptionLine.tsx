import { FunctionComponent } from 'react';
import classNames from 'classnames';
import type { SubscriptionUrgency } from '../hooks/useBranchSubscription';

interface BranchSubscriptionLineProps {
    label: string | null;
    urgency: SubscriptionUrgency | null;
    className?: string;
}

const DOT_COLOR: Record<SubscriptionUrgency, string> = {
    ok: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
    expired: 'bg-red-500',
};

const TEXT_COLOR: Record<SubscriptionUrgency, string> = {
    ok: 'text-gray-500 dark:text-gray-400',
    warning: 'text-amber-600 dark:text-amber-400',
    critical: 'text-red-600 dark:text-red-400',
    expired: 'text-red-600 dark:text-red-400',
};

/**
 * Compact "days remaining" line meant to sit directly under a branch name.
 */
const BranchSubscriptionLine: FunctionComponent<BranchSubscriptionLineProps> = ({
    label,
    urgency,
    className
}) => {
    if (!label || !urgency) return null;

    return (
        <span className={classNames(
            'flex items-center gap-1.5 text-[11px] font-medium leading-tight',
            TEXT_COLOR[urgency],
            className
        )}>
            <span className={classNames('w-1.5 h-1.5 rounded-full flex-shrink-0', DOT_COLOR[urgency])} />
            <span className="truncate">{label}</span>
        </span>
    );
};

export default BranchSubscriptionLine;
