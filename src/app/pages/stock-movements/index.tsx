import { FunctionComponent, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { Activity, SlidersHorizontal, ShieldAlert, Clock, ClipboardCheck, ArrowRightLeft, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import DataTable from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../components/TableEmptyState';
import SummaryCards, { type SummaryCardItem } from '../../components/stats/SummaryCards';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext, Button } from '../../components';
import { useStockMovements } from '../../hooks/useStockMovements';
import { getStockMovementTableColumns } from './partials/StockMovementTableColumns';
import Filters from './partials/Filters';
import { useIsMobile } from '../../hooks/useMediaQuery';
import MobileStockMovements from './MobileStockMovements';
import StockAdjustmentModal from './partials/StockAdjustmentModal';
import DamageStockModal from './partials/DamageStockModal';
import ExpiryStockModal from './partials/ExpiryStockModal';
import StockCountModal from './partials/StockCountModal';
import StockTransferModal from './partials/StockTransferModal';

type ModalType = 'adjust' | 'damage' | 'expiry' | 'count' | 'transfer' | null;

const StockMovements: FunctionComponent = () => {
    const location = useLocation();
    const { mode } = useContext(ZonseThemeContext);
    const isMobile = useIsMobile();
    const productId = (location.state as any)?.productId;
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    if (isMobile) {
        return <MobileStockMovements />;
    }

    const {
        movements,
        isLoading,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        movementTypeFilter,
        setMovementTypeFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        adjustStock,
        damageStock,
        transferStock,
        performStockCount,
        recordExpiry,
        tenantId,
        branchId,
        userId,
    } = useStockMovements(productId);

    const summaryCards: SummaryCardItem[] = useMemo(() => {
        const inCount = movements.filter(m => m.direction === 'IN').length;
        const outCount = movements.filter(m => m.direction === 'OUT').length;
        const adjustmentCount = movements.filter(m => m.direction === 'ADJUSTMENT').length;

        return [
            {
                title: 'Total Movements',
                value: totalRows,
                icon: <Activity className="w-5 h-5" />,
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Stock In',
                value: inCount,
                icon: <TrendingUp className="w-5 h-5" />,
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Stock Out',
                value: outCount,
                icon: <TrendingDown className="w-5 h-5" />,
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-500 dark:text-red-400',
            },
            {
                title: 'Adjustments',
                value: adjustmentCount,
                icon: <RefreshCw className="w-5 h-5" />,
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
        ];
    }, [movements, totalRows]);

    const columns = getStockMovementTableColumns();

    return (
        <AppLayout>
            <PageHeader
                icon={<Activity className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                title="Stock Movements"
                description={productId ? 'Product stock history' : 'All stock movements audit trail'}
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                {/* Action Toolbar + Filters */}
                <div className="px-4 pt-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <Filters
                            movementTypeFilter={movementTypeFilter}
                            onMovementTypeChange={setMovementTypeFilter}
                            startDate={startDate}
                            onStartDateChange={setStartDate}
                            endDate={endDate}
                            onEndDateChange={setEndDate}
                        />
                        <div className="flex flex-wrap gap-2 flex-shrink-0">
                            <Button
                                theme="primary"
                                layout="outline"
                                size="small"
                                onClick={() => setActiveModal('adjust')}
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                                Adjust
                            </Button>
                            <Button
                                theme="warning"
                                layout="outline"
                                size="small"
                                onClick={() => setActiveModal('damage')}
                            >
                                <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                                Damage
                            </Button>
                            <Button
                                theme="danger"
                                layout="outline"
                                size="small"
                                onClick={() => setActiveModal('expiry')}
                            >
                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                Expiry
                            </Button>
                            <Button
                                theme="success"
                                layout="outline"
                                size="small"
                                onClick={() => setActiveModal('count')}
                            >
                                <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />
                                Count
                            </Button>
                            <Button
                                theme="primary"
                                layout="outline"
                                size="small"
                                onClick={() => setActiveModal('transfer')}
                            >
                                <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
                                Transfer
                            </Button>
                        </div>
                    </div>
                </div>

                <SummaryCards
                    cards={summaryCards}
                    isLoading={isLoading}
                    skeletonCount={4}
                    variant="embedded"
                />

                <div className="overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={movements}
                        theme={mode as string}
                        progressPending={isLoading}
                        progressComponent={<TableSkeleton rows={10} columns={6} />}
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
                        paginationPerPage={perPage}
                        paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                        onChangeRowsPerPage={setPerPage}
                        onChangePage={setPage}
                        customStyles={getTableStyles(mode)}
                        highlightOnHover
                        responsive
                        persistTableHead
                        fixedHeader
                        noDataComponent={
                            <TableEmptyState
                                icon={<Activity />}
                                title="No stock movements found"
                                description={
                                    movementTypeFilter || startDate || endDate
                                        ? 'Try adjusting your filters.'
                                        : 'Stock movements will appear here.'
                                }
                            />
                        }
                    />
                </div>
            </div>

            {/* Modals */}
            <StockAdjustmentModal
                isOpen={activeModal === 'adjust'}
                onClose={() => setActiveModal(null)}
                onSubmit={adjustStock}
            />
            <DamageStockModal
                isOpen={activeModal === 'damage'}
                onClose={() => setActiveModal(null)}
                onSubmit={damageStock}
            />
            <ExpiryStockModal
                isOpen={activeModal === 'expiry'}
                onClose={() => setActiveModal(null)}
                onSubmit={recordExpiry}
            />
            <StockCountModal
                isOpen={activeModal === 'count'}
                onClose={() => setActiveModal(null)}
                onSubmit={performStockCount}
            />
            <StockTransferModal
                isOpen={activeModal === 'transfer'}
                onClose={() => setActiveModal(null)}
                onSubmit={transferStock}
                tenantId={tenantId}
                branchId={branchId}
                userId={userId}
            />
        </AppLayout>
    );
};

export default StockMovements;