import type { FunctionComponent } from 'react';
import { LayoutDashboard } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import dayjs from 'dayjs';
import { isElectron } from '../../../../helpers/index.helper';
import useBranchSubscription from '../../../hooks/useBranchSubscription';
import BranchSubscriptionLine from '../../../components/BranchSubscriptionLine';

const CLIENT_TYPE = import.meta.env.VITE_APP_CLIENT_TYPE || 'desktop';
const isDesktopEnv = isElectron() || CLIENT_TYPE === 'desktop';

const DashboardHeader: FunctionComponent = () => {
    const { subscription, label, urgency } = useBranchSubscription();
    const planName = subscription?.subscriptionPlan?.displayName || subscription?.subscriptionPlan?.name;

    return (
        <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-500/30">
                    <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        A snapshot of today's sales, inventory, and business performance.
                    </p>
                </div>
            </div>

            {isDesktopEnv && label && urgency && (
                <Tooltip.Provider delayDuration={300}>
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <div className="cursor-default">
                                <BranchSubscriptionLine label={label} urgency={urgency} />
                            </div>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content
                                side="bottom"
                                sideOffset={8}
                                className="z-50 max-w-[220px] rounded-lg bg-gray-900 dark:bg-gray-700 px-3 py-2 text-xs text-white shadow-md animate-fade-in"
                            >
                                <p className="font-semibold">{planName || 'Subscription'}</p>
                                {subscription?.endsAt && (
                                    <p className="mt-0.5 text-gray-300 dark:text-gray-400">
                                        {urgency === 'expired' ? 'Expired' : 'Renews'} {dayjs(subscription.endsAt).format('DD MMM YYYY')}
                                    </p>
                                )}
                                {(urgency === 'critical' || urgency === 'expired') && (
                                    <p className="mt-1 text-red-300">Contact support to renew your subscription.</p>
                                )}
                                <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </Tooltip.Provider>
            )}
        </div>
    );
};

export default DashboardHeader;
