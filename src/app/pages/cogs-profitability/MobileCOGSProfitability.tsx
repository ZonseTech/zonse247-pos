import { FC, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
    ArrowLeft,
    DollarSign,
    RefreshCw,
    BarChart3,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    ToggleLeft,
    ToggleRight,
    Loader2,
} from 'lucide-react';
import classNames from 'classnames';
import { useCOGSReport } from '../../hooks/useCOGSReport';
import { formatCurrency } from '../../utils';

type ActiveTab = 'cogs' | 'profit';

const MobileCOGSProfitability: FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<ActiveTab>('cogs');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const {
        startDate, setStartDate,
        endDate, setEndDate,
        periodCOGS, salesCOGS,
        isLoadingCOGS,
        showCrossCheck, setShowCrossCheck,
        cogsDiscrepancy, hasDiscrepancy,
        grossProfitItems,
        grossProfitSummary,
        isLoadingProfit,
        loadAll,
    } = useCOGSReport();

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadAll();
        setTimeout(() => setIsRefreshing(false), 500);
    }, [loadAll]);

    const isLoading = isLoadingCOGS || isLoadingProfit;

    // Sort profit products by margin descending
    const sortedProducts = grossProfitItems.length
        ? [...grossProfitItems].sort((a, b) => b.marginPercent - a.marginPercent)
        : [];

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 safe-area-top-android">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-6 h-6 text-red-500" />
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                COGS & Profit
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading || isRefreshing}
                        className={classNames(
                            'p-2 rounded-lg text-gray-500 dark:text-gray-400',
                            'hover:bg-gray-100 dark:hover:bg-gray-700',
                            'disabled:opacity-50 transition-all',
                            (isLoading || isRefreshing) && 'animate-spin'
                        )}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Date Range */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2.5">
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                    <button
                        onClick={() => setShowCrossCheck(!showCrossCheck)}
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                        title="Toggle cross-check"
                    >
                        {showCrossCheck ? (
                            <ToggleRight className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                        )}
                    </button>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('cogs')}
                        className={classNames(
                            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors',
                            activeTab === 'cogs'
                                ? 'border-red-500 text-red-600 dark:text-red-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400'
                        )}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Period COGS
                    </button>
                    <button
                        onClick={() => setActiveTab('profit')}
                        className={classNames(
                            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors',
                            activeTab === 'profit'
                                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400'
                        )}
                    >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Gross Profit
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
                {activeTab === 'cogs' ? (
                    /* ─── COGS Tab ─── */
                    <div className="p-4 space-y-4">
                        {isLoadingCOGS ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Loading COGS...</p>
                            </div>
                        ) : !periodCOGS ? (
                            <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-sm">
                                No COGS data available.
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <p className="text-[10px] uppercase tracking-wider text-red-500 dark:text-red-400 font-medium">Total COGS</p>
                                        <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">
                                            {formatCurrency(periodCOGS.totalCOGS, true)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                                        <p className="text-[10px] uppercase tracking-wider text-sky-500 dark:text-sky-400 font-medium">Units Sold</p>
                                        <p className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                                            {periodCOGS.totalUnitsSold.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Cross-check result */}
                                {showCrossCheck && salesCOGS && hasDiscrepancy && cogsDiscrepancy !== null && (
                                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-xs text-amber-700 dark:text-amber-300">
                                            <p className="font-semibold">Discrepancy detected</p>
                                            <p className="mt-0.5">
                                                Ledger: {formatCurrency(periodCOGS.totalCOGS, true)} vs
                                                Sales: {formatCurrency(salesCOGS.totalCOGS, true)} —
                                                Δ {formatCurrency(cogsDiscrepancy, true)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {showCrossCheck && salesCOGS && !hasDiscrepancy && (
                                    <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                        <span className="text-emerald-500 text-sm">✓</span>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300">COGS sources match.</p>
                                    </div>
                                )}

                                {/* Product Breakdown */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        By Product
                                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1.5">
                                            ({periodCOGS.byProduct.length})
                                        </span>
                                    </h3>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50">
                                        {[...periodCOGS.byProduct]
                                            .sort((a, b) => b.cogs - a.cogs)
                                            .map((item) => (
                                                <div key={`${item.productId}-${item.variantId}`} className="flex items-center justify-between px-3 py-2.5">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm text-gray-900 dark:text-white truncate">{item.productName}</p>
                                                        <p className="text-[10px] text-gray-400">{item.unitsSold} units</p>
                                                    </div>
                                                    <span className="text-sm font-semibold text-red-600 dark:text-red-400 flex-shrink-0 ml-3">
                                                        {formatCurrency(item.cogs, true)}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    /* ─── Gross Profit Tab ─── */
                    <div className="p-4 space-y-4">
                        {isLoadingProfit ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Loading profit data...</p>
                            </div>
                        ) : !grossProfitSummary ? (
                            <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-sm">
                                No profit data available.
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                                        <p className="text-[10px] uppercase tracking-wider text-sky-500 dark:text-sky-400 font-medium">Revenue</p>
                                        <p className="text-sm font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                                            {formatCurrency(grossProfitSummary.totalRevenue, true)}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <p className="text-[10px] uppercase tracking-wider text-red-500 dark:text-red-400 font-medium">COGS</p>
                                        <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5">
                                            {formatCurrency(grossProfitSummary.totalCOGS, true)}
                                        </p>
                                    </div>
                                    <div className={classNames(
                                        'p-3 rounded-lg border',
                                        grossProfitSummary.totalGrossProfit >= 0
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    )}>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Profit</p>
                                        <p className={classNames(
                                            'text-sm font-bold mt-0.5',
                                            grossProfitSummary.totalGrossProfit >= 0
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-red-600 dark:text-red-400'
                                        )}>
                                            {formatCurrency(grossProfitSummary.totalGrossProfit, true)}
                                        </p>
                                    </div>
                                </div>

                                {/* Overall Margin */}
                                <div className={classNames(
                                    'flex items-center justify-center gap-2 py-2 rounded-lg',
                                    grossProfitSummary.overallMarginPercent >= 0
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'bg-red-50 dark:bg-red-900/20'
                                )}>
                                    {grossProfitSummary.overallMarginPercent >= 0 ? (
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    )}
                                    <span className={classNames(
                                        'text-sm font-bold',
                                        grossProfitSummary.overallMarginPercent >= 0
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-red-600 dark:text-red-400'
                                    )}>
                                        {grossProfitSummary.overallMarginPercent.toFixed(1)}% overall margin
                                    </span>
                                </div>

                                {/* Product List (sorted by margin desc) */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        By Product
                                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1.5">
                                            (sorted by margin)
                                        </span>
                                    </h3>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50">
                                        {sortedProducts.map((item) => {
                                            const isPositive = item.marginPercent >= 0;
                                            return (
                                                <div key={`${item.productId}-${item.variantId}`} className="px-3 py-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm text-gray-900 dark:text-white truncate flex-1 mr-2">
                                                            {item.productName}
                                                        </p>
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            {isPositive ? (
                                                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                                            ) : (
                                                                <TrendingDown className="w-3 h-3 text-red-500" />
                                                            )}
                                                            <span className={classNames(
                                                                'text-sm font-bold',
                                                                isPositive
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : 'text-red-600 dark:text-red-400'
                                                            )}>
                                                                {item.marginPercent.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-[10px] text-gray-400">
                                                        <span>Rev: {formatCurrency(item.revenue, true)}</span>
                                                        <span>COGS: {formatCurrency(item.cogs, true)}</span>
                                                        <span>Profit: {formatCurrency(item.grossProfit, true)}</span>
                                                        <span>{item.unitsSold} units</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileCOGSProfitability;
