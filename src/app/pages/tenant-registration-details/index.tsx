import { Confirm } from 'notiflix';
import { ClipboardList } from 'lucide-react';
import { HiOutlineRefresh } from 'react-icons/hi';
import AppLayout from '../../layouts/AppLayout';
import { SearchBar } from './partials/SearchBar';
import DataTable from 'react-data-table-component';
import { FunctionComponent, useContext } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext } from '../../components';
import { getDetailColumns } from './partials/DetailTableColumns';
import { DetailViewModal } from './partials/DetailViewModal';
import { useTenantRegistrationDetails } from '../../hooks/useTenantRegistrationDetails';

const TenantRegistrationDetails: FunctionComponent = () => {
    const { mode } = useContext(ZonseThemeContext);
    const {
        isLoading,
        searchTerm,
        setSearchTerm,
        processedFilter,
        setProcessedFilter,
        totalRows,
        setPage,
        setPerPage,
        getPaginatedData,
        deleteDetail,
        markAsProcessed,
        viewDetail,
        selectedDetail,
        isViewModalOpen,
        closeViewModal,
        refreshData,
    } = useTenantRegistrationDetails();

    const handleView = (detailId: string) => viewDetail(detailId);

    const handleMarkProcessed = (detailId: string) => {
        Confirm.show(
            'Mark as Processed',
            'Are you sure you want to mark this registration detail as processed?',
            'Yes, Mark Processed',
            'Cancel',
            async () => {
                await markAsProcessed(detailId);
            },
            () => {
                // do nothing
            },
            {
                titleColor: '#22c55e',
                okButtonBackground: '#22c55e',
            }
        );
    };

    const handleDelete = (detailId: string, name: string) => {
        Confirm.show(
            'Delete Registration Detail',
            `Are you sure you want to delete the registration detail for "${name}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                await deleteDetail(detailId);
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

    const columns = getDetailColumns(handleView, handleMarkProcessed, handleDelete);

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title='Registration Details'
                    description='View and manage tenant registration details'
                    icon={<ClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
                    action={
                        <div className="flex items-center space-x-4">
                            <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                            {/* Filter Dropdown */}
                            <select
                                value={processedFilter === null ? 'all' : processedFilter ? 'processed' : 'pending'}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === 'all') setProcessedFilter(null);
                                    else if (value === 'processed') setProcessedFilter(true);
                                    else setProcessedFilter(false);
                                }}
                                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending Only</option>
                                <option value="processed">Processed Only</option>
                            </select>

                            <div className="flex items-center space-x-3">
                                <Button
                                    onClick={refreshData}
                                    theme='neutral'
                                >
                                    <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                    {'Refresh'}
                                </Button>
                            </div>
                        </div>
                    }
                />
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
                            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                                {searchTerm
                                    ? 'No registration details found matching your search.'
                                    : processedFilter === false
                                        ? 'No pending registration details.'
                                        : processedFilter === true
                                            ? 'No processed registration details.'
                                            : 'No registration details found.'
                                }
                            </p>
                        </div>
                    }
                />

                {/* Detail View Modal */}
                <DetailViewModal
                    isOpen={isViewModalOpen}
                    detail={selectedDetail}
                    onClose={closeViewModal}
                    onMarkProcessed={markAsProcessed}
                />
            </div>
        </AppLayout>
    );
};

export default TenantRegistrationDetails;
