import { useState, type FunctionComponent } from 'react';
import { HiOutlineHome } from 'react-icons/hi2';

import AppLayout from '../../layouts/AppLayout';
import PageLoader from '../../components/PageLoader';
import { useAuth } from '../../context/AuthProvider';
import PageHeader from '../../components/page/PageHeader';
import {
    DashboardCategory,
    getDashboardCategory,
    isInventoryManager,
    isAccountant,
    ROLE_DISPLAY_INFO
} from '../../constants/roles';
import {
    AdminDashboard,
    ManagerDashboard,
    CashierDashboard,
    InventoryDashboard,
    AccountantDashboard,
    ReadOnlyDashboard,
} from './role-dashboards';

/**
 * Main Dashboard Component
 * Routes to the appropriate role-based dashboard based on user's role
 */
const Dashboard: FunctionComponent = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    if (!user) return <PageLoader />;

    // Determine which dashboard to render based on user role
    const dashboardCategory = getDashboardCategory(user.roleId, user.roleName);

    // Get role display info for header customization
    const roleInfo = ROLE_DISPLAY_INFO[user.roleId || ''];
    const roleDisplayName = roleInfo?.displayName || user.roleName || 'User';

    // Determine dashboard description based on category
    const getDashboardDescription = () => {
        switch (dashboardCategory) {
            case DashboardCategory.ADMIN:
                return 'Complete overview of your business performance, metrics, and operations';
            case DashboardCategory.MANAGER:
                return 'Branch operations overview and team performance metrics';
            case DashboardCategory.SPECIALIST:
                if (isInventoryManager(user.roleId, user.roleName)) {
                    return 'Inventory management and stock level monitoring';
                }
                if (isAccountant(user.roleId, user.roleName)) {
                    return 'Financial overview and transaction summaries';
                }
                return 'Specialized view for your role';
            case DashboardCategory.CASHIER:
                return 'Your sales performance and recent transactions';
            case DashboardCategory.READONLY:
                return 'Read-only view of sales, products, and reports';
            default:
                return 'Overview of your business performance and key metrics';
        }
    };

    // Render the appropriate dashboard based on role category
    const renderDashboard = () => {
        // Check for specialist roles first (they're in SPECIALIST category but need specific dashboards)
        if (isInventoryManager(user.roleId, user.roleName)) {
            return <InventoryDashboard user={user} isLoading={isLoading} setIsLoading={setIsLoading} />;
        }

        if (isAccountant(user.roleId, user.roleName)) {
            return <AccountantDashboard user={user} isLoading={isLoading} setIsLoading={setIsLoading} />;
        }

        // Route based on dashboard category
        switch (dashboardCategory) {
            case DashboardCategory.ADMIN:
                return <AdminDashboard user={user} isLoading={isLoading} setIsLoading={setIsLoading} />;

            case DashboardCategory.MANAGER:
                return <ManagerDashboard user={user} isLoading={isLoading} setIsLoading={setIsLoading} />;

            case DashboardCategory.CASHIER:
                return <CashierDashboard user={user} isLoading={isLoading} setIsLoading={setIsLoading} />;

            case DashboardCategory.READONLY:
                return <ReadOnlyDashboard user={user} isLoading={isLoading} setIsLoading={setIsLoading} />;

            default:
                // Default to cashier dashboard for unknown roles
                return <CashierDashboard user={user} isLoading={isLoading} setIsLoading={setIsLoading} />;
        }
    };

    return (
        <AppLayout>
            <PageHeader
                title="Dashboard"
                description={getDashboardDescription()}
                icon={<HiOutlineHome className="w-8 h-8 text-sky-600 dark:text-sky-400" />}
            />
            <div className="pb-8 pt-0">
                {renderDashboard()}
            </div>
        </AppLayout>
    );
};

export default Dashboard;