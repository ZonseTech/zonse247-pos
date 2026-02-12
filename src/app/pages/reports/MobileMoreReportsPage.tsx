import { FunctionComponent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileTabPageHeader from '../../components/page/MobileTabPageHeader';
import { useInventory } from '../../hooks/useInventory';
import { useCustomers } from '../../hooks/useCustomers';
import { useUsers } from '../../hooks/useUsers';
import { useSuppliers } from '../../hooks/useSuppliers';
import { formatCurrency } from '../../utils';
import { ROUTES } from '../../utils/constants';

interface SummaryCardProps {
    label: string;
    value: string | number;
    onClick?: () => void;
    variant?: 'default' | 'success' | 'danger';
}

const SummaryCard: FunctionComponent<SummaryCardProps> = ({
    label,
    value,
    onClick,
    variant = 'default',
}) => {
    const valueColorClass = {
        default: 'text-sky-500',
        success: 'text-emerald-500',
        danger: 'text-red-500',
    }[variant];

    return (
        <button
            onClick={onClick}
            className="w-full bg-white dark:bg-gray-800 rounded-sm px-2.5 py-6 flex flex-col items-center justify-center active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700"
        >
            <p className={`text-lg font-bold ${valueColorClass}`}>{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        </button>
    );
};

const MobileMoreReportsPage: FunctionComponent = () => {
    const navigate = useNavigate();
    const { inventory } = useInventory();
    const { customers, totalRows: totalCustomers } = useCustomers();
    const { totalRows: totalUsers, getPaginatedData } = useUsers();
    const { suppliers, totalRows: totalSuppliers } = useSuppliers();

    const stats = useMemo(() => {
        const items = inventory || [];

        const lowStockItems = items.filter(item => {
            const qty = Number(item.quantity) || 0;
            const minStock = Number(item.minStock) || 10;
            return qty > 0 && qty <= minStock;
        });

        let totalCostValue = 0;
        let totalSellingValue = 0;
        let totalItems = 0;
        let totalVariants = 0;

        items.forEach((item: any) => {
            const qty = Number(item.quantity) || 0;
            const costPrice = Number(item.costPrice) || 0;
            const sellingPrice = Number(item.sellingPrice) || 0;

            totalCostValue += qty * costPrice;
            totalSellingValue += qty * sellingPrice;
            totalItems += 1;

            if (item.variants && Array.isArray(item.variants)) {
                totalVariants += item.variants.length;
            }
        });

        return {
            lowStockCount: lowStockItems.length,
            totalCostValue,
            totalSellingValue,
            totalItems,
            totalVariants,
            potentialProfit: totalSellingValue - totalCostValue,
        };
    }, [inventory]);

    const staffCount = useMemo(() => {
        const users = getPaginatedData();
        return users.length || totalUsers;
    }, [getPaginatedData, totalUsers]);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-100 dark:bg-gray-900">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobileTabPageHeader />
            </div>

            <div className="flex-1 min-h-0 overflow-hidden pt-[52px]">
                <div className="h-full overflow-y-auto pb-24">
                    <div className="px-2 space-y-1.5 grid grid-cols-2 gap-3">
                        <SummaryCard
                            label="Customers"
                            value={totalCustomers || customers.length}
                            onClick={() => navigate(ROUTES.CUSTOMERS)}
                        />
                        <SummaryCard
                            label="Low Stock"
                            value={stats.lowStockCount}
                            variant={stats.lowStockCount === 0 ? 'success' : 'danger'}
                            onClick={() => navigate(ROUTES.ITEMS)}
                        />
                        <SummaryCard
                            label="Staff"
                            value={staffCount}
                            onClick={() => navigate(ROUTES.USERS)}
                        />
                        <SummaryCard
                            label="Suppliers"
                            value={totalSuppliers || suppliers.length}
                            onClick={() => navigate(ROUTES.SUPPLIERS)}
                        />
                        <SummaryCard
                            label="Items"
                            value={stats.totalItems}
                            onClick={() => navigate(ROUTES.ITEMS)}
                        />
                        <SummaryCard
                            label="Stock Value Cost Price"
                            value={formatCurrency(stats.totalCostValue, true)}
                        />
                        <SummaryCard
                            label="Stock Value Selling Price"
                            value={formatCurrency(stats.totalSellingValue, true)}
                        />

                        <SummaryCard
                            label="Potential Profit"
                            value={formatCurrency(stats.potentialProfit, true)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileMoreReportsPage;
