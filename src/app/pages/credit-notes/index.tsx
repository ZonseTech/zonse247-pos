import {
    FunctionComponent,
    useCallback,
    useContext,
    useState,
    useMemo,
} from 'react';
import { Receipt } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePagination from '../../components/MobilePagination';
import { HiOutlineFilter } from 'react-icons/hi';
import { getTableStyles } from '../../utils/table-styles';
import {
    Button,
    ZonseThemeContext,
    Select,
    ComponentLoader,
} from '../../components';
import { useCreditNotes } from '../../hooks/useCreditNotes';
import { getCreditNoteTableColumns } from './partials/CreditNoteTableColumns';
import { CreditNoteMobileList } from './partials/CreditNoteMobileCard';
import CreditNoteSummaryCards from './partials/CreditNoteSummaryCards';
import SupplierReturnFormModal from '../supplier-returns/partials/SupplierReturnFormModal';
import { useIsMobile } from '../../hooks/useMediaQuery';

const CreditNoteManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const { mode } = useContext(ZonseThemeContext);

    const [viewingReturnId, setViewingReturnId] = useState<string | null>(null);

    const {
        creditNotes,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        loadCreditNotes,
    } = useCreditNotes();

    const hasActiveFilters = useMemo(() => !!statusFilter, [statusFilter]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleView = useCallback((cn: SupplierCreditNote) => {
        if (cn.supplierReturnId) {
            setViewingReturnId(cn.supplierReturnId);
        }
    }, []);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
    }, [setStatusFilter]);

    const handlePageChange = useCallback((p: number) => setPage(p), [setPage]);

    const handlePerRowsChange = useCallback(
        (newPerPage: number, p: number) => {
            setPerPage(newPerPage);
            setPage(p);
        },
        [setPerPage, setPage],
    );

    const columns = getCreditNoteTableColumns({ onView: handleView });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={
                        <Receipt className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500 dark:text-teal-400" />
                    }
                    title="Credit Notes"
                    description="Track credit notes from supplier returns"
                    action={
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value as
                                            | CreditNoteStatusType
                                            | '',
                                    )
                                }
                                className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-colors w-full sm:w-48"
                            >
                                <option
                                    value=""
                                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    All Status
                                </option>
                                <option
                                    value="PENDING"
                                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    Pending
                                </option>
                                <option
                                    value="APPLIED"
                                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    Applied
                                </option>
                                <option
                                    value="CANCELLED"
                                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    Cancelled
                                </option>
                            </Select>

                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700"
                                >
                                    <HiOutlineFilter className="w-4 h-4" />
                                    <span>Clear</span>
                                </button>
                            )}
                        </div>
                    }
                />

                {/* Main content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4">
                        <CreditNoteSummaryCards
                            creditNotes={creditNotes}
                            isLoading={isLoading}
                        />
                    </div>

                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <CreditNoteMobileList
                                    creditNotes={[]}
                                    onView={handleView}
                                    isLoading={true}
                                />
                            ) : creditNotes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <Receipt className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {hasActiveFilters
                                            ? 'No matching credit notes'
                                            : 'No credit notes yet'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {hasActiveFilters
                                            ? 'Try adjusting your filters.'
                                            : 'Credit notes are generated when supplier returns are completed.'}
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="mt-4 text-teal-500 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-medium text-sm"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <CreditNoteMobileList
                                        creditNotes={creditNotes}
                                        onView={handleView}
                                        isLoading={false}
                                    />
                                    <MobilePagination
                                        page={page}
                                        totalRows={totalRows}
                                        perPage={perPage}
                                        onPageChange={setPage}
                                    />
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={creditNotes}
                                theme={mode as Themes}
                                progressPending={isLoading}
                                progressComponent={
                                    <ComponentLoader loading={isLoading} />
                                }
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[
                                    10, 15, 25, 50, 100,
                                ]}
                                onChangeRowsPerPage={handlePerRowsChange}
                                onChangePage={handlePageChange}
                                customStyles={getTableStyles(mode)}
                                highlightOnHover
                                striped
                                responsive
                                persistTableHead
                                noDataComponent={
                                    <div className="flex flex-col items-center justify-center py-12 dark:bg-gray-800 flex-1">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                            <Receipt className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {hasActiveFilters
                                                ? 'No matching credit notes'
                                                : 'No credit notes yet'}
                                        </h3>
                                        <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                            {hasActiveFilters
                                                ? 'Try adjusting your filters.'
                                                : 'Credit notes are generated when supplier returns are completed.'}
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            {viewingReturnId && (
                <SupplierReturnFormModal
                    returnId={viewingReturnId}
                    onClose={() => setViewingReturnId(null)}
                    onSaved={loadCreditNotes}
                />
            )}
        </AppLayout>
    );
};

export default CreditNoteManagement;
