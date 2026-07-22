import type { FunctionComponent } from 'react';
import DashboardHeader from './partials/DashboardHeader';
import StatsRow from './partials/StatsRow';
import RevenueChart from './partials/RevenueChart';
import PaymentMethodsChart from './partials/PaymentMethodsChart';
import TopSellingProducts from './partials/TopSellingProducts';
import RecentSales from './partials/RecentSales';
import LowStockAlerts from './partials/LowStockAlerts';
import AppLayout from '../../layouts/AppLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const Dashboard: FunctionComponent = () => {
    const { stats, loading } = useDashboardStats();

    return (
        <AppLayout>
            <DashboardHeader />
            <StatsRow
                summary={stats.summary}
                isSummaryLoading={loading.summary}
                lowStockCount={stats.lowStock.length}
                isLowStockLoading={loading.lowStock}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
                <RevenueChart data={stats.revenueTrend} isLoading={loading.revenueTrend} className="xl:col-span-2" />
                <PaymentMethodsChart data={stats.paymentMethods} isLoading={loading.paymentMethods} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <TopSellingProducts products={stats.topProducts} isLoading={loading.topProducts} />
                <RecentSales sales={stats.recentSales} isLoading={loading.recentSales} className="xl:col-span-2" />
            </div>

            <LowStockAlerts items={stats.lowStock} isLoading={loading.lowStock} className="mt-4" />
        </AppLayout>
    );
};

export default Dashboard;
