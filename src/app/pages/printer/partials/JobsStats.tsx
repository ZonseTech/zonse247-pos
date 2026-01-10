import { Clock, Loader2, XCircle, FileText } from 'lucide-react';

interface StatsCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    colorClass: string;
}

const StatsCard = ({ label, value, icon, colorClass }: StatsCardProps) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClass}`}>{icon}</div>
            <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
            </div>
        </div>
    </div>
);

interface JobsStatsProps {
    pendingCount: number;
    printingCount: number;
    failedCount: number;
    totalCount: number;
}

export const JobsStats = ({ pendingCount, printingCount, failedCount, totalCount }: JobsStatsProps) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 px-4 md:px-0">
        <StatsCard label="Pending" value={pendingCount} colorClass="bg-yellow-100 dark:bg-yellow-900/30" icon={<Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />} />
        <StatsCard label="Printing" value={printingCount} colorClass="bg-blue-100 dark:bg-blue-900/30" icon={<Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />} />
        <StatsCard label="Failed" value={failedCount} colorClass="bg-red-100 dark:bg-red-900/30" icon={<XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />} />
        <StatsCard label="Total" value={totalCount} colorClass="bg-gray-100 dark:bg-gray-700" icon={<FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />} />
    </div>
);
