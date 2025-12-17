import { DashboardCategory } from '../../../constants/roles';

export interface RoleDashboardProps {
    user: User;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export interface DashboardCard {
    key: string;
    title: string;
    value: number | string;
    icon: React.ReactNode;
    bgColor: string;
    link?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export interface QuickAction {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
    permission?: string;
}

export interface DashboardSection {
    id: string;
    title: string;
    component: React.ReactNode;
    colSpan?: number;
    permissions?: string[];
}

export interface AdminDashboardCounts extends DashboardCounts {
    totalBranches?: number;
    totalTenants?: number;
    monthlyGrowth?: number;
    pendingOrders?: number;
    lowStockItems?: number;
}

export interface ManagerDashboardCounts extends DashboardCounts {
    branchSales?: number;
    teamMembers?: number;
    todayTransactions?: number;
    avgTransactionValue?: number;
    refundsToday?: number;
    pendingApprovals?: number;
}

export interface CashierDashboardCounts extends DashboardCounts {
    myTotalSales?: number;
    todaySales?: number;
    todayTransactions?: number;
    avgTransactionValue?: number;
    refundsProcessed?: number;
}

export interface InventoryDashboardCounts extends DashboardCounts {
    totalProducts?: number;
    lowStockItems?: number;
    outOfStockItems?: number;
    expiredItems?: number;
    expiringItems?: number;
    recentlyAdded?: number;
    pendingReceiving?: number;
}

export interface AccountantDashboardCounts extends DashboardCounts {
    totalRevenue?: number;
    monthlyRevenue?: number;
    pendingPayments?: number;
    completedPayments?: number;
    refunds?: number;
    grossProfit?: number;
    taxCollected?: number;
}

export interface ReadOnlyDashboardCounts extends DashboardCounts {
    // All properties from DashboardCounts are inherited
}

export interface DashboardContextValue {
    category: DashboardCategory;
    counts: DashboardCounts;
    isLoading: boolean;
    refreshData: () => Promise<void>;
}

export interface DashboardActivity {
    id: string;
    type: 'sale' | 'refund' | 'stock_update' | 'user_action' | 'alert';
    title: string;
    description: string;
    timestamp: Date | string;
    icon?: React.ReactNode;
    color?: string;
}

export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

export type DashboardPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';

export interface DashboardFilters {
    period: DashboardPeriod;
    branchId?: string;
    startDate?: Date;
    endDate?: Date;
}
