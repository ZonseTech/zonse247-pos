import { FC } from "react";
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineXCircle, HiOutlineBan, HiOutlineReceiptRefund } from "react-icons/hi";

interface StatusFilterProps {
    selectedStatus: TransactionStatus | 'all';
    onChange: (status: TransactionStatus | 'all') => void;
}

const statusOptions: Array<{ value: TransactionStatus | 'all'; label: string; icon: any; color: string }> = [
    { value: 'all', label: 'All', icon: HiOutlineCheckCircle, color: 'gray' },
    { value: 'completed', label: 'Completed', icon: HiOutlineCheckCircle, color: 'green' },
    { value: 'pending', label: 'Pending', icon: HiOutlineClock, color: 'yellow' },
    { value: 'failed', label: 'Failed', icon: HiOutlineXCircle, color: 'red' },
    { value: 'cancelled', label: 'Cancelled', icon: HiOutlineBan, color: 'gray' },
    { value: 'refunded', label: 'Refunded', icon: HiOutlineReceiptRefund, color: 'blue' },
];

export const StatusFilter: FC<StatusFilterProps> = ({ selectedStatus, onChange }) => {
    const getColorClasses = (status: string, isSelected: boolean) => {
        const baseClasses = "transition-all duration-200";

        if (isSelected) {
            const colors = {
                gray: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
                green: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
                yellow: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
                red: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
                blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
            };
            return `${baseClasses} ${colors[status as keyof typeof colors]}`;
        }

        return `${baseClasses} bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50`;
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">Status:</span>
            {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.value;

                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border ${getColorClasses(option.color, isSelected)}`}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
