import type { FunctionComponent, ReactNode } from 'react';

interface InfoRowProps {
    icon: ReactNode;
    label: string;
    value: string;
    noBorder?: boolean;
}

const InfoRow: FunctionComponent<InfoRowProps> = ({ icon, label, value, noBorder = false }) => (
    <div
        className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 ${!noBorder ? 'border-b border-gray-100 dark:border-gray-700' : ''
            }`}
    >
        <div className="flex-shrink-0 mr-3 sm:mr-4">{icon}</div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
        </div>
    </div>
);

export default InfoRow;
