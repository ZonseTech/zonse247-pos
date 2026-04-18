import { FunctionComponent } from 'react';
import CustomerSelector from '../../customers/partials/CustomerSelector';
import classNames from 'classnames';

interface ServiceInfoBarProps {
    cartItemCount: number;
    compact?: boolean;
    activeOrder?: { orderNumber: string; customer?: { name: string } | null } | null;
}

const ServiceInfoBar: FunctionComponent<ServiceInfoBarProps> = ({
    cartItemCount,
    compact = false,
    activeOrder,
}) => {
    return (
        <div className={classNames(
            "flex-shrink-0 border-t border-gray-200 dark:border-gray-700",
            compact ? "px-2 py-1" : "px-2 lg:px-4 py-2"
        )}>
            <div className="flex items-center gap-x-2 lg:gap-x-4">
                <div className="flex-1 min-w-0">
                    <label className={classNames(
                        "block font-bold text-black dark:text-gray-400",
                        compact ? "text-xs mb-0.5" : "text-xs lg:text-sm mb-0.5 lg:mb-1"
                    )}>
                        CUSTOMER
                    </label>
                    <div className={classNames(
                        "flex items-center",
                        compact ? "py-2" : "py-2 lg:py-2.5"
                    )}>
                        <CustomerSelector compact={compact} />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <label className={classNames(
                        "block font-bold text-black dark:text-gray-400",
                        compact ? "text-xs mb-0.5" : "text-xs lg:text-sm mb-0.5 lg:mb-1"
                    )}>
                        ORDER
                    </label>
                    <div className={classNames(
                        "font-bold truncate",
                        compact ? "text-sm py-2" : "text-lg lg:text-xl py-2 lg:py-2.5",
                        activeOrder
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-400 dark:text-gray-600"
                    )}>
                        {activeOrder ? activeOrder.orderNumber : '—'}
                    </div>
                </div>

                <div className="w-1/4 flex-shrink-0">
                    <label className={classNames(
                        "block font-bold text-black dark:text-gray-400",
                        compact ? "text-xs mb-0.5" : "text-xs lg:text-sm mb-0.5 lg:mb-1"
                    )}>
                        TOTAL ITEMS
                    </label>
                    <div className={classNames(
                        "bg-gray-800 text-white font-bold text-center",
                        compact ? "text-sm py-2" : "text-lg lg:text-xl py-2 lg:py-2.5"
                    )}>
                        {cartItemCount}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceInfoBar;
