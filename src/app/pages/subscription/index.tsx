import { Confirm } from 'notiflix';
import { CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { HiOutlinePlus } from 'react-icons/hi2';
import AppLayout from '../../layouts/AppLayout';
import DataTable from 'react-data-table-component';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { SearchBar } from '../../components/page/SearchBar';
import { Button, ZonseThemeContext } from '../../components';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { FunctionComponent, useContext, useState } from 'react';
import { getSubscriptionColumns } from './partials/SubscriptionTableColumns';

const SubscriptionManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);
    const [editingSubscription, setEditingSubscription] = useState<TenantSubscription | null>(null);

    const {
        isLoading,
        searchTerm,
        setSearchTerm,
        totalRows,
        setPage,
        setPerPage,
        getPaginatedData,
        deleteSubscription,
        updateSubscriptionStatus
    } = useSubscriptions();

    const handleEdit = (subscription: TenantSubscription) => {
        setEditingSubscription(subscription);
    };

    const handleDelete = (subscriptionId: string) => {
        Confirm.show(
            'Delete Subscription',
            'Are you sure you want to delete this subscription? This action cannot be undone.',
            'Yes, Delete',
            'Cancel',
            async () => {
                await deleteSubscription(subscriptionId);
            },
            () => {
                // do nothing
            },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const handleStatusToggle = (subscriptionId: string, currentStatus: string) => {
        const action = currentStatus === 'active' ? 'cancel' : 'activate';
        const newStatus = currentStatus === 'active' ? 'cancelled' : 'active';

        Confirm.show(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Subscription`,
            `Are you sure you want to ${action} this subscription?`,
            `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            'Cancel',
            async () => {
                await updateSubscriptionStatus(subscriptionId, newStatus);
            },
            () => {
                // do nothing
            },
            {
                titleColor: currentStatus === 'active' ? '#ef4444' : '#22c55e',
                okButtonBackground: currentStatus === 'active' ? '#ef4444' : '#22c55e',
            }
        );
    };

    const columns = getSubscriptionColumns(handleEdit, handleStatusToggle, handleDelete);

    return (
        <AppLayout>
            <div className="min-h-screen max-w-full">
                <PageHeader
                    title='Subscriptions'
                    description='Manage tenants subscriptions and billing'
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <SearchBar
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={getPaginatedData()}
                    theme={mode as string}
                    progressPending={isLoading}
                    highlightOnHover
                    striped
                    responsive
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={(newPerPage, page) => {
                        setPage(page);
                        setPerPage(newPerPage);
                    }}
                    onChangePage={setPage}
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 350px)"
                    customStyles={getTableStyles(mode)}
                    noDataComponent={
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                <CreditCard className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {searchTerm ? 'No matching subscriptions' : 'No subscriptions yet'}
                            </h3>
                            <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                {searchTerm
                                    ?? 'Try adjusting your search terms or clear the search to see all subscriptions.'
                                }
                            </p>
                        </div>
                    }
                />
            </div>
        </AppLayout>
    );
};

export default SubscriptionManagement;