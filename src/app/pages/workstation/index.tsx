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
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center">
                        <div className="relative w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ring-1 ring-gray-300 dark:ring-gray-600">
                            <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            {row?.isPrimary && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 dark:bg-yellow-400 rounded-full flex items-center justify-center">
                                    <Star className="w-2.5 h-2.5 text-white fill-current" />
                                </div>
                            )}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                                <span className="truncate">{row?.tillName}</span>
                                {row?.isPrimary && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                                        Primary
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center">
                                    Till #{row?.tillNumber}
                                    <span className="mx-1">•</span>
                                    <span className="truncate">{row?.deviceType}</span>
                                </span>
                            </div>
                            {row?.ipAddress && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 dark:bg-green-500 rounded-full mr-1.5"></span>
                                    {row?.ipAddress}
                                </div>
                            )}
                        </div>
                    </div>
                </Fragment>
            ),
        },
        {
            name: 'Status',
            cell: (row) => (
                <Fragment>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row?.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotColor(row?.status)}`} />
                        {row?.status?.charAt(0)?.toUpperCase() + row?.status?.slice(1)}
                    </span>
                </Fragment>
            )
        },
        {
            name: 'Last Activity',
            cell: (row) => (
                <Fragment>
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {row?.lastActivity ? formatDate(row?.lastActivity) : 'Never'}
                        </div>
                        {row?.lastSync && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                <svg className="w-3 h-3 mr-1 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2A7.999 7.999 0 0019.417 15M15 15H9" />
                                </svg>
                                Synced: {formatDate(row?.lastSync)}
                            </div>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            width: "25%",
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500 dark:text-gray-400' />,
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center space-x-1">
                        {/* Sync Button */}
                        <button
                            onClick={() => handleSync(row?.uuid)}
                            disabled={row.uuid === '-1'}
                            className={`group p-2 rounded-lg transition-all duration-200 ${row.uuid === '-1'
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                                }`}
                            title="Sync workstation"
                        >
                            <FaSync className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" />
                        </button>

                        {/* Primary Toggle Button */}
                        <button
                            onClick={() => togglePrimary(row?.uuid, row?.isPrimary)}
                            disabled={row.uuid === '-1'}
                            className={`group p-2 rounded-lg transition-all duration-200 ${row.uuid === '-1'
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : row?.isPrimary
                                    ? 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                                }`}
                            title={row?.isPrimary ? 'Remove as primary' : 'Set as primary'}
                        >
                            {row?.isPrimary ? (
                                <Star className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                            ) : (
                                <StarOff className="w-4 h-4 transition-transform group-hover:scale-110" />
                            )}
                        </button>

                        {/* Edit Button */}
                        <button
                            onClick={() => handleEdit(row)}
                            disabled={row.uuid === '-1'}
                            className={`group p-2 rounded-lg transition-all duration-200 ${row.uuid === '-1'
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                                }`}
                            title="Edit workstation"
                        >
                            <Edit2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                        </button>

                        {/* Status Toggle Button */}
                        <button
                            onClick={() => toggleWorkstationStatus(row?.uuid, row?.status)}
                            disabled={row.uuid === '-1'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${row.uuid === '-1'
                                ? 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                                : getStatusActionColor(row?.status)
                                }`}
                            title="Change status"
                        >
                            {getStatusAction(row?.status)}
                        </button>

                        {/* Delete Button */}
                        <button
                            onClick={() => handleDelete(row?.uuid, row?.tillName)}
                            disabled={row.uuid === '-1'}
                            className={`group p-2 rounded-lg transition-all duration-200 ${row.uuid === '-1'
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                                }`}
                            title="Delete workstation"
                        >
                            <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                        </button>
                    </div>
                </Fragment>
            )
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700';
            case 'inactive':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700';
            case 'syncing':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
            case 'maintenance':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700';
            case 'error':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
        }
    };

    const getStatusDotColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-400 dark:bg-green-300';
            case 'inactive':
                return 'bg-red-400 dark:bg-red-300';
            case 'syncing':
                return 'bg-blue-400 dark:bg-blue-300';
            case 'maintenance':
                return 'bg-yellow-400 dark:bg-yellow-300';
            case 'error':
                return 'bg-red-400 dark:bg-red-300';
            default:
                return 'bg-gray-400 dark:bg-gray-500';
        }
    };

    const getStatusActionColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 focus:ring-red-500 dark:focus:ring-red-400';
            case 'inactive':
                return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 focus:ring-green-500 dark:focus:ring-green-400';
            case 'maintenance':
                return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 focus:ring-blue-500 dark:focus:ring-blue-400';
            default:
                return 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 focus:ring-gray-500 dark:focus:ring-gray-400';
        }
    };

    const getStatusAction = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'Take Offline';
            case 'inactive':
                return 'Bring Online';
            case 'maintenance':
                return 'Exit Maintenance';
            case 'error':
                return 'Reset';
            default:
                return 'Toggle Status';
        }
    };

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
                workstation.tillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workstation.tillNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workstation.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workstation.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workstation.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    const updatedWorkstations = workstations.map(ws => ({ ...ws, isPrimary: false }));
                    const finalWorkstations = updatedWorkstations.map(ws =>
                        ws.uuid === workstationId ? { ...ws, isPrimary: true } : ws
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
                        ? { ...ws, lastSync: result.lastSync, lastActivity: new Date().toISOString() }
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
            <div className="min-h-screen max-w-full bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-all">
                    <div className="border-b border-gray-200 bg-white px-6 py-5 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                                        <Monitor className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            Workstations
                                            <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                {filteredWorkstations.length}
                                            </span>
                                        </h1>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            Manage workstations and sync settings across your infrastructure
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
                                        placeholder="Search workstations..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="block w-full rounded-lg border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm placeholder-gray-500 shadow-sm transition-all focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400 sm:w-64"
                                    />
                                </div>

                                <Button
                                    onClick={handleAddWorkstationClicked}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-offset-gray-800"
                                >
                                    <HiOutlinePlus className="h-4 w-4" />
                                    Add Workstation
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
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            backgroundColor: mode === 'dark' ? 'rgb(31 41 55)' : 'rgb(249 250 251)',
                                            color: mode === 'dark' ? 'rgb(243 244 246)' : 'rgb(55 65 81)',
                                            borderBottomColor: mode === 'dark' ? 'rgb(55 65 81)' : 'rgb(229 231 235)',
                                        },
                                    },
                                    headRow: {
                                        style: {
                                            borderBottomColor: mode === 'dark' ? 'rgb(55 65 81)' : 'rgb(229 231 235)',
                                            minHeight: '52px',
                                            backgroundColor: mode === 'dark' ? 'rgb(31 41 55)' : 'rgb(249 250 251)',
                                        },
                                    },
                                    rows: {
                                        style: {
                                            minHeight: '64px',
                                            backgroundColor: 'transparent',
                                            color: mode === 'dark' ? 'rgb(243 244 246)' : 'rgb(55 65 81)',
                                            borderBottomColor: mode === 'dark' ? 'rgb(55 65 81)' : 'rgb(229 231 235)',
                                            '&:hover': {
                                                backgroundColor: mode === 'dark' ? 'rgb(55 65 81)' : 'rgb(249 250 251)',
                                                cursor: 'pointer',
                                            },
                                        },
                                        stripedStyle: {
                                            backgroundColor: mode === 'dark' ? 'rgb(31 41 55)' : 'rgb(248 250 252)',
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
                                            backgroundColor: mode === 'dark' ? 'rgb(31 41 55)' : 'rgb(249 250 251)',
                                            borderTopColor: mode === 'dark' ? 'rgb(55 65 81)' : 'rgb(229 231 235)',
                                            color: mode === 'dark' ? 'rgb(243 244 246)' : 'rgb(55 65 81)',
                                            fontSize: '14px',
                                            minHeight: '56px',
                                        },
                                        pageButtonsStyle: {
                                            borderRadius: '6px',
                                            height: '32px',
                                            width: '32px',
                                            padding: '4px',
                                            margin: '0 2px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            color: mode === 'dark' ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
                                            fill: mode === 'dark' ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
                                            backgroundColor: 'transparent',
                                            '&:hover:not(:disabled)': {
                                                backgroundColor: mode === 'dark' ? 'rgb(55 65 81)' : 'rgb(229 231 235)',
                                                color: mode === 'dark' ? 'rgb(243 244 246)' : 'rgb(17 24 39)',
                                            },
                                            '&:focus': {
                                                outline: 'none',
                                                boxShadow: mode === 'dark'
                                                    ? '0 0 0 2px rgb(59 130 246)'
                                                    : '0 0 0 2px rgb(37 99 235)',
                                            },
                                        },
                                    },
                                    progress: {
                                        style: {
                                            backgroundColor: mode === 'dark' ? 'rgb(31 41 55)' : 'rgb(255 255 255)',
                                        },
                                    },
                                }}
                                noDataComponent={
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                            <Monitor className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {searchTerm ? 'No matching workstations' : 'No workstations configured'}
                                        </h3>
                                        <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                            {searchTerm
                                                ? 'Try adjusting your search terms or clear the search to see all workstations.'
                                                : 'Get started by adding your first workstation to manage and sync settings.'
                                            }
                                        </p>
                                        {!searchTerm && (
                                            <Button
                                                onClick={handleAddWorkstationClicked}
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                                            >
                                                <HiOutlinePlus className="h-4 w-4" />
                                                Add Your First Workstation
                                            </Button>
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    </div>

                    <WorkstationFormModal
                        workstation={editingWorkstation || undefined}
                        isOpen={showForm}
                        onClose={handleCloseForm}
                        onWorkstationSaved={handleWorkstationSaved}
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default WorkstationManagement;