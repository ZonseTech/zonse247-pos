import { useMemo, type FunctionComponent } from 'react';
import DashboardHeader from './partials/DashboardHeader';
import StatsRow from './partials/StatsRow';
import RevenueChart from './partials/RevenueChart';
import PaymentMethodsChart from './partials/PaymentMethodsChart';
import ExpensesByCategoryChart from './partials/ExpensesByCategoryChart';
import TopSellingProducts from './partials/TopSellingProducts';
import RecentSales from './partials/RecentSales';
import LowStockAlerts from './partials/LowStockAlerts';
import AppLayout from '../../layouts/AppLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useAuth } from '../../context/AuthProvider';
import { hasAnyPermission } from '../../utils';

const Dashboard: FunctionComponent = () => {
    const { user } = useAuth();

    const canViewSummary = hasAnyPermission(user, ['analytics.view', 'reports.sales.daily']);
    const canViewRevenueTrend = hasAnyPermission(user, ['analytics.view', 'reports.sales.daily']);
    const canViewPaymentMethods = hasAnyPermission(user, ['analytics.view', 'reports.financial']);
    const canViewExpensesByCategory = hasAnyPermission(user, ['analytics.view', 'reports.financial']);
    const canViewTopProducts = hasAnyPermission(user, ['analytics.view', 'reports.sales.detailed']);
    const canViewRecentSales = hasAnyPermission(user, ['analytics.view', 'reports.sales.detailed']);
    const canViewLowStock = hasAnyPermission(user, ['analytics.view', 'reports.inventory']);

    const enabledSections = useMemo(() => ({
        summary: canViewSummary,
        revenueTrend: canViewRevenueTrend,
        paymentMethods: canViewPaymentMethods,
        expensesByCategory: canViewExpensesByCategory,
        topProducts: canViewTopProducts,
        recentSales: canViewRecentSales,
        lowStock: canViewLowStock,
    }), [
        canViewSummary,
        canViewRevenueTrend,
        canViewPaymentMethods,
        canViewExpensesByCategory,
        canViewTopProducts,
        canViewRecentSales,
        canViewLowStock,
    ]);

    const { stats, loading } = useDashboardStats({ enabledSections });

    const hasAnyDashboardPermission = [
        canViewSummary,
        canViewRevenueTrend,
        canViewPaymentMethods,
        canViewExpensesByCategory,
        canViewTopProducts,
        canViewRecentSales,
        canViewLowStock,
    ].some(Boolean);

    return (
        <AppLayout>
            <DashboardHeader />
            {!hasAnyDashboardPermission ? (
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 text-sm text-gray-600 dark:text-gray-300">
                    You do not currently have permission to view dashboard analytics sections.
                </div>
            ) : (
                <>
                    <StatsRow
                        summary={stats.summary}
                        isSummaryLoading={loading.summary}
                        lowStockCount={stats.lowStock.totalCount}
                        isLowStockLoading={loading.lowStock}
                        showSummary={canViewSummary}
                        showLowStock={canViewLowStock}
                    />

                    {(canViewRevenueTrend || canViewPaymentMethods || canViewExpensesByCategory) && (
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-4">
                            {canViewRevenueTrend && <RevenueChart data={stats.revenueTrend} isLoading={loading.revenueTrend} className="xl:col-span-2" />}
                            {canViewPaymentMethods && <PaymentMethodsChart data={stats.paymentMethods} isLoading={loading.paymentMethods} />}
                            {canViewExpensesByCategory && <ExpensesByCategoryChart data={stats.expensesByCategory} isLoading={loading.expensesByCategory} />}
                        </div>
                    )}

                    {(canViewTopProducts || canViewRecentSales) && (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                            {canViewTopProducts && <TopSellingProducts products={stats.topProducts} isLoading={loading.topProducts} />}
                            {canViewRecentSales && <RecentSales sales={stats.recentSales} isLoading={loading.recentSales} className="xl:col-span-2" />}
                        </div>
                    )}

                    {canViewLowStock && <LowStockAlerts items={stats.lowStock.items} isLoading={loading.lowStock} className="mt-4" />}
                </>
            )}
        </AppLayout>
    );
};

export default Dashboard;
