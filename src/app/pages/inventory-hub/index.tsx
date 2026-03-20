import { lazy, Suspense, useCallback, type FunctionComponent } from 'react';
import { useSearchParams } from 'react-router';
import { Package } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { ComponentLoader } from '../../components';
import { ROUTES } from '../../utils/constants';

// ─── Lazy-loaded inventory sub-pages ───────────────────────────────────────────
const Products = lazy(() => import('../inventory'));
const Categories = lazy(() => import('../categories'));
const StockMovements = lazy(() => import('../stock-movements'));
const InventoryValuation = lazy(() => import('../inventory-valuation'));
const COGSProfitability = lazy(() => import('../cogs-profitability'));
const InventoryAging = lazy(() => import('../inventory-aging'));

// ─── Tab definitions ───────────────────────────────────────────────────────────
const INVENTORY_TABS = [
    { id: 'products', label: 'Products', Component: Products, route: ROUTES.INVENTORY },
    { id: 'categories', label: 'Categories', Component: Categories, route: ROUTES.CATEGORIES },
    { id: 'stock-movements', label: 'Stock Movements', Component: StockMovements, route: ROUTES.STOCK_MOVEMENTS },
    { id: 'valuation', label: 'Valuation', Component: InventoryValuation, route: ROUTES.INVENTORY_VALUATION },
    { id: 'cogs', label: 'COGS & Profit', Component: COGSProfitability, route: ROUTES.COGS_PROFITABILITY },
    { id: 'aging', label: 'Aging', Component: InventoryAging, route: ROUTES.INVENTORY_AGING },
] as const;

type InventoryTabId = (typeof INVENTORY_TABS)[number]['id'];
const DEFAULT_TAB: InventoryTabId = 'products';

// ─── Component ─────────────────────────────────────────────────────────────────

const InventoryHubPage: FunctionComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = (searchParams.get('tab') as InventoryTabId) || DEFAULT_TAB;

    const handleTabChange = useCallback(
        (value: string) => {
            setSearchParams({ tab: value }, { replace: true });
        },
        [setSearchParams],
    );

    return (
        <AppLayout>
            <PageHeader
                icon={<Package className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                title="Inventory"
                description="Manage products, categories, stock movements and analytics"
                compact
            />

            <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
                {/* Tab list — horizontally scrollable on mobile */}
                <Tabs.List className="-mx-4 md:-mx-6 px-4 md:px-6 flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 gap-0 scrollbar-none mb-4">
                    {INVENTORY_TABS.map((tab) => (
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
                {INVENTORY_TABS.map((tab) => (
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

export default InventoryHubPage;
