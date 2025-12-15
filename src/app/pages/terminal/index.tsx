import { Confirm } from 'notiflix';
import { Monitor } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlinePlus } from 'react-icons/hi2';
import { SearchBar } from './partials/SearchBar';
import DataTable from 'react-data-table-component';
import { useTerminals } from '../../hooks/useTerminals';
import { FunctionComponent, useContext } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext } from '../../components';
import { getTerminalColumns } from './partials/TerminalTableColumns';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';

const TerminalManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const {
        isLoading,
        searchTerm,
        setSearchTerm,
        totalRows,
        setPage,
        setPerPage,
        getPaginatedData,
        deleteTerminal,
        blockTerminal,
        unblockTerminal,
        setPrimary,
        syncTerminal
    } = useTerminals();

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
                >
                    <div className="flex items-center space-x-4">
                        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={() => navigate(ROUTES.TERMINAL_FORM)}
                                theme='primary'
                            >
                                <HiOutlinePlus className="w-4 h-4 mr-2" />
                                {'Add Terminal'}
                            </Button>
                        </div>
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
                        <div className="text-center py-8">
                            <Monitor className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'No terminal(s) found matching your search.' : 'No terminals found.'}
                            </p>
                        </div>
                    }
                />
            </div>
        </AppLayout>
    );
};

export default TerminalManagement;
