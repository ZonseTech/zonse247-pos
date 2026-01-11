import { FunctionComponent } from "react";
import { User, UserCheck, Calendar, Phone, CreditCard } from "lucide-react";

const DetailRow: FunctionComponent<{
    label: string;
    value: string;
    icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
        {icon && (
            <div className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                {icon}
            </div>
        )}
        <div className="flex-1 min-w-0">
            <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                {label}
            </span>
            <span className="block text-gray-900 dark:text-gray-100 font-semibold truncate mt-0.5">
                {value}
            </span>
        </div>
    </div>
);

const TransactionHeader: FunctionComponent<{
    refNumber: string;
    customerName: string;
    cashierName: string;
    date: string;
    phoneNumber: string | null;
    tillName: string;
    status: string;
    statusColor: string;
}> = ({ customerName, cashierName, date, phoneNumber, tillName }) => (
    <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/80 dark:border-gray-700/50 p-5">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            Transaction Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <DetailRow
                label="Customer"
                value={customerName}
                icon={<User className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
            />
            <DetailRow
                label="Cashier"
                value={cashierName}
                icon={<UserCheck className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
            />
            <DetailRow
                label="Date & Time"
                value={date}
                icon={<Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
            />
            {phoneNumber && (
                <DetailRow
                    label="Phone"
                    value={phoneNumber}
                    icon={<Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                />
            )}
            <DetailRow
                label="Till/Terminal"
                value={tillName}
                icon={<CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
            />
        </div>
    </div>
);

export default TransactionHeader;