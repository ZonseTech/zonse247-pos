import { ZonseThemeContext } from '../../../../components';
import { getTableStyles } from '../../../../utils/table-styles';
import DataTable, { TableColumn } from 'react-data-table-component';
import { FunctionComponent, memo, useContext, useState } from 'react';
import TableSkeleton from '../../../../components/skeleton/TableSkeleton';
import {
    CreditCard,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    RefreshCw,
    Ban
} from 'lucide-react';
import { Badge, Box, Button, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes';
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

const statusColorMap: Record<string, 'green' | 'gray' | 'red' | 'amber'> = {
    active: 'green',
    cancelled: 'gray',
    expired: 'red',
    past_due: 'amber',
};

const getStatusIcon = (status: BranchSubscription['status']) => {
    switch (status) {
        case 'active':
            return <CheckCircle className="w-4 h-4" />;
        case 'cancelled':
            return <Ban className="w-4 h-4" />;
        case 'expired':
            return <XCircle className="w-4 h-4" />;
        case 'past_due':
            return <AlertCircle className="w-4 h-4" />;
        default:
            return <Clock className="w-4 h-4" />;
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
                <Box py="2">
                    <Text as="p" size="2" weight="medium" className="truncate">
                        {row.branch?.branchName || 'Unknown Branch'}
                    </Text>
                    <Text as="p" size="1" color="gray">
                        {row.branch?.branchCode || row.branch?.branchId?.slice(0, 8)}
                    </Text>
                </Box>
            ),
            minWidth: '200px',
            sortable: true,
            sortField: 'branch.branchName',
        },
        {
            name: 'Plan',
            cell: (row) => (
                <Box py="2">
                    <Flex align="center" gap="2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <Text size="2" weight="medium">
                            {row.planName || row.subscriptionPlan?.displayName || row.subscriptionPlan?.name || 'N/A'}
                        </Text>
                    </Flex>
                    {row.subscriptionPlan?.monthlyPrice && (
                        <Text as="p" size="1" color="gray" className="ml-6">
                            ${row.subscriptionPlan.monthlyPrice}/month
                        </Text>
                    )}
                </Box>
            ),
            minWidth: '150px',
        },
        {
            name: 'Status',
            cell: (row) => (
                <Badge variant="soft" radius="full" color={statusColorMap[row.status || ''] || 'gray'}>
                    <Flex align="center" gap="1">
                        {getStatusIcon(row.status)}
                        {row.status?.charAt(0).toUpperCase() + row.status?.slice(1).replace('_', ' ')}
                    </Flex>
                </Badge>
            ),
            minWidth: '130px',
            sortable: true,
            sortField: 'status',
        },
        {
            name: 'Period',
            cell: (row) => (
                <Box py="2">
                    <Flex align="center" gap="1">
                        <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <Text size="2" color="gray">{formatDate(String(row.startsAt))}</Text>
                    </Flex>
                    {row.endsAt && (
                        <Text as="p" size="1" color="gray" className="ml-4">
                            to {formatDate(String(row.endsAt))}
                        </Text>
                    )}
                </Box>
            ),
            minWidth: '150px',
            sortable: true,
            sortField: 'startsAt',
        },
        {
            name: 'Auto Renew',
            cell: (row) => (
                <Flex align="center" gap="1">
                    {row.autoRenew ? (
                        <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <Text size="2" color="green">Yes</Text>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <Text size="2" color="gray">No</Text>
                        </>
                    )}
                </Flex>
            ),
            minWidth: '100px',
        },
        {
            name: 'Actions',
            cell: (row) => (
                <Flex align="center" gap="2">
                    {row.status === 'active' && (
                        <Tooltip content="Cancel subscription">
                            <IconButton
                                type="button"
                                variant="ghost"
                                color="red"
                                size="1"
                                disabled={actionLoading === row.branchSubscriptionId}
                                onClick={() => handleCancel(row)}
                            >
                                {actionLoading === row.branchSubscriptionId ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Ban className="w-4 h-4" />
                                )}
                            </IconButton>
                        </Tooltip>
                    )}
                    {row.status === 'cancelled' && (
                        <Tooltip content="Reactivate subscription">
                            <IconButton
                                type="button"
                                variant="ghost"
                                color="green"
                                size="1"
                                disabled={actionLoading === row.branchSubscriptionId}
                                onClick={() => handleReactivate(row)}
                            >
                                <RefreshCw className={`w-4 h-4 ${actionLoading === row.branchSubscriptionId ? 'animate-spin' : ''}`} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Flex>
            ),
            minWidth: '80px',
            right: true,
        },
    ];

    if (loading) {
        return <TableSkeleton columns={6} rows={5} />;
    }

    return (
        <DataTable
            columns={columns}
            data={subscriptions}
            customStyles={getTableStyles(mode)}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50]}
            noDataComponent={
                <Flex direction="column" align="center" py="8">
                    <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <Text as="p" size="4" weight="medium" mb="1">No Subscriptions Found</Text>
                    <Text as="p" size="2" color="gray" mb="4">
                        {tenantId
                            ? "This tenant doesn't have any branch subscriptions yet."
                            : "No subscriptions to display."
                        }
                    </Text>
                    {onSubscribe && tenantId && (
                        <Button onClick={onSubscribe}>Subscribe a Branch</Button>
                    )}
                </Flex>
            }
            highlightOnHover
            responsive
        />
    );
});

SubscriptionsTab.displayName = 'SubscriptionsTab';

export default SubscriptionsTab;
