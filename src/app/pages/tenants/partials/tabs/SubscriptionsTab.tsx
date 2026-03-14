import { ZonseThemeContext } from '../../../../components';
import { getTableStyles } from '../../../../utils/table-styles';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Fragment, FunctionComponent, memo, useContext, useState } from 'react';
import TableSkeleton from '../../../../components/skeleton/TableSkeleton';
import {
    CreditCard,
    Building2,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    MoreVertical,
    RefreshCw,
    Ban
} from 'lucide-react';
import { formatDate } from '../../../../utils';
import { Notify, Confirm } from 'notiflix';
import subscriptionService from '../../../../services/subscriptions.service';

interface SubscriptionsTabProps {
    subscriptions: BranchSubscription[];
    loading: boolean;
    tenantId?: string;
    onRefresh?: () => void;
    onSubscribe?: () => void;
}

const getStatusColor = (status: BranchSubscription['status']): string => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'cancelled':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400';
        case 'expired':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'past_due':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400';
    }
};

const getStatusIcon = (status: BranchSubscription['status']) => {
    switch (status) {
        case 'active':
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'cancelled':
            return <Ban className="w-4 h-4 text-gray-500" />;
        case 'expired':
            return <XCircle className="w-4 h-4 text-red-500" />;
        case 'past_due':
            return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        default:
            return <Clock className="w-4 h-4 text-gray-500" />;
    }
};

const SubscriptionsTab: FunctionComponent<SubscriptionsTabProps> = memo(({
    subscriptions,
    loading,
    tenantId,
    onRefresh,
    onSubscribe,
}) => {
    const { mode } = useContext(ZonseThemeContext);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleCancel = async (subscription: BranchSubscription) => {
        Confirm.show(
            'Cancel Subscription',
            `Are you sure you want to cancel the subscription for ${subscription.branch?.branchName || 'this branch'}?`,
            'Yes, Cancel',
            'No',
            async () => {
                try {
                    setActionLoading(subscription.branchSubscriptionId);
                    await subscriptionService.cancel(subscription.branchSubscriptionId);
                    Notify.success('Subscription cancelled successfully');
                    onRefresh?.();
                } catch (error) {
                    console.error('Error cancelling subscription:', error);
                    Notify.failure('Failed to cancel subscription');
                } finally {
                    setActionLoading(null);
                }
            }
        );
    };

    const handleReactivate = async (subscription: BranchSubscription) => {
        try {
            setActionLoading(subscription.branchSubscriptionId);
            await subscriptionService.reactivate(subscription.branchSubscriptionId);
            Notify.success('Subscription reactivated successfully');
            onRefresh?.();
        } catch (error) {
            console.error('Error reactivating subscription:', error);
            Notify.failure('Failed to reactivate subscription');
        } finally {
            setActionLoading(null);
        }
    };

    const columns: TableColumn<BranchSubscription>[] = [
        {
            name: 'Branch',
            cell: (row) => (
                <div className="flex items-center py-2">
                    <div className="ml-3 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {row.branch?.branchName || 'Unknown Branch'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {row.branch?.branchCode || row.branch?.branchId?.slice(0, 8)}
                        </div>
                    </div>
                </div>
            ),
            minWidth: '200px',
            sortable: true,
            sortField: 'branch.branchName',
        },
        {
            name: 'Plan',
            cell: (row) => (
                <div className="py-2">
                    <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {row.planName || row.subscriptionPlan?.displayName || row.subscriptionPlan?.name || 'N/A'}
                        </span>
                    </div>
                    {row.subscriptionPlan?.monthlyPrice && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                            ${row.subscriptionPlan.monthlyPrice}/month
                        </div>
                    )}
                </div>
            ),
            minWidth: '150px',
        },
        {
            name: 'Status',
            cell: (row) => (
                <div className="py-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                        {getStatusIcon(row.status)}
                        {row.status?.charAt(0).toUpperCase() + row.status?.slice(1).replace('_', ' ')}
                    </span>
                </div>
            ),
            minWidth: '130px',
            sortable: true,
            sortField: 'status',
        },
        {
            name: 'Period',
            cell: (row) => (
                <div className="py-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3 mr-1.5 flex-shrink-0" />
                        <span>{formatDate(String(row.startsAt))}</span>
                    </div>
                    {row.endsAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 ml-4.5">
                            to {formatDate(String(row.endsAt))}
                        </div>
                    )}
                </div>
            ),
            minWidth: '150px',
            sortable: true,
            sortField: 'startsAt',
        },
        {
            name: 'Auto Renew',
            cell: (row) => (
                <div className="py-2">
                    {row.autoRenew ? (
                        <span className="inline-flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">Yes</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center text-gray-500 dark:text-gray-400">
                            <XCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">No</span>
                        </span>
                    )}
                </div>
            ),
            minWidth: '100px',
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="py-2 flex items-center gap-2">
                    {row.status === 'active' && (
                        <button
                            onClick={() => handleCancel(row)}
                            disabled={actionLoading === row.branchSubscriptionId}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Cancel Subscription"
                        >
                            {actionLoading === row.branchSubscriptionId ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Ban className="w-4 h-4" />
                            )}
                        </button>
                    )}
                    {row.status === 'cancelled' && (
                        <button
                            onClick={() => handleReactivate(row)}
                            disabled={actionLoading === row.branchSubscriptionId}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Reactivate Subscription"
                        >
                            {actionLoading === row.branchSubscriptionId ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </div>
            ),
            minWidth: '80px',
            right: true,
        },
    ];

    if (loading) {
        return <TableSkeleton columns={6} rows={5} />;
    }

    return (
        <Fragment>
            <DataTable
                columns={columns}
                data={subscriptions}
                customStyles={getTableStyles(mode)}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 25, 50]}
                noDataComponent={
                    <div className="flex flex-col items-center justify-center py-12">
                        <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                            No Subscriptions Found
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {tenantId
                                ? "This tenant doesn't have any branch subscriptions yet."
                                : "No subscriptions to display."
                            }
                        </p>
                        {onSubscribe && tenantId && (
                            <button
                                onClick={onSubscribe}
                                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                            >
                                Subscribe a Branch
                            </button>
                        )}
                    </div>
                }
                highlightOnHover
                responsive
            />
        </Fragment>
    );
});

SubscriptionsTab.displayName = 'SubscriptionsTab';

export default SubscriptionsTab;
