import { FunctionComponent } from "react";

const InfoLine: FunctionComponent<{
    label: string;
    value: string;
    compact?: boolean;
}> = ({ label, value, compact = false }) => (
    <div className="flex justify-between items-baseline">
        <span className={compact
            ? "text-[10px] text-gray-500 dark:text-gray-400"
            : "text-xs text-gray-500 dark:text-gray-400"
        }>
            {label}
        </span>
        <span className={compact
            ? "text-[10px] font-medium text-gray-900 dark:text-gray-100 text-right truncate ml-3 max-w-[60%]"
            : "text-sm font-medium text-gray-900 dark:text-gray-100 text-right truncate ml-4 max-w-[60%]"
        }>
            {value}
        </span>
    </div>
);

const SaleHeader: FunctionComponent<{
    refNumber: string;
    customerName: string;
    cashierName: string;
    date: string;
    phoneNumber: string | null;
    tillName: string;
    status: string;
    statusColor: string;
    compact?: boolean;
}> = ({ customerName, cashierName, date, phoneNumber, tillName, compact = false }) => (
    <div className={compact ? "space-y-1 px-1" : "space-y-1.5"}>
        <InfoLine label="Customer" value={customerName} compact={compact} />
        <InfoLine label="Cashier" value={cashierName} compact={compact} />
        <InfoLine label="Date" value={date} compact={compact} />
        {phoneNumber && (
            <InfoLine label="Phone" value={phoneNumber} compact={compact} />
        )}
        <InfoLine label="Terminal" value={tillName} compact={compact} />
    </div>
);

export default SaleHeader;