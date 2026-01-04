import { FC, useState, useContext, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import DataTable, { type Themes } from 'react-data-table-component';
import ReturnDetailsModal from './partials/ReturnDetailsModal';
import RestockItemsModal from './partials/RestockItemsModal';
import Filters from './partials/Filters';
import { useReturns } from '../../hooks/useReturns';
import { getTableStyles } from '../../utils/table-styles';
import { getReturnColumns } from './partials/ReturnTableColumns';
import { ZonseThemeContext } from '../../components';
import { useIsMobile } from '../../hooks/useMediaQuery';
import SearchBar from '../../components/SearchBar';

const ReturnsPage: FC = () => {
    const isMobile = useIsMobile();
    const { mode } = useContext(ZonseThemeContext);
    const {
        isLoading,
        searchTerm,
        totalRows,
        activeFilter,
        getPaginatedData,
        getSummaryData,
        handleSearch,
        handleClearFilters,
        handlePageChange,
        handlePerRowsChange,
        cancelReturn,
        loadReturns
    } = useReturns();

    const [selectedReturn, setSelectedReturn] = useState<ReturnDetails | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

    const handleViewDetails = useCallback((returnData: ReturnDetails) => {
        setSelectedReturn(returnData);
        setIsDetailsModalOpen(true);
    }, []);

    const handleRestock = useCallback((returnData: ReturnDetails) => {
        setSelectedReturn(returnData);
        setIsRestockModalOpen(true);
    }, []);

    const handleCancelReturn = useCallback((returnTransactionId: string, refNumber: string) => {
        Confirm.show(
            'Cancel Return',
            `Are you sure you want to cancel return ${refNumber}? This action cannot be undone.`,
            'Yes, Cancel',
            'No',
            async () => {
                await cancelReturn(returnTransactionId, refNumber);
            },
            () => { },
            {
                okButtonBackground: '#ef4444',
            }
        );
    }, [cancelReturn]);

    const handleRestockSuccess = useCallback(() => {
        loadReturns();
    }, [loadReturns]);

    const columns = getReturnColumns(handleViewDetails, handleRestock, handleCancelReturn);
    const summaryData = getSummaryData();

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<RotateCcw className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
                    title="Returns & Refunds"
                    description="Manage product returns, process refunds, and track restock status"
                >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4">
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <SearchBar
                                value={searchTerm}
                                onChange={handleSearch}
                                onClear={() => handleSearch('')}
                                placeholder="Search by return ID, transaction, or customer..."
                                className="w-full sm:w-64"
                            />
                        </div>

                        <Filters
                            summaryData={summaryData}
                            activeFilter={activeFilter}
                            onClear={handleClearFilters}
                        />
                    </div>
                </PageHeader>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <DataTable
                        columns={columns}
                        data={getPaginatedData()}
                        theme={mode as Themes}
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
                        fixedHeaderScrollHeight="calc(100vh - 380px)"
                        customStyles={getTableStyles(mode)}
                        noDataComponent={
                            <div className="flex flex-col items-center justify-center py-12 dark:bg-gray-800 flex-1">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                    <RotateCcw className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {searchTerm ? 'No matching returns' : 'No returns yet'}
                                </h3>
                                <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                    {searchTerm
                                        ? 'Try adjusting your search terms or clear the search to see all returns.'
                                        : 'Returns will appear here when customers return items.'
                                    }
                                </p>
                            </div>
                        }
                    />
                </div>
            </div>

            {selectedReturn && (
                <>
                    <ReturnDetailsModal
                        isOpen={isDetailsModalOpen}
                        onClose={() => {
                            setIsDetailsModalOpen(false);
                            setSelectedReturn(null);
                        }}
                        returnDetails={selectedReturn}
                    />

                    <RestockItemsModal
                        isOpen={isRestockModalOpen}
                        onClose={() => {
                            setIsRestockModalOpen(false);
                            setSelectedReturn(null);
                        }}
                        returnDetails={selectedReturn}
                        onSuccess={handleRestockSuccess}
                    />
                </>
            )}
        </AppLayout>
    );
};

export default ReturnsPage;
