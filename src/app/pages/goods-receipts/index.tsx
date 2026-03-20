import { FunctionComponent, useCallback, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Package, Settings2, Clock, CheckCircle2, FileCheck, Plus, X } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../components/TableEmptyState';
import SummaryCards, { type SummaryCardItem } from '../../components/stats/SummaryCards';
import MobilePagination from '../../components/MobilePagination';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext, Select } from '../../components';
import { useGoodsReceipts } from '../../hooks/useGoodsReceipts';
import { getGoodsReceiptTableColumns } from './partials/GoodsReceiptTableColumns';
import { GoodsReceiptMobileList } from './partials/GoodsReceiptMobileCard';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Confirm } from 'notiflix';

const GoodsReceiptManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const [selectedRows, setSelectedRows] = useState<GoodsReceiptWithItems[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);

    const {
        goodsReceipts,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        verifyGoodsReceipt,
        postGoodsReceipt,
        cancelGoodsReceipt,
    } = useGoodsReceipts();

    const hasActiveFilters = useMemo(() => !!statusFilter, [statusFilter]);

    // Summary cards
    const summaryCards: SummaryCardItem[] = useMemo(() => {
        const draftCount = goodsReceipts.filter(g => g.status === 'DRAFT').length;
        const verifiedCount = goodsReceipts.filter(g => g.status === 'VERIFIED').length;
        const postedCount = goodsReceipts.filter(g => g.status === 'POSTED').length;

        return [
            {
                title: 'Total Receipts',
                value: totalRows,
                icon: <Package className="w-5 h-5" />,
                bgColor: 'bg-teal-50 dark:bg-teal-900/20',
                iconBgColor: 'bg-teal-100 dark:bg-teal-900/40',
                textColor: 'text-teal-500 dark:text-teal-400',
            },
            {
                title: 'Draft',
                value: draftCount,
                icon: <Clock className="w-5 h-5" />,
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
            {
                title: 'Verified',
                value: verifiedCount,
                icon: <CheckCircle2 className="w-5 h-5" />,
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                iconBgColor: 'bg-blue-100 dark:bg-blue-900/40',
                textColor: 'text-blue-500 dark:text-blue-400',
            },
            {
                title: 'Posted',
                value: postedCount,
                icon: <FileCheck className="w-5 h-5" />,
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
        ];
    }, [goodsReceipts, totalRows]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAddGRN = useCallback(() => {
        navigate(ROUTES.GOODS_RECEIPT_FORM);
    }, [navigate]);

    const handleView = useCallback((grn: GoodsReceiptWithItems) => {
        navigate(ROUTES.GOODS_RECEIPT_FORM, { state: { goodsReceiptId: grn.id } });
    }, [navigate]);

    const handleVerify = useCallback((grn: GoodsReceiptWithItems) => {
        Confirm.show(
            'Verify Goods Receipt',
            `Verify ${grn.receiptNumber}? This confirms the received quantities are correct.`,
            'Yes, Verify',
            'Cancel',
            async () => {
                await verifyGoodsReceipt(grn.id);
            },
        );
    }, [verifyGoodsReceipt]);

    const handlePost = useCallback((grn: GoodsReceiptWithItems) => {
        Confirm.show(
            'Post Goods Receipt',
            `Post ${grn.receiptNumber}? This will update inventory stock levels. This action cannot be undone.`,
            'Yes, Post',
            'Cancel',
            async () => {
                await postGoodsReceipt(grn.id);
            },
        );
    }, [postGoodsReceipt]);

    const handleCancel = useCallback((grn: GoodsReceiptWithItems) => {
        Confirm.show(
            'Cancel Goods Receipt',
            `Are you sure you want to cancel ${grn.receiptNumber}?`,
            'Yes, Cancel',
            'No',
            async () => {
                await cancelGoodsReceipt(grn.id);
            },
        );
    }, [cancelGoodsReceipt]);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
    }, [setStatusFilter]);

    const handleRowSelected = useCallback((state: { selectedRows: GoodsReceiptWithItems[] }) => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handlePageChange = useCallback((p: number) => setPage(p), [setPage]);

    const handlePerRowsChange = useCallback((newPerPage: number, p: number) => {
        setPerPage(newPerPage);
        setPage(p);
    }, [setPerPage, setPage]);

    const columns = getGoodsReceiptTableColumns({
        onView: handleView,
        onVerify: handleVerify,
        onPost: handlePost,
        onCancel: handleCancel,
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<Package className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500 dark:text-teal-400" />}
                    title="Goods Receipts"
                    description="Record and verify received goods against purchase orders"
                    action={
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as GRNStatusType | '')}
                                className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-colors w-full sm:w-48"
                            >
                                <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    All Status
                                </option>
                                <option value="DRAFT" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Draft
                                </option>
                                <option value="VERIFIED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Verified
                                </option>
                                <option value="POSTED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Posted
                                </option>
                                <option value="CANCELLED" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Cancelled
                                </option>
                            </Select>

                            {selectedRows.length > 0 && !isMobile && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-md">
                                    <Settings2 className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                                    <span className="text-sm font-medium text-teal-900 dark:text-teal-100">
                                        {selectedRows.length} selected
                                    </span>
                                </div>
                            )}

                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Clear</span>
                                </button>
                            )}
                            <Button
                                icon={Plus}
                                layout={isMobile ? 'outline' : 'primary'}
                                onClick={handleAddGRN}
                                className="!px-3 sm:!px-4 !py-2 sm:!py-2.5"
                                theme="primary"
                            >
                                {!isMobile && <span className="hidden md:block">New GRN</span>}
                            </Button>
                        </div>
                    }
                />

                {/* Main content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <SummaryCards
                        cards={summaryCards}
                        isLoading={isLoading}
                        skeletonCount={4}
                        variant="embedded"
                    />

                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <GoodsReceiptMobileList
                                    goodsReceipts={[]}
                                    onView={handleView}
                                    onVerify={handleVerify}
                                    onPost={handlePost}
                                    onCancel={handleCancel}
                                    isLoading={true}
                                />
                            ) : goodsReceipts.length === 0 ? (
                                <TableEmptyState
                                    icon={<Package />}
                                    title={hasActiveFilters ? 'No matching goods receipts' : 'No goods receipts yet'}
                                    description={
                                        hasActiveFilters
                                            ? 'Try adjusting your filters.'
                                            : 'Create a GRN from an existing purchase order.'
                                    }
                                    action={
                                        hasActiveFilters ? (
                                            <button
                                                onClick={handleClearFilters}
                                                className="text-teal-500 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-medium text-sm"
                                            >
                                                Clear filters
                                            </button>
                                        ) : undefined
                                    }
                                />
                            ) : (
                                <>
                                    <GoodsReceiptMobileList
                                        goodsReceipts={goodsReceipts}
                                        onView={handleView}
                                        onVerify={handleVerify}
                                        onPost={handlePost}
                                        onCancel={handleCancel}
                                        isLoading={false}
                                    />
                                    <MobilePagination page={page} totalRows={totalRows} perPage={perPage} onPageChange={setPage} />
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={goodsReceipts}
                                theme={mode as Themes}
                                progressPending={isLoading}
                                progressComponent={<TableSkeleton rows={10} columns={6} showCheckbox showActions />}
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                                onChangeRowsPerPage={handlePerRowsChange}
                                onChangePage={handlePageChange}
                                customStyles={getTableStyles(mode)}
                                highlightOnHover
                                responsive
                                fixedHeader
                                selectableRows
                                selectableRowsHighlight
                                onSelectedRowsChange={handleRowSelected}
                                clearSelectedRows={toggleCleared}
                                persistTableHead
                                noDataComponent={
                                    <TableEmptyState
                                        icon={<Package />}
                                        title={hasActiveFilters ? 'No matching goods receipts' : 'No goods receipts yet'}
                                        description={
                                            hasActiveFilters
                                                ? 'Try adjusting your filters.'
                                                : 'Create a GRN from an existing purchase order.'
                                        }
                                    />
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default GoodsReceiptManagement;
