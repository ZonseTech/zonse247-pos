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
            cell: (row) => (<Fragment>
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {row?.uuid}
                        </div>
                        <div className="text-sm text-gray-500">
                            Plan: {row?.planId}
                        </div>
                    </div>
                </div>
            </Fragment>),
        },
        {
            name: 'Client',
            cell: (row) => (<Fragment>
                <div className="text-sm text-gray-900">{row?.clientUuid}</div>
            </Fragment>)
        },
        {
            name: 'Status',
            cell: (row) => (<Fragment>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row?.status)}`}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {row?.status?.charAt(0)?.toUpperCase() + row?.status?.slice(1)}
                </span>
            </Fragment>)
        },
        {
            name: 'Period',
            cell: (row) => (<Fragment>
                <div className="text-sm">
                    <div className="text-gray-900">
                        {new Date(row?.startsAt).toLocaleDateString()}
                    </div>
                    {row?.endsAt && (
                        <div className="text-gray-500">
                            to {new Date(row?.endsAt).toLocaleDateString()}
                        </div>
                    )}
                </div>
            </Fragment>)
        },
        {
            name: 'Auto Renew',
            cell: (row) => (<Fragment>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row?.autoRenew ? 'text-green-800 bg-green-100' : 'text-gray-800 dark:text-gray-400 bg-gray-100'}`}>
                    {row?.autoRenew ? 'Yes' : 'No'}
                </span>
            </Fragment>)
        },
        {
            name: 'Next Payment',
            cell: (row) => (<Fragment>
                <div className="text-sm text-gray-900">
                    {row?.nextPaymentDate ? new Date(row?.nextPaymentDate).toLocaleDateString() : 'N/A'}
                </div>
            </Fragment>)
        },
        {
            width: "20%",
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500' />,
            cell: (row) => (<Fragment>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        disabled={row.uuid === '-1'}
                        className={`p-1 rounded transition-colors ${row.uuid === '-1'
                            ? 'text-gray-500'
                            : 'text-blue-600 hover:text-blue-800'
                            }`}
                        title="Edit subscription"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => toggleSubscriptionStatus(row?.uuid, row?.status)}
                        disabled={row.uuid === '-1'}
                        className={`text-xs px-2 py-1 rounded transition-colors ${row.uuid === '-1'
                            ? 'text-gray-500 bg-gray-100'
                            : row?.status === 'active'
                                ? 'text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100'
                                : 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100'
                            }`}
                        title={row?.status === 'active' ? 'Cancel subscription' : 'Activate subscription'}
                    >
                        {row?.status === 'active' ? 'Cancel' : 'Activate'}
                    </button>

                    <button
                        onClick={() => handleDelete(row?.uuid)}
                        disabled={row.uuid === '-1'}
                        className={`p-1 rounded transition-colors ${row.uuid === '-1'
                            ? 'text-gray-500'
                            : 'text-red-600 hover:text-red-800'
                            }`}
                        title="Delete subscription"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </Fragment>)
        }
    ]

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-800 bg-green-100';
            case 'cancelled': return 'text-red-800 bg-red-100';
            case 'expired': return 'text-orange-800 bg-orange-100';
            case 'past_due': return 'text-yellow-800 bg-green-100';
            default: return 'text-gray-800 dark:text-gray-400 bg-gray-100';
        }
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
            <div className="min-h-screen max-w-full mx-auto bg-white dark:bg-gray-700">
                <div className="bg-white dark:bg-gray-700 rounded-md border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-400 flex items-center">
                                    <CreditCard className="w-6 h-6 mr-2" />
                                    Client Subscriptions ({filteredSubscriptions.length})
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Manage client subscriptions and billing
                                </p>
                            </div>

                            <div className='flex items-center space-x-4'>
                                <div className="flex relative">
                                    <Input
                                        type="text"
                                        placeholder="Search subscriptions..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="rounded-md px-3 py-2.5 pr-10"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Button
                                        onClick={handleAddSubscriptionClicked}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white dark:text-gray-100 rounded-lg hover:bg-green-700"
                                    >
                                        <HiOutlinePlus className="w-4 h-4 mr-2" />
                                        {'Add Subscription'}
                                    </Button>

                                    <SubscriptionFormModal
                                        subscription={editingSubscription}
                                        isOpen={showForm}
                                        onClose={handleCloseForm}
                                        onSubscriptionSaved={handleSubscriptionSaved}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

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
                            noDataComponent={
                                <div className="text-center py-8">
                                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {searchTerm ? 'No subscriptions found matching your search.' : 'No subscriptions found.'}
                                    </p>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default SubscriptionManagement;