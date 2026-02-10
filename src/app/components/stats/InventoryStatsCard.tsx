import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiExclamationCircle } from 'react-icons/hi';
import { BsBoxSeam, BsCheckCircle, BsExclamationTriangle } from 'react-icons/bs';
import { HiArrowRight } from 'react-icons/hi2';
import { ROUTES } from '../../utils/constants';

interface InventoryStatsCardProps {
    inventory: InventoryItem[];
}

const InventoryStatsCard: FunctionComponent<InventoryStatsCardProps> = ({ inventory }) => {
    const navigate = useNavigate();
    const totalProducts = inventory.length;
    const inStock = inventory.filter(item => Number(item.quantity) > 10).length;
    const lowStock = inventory.filter(item => Number(item.quantity) > 0 && Number(item.quantity) <= 10).length;
    const outOfStock = inventory.filter(item => Number(item.quantity) <= 0).length;

    return (
        <>
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
                    Inventory Stats
                </h3>
                <button
                    onClick={() => navigate(ROUTES.MOBILE_INVENTORY)}
                    className="flex items-center gap-1 text-sky-500 dark:text-sky-400 text-sm font-medium active:scale-95 transition-transform"
                >
                    <HiArrowRight className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="grid grid-cols-2">
                    <div className="flex flex-col items-center justify-center py-4 px-3 border-r border-b border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-2">
                            <BsBoxSeam className="w-5 h-5 text-sky-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProducts}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Products</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-4 px-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                            <BsCheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{inStock}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">In Stock</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-4 px-3 border-r border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                            <BsExclamationTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{lowStock}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Low Stock</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-4 px-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                            <HiExclamationCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{outOfStock}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Out/Expired</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InventoryStatsCard;
