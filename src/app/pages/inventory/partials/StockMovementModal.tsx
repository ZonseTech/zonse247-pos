import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    History,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Package,
    Calendar,
    Hash,
    User,
    FileText,
    ChevronLeft,
    ChevronRight,
    Filter,
    Download,
} from 'lucide-react';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import { useStockMovements } from '../../../hooks/useStockMovements';
import { formatCurrency } from '../../../utils';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface StockMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    variantId: string;
    variantName: string;
    productName: string;
    sku?: string;
}

const typeColors: Record<StockMovementType, string> = {
    PURCHASE_RECEIPT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    SALE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    RETURN: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    ADJUSTMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    TRANSFER_IN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    TRANSFER_OUT: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    DAMAGE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    EXPIRY: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    STOCK_TAKE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    PRODUCTION: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    CONSUMPTION: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const typeLabels: Record<StockMovementType, string> = {
    PURCHASE_RECEIPT: 'Purchase Receipt',
    SALE: 'Sale',
    RETURN: 'Return',
    ADJUSTMENT: 'Adjustment',
    TRANSFER_IN: 'Transfer In',
    TRANSFER_OUT: 'Transfer Out',
    DAMAGE: 'Damage',
    EXPIRY: 'Expiry',
    STOCK_TAKE: 'Stock Take',
    PRODUCTION: 'Production',
    CONSUMPTION: 'Consumption',
};

const StockMovementModal: React.FC<StockMovementModalProps> = ({
    isOpen,
    onClose,
    variantId,
    variantName,
    productName,
    sku,
}) => {
    const {
        movements,
        isLoading,
        loadMovements,
        page,
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
    } = useStockMovements(undefined, variantId);

    const [showFilters, setShowFilters] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (isOpen && variantId) {
            setPerPage(15);
            loadMovements();
        }
    }, [isOpen, variantId]);

    if (!isOpen) return null;

    const totalPages = Math.ceil(totalRows / perPage);

    // Calculate summary stats
    const totalIn = movements.filter(m => m.direction === 'IN').reduce((sum, m) => sum + m.quantity, 0);
    const totalOut = movements.filter(m => m.direction === 'OUT').reduce((sum, m) => sum + m.quantity, 0);
    const netChange = totalIn - totalOut;

    const handleExport = () => {
        const csvContent = [
            ['Date', 'Type', 'Direction', 'Quantity', 'Before', 'After', 'Unit Cost', 'Reference', 'Notes'].join(','),
            ...movements.map(m => [
                dayjs(m.movementDate).format('YYYY-MM-DD HH:mm'),
                m.movementType,
                m.direction,
                m.quantity,
                m.previousQuantity,
                m.newQuantity,
                m.unitCost,
                m.referenceNumber || '',
                (m.notes || '').replace(/,/g, ';'),
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-movements-${variantName}-${dayjs().format('YYYYMMDD')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col ${isMobile
                    ? 'h-full'
                    : 'max-w-5xl max-h-[90vh] rounded-xl mx-4'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'
                    }`}>
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                        <div className={`shrink-0 bg-sky-100 dark:bg-sky-900/30 rounded-lg ${isMobile ? 'p-1.5' : 'p-2'}`}>
                            <History className={`text-sky-600 dark:text-sky-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                        </div>
                        <div className="min-w-0">
                            <h2 className={`font-semibold text-gray-900 dark:text-white ${isMobile ? 'text-sm' : 'text-lg'}`}>
                                {isMobile ? 'Stock Movements' : 'Stock Movement History'}
                            </h2>
                            <p className={`text-gray-500 dark:text-gray-400 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                {productName} - <span className="font-medium">{variantName}</span>
                                {sku && !isMobile && <span className="ml-2 font-mono text-xs">({sku})</span>}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Summary Cards */}
                <div className={`border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${isMobile ? 'px-3 py-2 overflow-x-auto' : 'px-6 py-4'
                    }`}>
                    <div className={`flex gap-2 md:gap-4 ${isMobile ? 'min-w-max' : 'grid grid-cols-3'}`}>
                        <div className={`flex items-center gap-2 md:gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${isMobile ? 'p-2 min-w-[100px]' : 'p-3'
                            }`}>
                            <div className={`rounded-lg bg-green-100 dark:bg-green-900/30 ${isMobile ? 'p-1.5' : 'p-2'}`}>
                                <TrendingUp className={`text-green-600 dark:text-green-400 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                            </div>
                            <div>
                                <p className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Total In</p>
                                <p className={`font-bold text-green-600 dark:text-green-400 ${isMobile ? 'text-sm' : 'text-lg'}`}>+{totalIn}</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 md:gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${isMobile ? 'p-2 min-w-[100px]' : 'p-3'
                            }`}>
                            <div className={`rounded-lg bg-red-100 dark:bg-red-900/30 ${isMobile ? 'p-1.5' : 'p-2'}`}>
                                <TrendingDown className={`text-red-600 dark:text-red-400 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                            </div>
                            <div>
                                <p className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Total Out</p>
                                <p className={`font-bold text-red-600 dark:text-red-400 ${isMobile ? 'text-sm' : 'text-lg'}`}>-{totalOut}</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 md:gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${isMobile ? 'p-2 min-w-[100px]' : 'p-3'
                            }`}>
                            <div className={`rounded-lg ${isMobile ? 'p-1.5' : 'p-2'} ${netChange >= 0 ? 'bg-sky-100 dark:bg-sky-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                                <RefreshCw className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} ${netChange >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-orange-600 dark:text-orange-400'}`} />
                            </div>
                            <div>
                                <p className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Net</p>
                                <p className={`font-bold ${isMobile ? 'text-sm' : 'text-lg'} ${netChange >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                    {netChange >= 0 ? '+' : ''}{netChange}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Toggle */}
                <div className={`border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${isMobile ? 'px-3 py-2' : 'px-6 py-3'
                    }`}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${showFilters
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button
                        onClick={handleExport}
                        className={`flex items-center gap-2 text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors ${isMobile ? 'px-2 py-1.5' : 'px-3 py-1.5'
                            }`}
                    >
                        <Download className="w-4 h-4" />
                        {!isMobile && 'Export CSV'}
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className={`bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700 ${isMobile ? 'px-3 py-3' : 'px-6 py-4'
                        }`}>
                        <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3 gap-4'}`}>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Movement Type
                                </label>
                                <select
                                    value={movementTypeFilter}
                                    onChange={(e) => setMovementTypeFilter(e.target.value as StockMovementType | '')}
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                >
                                    <option value="">All Types</option>
                                    {Object.entries(typeLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    From Date
                                </label>
                                <DatePicker
                                    selected={startDate ? new Date(startDate) : null}
                                    onChange={((date: Date | null) => setStartDate(date ? dayjs(date).format('YYYY-MM-DD') : '')) as any}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select start date"
                                    isClearable
                                    withPortal={isMobile}
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    portalId="datepicker-portal"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    To Date
                                </label>
                                <DatePicker
                                    selected={endDate ? new Date(endDate) : null}
                                    onChange={((date: Date | null) => setEndDate(date ? dayjs(date).format('YYYY-MM-DD') : '')) as any}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select end date"
                                    isClearable
                                    minDate={startDate ? new Date(startDate) : undefined}
                                    withPortal={isMobile}
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    portalId="datepicker-portal"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Table / Mobile Cards */}
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
                        </div>
                    ) : movements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                            <History className={`mb-3 opacity-50 ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`} />
                            <p className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>No movements found</p>
                            <p className="text-sm">Adjust filters or check back later</p>
                        </div>
                    ) : isMobile ? (
                        /* Mobile Card Layout */
                        <div className="p-3 space-y-2">
                            {movements.map((movement) => {
                                const isIn = movement.direction === 'IN';
                                const isOut = movement.direction === 'OUT';
                                const Icon = isIn ? TrendingUp : isOut ? TrendingDown : RefreshCw;
                                const colorClass = isIn
                                    ? 'text-green-600 dark:text-green-400'
                                    : isOut
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-yellow-600 dark:text-yellow-400';

                                return (
                                    <div
                                        key={movement.id}
                                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                                    >
                                        {/* Row 1: Type badge and Change */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[movement.movementType]}`}>
                                                {typeLabels[movement.movementType]}
                                            </span>
                                            <div className={`flex items-center gap-1 font-bold ${colorClass}`}>
                                                <Icon className="w-4 h-4" />
                                                <span className="text-base">
                                                    {isIn ? '+' : isOut ? '-' : '±'}{movement.quantity}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Row 2: Date and Stock Level */}
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            <span>{dayjs(movement.movementDate).format('DD MMM YYYY, HH:mm')}</span>
                                            <span>
                                                {movement.previousQuantity} → <span className="font-semibold text-gray-900 dark:text-white">{movement.newQuantity}</span>
                                            </span>
                                        </div>

                                        {/* Row 3: Reference and Cost (if available) */}
                                        {(movement.referenceNumber || movement.unitCost > 0 || movement.notes) && (
                                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2 text-xs">
                                                {movement.referenceNumber && (
                                                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                                        <Hash className="w-3 h-3" />
                                                        {movement.referenceNumber}
                                                    </span>
                                                )}
                                                {movement.unitCost > 0 && (
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        {formatCurrency(movement.unitCost)}
                                                    </span>
                                                )}
                                                {movement.notes && (
                                                    <span className="text-gray-500 dark:text-gray-400 truncate flex-1 min-w-0">
                                                        {movement.notes}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Desktop Table Layout */
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Change
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Stock Level
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Unit Cost
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Reference
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Notes
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {movements.map((movement, index) => {
                                    const isIn = movement.direction === 'IN';
                                    const isOut = movement.direction === 'OUT';
                                    const Icon = isIn ? TrendingUp : isOut ? TrendingDown : RefreshCw;
                                    const colorClass = isIn
                                        ? 'text-green-600 dark:text-green-400'
                                        : isOut
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-yellow-600 dark:text-yellow-400';

                                    return (
                                        <tr
                                            key={movement.id}
                                            className={`${index % 2 === 0
                                                ? 'bg-white dark:bg-gray-900'
                                                : 'bg-gray-50/50 dark:bg-gray-800/30'
                                                } hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-colors`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {dayjs(movement.movementDate).format('DD MMM YYYY')}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {dayjs(movement.movementDate).format('HH:mm')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[movement.movementType]}`}>
                                                    {typeLabels[movement.movementType]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className={`inline-flex items-center gap-1.5 font-bold ${colorClass}`}>
                                                    <Icon className="w-4 h-4" />
                                                    <span className="text-lg">
                                                        {isIn ? '+' : isOut ? '-' : '±'}{movement.quantity}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2 text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">{movement.previousQuantity}</span>
                                                    <span className="text-gray-400">→</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">{movement.newQuantity}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {movement.unitCost > 0 ? (
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatCurrency(movement.unitCost)}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {movement.referenceNumber ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Hash className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                                                            {movement.referenceNumber}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {movement.notes ? (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]" title={movement.notes}>
                                                        {movement.notes}
                                                    </p>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalRows > perPage && (
                    <div className={`border-t border-gray-200 dark:border-gray-700 flex items-center bg-gray-50 dark:bg-gray-800/50 ${isMobile ? 'px-3 py-2 justify-center gap-4' : 'px-6 py-3 justify-between'
                        }`}>
                        {!isMobile && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, totalRows)} of {totalRows} movements
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className={`py-1 font-medium text-gray-700 dark:text-gray-300 ${isMobile ? 'text-xs px-2' : 'text-sm px-3'}`}>
                                {isMobile ? `${page}/${totalPages}` : `${page} / ${totalPages}`}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        {isMobile && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {totalRows} total
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default StockMovementModal;
