import { Notify, Confirm } from 'notiflix';
import { HiOutlinePlus } from 'react-icons/hi2';
import AppLayout from '../../layouts/AppLayout';
import WorkstationFormModal from './partials/WorkstationFormModal';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Button, Input, ZonseThemeContext } from '../../components';
import { HiOutlineMenuAlt4, HiOutlineSearch } from 'react-icons/hi';
import workstationsService from '../../services/workstation.service';
import { Edit2, Trash2, Monitor, Star, StarOff } from 'lucide-react';
import { useState, useEffect, Fragment, useContext, FunctionComponent, ChangeEvent } from 'react';
import { FaSync } from 'react-icons/fa';

const WorkstationManagement: FunctionComponent = () => {
    const columns: Array<TableColumn<Workstation>> = [
        {
            name: "Workstation",
            cell: (row) => (<Fragment>
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                            {row?.till_name}
                            {row?.is_primary && (
                                <Star className="w-4 h-4 text-yellow-500 ml-2 fill-current" />
                            )}
                        </div>
                        <div className="text-sm text-gray-500">
                            Till #{row?.till_number} • {row?.device_type}
                        </div>
                        {row?.ip_address && (
                            <div className="text-xs text-gray-400">{row?.ip_address}</div>
                        )}
                    </div>
                </div>
            </Fragment>),
        },
        {
            name: 'Status',
            cell: (row) => (<Fragment>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row?.status)}`}>
                    {row?.status?.charAt(0)?.toUpperCase() + row?.status?.slice(1)}
                </span>
            </Fragment>)
        },
        {
            name: 'Last Activity',
            cell: (row) => (<Fragment>
                <div className="text-sm text-gray-900">
                    {row?.last_activity ? formatDate(row?.last_activity) : 'Never'}
                </div>
                {row?.last_sync && (
                    <div className="text-xs text-gray-500">
                        Synced: {formatDate(row?.last_sync)}
                    </div>
                )}
            </Fragment>)
        },
        {
            width: "25%",
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500' />,
            cell: (row) => (<Fragment>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleSync(row?.uuid)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="Sync workstation"
                    >
                        <FaSync className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => togglePrimary(row?.uuid, row?.is_primary)}
                        className={`p-1 rounded transition-colors ${row?.is_primary
                            ? 'text-yellow-600 hover:text-yellow-800'
                            : 'text-gray-400 hover:text-yellow-600'
                            }`}
                        title={row?.is_primary ? 'Remove as primary' : 'Set as primary'}
                    >
                        {row?.is_primary ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="Edit workstation"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => toggleWorkstationStatus(row?.uuid, row?.status)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${getStatusActionColor(row?.status)}`}
                        title={`Change status`}
                    >
                        {getStatusAction(row?.status)}
                    </button>
                    <button
                        onClick={() => handleDelete(row?.uuid, row?.till_name)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title="Delete workstation"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </Fragment>)
        }
    ];

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const { mode } = useContext(ZonseThemeContext);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [workstations, setWorkstations] = useState<Workstation[]>([]);
    const [editingWorkstation, setEditingWorkstation] = useState<Workstation | null>(null);
    const [filteredWorkstations, setFilteredWorkstations] = useState<Array<Workstation>>([]);

    useEffect(() => {
        loadWorkstations();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredWorkstations(workstations);
        } else {
            const filtered = workstations.filter(workstation =>
                workstation.till_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workstation.till_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workstation.device_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workstation.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workstation.ip_address?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredWorkstations(filtered);
        }
        setTotalRows(filteredWorkstations.length);
        setPage(1);
    }, [searchTerm, workstations]);

    const loadWorkstations = async () => {
        try {
            setIsLoading(true);
            const data = await workstationsService.list();
            setWorkstations(data);
            setFilteredWorkstations(data);
            setTotalRows(data.length);
        } catch (error) {
            console.error('Error loading workstations:', error);
            Notify.failure('Failed to load workstations');
        } finally {
            setIsLoading(false);
        }
    };

    const saveWorkstations = (updatedWorkstations: Workstation[]) => {
        setWorkstations(updatedWorkstations);
        setFilteredWorkstations(updatedWorkstations);
        setTotalRows(updatedWorkstations.length);
    };

    const handleEdit = (workstation: Workstation) => {
        setEditingWorkstation(workstation);
        setShowForm(true);
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredWorkstations.slice(startIndex, endIndex);
    };

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handlePerRowsChange = (newPerPage: number, page: number) => {
        setPage(page);
        setPerPage(newPerPage);
    };

    const handleDelete = async (workstationId: string, tillName: string) => {
        Confirm.show(
            'Delete Workstation',
            `Are you sure you want to delete the workstation "${tillName}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                try {
                    await workstationsService.delete(workstationId);
                    const updatedWorkstations = workstations.filter(ws => ws.uuid !== workstationId);
                    saveWorkstations(updatedWorkstations);
                    Notify.success('Workstation deleted successfully');
                } catch (error) {
                    console.error('Error deleting workstation:', error);
                    Notify.failure('Failed to delete workstation');
                }
            },
            () => { },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const toggleWorkstationStatus = async (workstationId: string, currentStatus: string) => {
        const statusOptions = ['active', 'inactive', 'maintenance'];
        const currentIndex = statusOptions.indexOf(currentStatus);
        const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length];

        try {
            await workstationsService.updateStatus(workstationId, nextStatus as any);
            const updatedWorkstations = workstations.map(ws =>
                ws.uuid === workstationId ? { ...ws, status: nextStatus as any } : ws
            );
            saveWorkstations(updatedWorkstations);
            Notify.success(`Workstation status updated to ${nextStatus}`);
        } catch (error) {
            console.error('Error updating workstation status:', error);
            Notify.failure('Failed to update workstation status');
        }
    };

    const togglePrimary = async (workstationId: string, isPrimary: boolean) => {
        if (isPrimary) {
            Notify.info('This workstation is already set as primary');
            return;
        }

        Confirm.show(
            'Set Primary Workstation',
            'Are you sure you want to set this as the primary workstation?',
            'Yes, Set Primary',
            'Cancel',
            async () => {
                try {
                    const updatedWorkstations = workstations.map(ws => ({ ...ws, is_primary: false }));
                    const finalWorkstations = updatedWorkstations.map(ws =>
                        ws.uuid === workstationId ? { ...ws, is_primary: true } : ws
                    );

                    await workstationsService.setPrimary(workstationId);
                    saveWorkstations(finalWorkstations);
                    Notify.success('Primary workstation updated');
                } catch (error) {
                    console.error('Error setting primary workstation:', error);
                    Notify.failure('Failed to set primary workstation');
                }
            }
        );
    };

    const handleSync = async (workstationId: string) => {
        try {
            const result = await workstationsService.syncWorkstation(workstationId);
            if (result.status) {
                const updatedWorkstations = workstations.map(ws =>
                    ws.uuid === workstationId
                        ? { ...ws, last_sync: result.last_sync, last_activity: new Date().toISOString() }
                        : ws
                );
                saveWorkstations(updatedWorkstations);
                Notify.success('Workstation synced successfully');
            }
        } catch (error) {
            console.error('Error syncing workstation:', error);
            Notify.failure('Failed to sync workstation');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-800 bg-green-100';
            case 'inactive': return 'text-red-800 bg-red-100';
            case 'maintenance': return 'text-yellow-800 bg-yellow-100';
            default: return 'text-gray-800 bg-gray-100';
        }
    };

    const getStatusActionColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-yellow-600 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100';
            case 'inactive': return 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100';
            case 'maintenance': return 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100';
            default: return 'text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100';
        }
    };

    const getStatusAction = (status: string) => {
        switch (status) {
            case 'active': return 'Maintenance';
            case 'inactive': return 'Activate';
            case 'maintenance': return 'Activate';
            default: return 'Change';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleWorkstationSaved = () => {
        loadWorkstations();
        setShowForm(false);
        setEditingWorkstation(null);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingWorkstation(null);
    };

    const handleAddWorkstationClicked = () => {
        setShowForm(!showForm);
    };

    return (
        <AppLayout>
            <div className="p-6 max-w-full mx-auto bg-white">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Monitor className="w-6 h-6 mr-2" />
                            Workstation Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage workstations and sync settings
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={handleAddWorkstationClicked}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <HiOutlinePlus className="w-4 h-4 mr-2" />
                            Add Workstation
                        </Button>

                        <WorkstationFormModal
                            workstation={editingWorkstation || undefined}
                            isOpen={showForm}
                            onClose={handleCloseForm}
                            onWorkstationSaved={handleWorkstationSaved}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-md border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Workstations ({filteredWorkstations.length})
                            </h2>

                            <div className="flex relative">
                                <Input
                                    type="text"
                                    placeholder="Search workstations..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="rounded-md px-3 py-2.5 pr-10"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <HiOutlineSearch className="h-5 w-5 text-gray-400" />
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
                                    <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {searchTerm ? 'No workstations found matching your search.' : 'No workstations found.'}
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

export default WorkstationManagement;