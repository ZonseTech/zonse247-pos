import { FunctionComponent, useCallback, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ClipboardList, Settings2 } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus } from 'react-icons/hi2';
import { HiOutlineFilter } from 'react-icons/hi';
import MobilePagination from '../../components/MobilePagination';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext, Select, ComponentLoader } from '../../components';
import { usePurchaseRequisitions } from '../../hooks/usePurchaseRequisitions';
import { getRequisitionTableColumns } from './partials/RequisitionTableColumns';
import { RequisitionMobileList } from './partials/RequisitionMobileCard';
import RequisitionSummaryCards, { RequisitionSummaryCard } from './partials/RequisitionSummaryCards';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import ApproveModal from './partials/ApproveModal';
import RejectModal from './partials/RejectModal';
import { Confirm } from 'notiflix';

const PurchaseRequisitionManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const [selectedRows, setSelectedRows] = useState<PurchaseRequisitionWithItems[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);
    const [approvingReq, setApprovingReq] = useState<PurchaseRequisitionWithItems | null>(null);
    const [rejectingReq, setRejectingReq] = useState<PurchaseRequisitionWithItems | null>(null);

    const {
        requisitions,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        approveRequisition,
        rejectRequisition,
        cancelRequisition,
    } = usePurchaseRequisitions();

    const hasActiveFilters = useMemo(() => {
        return !!statusFilter;
    }, [statusFilter]);

    // Calculate summary stats
    const summaryCards: RequisitionSummaryCard[] = useMemo(() => {
        const pendingCount = requisitions.filter(r => r.status === 'PENDING').length;
        const approvedCount = requisitions.filter(r => r.status === 'APPROVED').length;
        const partialApprovedCount = requisitions.filter(r => r.status === 'PARTIALLY_APPROVED').length;
        const rejectedCount = requisitions.filter(r => r.status === 'REJECTED').length;

        return [
            {
                title: 'Total Requisitions',
                value: totalRows,
                icon: 'total',
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Pending',
                value: pendingCount,
                icon: 'pending',
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
            {
                title: 'Approved',
                value: approvedCount,
                icon: 'approved',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Partially Approved',
                value: partialApprovedCount,
                icon: 'approved',
                bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
                iconBgColor: 'bg-cyan-100 dark:bg-cyan-900/40',
                textColor: 'text-cyan-500 dark:text-cyan-400',
            },
            {
                title: 'Rejected',
                value: rejectedCount,
                icon: 'rejected',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-500 dark:text-red-400',
            },
        ];
    }, [requisitions, totalRows]);

    const handleAddRequisition = useCallback(() => {
        navigate(ROUTES.PURCHASE_REQUISITION_FORM);
    }, [navigate]);

    const handleApprove = useCallback((req: PurchaseRequisitionWithItems) => {
        setApprovingReq(req);
    }, []);

    const handleReject = useCallback((req: PurchaseRequisitionWithItems) => {
        setRejectingReq(req);
    }, []);

    const handleCancel = useCallback(async (req: PurchaseRequisitionWithItems) => {
        Confirm.show(
            'Cancel Requisition',
            `Are you sure you want to cancel ${req.requisitionNumber}?`,
            'Yes, Cancel',
            'No',
            async () => {
                await cancelRequisition(req.id);
            }
        );
    }, [cancelRequisition]);

    const handleView = useCallback((req: PurchaseRequisitionWithItems) => {
        navigate(ROUTES.PURCHASE_REQUISITION_FORM, { state: { requisitionId: req.id } });
    }, [navigate]);

    const handleCreatePO = useCallback((req: PurchaseRequisitionWithItems) => {
        navigate(ROUTES.PURCHASE_ORDER_FORM, { state: { requisitionId: req.id } });
    }, [navigate]);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
    }, [setStatusFilter]);

    const handleRowSelected = useCallback((state: { selectedRows: PurchaseRequisitionWithItems[] }) => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setPage(page);
    }, [setPage]);

    const handlePerRowsChange = useCallback((newPerPage: number, page: number) => {
        setPerPage(newPerPage);
        setPage(page);
    }, [setPerPage, setPage]);

    const columns = getRequisitionTableColumns({
        onApprove: handleApprove,
        onReject: handleReject,
        onCancel: handleCancel,
        onView: handleView,
        onCreatePO: handleCreatePO,
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                    title="Purchase Requisitions"
                    description="Request and manage stock requisitions before raising purchase orders"
                    action={
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as RequisitionStatusType | '')}
                                className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 transition-colors w-full sm:w-48"
                            >
                                <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    All Status
                                </option>
                                <option value="PENDING" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Pending
                                </option>
                                <option value="APPROVED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Approved
                                </option>
                                <option value="PARTIALLY_APPROVED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Partially Approved
                                </option>
                                <option value="REJECTED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Rejected
                                </option>
                                <option value="CANCELLED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Cancelled
                                </option>
                            </Select>

                            {selectedRows.length > 0 && !isMobile && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-md">
                                    <Settings2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                    <span className="text-sm font-medium text-sky-900 dark:text-sky-100">
                                        {selectedRows.length} selected
                                    </span>
                                </div>
                            )}

                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700"
                                >
                                    <HiOutlineFilter className="w-4 h-4" />
                                    <span>Clear</span>
                                </button>
                            )}
                            <Button
                                icon={HiOutlinePlus}
                                layout={isMobile ? 'outline' : 'primary'}
                                onClick={handleAddRequisition}
                                className="!px-3 sm:!px-4 !py-2 sm:!py-2.5"
                                theme="primary">
                                {!isMobile && <span className='hidden md:block'>
                                    New Requisition
                                </span>}
                            </Button>
                        </div>
                    }
                />

                {/* Main Content Container */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Summary Cards */}
                    <RequisitionSummaryCards
                        cards={summaryCards}
                        isLoading={isLoading}
                    />

                    {/* Mobile View - Card List */}
                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <RequisitionMobileList
                                    requisitions={[]}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onCancel={handleCancel}
                                    onView={handleView}
                                    onCreatePO={handleCreatePO}
                                    isLoading={true}
                                />
                            ) : requisitions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <ClipboardList className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {hasActiveFilters ? 'No matching requisitions' : 'No requisitions yet'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {hasActiveFilters
                                            ? "Try adjusting your filters to see requisitions."
                                            : "Get started by creating your first purchase requisition."}
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="mt-4 text-sky-500 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium text-sm"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <RequisitionMobileList
                                        requisitions={requisitions}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                        onCancel={handleCancel}
                                        onView={handleView}
                                        onCreatePO={handleCreatePO}
                                        isLoading={false}
                                    />

                                    <MobilePagination page={page} totalRows={totalRows} perPage={perPage} onPageChange={setPage} />
                                </>
                            )}
                        </div>
                    ) : (
                        /* Desktop View - Data Table */
                        <div className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={requisitions}
                                theme={mode as Themes}
                                progressPending={isLoading}
                                progressComponent={<ComponentLoader loading={isLoading} />}
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                                onChangeRowsPerPage={handlePerRowsChange}
                                onChangePage={handlePageChange}
                                customStyles={getTableStyles(mode)}
                                highlightOnHover
                                striped
                                responsive
                                fixedHeader
                                selectableRows
                                selectableRowsHighlight
                                onSelectedRowsChange={handleRowSelected}
                                clearSelectedRows={toggleCleared}
                                fixedHeaderScrollHeight="calc(100vh - 480px)"
                                persistTableHead
                                noDataComponent={
                                    <div className="flex flex-col items-center justify-center py-12 dark:bg-gray-800 flex-1">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                            <ClipboardList className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {hasActiveFilters ? 'No matching requisitions' : 'No requisitions yet'}
                                        </h3>
                                        <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                            {hasActiveFilters
                                                ? 'Try adjusting your filters to see requisitions.'
                                                : 'Get started by creating your first purchase requisition.'
                                            }
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            {approvingReq && (
                <ApproveModal
                    requisition={approvingReq}
                    onClose={() => setApprovingReq(null)}
                    onApprove={approveRequisition}
                />
            )}

            {rejectingReq && (
                <RejectModal
                    requisition={rejectingReq}
                    onClose={() => setRejectingReq(null)}
                    onReject={rejectRequisition}
                />
            )}
        </AppLayout>
    );
};

export default PurchaseRequisitionManagement;
