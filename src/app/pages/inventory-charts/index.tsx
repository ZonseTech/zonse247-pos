import { FunctionComponent, useContext, useEffect, useState } from 'react';
import {
    BarChart3,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import { ZonseThemeContext, ComponentLoader, Button, Label } from '../../components';
import { useInventoryAging } from '../../hooks/useInventoryAging';
import { useCOGSReport } from '../../hooks/useCOGSReport';
import AgingBucketChart from '../inventory-aging/partials/AgingBucketChart';
import PeriodCOGSChart from '../cogs-profitability/partials/PeriodCOGSChart';
import PageHeader from '../../components/page/PageHeader';
import { useIsMobile } from '../../hooks/useMediaQuery';

const CHART_METRICS = [
    { value: 'totalValue' as const, label: 'Value' },
    { value: 'itemCount' as const, label: 'Items' },
    { value: 'totalQuantity' as const, label: 'Qty' },
];

const InventoryCharts: FunctionComponent = () => {
    const { mode } = useContext(ZonseThemeContext);
    const isDark = mode === 'dark';
    const isMobile = useIsMobile();
    const [chartMetric, setChartMetric] = useState<'totalValue' | 'itemCount' | 'totalQuantity'>('totalValue');

    const {
        isLoading: isLoadingAging,
        loadAgingReport,
        getBucketChartData,
    } = useInventoryAging();

    const {
        startDate, setStartDate,
        endDate, setEndDate,
        periodCOGSItems, periodCOGSSummary,
        salesCOGSItems, salesCOGSSummary,
        isLoadingCOGS,
        showCrossCheck, setShowCrossCheck,
        cogsDiscrepancy, hasDiscrepancy,
        loadAll: loadCOGS,
    } = useCOGSReport();

    useEffect(() => {
        loadAgingReport();
        loadCOGS();
    }, [loadAgingReport, loadCOGS]);

    const bucketChartData = getBucketChartData();
    const isRefreshing = isLoadingAging || isLoadingCOGS;

    const handleRefresh = () => {
        loadAgingReport();
        loadCOGS();
    };

    return (
        <div className="space-y-6">
            {!isMobile && (
                <PageHeader
                    title="Inventory Charts"
                    description="Visual overview of stock aging and cost of goods sold"
                    icon={<BarChart3 className="w-7 h-7 text-sky-500" />}
                    action={
                        <Button
                            theme="primary"
                            size="small"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    }
                />
            )}

            {/* Period COGS Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-red-500" />
                            Period COGS
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Cost of Goods Sold by product for the selected period
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div>
                                <Label>Start</Label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="mt-1 w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <Label>End</Label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="mt-1 w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCrossCheck(!showCrossCheck)}
                            className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="Compare ledger COGS with sales-derived COGS"
                        >
                            {showCrossCheck ? (
                                <ToggleRight className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <ToggleLeft className="w-5 h-5" />
                            )}
                            Cross-check
                        </button>
                        <Button
                            theme="primary"
                            size="small"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
                <div className="p-4">
                    <PeriodCOGSChart
                        items={periodCOGSItems}
                        summary={periodCOGSSummary}
                        salesItems={salesCOGSItems}
                        salesSummary={salesCOGSSummary}
                        showCrossCheck={showCrossCheck}
                        isLoading={isLoadingCOGS}
                        cogsDiscrepancy={cogsDiscrepancy}
                        hasDiscrepancy={hasDiscrepancy}
                    />
                </div>
            </div>

            {/* Aging Distribution Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Aging Distribution
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Stock grouped by days since last sale
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {CHART_METRICS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setChartMetric(value)}
                                    className={`px-3 py-1.5 text-xs font-semibold transition-colors ${chartMetric === value
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    {isLoadingAging ? (
                        <div className="h-64 flex items-center justify-center">
                            <ComponentLoader loading={true} />
                        </div>
                    ) : (
                        <AgingBucketChart data={bucketChartData} metric={chartMetric} isDark={isDark} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryCharts;
