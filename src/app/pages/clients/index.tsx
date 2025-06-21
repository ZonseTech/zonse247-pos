import AppLayout from '../../layouts/AppLayout';
import { HiOutlineMenuAlt4, HiOutlineSearch } from 'react-icons/hi';
import clientsService from '../../services/client.service';
import { Button, Input, ZonseThemeContext } from '../../components';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Edit2, Trash2, Building2, Globe, Phone, Mail } from 'lucide-react';
import { useState, useEffect, Fragment, useContext, FunctionComponent, ChangeEvent } from 'react';
import ClientFormModal from './partials/ClientFormModal';
import { Notify, Confirm } from 'notiflix';
import { HiOutlinePlus } from 'react-icons/hi2';

const ClientManagement: FunctionComponent = () => {
    const columns: Array<TableColumn<Client>> = [
        {
            name: "Client",
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                                {row?.companyName}
                            </div>
                            <div className="text-sm text-gray-500">
                                ID: {row?.clientCode}
                            </div>
                        </div>
                    </div>
                </Fragment>
            ),
        },
        {
            name: 'Owner & Contact',
            cell: (row) => (
                <Fragment>
                    <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                            {row?.ownerName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {row?.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {row?.phone}
                        </div>
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Location',
            cell: (row) => (
                <Fragment>
                    <div>
                        {row?.country && (
                            <div className="text-sm text-gray-900 flex items-center">
                                <Globe className="w-3 h-3 mr-1" />
                                {row?.country}
                            </div>
                        )}
                        <div className="text-sm text-gray-500">
                            {row?.timezone}
                        </div>
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Subscription',
            cell: (row) => (
                <Fragment>
                    <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionStatusColor(row?.subscriptionStatus)}`}>
                            {row?.subscriptionStatus?.charAt(0)?.toUpperCase() + row?.subscriptionStatus?.slice(1)}
                        </span>
                        {row?.subscriptionStatus === 'trial' && row?.trialEndsAt && (
                            <div className="text-xs text-gray-500 mt-1">
                                Ends: {new Date(row.trialEndsAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Status',
            cell: (row) => (
                <Fragment>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row?.status)}`}>
                        {row?.status?.charAt(0)?.toUpperCase() + row?.status?.slice(1)}
                    </span>
                </Fragment>
            )
        },
        {
            width: "15%",
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500' />,
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleEdit(row)}
                            disabled={row.uuid === '-1'}
                            className={`p-1 rounded transition-colors ${row.uuid === '-1'
                                ? 'text-gray-500'
                                : 'text-blue-600 hover:text-blue-800'
                                }`}
                            title="Edit client"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => toggleClientStatus(row?.uuid, row?.status)}
                            disabled={row.uuid === '-1'}
                            className={`text-xs px-2 py-1 rounded transition-colors ${row.uuid === '-1'
                                ? 'text-gray-500 bg-gray-100'
                                : row?.status === 'active'
                                    ? 'text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100'
                                    : 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100'
                                }`}
                            title={row?.status === 'active' ? 'Suspend client' : 'Activate client'}
                        >
                            {row?.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>

                        <button
                            onClick={() => handleDelete(row?.uuid, row?.companyName)}
                            disabled={row.uuid === '-1'}
                            className={`p-1 rounded transition-colors ${row.uuid === '-1'
                                ? 'text-gray-500'
                                : 'text-red-600 hover:text-red-800'
                                }`}
                            title="Delete client"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                </Fragment>
            )
        }
    ];

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const { mode } = useContext(ZonseThemeContext);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [clients, setClients] = useState<Client[]>([]);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [filteredClients, setFilteredClients] = useState<Array<Client>>([]);

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredClients(clients);
        } else {
            const filtered = clients.filter(client =>
                client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.country?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredClients(filtered);
        }
        setTotalRows(filteredClients.length);
        setPage(1);
    }, [searchTerm, clients]);

    const loadClients = async () => {
        try {
            setIsLoading(true);
            const data: Array<Client> = await clientsService.list();
            setClients(data);
            setFilteredClients(data);
            setTotalRows(data.length);
        } catch (error) {
            console.error('Error loading clients:', error);
            Notify.failure('Failed to load clients');
        } finally {
            setIsLoading(false);
        }
    };

    const saveClients = (updatedClients: Client[]) => {
        setClients(updatedClients);
        setFilteredClients(updatedClients);
        setTotalRows(updatedClients.length);
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setShowForm(true);
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredClients.slice(startIndex, endIndex);
    };

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handlePerRowsChange = (newPerPage: number, page: number) => {
        setPage(page);
        setPerPage(newPerPage);
    };

    const handleDelete = async (clientUuid: string, companyName: string) => {
        Confirm.show(
            'Delete Client',
            `Are you sure you want to delete the client "${companyName}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                try {
                    await clientsService.delete(clientUuid);
                    const updatedClients = clients.filter(client => client.uuid !== clientUuid);
                    saveClients(updatedClients);
                    Notify.success('Client deleted successfully');
                } catch (error) {
                    console.error('Error deleting client:', error);
                    Notify.failure('Failed to delete client');
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

    const toggleClientStatus = async (clientUuid: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        const action = newStatus === 'active' ? 'activate' : 'suspend';
        const client = clients.find(c => c.uuid === clientUuid);

        Confirm.show(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Client`,
            `Are you sure you want to ${action} the client "${client?.companyName}"?`,
            `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            'Cancel',
            async () => {
                try {
                    const updatedClientData = {
                        ...client,
                        status: newStatus
                    };

                    await clientsService.update(clientUuid, updatedClientData);

                    const updatedClients = clients.map(client =>
                        client.uuid === clientUuid
                            ? { ...client, status: newStatus as 'pending' | 'active' | 'suspended' | 'cancelled' }
                            : client
                    );
                    saveClients(updatedClients);

                    Notify.success(`Client ${action}d successfully`);
                } catch (error) {
                    console.error(`Error ${action}ing client:`, error);
                    Notify.failure(`Failed to ${action} client`);
                }
            },
            () => {
                // do nothing
            },
            {
                titleColor: newStatus === 'suspended' ? '#ef4444' : '#22c55e',
                okButtonBackground: newStatus === 'suspended' ? '#ef4444' : '#22c55e',
            }
        );
    };

    const getSubscriptionStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-800 bg-green-100';
            case 'trial': return 'text-blue-800 bg-blue-100';
            case 'suspended': return 'text-red-800 bg-red-100';
            case 'inactive': return 'text-gray-800 dark:text-gray-400 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-800 bg-green-100';
            case 'pending': return 'text-yellow-800 bg-green-100';
            case 'suspended': return 'text-red-800 bg-red-100';
            case 'cancelled': return 'text-gray-800 dark:text-gray-400 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleClientSaved = () => {
        loadClients();
        setShowForm(false);
        setEditingClient(null);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingClient(null);
    };

    const handleAddClientClicked = () => {
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
                                    <Building2 className="w-6 h-6 mr-2" />
                                    Clients ({filteredClients.length})
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Manage client accounts and subscriptions
                                </p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex relative">
                                    <Input
                                        type="text"
                                        placeholder="Search clients..."
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
                                        onClick={handleAddClientClicked}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white dark:text-gray-100 rounded-lg hover:bg-blue-700"
                                    >
                                        <HiOutlinePlus className="w-4 h-4 mr-2" />
                                        {'Add Client'}
                                    </Button>

                                    <ClientFormModal
                                        client={editingClient || undefined}
                                        isOpen={showForm}
                                        onClose={handleCloseForm}
                                        onClientSaved={handleClientSaved}
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
                                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {searchTerm ? 'No clients found matching your search.' : 'No clients found.'}
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

export default ClientManagement;