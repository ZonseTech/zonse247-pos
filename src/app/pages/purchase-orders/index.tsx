import { FunctionComponent, useCallback, useState, useMemo } from 'react';
import { ShoppingCart, Plus, SlidersHorizontal, Users, ClipboardList, PackageCheck, FileText, Wallet, RotateCcw, CreditCard } from 'lucide-react';
import { Box, Button } from '@radix-ui/themes';
import { Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import FloatingHubNavButton, { type HubNavLink } from '../../components/buttons/FloatingHubNavButton';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { getPurchaseOrderTableColumns } from './partials/PurchaseOrderTableColumns';
import PurchaseOrderSummaryCards from './partials/PurchaseOrderSummaryCards';
import PurchaseOrderToolbar from './partials/PurchaseOrderToolbar';
import PurchaseOrderStatusFilter from './partials/PurchaseOrderStatusFilter';
import PurchaseOrderActiveFilterChips from './partials/PurchaseOrderActiveFilterChips';
import PurchaseOrderFilterSheet from './partials/PurchaseOrderFilterSheet';
import PurchaseOrderDesktopView from './partials/PurchaseOrderDesktopView';
import PurchaseOrderMobileView from './partials/PurchaseOrderMobileView';
import ReceiveModal from './partials/ReceiveModal';
import CreatePurchaseOrderModal from './partials/CreatePurchaseOrderModal';
import ViewPurchaseOrderModal from './partials/ViewPurchaseOrderModal';
import { ROUTES } from '../../utils/constants';
import type { POFormValues } from './partials/types';

const PurchaseOrderManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();

    const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
    const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

    const {
        purchaseOrders,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        createPurchaseOrder,
        sendPurchaseOrder,
        receivePurchaseOrder,
        cancelPurchaseOrder,
    } = usePurchaseOrders();

    const totalPages = Math.ceil(totalRows / perPage);

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

    const hasActiveFilters = useMemo(() => !!statusFilter || !!searchTerm, [statusFilter, searchTerm]);
    const activeFilterCount = useMemo(() => (statusFilter ? 1 : 0) + (searchTerm ? 1 : 0), [statusFilter, searchTerm]);

    const filteredPurchaseOrders = useMemo(() => {
        if (!searchTerm.trim()) return purchaseOrders;
        const q = searchTerm.toLowerCase();
        return purchaseOrders.filter(po =>
            po.poNumber?.toLowerCase().includes(q) ||
            po.supplier?.name?.toLowerCase().includes(q)
        );
    }, [purchaseOrders, searchTerm]);

    const handleAddPO = useCallback(() => setIsCreateOpen(true), []);

    const handleCreateSubmit = useCallback(async (values: POFormValues) => {
        await createPurchaseOrder({
            supplierId: values.supplierId,
            createdBy: '',
            expectedDeliveryDate: values.expectedDeliveryDate || undefined,
            notes: values.notes || undefined,
            items: values.items.map((item) => ({
                variantId: item.variantId,
                orderedQuantity: Number(item.orderedQuantity),
                unitPrice: Number(item.unitPrice),
                notes: item.notes || undefined,
            })),
        });
    }, [createPurchaseOrder]);

    const handleSend = useCallback(async (po: PurchaseOrder) => {
        Confirm.show('Send Purchase Order', `Send ${po.poNumber} to ${po.supplier?.name || 'supplier'}?`, 'Yes, Send', 'Cancel', async () => {
            await sendPurchaseOrder(po.id);
        });
    }, [sendPurchaseOrder]);

    const handleReceive = useCallback((po: PurchaseOrder) => setReceivingPO(po), []);

    const handleCancel = useCallback(async (po: PurchaseOrder) => {
        Confirm.show('Cancel Purchase Order', `Are you sure you want to cancel ${po.poNumber}?`, 'Yes, Cancel', 'No', async () => {
            await cancelPurchaseOrder(po.id);
        });
    }, [cancelPurchaseOrder]);

    const handleView = useCallback((po: PurchaseOrder) => setViewingPO(po), []);

    const handleStatusChange = useCallback((status: PurchaseOrderStatus | 'all') => {
        setStatusFilter(status === 'all' ? '' : status);
        setPage(1);
    }, [setStatusFilter, setPage]);

    const handleClearFilters = useCallback(() => { setStatusFilter(''); setSearchTerm(''); setPage(1); }, [setStatusFilter, setPage]);
    const handleClearSearch = useCallback(() => setSearchTerm(''), []);
    const handleClearStatus = useCallback(() => setStatusFilter(''), [setStatusFilter]);
    const handlePageChange = useCallback((p: number) => setPage(p), [setPage]);
    const handlePerRowsChange = useCallback((newPerPage: number, p: number) => { setPerPage(newPerPage); setPage(p); }, [setPerPage, setPage]);

    const columns = getPurchaseOrderTableColumns({
        onSend: handleSend,
        onReceive: handleReceive,
        onCancel: handleCancel,
        onView: handleView,
    });

    return (
        <AppLayout>
            {isMobile ? (
                <MobilePageHeader
                    title="Purchase Orders"
                    rightContent={
                        <Button size="2" onClick={handleAddPO}>
                            <Plus className="w-4 h-4" />
                            New Order
                        </Button>
                    }
                />
            ) : (
                <PageHeader
                    title="Purchase Orders"
                    description="Manage purchase orders and receive inventory"
                    icon={<ShoppingCart className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <Button size="2" onClick={handleAddPO}>
                            <Plus className="w-4 h-4" />
                            New Purchase Order
                        </Button>
                    }
                />
            )}

            <Box className="sm:rounded-lg shadow-sm border-y sm:border border-gray-200 dark:border-gray-700 sm:overflow-clip -mx-2 sm:mx-0">
                <PurchaseOrderToolbar
                    searchTerm={searchTerm}
                    onSearch={setSearchTerm}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onOpenFilters={() => setIsFilterSheetOpen(true)}
                    isMobile={isMobile}
                />

                {isMobile && hasActiveFilters && (
                    <PurchaseOrderActiveFilterChips
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        onClearSearch={handleClearSearch}
                        onClearStatus={handleClearStatus}
                        onClearAll={handleClearFilters}
                    />
                )}

                {!isMobile && (
                    <div
                        className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3"
                        role="group"
                        aria-label="Purchase order filters"
                    >
                        <PurchaseOrderStatusFilter
                            selectedStatus={(statusFilter || 'all') as PurchaseOrderStatus | 'all'}
                            onChange={handleStatusChange}
                        />
                    </div>
                )}

                <Box px={{ initial: '2', sm: '4' }}>
                    <PurchaseOrderSummaryCards
                        purchaseOrders={purchaseOrders}
                        totalRows={totalRows}
                        isLoading={isLoading}
                    />
                </Box>

                {isMobile ? (
                    <PurchaseOrderMobileView
                        data={purchaseOrders}
                        isLoading={isLoading}
                        hasActiveFilters={hasActiveFilters}
                        page={page}
                        totalPages={totalPages}
                        totalRows={totalRows}
                        perPage={perPage}
                        onSend={handleSend}
                        onReceive={handleReceive}
                        onCancel={handleCancel}
                        onView={handleView}
                        onPageChange={handlePageChange}
                        onClearFilters={handleClearFilters}
                    />
                ) : (
                    <PurchaseOrderDesktopView
                        columns={columns}
                        data={purchaseOrders}
                        isLoading={isLoading}
                        hasActiveFilters={hasActiveFilters}
                        perPage={perPage}
                        totalRows={totalRows}
                        onPageChange={handlePageChange}
                        onPerRowsChange={handlePerRowsChange}
                        onClearFilters={handleClearFilters}
                    />
                )}
            </Box>

            {isMobile && (
                <PurchaseOrderFilterSheet
                    isOpen={isFilterSheetOpen}
                    onClose={() => setIsFilterSheetOpen(false)}
                    statusFilter={statusFilter}
                    onStatusChange={(val) => setStatusFilter(val as PurchaseOrderStatus)}
                    hasActiveFilters={!!statusFilter}
                    onClearFilters={handleClearStatus}
                />
            )}

            {isMobile && (
                <button
                    onClick={() => setIsFilterSheetOpen(true)}
                    className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg
                             flex items-center justify-center active:scale-95 transition-transform
                             hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-200 dark:focus:ring-sky-900"
                    aria-label="Open filters"
                >
                    <SlidersHorizontal className="w-5 h-5" />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            )}

            {isMobile && <FloatingHubNavButton links={hubLinks} />}

            {receivingPO && (
                <ReceiveModal
                    purchaseOrder={receivingPO}
                    onClose={() => setReceivingPO(null)}
                    onReceive={receivePurchaseOrder}
                />
            )}

            {isCreateOpen && (
                <CreatePurchaseOrderModal
                    onClose={() => setIsCreateOpen(false)}
                    onSubmit={handleCreateSubmit}
                />
            )}

            {viewingPO && (
                <ViewPurchaseOrderModal
                    purchaseOrder={viewingPO}
                    onClose={() => setViewingPO(null)}
                />
            )}
        </AppLayout>
    );
};

export default PurchaseOrderManagement;
