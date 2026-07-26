import type { FunctionComponent, ReactNode } from 'react';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

export interface ReportStatTileProps {
    name: string;
    value: string;
    description?: string;
    icon: ReactNode;
    accent: string;
    hasData?: boolean;
    /** Percent change vs. the previous equivalent period */
    delta?: number;
    onClick?: () => void;
}

const ReportStatTile: FunctionComponent<ReportStatTileProps> = ({
    name,
    value,
    description,
    icon,
    accent,
    hasData = true,
    delta,
    onClick,
}) => {
    const isClickable = !!onClick && hasData;
    const isPositive = (delta ?? 0) >= 0;

    return (
        <div
            onClick={hasData ? onClick : undefined}
            className={`group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-5 transition-transform ${
                !hasData ? 'opacity-60' : isClickable ? 'cursor-pointer hover:scale-[1.02]' : ''
            }`}
        >
            <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate">
                        {name}
                    </p>
                    <p className="mt-1.5 text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {value}
                    </p>
                    {description && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
                    )}
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${accent} bg-opacity-10 dark:bg-opacity-20 flex-shrink-0`}>
                    {icon}
                </div>
            </div>
            {delta !== undefined && (
                <div className="mt-3 flex items-center gap-1 text-xs font-medium">
                    <span className={`flex items-center gap-0.5 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{delta.toFixed(1)}%
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">vs last period</span>
                </div>
            )}
            {isClickable && (
                <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </div>
    );
};

export default ReportStatTile;
