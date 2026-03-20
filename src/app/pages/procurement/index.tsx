import { lazy, Suspense, useCallback, type FunctionComponent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { ComponentLoader } from '../../components';
import { ROUTES } from '../../utils/constants';

// ─── Lazy-loaded procurement sub-pages ─────────────────────────────────────────
const Suppliers = lazy(() => import('../suppliers'));
const PurchaseRequisitions = lazy(() => import('../purchase-requisitions'));
const PurchaseOrders = lazy(() => import('../purchase-orders'));
const GoodsReceipts = lazy(() => import('../goods-receipts'));
const SupplierInvoices = lazy(() => import('../supplier-invoices'));
const SupplierPayments = lazy(() => import('../supplier-payments'));
const SupplierReturns = lazy(() => import('../supplier-returns'));
const CreditNotes = lazy(() => import('../credit-notes'));

// ─── Tab definitions ───────────────────────────────────────────────────────────
const PROCUREMENT_TABS = [
    { id: 'suppliers', label: 'Suppliers', Component: Suppliers, route: ROUTES.SUPPLIERS },
    { id: 'requisitions', label: 'Requisitions', Component: PurchaseRequisitions, route: ROUTES.PURCHASE_REQUISITIONS },
    { id: 'purchase-orders', label: 'Purchase Orders', Component: PurchaseOrders, route: ROUTES.PURCHASE_ORDERS },
    { id: 'goods-receipts', label: 'Goods Receipts', Component: GoodsReceipts, route: ROUTES.GOODS_RECEIPTS },
    { id: 'invoices', label: 'Invoices', Component: SupplierInvoices, route: ROUTES.SUPPLIER_INVOICES },
    { id: 'payments', label: 'Payments', Component: SupplierPayments, route: ROUTES.SUPPLIER_PAYMENTS },
    { id: 'returns', label: 'Returns', Component: SupplierReturns, route: ROUTES.SUPPLIER_RETURNS },
    { id: 'credit-notes', label: 'Credit Notes', Component: CreditNotes, route: ROUTES.CREDIT_NOTES },
] as const;

type ProcurementTabId = (typeof PROCUREMENT_TABS)[number]['id'];
const DEFAULT_TAB: ProcurementTabId = 'suppliers';

// ─── Component ─────────────────────────────────────────────────────────────────

const ProcurementPage: FunctionComponent = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = (searchParams.get('tab') as ProcurementTabId) || DEFAULT_TAB;

    const handleTabChange = useCallback(
        (value: string) => {
            setSearchParams({ tab: value }, { replace: true });
        },
        [setSearchParams],
    );

    return (
        <AppLayout>
            <PageHeader
                icon={<ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                title="Procurement"
                description="Manage suppliers, orders, receipts, invoices and payments"
                compact
            />

            <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
                {/* Tab list — horizontally scrollable on mobile */}
                <Tabs.List className="-mx-4 md:-mx-6 px-4 md:px-6 flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 gap-0 scrollbar-none mb-4">
                    {PROCUREMENT_TABS.map((tab) => (
                        <Tabs.Trigger
                            key={tab.id}
                            value={tab.id}
                            className={
                                'flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 outline-none cursor-pointer whitespace-nowrap ' +
                                'text-gray-500 dark:text-gray-400 border-transparent ' +
                                'hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 ' +
                                'data-[state=active]:text-sky-500 dark:data-[state=active]:text-sky-400 ' +
                                'data-[state=active]:border-sky-500 dark:data-[state=active]:border-sky-400'
                            }
                        >
                            {tab.label}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>

                {/* Tab panels — each renders the existing page component */}
                {PROCUREMENT_TABS.map((tab) => (
                    <Tabs.Content
                        key={tab.id}
                        value={tab.id}
                        className="outline-none"
                        forceMount={undefined}
                    >
                        <Suspense fallback={<ComponentLoader loading={true} />}>
                            <tab.Component />
                        </Suspense>
                    </Tabs.Content>
                ))}
            </Tabs.Root>
        </AppLayout>
    );
};

export default ProcurementPage;
