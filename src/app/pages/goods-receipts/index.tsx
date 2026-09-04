import {
    FunctionComponent,
    useCallback,
    useContext,
    useState,
    useMemo,
} from 'react';
import {
    Package,
    Clock,
    CheckCircle2,
    FileCheck,
    Plus,
    FilterX,
    Users,
    ClipboardList,
    ShoppingCart,
    PackageCheck,
    FileText,
    Wallet,
    RotateCcw,
    CreditCard,
} from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import dayjs from 'dayjs';
import { Box, Flex, Text, Select, Button, IconButton } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import FloatingHubNavButton, { type HubNavLink } from '../../components/buttons/FloatingHubNavButton';
import PageHeader from '../../components/page/PageHeader';
import MobilePagination from '../../components/MobilePagination';
import { getTableStyles } from '../../utils/table-styles';
import { SearchBar } from '../../components/SearchBar';
import MobileDateFilter from '../../components/reports/MobileDateFilter';
import {
    ZonseThemeContext,
    ComponentLoader,
    ProcurementSummaryCards,
} from '../../components';
import type { ProcurementSummaryCard } from '../../components';
import { useGoodsReceipts } from '../../hooks/useGoodsReceipts';
import { getGoodsReceiptTableColumns } from './partials/GoodsReceiptTableColumns';
import { GoodsReceiptMobileList } from './partials/GoodsReceiptMobileCard';
import GoodsReceiptFormModal from './partials/GoodsReceiptFormModal';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Confirm } from 'notiflix';

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'POSTED', label: 'Posted' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const GoodsReceiptManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const { mode } = useContext(ZonseThemeContext);

    const [formState, setFormState] = useState<{
        goodsReceiptId?: string;
    } | null>(null);

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
        searchTerm,
        setSearchTerm,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        loadGoodsReceipts,
        verifyGoodsReceipt,
        postGoodsReceipt,
        cancelGoodsReceipt,
    } = useGoodsReceipts();

    const hubLinks: HubNavLink[] = useMemo(() => [
        { id: 'suppliers', label: 'Suppliers', path: ROUTES.SUPPLIERS, icon: <Users className="w-4 h-4" /> },
        { id: 'requisitions', label: 'Requisitions', path: ROUTES.PURCHASE_REQUISITIONS, icon: <ClipboardList className="w-4 h-4" /> },
        { id: 'purchase-orders', label: 'Purchase Orders', path: ROUTES.PURCHASE_ORDERS, icon: <ShoppingCart className="w-4 h-4" /> },
        { id: 'goods-receipts', label: 'Goods Receipts', path: ROUTES.GOODS_RECEIPTS, icon: <PackageCheck className="w-4 h-4" /> },
        { id: 'invoices', label: 'Invoices', path: ROUTES.SUPPLIER_INVOICES, icon: <FileText className="w-4 h-4" /> },
        { id: 'payments', label: 'Payments', path: ROUTES.SUPPLIER_PAYMENTS, icon: <Wallet className="w-4 h-4" /> },
        { id: 'returns', label: 'Returns', path: ROUTES.SUPPLIER_RETURNS, icon: <RotateCcw className="w-4 h-4" /> },
        { id: 'credit-notes', label: 'Credit Notes', path: ROUTES.CREDIT_NOTES, icon: <CreditCard className="w-4 h-4" /> },
    ], []);

    const hasActiveFilters = useMemo(
        () => !!statusFilter || !!searchTerm || !!dateFrom || !!dateTo,
        [statusFilter, searchTerm, dateFrom, dateTo]
    );

    const summaryCards: ProcurementSummaryCard[] = useMemo(() => {
        const draftCount = goodsReceipts.filter(
            (g) => g.status === 'DRAFT',
        ).length;
        const verifiedCount = goodsReceipts.filter(
            (g) => g.status === 'VERIFIED',
        ).length;
        const postedCount = goodsReceipts.filter(
            (g) => g.status === 'POSTED',
        ).length;

        return [
            {
                title: 'Total Receipts',
                value: totalRows,
                icon: Package,
                bgColor: 'bg-teal-50 dark:bg-teal-900/20',
                iconBgColor: 'bg-teal-100 dark:bg-teal-900/40',
                textColor: 'text-teal-500 dark:text-teal-400',
            },
            {
                title: 'Draft',
                value: draftCount,
                icon: Clock,
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
            {
                title: 'Verified',
                value: verifiedCount,
                icon: CheckCircle2,
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                iconBgColor: 'bg-blue-100 dark:bg-blue-900/40',
                textColor: 'text-blue-500 dark:text-blue-400',
            },
            {
                title: 'Posted',
                value: postedCount,
                icon: FileCheck,
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
        ];
    }, [goodsReceipts, totalRows]);

    const handleAddGRN = useCallback(() => setFormState({}), []);

    const handleView = useCallback((grn: GoodsReceiptWithItems) => {
        setFormState({ goodsReceiptId: grn.id });
    }, []);

    const handleVerify = useCallback(
        (grn: GoodsReceiptWithItems) => {
            Confirm.show(
                'Verify Goods Receipt',
                `Verify ${grn.receiptNumber}? This confirms the received quantities are correct.`,
                'Yes, Verify',
                'Cancel',
                async () => {
                    await verifyGoodsReceipt(grn.id);
                },
            );
        },
        [verifyGoodsReceipt],
    );

    const handlePost = useCallback(
        (grn: GoodsReceiptWithItems) => {
            Confirm.show(
                'Post Goods Receipt',
                `Post ${grn.receiptNumber}? This will update inventory stock levels. This action cannot be undone.`,
                'Yes, Post',
                'Cancel',
                async () => {
                    await postGoodsReceipt(grn.id);
                },
            );
        },
        [postGoodsReceipt],
    );

    const handleCancel = useCallback(
        (grn: GoodsReceiptWithItems) => {
            Confirm.show(
                'Cancel Goods Receipt',
                `Are you sure you want to cancel ${grn.receiptNumber}?`,
                'Yes, Cancel',
                'No',
                async () => {
                    await cancelGoodsReceipt(grn.id);
                },
            );
        },
        [cancelGoodsReceipt],
    );

    const handleDateChange = useCallback((start: Date | null, end: Date | null) => {
        setDateFrom(start ? dayjs(start).format('YYYY-MM-DD') : '');
        setDateTo(end ? dayjs(end).format('YYYY-MM-DD') : '');
        setPage(1);
    }, [setDateFrom, setDateTo, setPage]);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
        setSearchTerm('');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    }, [setStatusFilter, setSearchTerm, setDateFrom, setDateTo, setPage]);

    const handlePageChange = useCallback((p: number) => setPage(p), [setPage]);

    const handlePerRowsChange = useCallback(
        (newPerPage: number, p: number) => {
            setPerPage(newPerPage);
            setPage(p);
        },
        [setPerPage, setPage],
    );

    const columns = getGoodsReceiptTableColumns({
        onView: handleView,
        onVerify: handleVerify,
        onPost: handlePost,
        onCancel: handleCancel,
    });

    const content = (
        <>
            <Box className="max-w-full">
                <PageHeader
                    icon={
                        <Package className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500 dark:text-teal-400" />
                    }
                    title="Goods Receipts"
                    description="Record and verify received goods against purchase orders"
                    action={
                        <Flex
                            direction={{ initial: 'column', sm: 'row' }}
                            gap={{ initial: '2', sm: '3' }}
                            align="center"
                        >
                            <Select.Root
                                value={statusFilter || 'all'}
                                onValueChange={(val) => {
                                    setStatusFilter(
                                        val === 'all'
                                            ? ''
                                            : (val as GRNStatusType),
                                    );
                                    setPage(1);
                                }}
                            >
                                <Select.Trigger
                                    variant="surface"
                                    placeholder="All Status"
                                    className="w-full sm:w-48"
                                />
                                <Select.Content position="popper">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <Select.Item
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>

                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    color="red"
                                    size="2"
                                    onClick={handleClearFilters}
                                >
                                    <FilterX className="w-4 h-4" />
                                    Clear
                                </Button>
                            )}

                            {isMobile ? (
                                <IconButton
                                    variant="outline"
                                    size="2"
                                    onClick={handleAddGRN}
                                    aria-label="New Goods Receipt"
                                >
                                    <Plus className="w-4 h-4" />
                                </IconButton>
                            ) : (
                                <Button size="2" onClick={handleAddGRN}>
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden md:inline">
                                        New GRN
                                    </span>
                                </Button>
                            )}
                        </Flex>
                    }
                />

                <Flex
                    align="center"
                    gap="3"
                    px="4"
                    py="3"
                    className="bg-white dark:bg-gray-800/50 border-x border-t border-gray-200 dark:border-gray-700 rounded-t-lg"
                >
                    <SearchBar
                        placeholder="Search receipt#, PO#, supplier..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        debounce={400}
                        className="flex-1 max-w-xs"
                    />

                    <Box className="ml-auto">
                        <MobileDateFilter
                            startDate={dateFrom ? new Date(dateFrom) : null}
                            endDate={dateTo ? new Date(dateTo) : null}
                            onChange={handleDateChange}
                            align="right"
                        />
                    </Box>
                </Flex>

                <Box className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Box px="4">
                        <ProcurementSummaryCards
                            cards={summaryCards}
                            isLoading={isLoading}
                        />
                    </Box>

                    {isMobile ? (
                        <Box className="overflow-hidden">
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
                                <Flex
                                    direction="column"
                                    align="center"
                                    justify="center"
                                    py="9"
                                    px="4"
                                >
                                    <Flex
                                        align="center"
                                        justify="center"
                                        className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4"
                                    >
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </Flex>
                                    <Text
                                        as="p"
                                        size="4"
                                        weight="medium"
                                        align="center"
                                        className="text-gray-900 dark:text-white mb-2"
                                    >
                                        {hasActiveFilters
                                            ? 'No matching goods receipts'
                                            : 'No goods receipts yet'}
                                    </Text>
                                    <Text
                                        as="p"
                                        size="2"
                                        color="gray"
                                        align="center"
                                        className="max-w-sm"
                                    >
                                        {hasActiveFilters
                                            ? 'Try adjusting your filters.'
                                            : 'Create a GRN from an existing purchase order.'}
                                    </Text>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            color="teal"
                                            size="2"
                                            mt="4"
                                            onClick={handleClearFilters}
                                        >
                                            Clear filters
                                        </Button>
                                    )}
                                </Flex>
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
                                    <MobilePagination
                                        page={page}
                                        totalRows={totalRows}
                                        perPage={perPage}
                                        onPageChange={setPage}
                                    />
                                </>
                            )}
                        </Box>
                    ) : (
                        <Box className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={goodsReceipts}
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
                                    <Flex
                                        direction="column"
                                        align="center"
                                        justify="center"
                                        py="9"
                                        className="dark:bg-gray-800 flex-1"
                                    >
                                        <Flex
                                            align="center"
                                            justify="center"
                                            className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700"
                                        >
                                            <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </Flex>
                                        <Text
                                            as="p"
                                            size="4"
                                            weight="bold"
                                            className="mt-4 text-gray-900 dark:text-gray-100"
                                        >
                                            {hasActiveFilters
                                                ? 'No matching goods receipts'
                                                : 'No goods receipts yet'}
                                        </Text>
                                        <Text
                                            as="p"
                                            size="2"
                                            color="gray"
                                            align="center"
                                            className="mt-2 max-w-sm"
                                        >
                                            {hasActiveFilters
                                                ? 'Try adjusting your filters.'
                                                : 'Create a GRN from an existing purchase order.'}
                                        </Text>
                                    </Flex>
                                }
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            {isMobile && <FloatingHubNavButton links={hubLinks} />}

            {formState && (
                <GoodsReceiptFormModal
                    goodsReceiptId={formState.goodsReceiptId}
                    onClose={() => setFormState(null)}
                    onSaved={loadGoodsReceipts}
                />
            )}
        </>
    );

    return isMobile ? <AppLayout>{content}</AppLayout> : content;
};

export default GoodsReceiptManagement;
