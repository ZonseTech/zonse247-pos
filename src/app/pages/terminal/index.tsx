import { Confirm } from 'notiflix';
import { Monitor, Building2 } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlinePlus, HiOutlineComputerDesktop } from 'react-icons/hi2';
import MobilePagination from '../../components/MobilePagination';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { useTerminals } from '../../hooks/useTerminals';
import { FunctionComponent, useContext, useMemo, useState, useEffect } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext, ComponentLoader, Select } from '../../components';
import { getTerminalColumns } from './partials/TerminalTableColumns';
import { TerminalMobileList } from './partials/TerminalMobileCard';
import TerminalSummaryCards, { TerminalSummaryCard } from './partials/TerminalSummaryCards';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useAuth } from '../../context/AuthProvider';
import { hasRole } from '../../utils';
import branchService from '../../services/branch.service';

const TerminalManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);
    const { user: authUser } = useAuth();

    // Branch filter state
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(false);

    const canViewStats = useMemo(() => {
        return hasRole(authUser, 'admin');
    }, [authUser]);

    // Load branches for filter dropdown
    useEffect(() => {
        const loadBranches = async () => {
            setLoadingBranches(true);
            try {
                const data = await branchService.list();
                setBranches(data);
            } catch (error) {
                console.error('Error loading branches:', error);
            } finally {
                setLoadingBranches(false);
            }
        };
        loadBranches();
    }, []);

    const {
        terminals,
        isLoading,
        searchTerm,
        setSearchTerm,
        totalRows,
        page,
        setPage,
        perPage,
        handlePageChange,
        handlePerRowsChange,
        deleteTerminal,
        blockTerminal,
        unblockTerminal,
        setPrimary,
        syncTerminal,
    } = useTerminals({ branchId: selectedBranchId || undefined });

    const summaryCards: TerminalSummaryCard[] = useMemo(() => {
        const allTerminals = terminals || [];
        const activeCount = allTerminals.filter(t => t.activationStatus === 'ACTIVATED').length;
        const primaryCount = allTerminals.filter(t => t.isPrimary).length;
        const blockedCount = allTerminals.filter(t => t.isBlocked).length;

        return [
            {
                title: 'Total Terminals',
                value: totalRows,
                icon: 'total',
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Active',
                value: activeCount,
                icon: 'active',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Primary',
                value: primaryCount,
                icon: 'primary',
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
            {
                title: 'Blocked',
                value: blockedCount,
                icon: 'blocked',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-500 dark:text-red-400',
            },
        ];
    }, [terminals, totalRows]);

    const handleEdit = (terminal: Terminal) => {
        navigate(ROUTES.TERMINAL_FORM, { state: { terminalId: terminal.terminalId } });
    };

    const handleDelete = (terminalId: string, terminalLabel: string) => {
        Confirm.show(
            'Delete Terminal',
            `Are you sure you want to delete the terminal "${terminalLabel}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                await deleteTerminal(terminalId);
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

    const handleToggleBlock = (terminalId: string, isBlocked: boolean) => {
        if (isBlocked) {
            Confirm.show(
                'Unblock Terminal',
                'Are you sure you want to unblock this terminal?',
                'Yes, Unblock',
                'Cancel',
                async () => {
                    await unblockTerminal(terminalId);
                },
                () => {
                    // do nothing
                },
                {
                    titleColor: '#22c55e',
                    okButtonBackground: '#22c55e',
                }
            );
        } else {
            const reason = prompt('Please provide a reason for blocking this terminal:');
            if (reason) {
                blockTerminal(terminalId, reason);
            }
        }
    };

    const handleSetPrimary = (terminalId: string, branchId: string) => {
        Confirm.show(
            'Set Primary Terminal',
            'Are you sure you want to set this as the primary terminal for its branch?',
            'Yes, Set Primary',
            'Cancel',
            async () => {
                await setPrimary(terminalId, branchId);
            },
            () => {
                // do nothing
            },
            {
                titleColor: '#eab308',
                okButtonBackground: '#eab308',
            }
        );
    };

    const handleSync = (terminalId: string) => {
        Confirm.show(
            'Sync Terminal',
            'Are you sure you want to sync this terminal?',
            'Yes, Sync',
            'Cancel',
            async () => {
                await syncTerminal(terminalId);
            },
            () => {
                // do nothing
            },
            {
                titleColor: '#3b82f6',
                okButtonBackground: '#3b82f6',
            }
        );
    };

    const columns = getTerminalColumns(handleEdit, handleToggleBlock, handleDelete, handleSetPrimary, handleSync);

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title='Terminals'
                    description='Manage your terminal devices and settings'
                    icon={<HiOutlineComputerDesktop className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <div className='flex items-center justify-between gap-2'>
                            {!isMobile && (
                                <>
                                    <div className="relative min-w-[180px]">
                                        <Select
                                            value={selectedBranchId}
                                            onChange={(e) => setSelectedBranchId(e.target.value)}
                                            className="!py-2"
                                        >
                                            <option value="">All Branches</option>
                                            {branches.map((branch) => (
                                                <option key={branch.branchId} value={branch.branchId}>
                                                    {branch.branchName}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    <SearchBar
                                        value={searchTerm}
                                        onChange={setSearchTerm}
                                    />
                                </>
                            )}

                            <Button
                                onClick={() => navigate(ROUTES.TERMINAL_FORM)}
                                icon={HiOutlinePlus}
                                layout={isMobile ? 'outline' : 'primary'}
                                className="!px-3 sm:!px-4 !py-2 sm:!py-2.5"
                                theme='primary'
                            >
                                {!isMobile && <span className='hidden md:block'>
                                    Add Terminal
                                </span>}
                            </Button>
                        </div>
                    }
                >
                    {isMobile && (
                        <div className='px-4 pb-4 space-y-3'>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <Select
                                    value={selectedBranchId}
                                    onChange={(e) => setSelectedBranchId(e.target.value)}
                                    className="flex-1"
                                >
                                    <option value="">All Branches</option>
                                    {branches.map((branch) => (
                                        <option key={branch.branchId} value={branch.branchId}>
                                            {branch.branchName}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                            />
                        </div>
                    )}
                </PageHeader>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {canViewStats ? (
                        <TerminalSummaryCards
                            cards={summaryCards}
                            isLoading={isLoading}
                        />
                    ) : null}

                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <TerminalMobileList
                                    terminals={[]}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onToggleBlock={handleToggleBlock}
                                    onSetPrimary={handleSetPrimary}
                                    onSync={handleSync}
                                    isLoading={true}
                                />
                            ) : terminals.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <Monitor className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {searchTerm || selectedBranchId ? 'No matching terminals' : 'No terminals yet'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {searchTerm || selectedBranchId
                                            ? "Try adjusting your filters to find terminals."
                                            : "Add your first terminal to get started."
                                        }
                                    </p>
                                    {selectedBranchId && (
                                        <button
                                            onClick={() => setSelectedBranchId('')}
                                            className="mt-4 text-sm text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300"
                                        >
                                            Clear branch filter
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <TerminalMobileList
                                        terminals={terminals}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onToggleBlock={handleToggleBlock}
                                        onSetPrimary={handleSetPrimary}
                                        onSync={handleSync}
                                        isLoading={false}
                                    />

                                    <MobilePagination page={page} totalRows={totalRows} perPage={perPage} onPageChange={handlePageChange} />
                                </>
                            )}
                        </div>
                    ) : (
                        /* Desktop View - Data Table */
                        <div className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={terminals}
                                theme={mode as string}
                                progressPending={isLoading}
                                progressComponent={<ComponentLoader loading={isLoading} />}
                                highlightOnHover
                                striped
                                responsive
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                                onChangeRowsPerPage={handlePerRowsChange}
                                onChangePage={handlePageChange}
                                fixedHeader
                                fixedHeaderScrollHeight="calc(100vh - 420px)"
                                customStyles={getTableStyles(mode)}
                                noDataComponent={
                                    <div className="text-center py-12">
                                        <Monitor className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            {searchTerm || selectedBranchId ? 'No matching terminals' : 'No terminals found'}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchTerm || selectedBranchId
                                                ? 'Try adjusting your filters.'
                                                : 'Get started by adding your first terminal.'}
                                        </p>
                                        {selectedBranchId && (
                                            <button
                                                onClick={() => setSelectedBranchId('')}
                                                className="mt-4 text-sm text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300"
                                            >
                                                Clear branch filter
                                            </button>
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default TerminalManagement;
