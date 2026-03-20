import { FunctionComponent, useEffect, useState } from 'react';
import {
    DollarSign,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
    BarChart3,
    TrendingUp,
} from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, Label } from '../../components';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useCOGSReport } from '../../hooks/useCOGSReport';
import PeriodCOGSChart from './partials/PeriodCOGSChart';
import GrossProfitTable from './partials/GrossProfitTable';
import MobileCOGSProfitability from './MobileCOGSProfitability';

type ActiveTab = 'cogs' | 'profit';

const COGSProfitability: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<ActiveTab>('cogs');

    const {
        startDate, setStartDate,
        endDate, setEndDate,
        periodCOGS, salesCOGS,
        isLoadingCOGS,
        showCrossCheck, setShowCrossCheck,
        cogsDiscrepancy, hasDiscrepancy,
        grossProfit,
        isLoadingProfit,
        loadAll,
    } = useCOGSReport();

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    if (isMobile) {
        return <MobileCOGSProfitability />;
    }

    return (
        <AppLayout>
            <PageHeader
                icon={<DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-red-500 dark:text-red-400" />}
                title="COGS & Profitability"
                description="Cost of Goods Sold analysis and gross profit by product"
            />

            {/* Date Range + Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="flex-1 grid grid-cols-2 gap-4 max-w-md">
                        <div>
                            <Label>Start Date</Label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Cross-check toggle */}
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
                            onClick={loadAll}
                            disabled={isLoadingCOGS || isLoadingProfit}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${(isLoadingCOGS || isLoadingProfit) ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('cogs')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'cogs'
                            ? 'border-red-500 text-red-600 dark:text-red-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    Period COGS
                </button>
                <button
                    onClick={() => setActiveTab('profit')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profit'
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <TrendingUp className="w-4 h-4" />
                    Gross Profit by Product
                </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                {activeTab === 'cogs' ? (
                    <PeriodCOGSChart
                        periodCOGS={periodCOGS}
                        salesCOGS={salesCOGS}
                        showCrossCheck={showCrossCheck}
                        isLoading={isLoadingCOGS}
                        cogsDiscrepancy={cogsDiscrepancy}
                        hasDiscrepancy={hasDiscrepancy}
                    />
                ) : (
                    <GrossProfitTable
                        data={grossProfit}
                        isLoading={isLoadingProfit}
                    />
                )}
            </div>
        </AppLayout>
    );
};

export default COGSProfitability;
