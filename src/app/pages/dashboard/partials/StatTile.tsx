import type { FunctionComponent, ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatTileProps {
    label: string;
    value: string;
    delta?: number;
    icon: ReactNode;
    accent: string;
    isLoading?: boolean;
}

const StatTile: FunctionComponent<StatTileProps> = ({ label, value, delta, icon, accent, isLoading }) => {
    const isPositive = (delta ?? 0) >= 0;

    return (
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-5">
            <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    {isLoading ? (
                        <div className="mt-2 h-7 w-20 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
                    ) : (
                        <p className="mt-1.5 text-xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
                    )}
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${accent} bg-opacity-10 dark:bg-opacity-20 flex-shrink-0`}>
                    {icon}
                </div>
            </div>
            {!isLoading && delta !== undefined && (
                <div className="mt-3 flex items-center gap-1 text-xs font-medium">
                    <span className={`flex items-center gap-0.5 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{delta.toFixed(1)}%
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">vs yesterday</span>
                </div>
            )}
        </div>
    );
};

export default StatTile;
