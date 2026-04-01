import * as Tabs from '@radix-ui/react-tabs';
import { ROUTES } from '../../utils/constants';
import AppLayout from '../../layouts/AppLayout';
import { ComponentLoader } from '../../components';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Suspense, useCallback, type FunctionComponent } from 'react';
import { HubProvider } from '../../context/HubContext';
import PageHeader from '../../components/page/PageHeader';

const SALES_TABS = [
    { id: 'sales', label: 'Sales', path: ROUTES.SALES_HUB_SALES },
    { id: 'reports', label: 'Reports', path: ROUTES.SALES_HUB_REPORTS },
    { id: 'returns', label: 'Returns', path: ROUTES.SALES_HUB_RETURNS },
] as const;

const DEFAULT_TAB = 'sales';
type SalesTabId = (typeof SALES_TABS)[number]['id'];

const SalesHubPage: FunctionComponent = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const segment = pathname.split('/').pop() || DEFAULT_TAB;
    const activeTab: SalesTabId =
        SALES_TABS.find((t) => t.id === segment)?.id ?? DEFAULT_TAB;

    const handleTabChange = useCallback(
        (value: string) => {
            const tab = SALES_TABS.find((t) => t.id === value);
            if (tab) navigate(tab.path, { replace: true });
        },
        [navigate],
    );

    return (
        <>
            <PageHeader
                title="Sales Hub"
                compact
                showBackButton
                onBack={() => navigate(ROUTES.POS)}
            />

            <AppLayout>
                <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
                    <Tabs.List className="-mx-4 md:-mx-6 px-4 md:px-6 flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 gap-0 scrollbar-none mb-4">
                        {SALES_TABS.map((tab) => (
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

                    <Suspense fallback={<ComponentLoader loading={true} />}>
                        <HubProvider value={true}>
                            <Outlet />
                        </HubProvider>
                    </Suspense>
                </Tabs.Root>
            </AppLayout>
        </>
    );
};

export default SalesHubPage;
