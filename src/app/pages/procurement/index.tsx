import * as Tabs from '@radix-ui/react-tabs';
import { ROUTES } from '../../utils/constants';
import AppLayout from '../../layouts/AppLayout';
import { ComponentLoader } from '../../components';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Suspense, useCallback, useEffect, useMemo, type FunctionComponent } from 'react';
import { HubProvider } from '../../context/HubContext';
import { useAuth } from '../../context/AuthProvider';
import { hasAnyPermission, hasPermission } from '../../utils';

const PROCUREMENT_TABS = [
    { id: 'suppliers', label: 'Suppliers', path: ROUTES.PROCUREMENT_SUPPLIERS, canAccess: (user: User | null) => hasPermission(user, 'suppliers.view') },
    { id: 'requisitions', label: 'Requisitions', path: ROUTES.PROCUREMENT_REQUISITIONS, canAccess: (user: User | null) => hasPermission(user, 'suppliers.orders') },
    { id: 'purchase-orders', label: 'Purchase Orders', path: ROUTES.PROCUREMENT_PURCHASE_ORDERS, canAccess: (user: User | null) => hasPermission(user, 'suppliers.orders') },
    { id: 'goods-receipts', label: 'Goods Receipts', path: ROUTES.PROCUREMENT_GOODS_RECEIPTS, canAccess: (user: User | null) => hasAnyPermission(user, ['suppliers.orders', 'inventory.receive']) },
    { id: 'invoices', label: 'Invoices', path: ROUTES.PROCUREMENT_INVOICES, canAccess: (user: User | null) => hasPermission(user, 'suppliers.orders') },
    { id: 'payments', label: 'Payments', path: ROUTES.PROCUREMENT_PAYMENTS, canAccess: (user: User | null) => hasAnyPermission(user, ['payments.view', 'payments.process', 'suppliers.orders']) },
    { id: 'returns', label: 'Returns', path: ROUTES.PROCUREMENT_RETURNS, canAccess: (user: User | null) => hasPermission(user, 'suppliers.orders') },
    { id: 'credit-notes', label: 'Credit Notes', path: ROUTES.PROCUREMENT_CREDIT_NOTES, canAccess: (user: User | null) => hasPermission(user, 'suppliers.orders') },
] as const;

const DEFAULT_TAB = 'suppliers';
type ProcurementTabId = (typeof PROCUREMENT_TABS)[number]['id'];

const ProcurementPage: FunctionComponent = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const visibleTabs = useMemo(
        () => PROCUREMENT_TABS.filter((tab) => tab.canAccess(user)),
        [user],
    );

    // Segment right after "/procurement/" — not the last path segment, so a
    // sub-route like "/procurement/suppliers/:supplierId" still resolves to
    // the "suppliers" tab instead of matching nothing and bouncing back to it.
    const segment = pathname.split('/')[2] || DEFAULT_TAB;
    const activeTab: ProcurementTabId =
        (visibleTabs.find((t) => t.id === segment)?.id ?? visibleTabs[0]?.id ?? DEFAULT_TAB) as ProcurementTabId;

    useEffect(() => {
        if (visibleTabs.length === 0) {
            return;
        }

        const isCurrentTabVisible = visibleTabs.some((tab) => tab.id === segment);
        if (!isCurrentTabVisible) {
            navigate(visibleTabs[0].path, { replace: true });
        }
    }, [segment, visibleTabs, navigate]);

    const handleTabChange = useCallback(
        (value: string) => {
            const tab = PROCUREMENT_TABS.find((t) => t.id === value);
            if (tab) navigate(tab.path, { replace: true });
        },
        [navigate],
    );

    return (
        <AppLayout>
            <Tabs.Root className='px-0 mx-0' value={activeTab} onValueChange={handleTabChange}>
                <Tabs.List className="-mx-4 md:-mx-6 px-4 md:px-6 flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 gap-0 scrollbar-none">
                    {visibleTabs.map((tab) => (
                        <Tabs.Trigger
                            key={tab.id}
                            value={tab.id}
                            className={
                                'flex-shrink-0 px-4 pb-2.5 text-sm font-medium transition-colors duration-200 border-b-2 outline-none cursor-pointer whitespace-nowrap ' +
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

                {visibleTabs.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 text-sm text-gray-600 dark:text-gray-300">
                        You do not currently have permission to view procurement tabs.
                    </div>
                )}

                {visibleTabs.length > 0 && (
                    <Suspense fallback={<ComponentLoader loading={true} />}>
                        <HubProvider value={true}>
                            <Outlet />
                        </HubProvider>
                    </Suspense>
                )}
            </Tabs.Root>
        </AppLayout>
    );
};

export default ProcurementPage;
