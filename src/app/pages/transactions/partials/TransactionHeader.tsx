import { FunctionComponent } from "react";

const DetailRow: FunctionComponent<{
    label: string;
    value: string;
    icon?: string;
}> = ({ label, value, icon }) => (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <span className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
            {icon && <span className="text-base">{icon}</span>}
            {label}
        </span>
        <span className="text-gray-900 dark:text-gray-100 font-semibold truncate ml-3">
            {value}
        </span>
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
}> = ({ refNumber, customerName, cashierName, date, phoneNumber, tillName, status, statusColor }) => (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    #{refNumber}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Transaction Reference</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize border ${statusColor} shadow-sm`}>
                {status}
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailRow label="Customer" value={customerName} icon="👤" />
            <DetailRow label="Cashier" value={cashierName} icon="👨‍💼" />
            <DetailRow label="Date" value={date} icon="📅" />
            {phoneNumber && <DetailRow label="Phone" value={phoneNumber} icon="📞" />}
            <DetailRow label="Till" value={tillName} icon="💳" />
        </div>
    </div>
);

export default TransactionHeader;