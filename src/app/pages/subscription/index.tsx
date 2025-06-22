import AppLayout from '../../layouts/AppLayout';
import { HiOutlineMenuAlt4, HiOutlineSearch } from 'react-icons/hi';
import subscriptionsService from '../../services/subscriptions.service';
import { Button, Input, ZonseThemeContext } from '../../components';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Edit2, Trash2, CreditCard, Calendar, CheckCircle } from 'lucide-react';
import { useState, useEffect, Fragment, useContext, FunctionComponent, ChangeEvent } from 'react';
import SubscriptionFormModal from './partials/SubscriptionFormModal';
import { Notify, Confirm } from 'notiflix';
import { HiOutlinePlus } from 'react-icons/hi2';

const SubscriptionManagement: FunctionComponent = () => {
    const columns: Array<TableColumn<ClientSubscription>> = [
        {
            name: "Subscription",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 transition-colors">
                        <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {row?.clientDetails?.clientCode}
                        </div>
                        <div className="truncate text-xs text-gray-600 dark:text-gray-400">
                            Plan: {row?.planId}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            name: 'Client',
            cell: (row) => (
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {row?.clientDetails?.companyName}

                    <div className="truncate text-xs text-gray-600 dark:text-gray-400">
                        - {row?.clientDetails?.ownerName}
                    </div>
                </div>
            )
        },
        {
            name: 'Status',
            cell: (row) => (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${getStatusColor(row?.status)}`}>
                    <CheckCircle className="h-3 w-3" />
                    {row?.status?.charAt(0)?.toUpperCase() + row?.status?.slice(1)}
                </span>
            )
        },
        {
            name: 'Period',
            cell: (row) => (
                <div className="space-y-1 text-sm">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(row?.startsAt).toLocaleDateString()}
                    </div>
                    {row?.endsAt && (
                        <div className="text-gray-600 dark:text-gray-400">
                            to {new Date(row?.endsAt).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )
        },
        {
            name: 'Auto Renew',
            cell: (row) => (
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${row?.autoRenew
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                    {row?.autoRenew ? 'Yes' : 'No'}
                </span>
            )
        },
        {
            name: 'Payment Method',
            cell: (row) => (
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {row?.paymentMethod}
                </div>
            )
        },
        {
            name: 'Next Payment',
            cell: (row) => (
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {row?.nextPaymentDate ? new Date(row?.nextPaymentDate).toLocaleDateString() : 'N/A'}
                </div>
            )
        },
        {
            width: "20%",
            name: <HiOutlineMenuAlt4 className='h-5 w-5 text-gray-500 dark:text-gray-400' />,
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        disabled={row.uuid === '-1'}
                        className={`group rounded-lg p-2 transition-all duration-200 ${row.uuid === '-1'
                            ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                            : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
                            }`}
                        title="Edit subscription"
                    >
                        <Edit2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </button>

                    <button
                        onClick={() => toggleSubscriptionStatus(row?.uuid, row?.status)}
                        disabled={row.uuid === '-1'}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${row.uuid === '-1'
                            ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                            : row?.status === 'active'
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300'
                            }`}
                        title={row?.status === 'active' ? 'Cancel subscription' : 'Activate subscription'}
                    >
                        {row?.status === 'active' ? 'Cancel' : 'Activate'}
                    </button>

                    <button
                        onClick={() => handleDelete(row?.uuid)}
                        disabled={row.uuid === '-1'}
                        className={`group rounded-lg p-2 transition-all duration-200 ${row.uuid === '-1'
                            ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                            : 'text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
                            }`}
                        title="Delete subscription"
                    >
                        <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </button>
                </div>
            )
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
            case 'inactive':
            case 'cancelled':
                return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
            case 'past_due':
                return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
            case 'expired':
                return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
            default:
                return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const { mode } = useContext(ZonseThemeContext);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
    const [editingSubscription, setEditingSubscription] = useState<ClientSubscription | null>(null);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState<Array<ClientSubscription>>([]);

    useEffect(() => {
        loadSubscriptions();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredSubscriptions(subscriptions);
        } else {
            const filtered = subscriptions.filter(subscription =>
                subscription.uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subscription.clientUuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subscription.planId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subscription.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredSubscriptions(filtered);
        }
        setTotalRows(filteredSubscriptions.length);
        setPage(1);
    }, [searchTerm, subscriptions]);

    const loadSubscriptions = async () => {
        try {
            setIsLoading(true);
            const result = await subscriptionsService.list();

            const data = result.data

            setSubscriptions(result.data);
            setFilteredSubscriptions(data);
            setTotalRows(data.length);
        } catch (error) {
            console.error('Error loading subscriptions:', error);
            Notify.failure('Failed to load subscriptions');
        } finally {
            setIsLoading(false);
        }
    };

    const saveSubscriptions = (updatedSubscriptions: ClientSubscription[]) => {
        setSubscriptions(updatedSubscriptions);
        setFilteredSubscriptions(updatedSubscriptions);
        setTotalRows(updatedSubscriptions.length);
    };

    const handleEdit = (subscription: ClientSubscription) => {
        setEditingSubscription(subscription);
        setShowForm(true);
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredSubscriptions.slice(startIndex, endIndex);
    };

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handlePerRowsChange = (newPerPage: number, page: number) => {
        setPage(page);
        setPerPage(newPerPage);
    };

    const handleDelete = async (subscriptionId: string) => {
        Confirm.show(
            'Delete Subscription',
            `Are you sure you want to delete this subscription? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                try {
                    await subscriptionsService.delete(subscriptionId);

                    const updatedSubscriptions = subscriptions.filter(sub => sub.uuid !== subscriptionId);
                    saveSubscriptions(updatedSubscriptions);

                    Notify.success('Subscription deleted successfully');
                } catch (error) {
                    console.error('Error deleting subscription:', error);
                    Notify.failure('Failed to delete subscription');
                }
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

    const toggleSubscriptionStatus = async (subscriptionId: string, currentStatus: string) => {
        const action = currentStatus === 'active' ? 'cancel' : 'activate';
        const newStatus = currentStatus === 'active' ? 'cancelled' : 'active';
        const subscription = subscriptions.find(s => s.uuid === subscriptionId);

        Confirm.show(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Subscription`,
            `Are you sure you want to ${action} this subscription?`,
            `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            'Cancel',
            async () => {
                try {
                    const updatedSubscriptionData = {
                        ...subscription,
                        status: newStatus
                    };

                    await subscriptionsService.update(subscriptionId, updatedSubscriptionData as any);

                    const updatedSubscriptions = subscriptions.map(sub =>
                        sub.uuid === subscriptionId
                            ? { ...sub, status: newStatus as ClientSubscription['status'] }
                            : sub
                    );
                    saveSubscriptions(updatedSubscriptions);

                    Notify.success(`Subscription ${action}d successfully`);
                } catch (error) {
                    console.error(`Error ${action}ing subscription:`, error);
                    Notify.failure(`Failed to ${action} subscription`);
                }
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

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSubscriptionSaved = () => {
        loadSubscriptions();
        setShowForm(false);
        setEditingSubscription(null);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingSubscription(null);
    };

    const handleAddSubscriptionClicked = () => {
        setShowForm(!showForm);
    };

    return (
        <AppLayout>
            <div className="min-h-screen mx-auto max-w-full transition-colors">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-all">
                    <div className="border-b border-gray-200 bg-white px-6 py-5 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                        <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            Client Subscriptions
                                            <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                {filteredSubscriptions.length}
                                            </span>
                                        </h1>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            Manage client subscriptions and billing efficiently
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <HiOutlineSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="Search subscriptions..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="block w-full rounded-lg border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm placeholder-gray-500 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:w-64"
                                    />
                                </div>

                                <Button
                                    onClick={handleAddSubscriptionClicked}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-offset-gray-800"
                                >
                                    <HiOutlinePlus className="h-4 w-4" />
                                    Add Subscription
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800">
                        <div className="overflow-x-auto">
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
                                onChangeRowsPerPage={handlePerRowsChange}
                                onChangePage={handlePageChange}
                                fixedHeader
                                fixedHeaderScrollHeight="calc(100vh - 350px)"
                                customStyles={{
                                    table: {
                                        style: {
                                            backgroundColor: 'transparent',
                                        },
                                    },
                                    head: {
                                        style: {
                                            backgroundColor: 'rgb(249 250 251)',
                                            borderBottomColor: 'rgb(229 231 235)',
                                            color: 'rgb(55 65 81)',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                        },
                                    },
                                    headRow: {
                                        style: {
                                            backgroundColor: 'rgb(249 250 251)',
                                            borderBottomColor: 'rgb(229 231 235)',
                                            minHeight: '52px',
                                        },
                                    },
                                    rows: {
                                        style: {
                                            backgroundColor: 'transparent',
                                            borderBottomColor: 'rgb(243 244 246)',
                                            '&:nth-of-type(odd)': {
                                                backgroundColor: 'rgb(249 250 251)',
                                            },
                                            '&:hover': {
                                                backgroundColor: 'rgb(243 244 246)',
                                                transitionDuration: '0.15s',
                                            },
                                            minHeight: '64px',
                                        },
                                    },
                                    cells: {
                                        style: {
                                            paddingLeft: '24px',
                                            paddingRight: '24px',
                                            paddingTop: '16px',
                                            paddingBottom: '16px',
                                        },
                                    },
                                    pagination: {
                                        style: {
                                            backgroundColor: 'transparent',
                                            borderTopColor: 'rgb(229 231 235)',
                                            color: 'rgb(55 65 81)',
                                            fontSize: '14px',
                                        },
                                    },
                                }}
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
                                                ? 'Try adjusting your search terms or clear the search to see all subscriptions.'
                                                : 'Get started by creating your first client subscription.'
                                            }
                                        </p>
                                        {!searchTerm && (
                                            <Button
                                                onClick={handleAddSubscriptionClicked}
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                                            >
                                                <HiOutlinePlus className="h-4 w-4" />
                                                Add Your First Subscription
                                            </Button>
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    </div>

                    <SubscriptionFormModal
                        subscription={editingSubscription}
                        isOpen={showForm}
                        onClose={handleCloseForm}
                        onSubscriptionSaved={handleSubscriptionSaved}
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default SubscriptionManagement;