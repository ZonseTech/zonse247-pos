import { Confirm } from 'notiflix';
import { Monitor } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlinePlus, HiOutlineComputerDesktop, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { useTerminals } from '../../hooks/useTerminals';
import { FunctionComponent, useContext, useMemo } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext, ComponentLoader } from '../../components';
import { getTerminalColumns } from './partials/TerminalTableColumns';
import { TerminalMobileList } from './partials/TerminalMobileCard';
import TerminalSummaryCards, { TerminalSummaryCard } from './partials/TerminalSummaryCards';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';

const TerminalManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const {
        isLoading,
        searchTerm,
        setSearchTerm,
        totalRows,
        page,
        setPage,
        perPage,
        setPerPage,
        getPaginatedData,
        deleteTerminal,
        blockTerminal,
        unblockTerminal,
        setPrimary,
        syncTerminal,
        filteredTerminals
    } = useTerminals();

    // Calculate summary stats
    const summaryCards: TerminalSummaryCard[] = useMemo(() => {
        const allTerminals = filteredTerminals || [];
        const activeCount = allTerminals.filter(t => t.activationStatus === 'ACTIVATED').length;
        const inactiveCount = allTerminals.filter(t => t.activationStatus === 'DEACTIVATED' || t.activationStatus === 'PENDING').length;
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
    }, [filteredTerminals, totalRows]);

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
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                />
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
                        <div className='px-4 pb-4'>
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                            />
                        </div>
                    )}
                </PageHeader>

                {/* Main Content Container */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Summary Cards */}
                    <TerminalSummaryCards
                        cards={summaryCards}
                        isLoading={isLoading}
                    />

                    {/* Mobile View - Card List */}
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
                            ) : getPaginatedData().length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <Monitor className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {searchTerm ? 'No matching terminals' : 'No terminals yet'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {searchTerm
                                            ? "Try adjusting your search to find terminals."
                                            : "Add your first terminal to get started."
                                        }
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <TerminalMobileList
                                        terminals={getPaginatedData()}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onToggleBlock={handleToggleBlock}
                                        onSetPrimary={handleSetPrimary}
                                        onSync={handleSync}
                                        isLoading={false}
                                    />

                                    {/* Mobile Pagination */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {totalRows} total
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage(Math.max(1, page - 1))}
                                                disabled={page <= 1}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {page} / {Math.ceil(totalRows / perPage) || 1}
                                            </span>
                                            <button
                                                onClick={() => setPage(Math.min(Math.ceil(totalRows / perPage), page + 1))}
                                                disabled={page >= Math.ceil(totalRows / perPage)}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        /* Desktop View - Data Table */
                        <div className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={getPaginatedData()}
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
                                onChangeRowsPerPage={(newPerPage, page) => {
                                    setPage(page);
                                    setPerPage(newPerPage);
                                }}
                                onChangePage={setPage}
                                fixedHeader
                                fixedHeaderScrollHeight="calc(100vh - 420px)"
                                customStyles={getTableStyles(mode)}
                                noDataComponent={
                                    <div className="text-center py-12">
                                        <Monitor className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            {searchTerm ? 'No matching terminals' : 'No terminals found'}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first terminal.'}
                                        </p>
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
