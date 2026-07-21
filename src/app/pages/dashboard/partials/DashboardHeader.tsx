import type { FunctionComponent } from 'react';
import { LayoutDashboard } from 'lucide-react';

const DashboardHeader: FunctionComponent = () => (
    <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-500/30">
            <LayoutDashboard className="w-5 h-5" />
        </div>
        <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                A snapshot of today's sales, inventory, and business performance.
            </p>
        </div>
    </div>
);

export default DashboardHeader;
