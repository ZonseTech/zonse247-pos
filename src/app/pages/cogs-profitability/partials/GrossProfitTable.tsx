import { FC, useContext, useMemo, useState } from 'react';
import { Search, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { ZonseThemeContext, ComponentLoader } from '../../../components';
import { getTableStyles } from '../../../utils/table-styles';
import { formatCurrency } from '../../../utils';

type ProfitProduct = GrossProfitByProductResult['byProduct'][number];

interface GrossProfitTableProps {
    data: GrossProfitByProductResult | null;
    isLoading: boolean;
}

const GrossProfitTable: FC<GrossProfitTableProps> = ({ data, isLoading }) => {
    const { mode } = useContext(ZonseThemeContext);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        if (!data?.byProduct) return [];
        const sorted = [...data.byProduct].sort((a, b) => b.marginPercent - a.marginPercent);
        if (!searchTerm.trim()) return sorted;
        const term = searchTerm.toLowerCase();
        return sorted.filter(
            (p) =>
                p.productName.toLowerCase().includes(term) ||
                p.sku?.toLowerCase().includes(term)
        );
    }, [data?.byProduct, searchTerm]);

    const columns: TableColumn<ProfitProduct>[] = [
        {
            name: 'Product',
            sortable: true,
            minWidth: '200px',
            selector: (row) => row.productName,
            cell: (row) => (
                <div className="py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {row.productName}
                    </p>
                    {row.sku && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{row.sku}</p>
                    )}
                </div>
            ),
        },
        {
            name: 'Units',
            sortable: true,
            width: '80px',
            right: true,
            selector: (row) => row.unitsSold,
            cell: (row) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {row.unitsSold.toLocaleString()}
                </span>
            ),
        },
        {
            name: 'Revenue',
            sortable: true,
            width: '120px',
            right: true,
            selector: (row) => row.revenue,
            cell: (row) => (
                <span className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(row.revenue, true)}
                </span>
            ),
        },
        {
            name: 'COGS',
            sortable: true,
            width: '120px',
            right: true,
            selector: (row) => row.cogs,
            cell: (row) => (
                <span className="text-sm text-red-600 dark:text-red-400">
                    {formatCurrency(row.cogs, true)}
                </span>
            ),
        },
        {
            name: 'Profit',
            sortable: true,
            width: '120px',
            right: true,
            selector: (row) => row.grossProfit,
            cell: (row) => (
                <span className={`text-sm font-semibold ${row.grossProfit >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                    {formatCurrency(row.grossProfit, true)}
                </span>
            ),
        },
        {
            name: 'Margin',
            sortable: true,
            width: '100px',
            right: true,
            selector: (row) => row.marginPercent,
            cell: (row) => {
                const isPositive = row.marginPercent >= 0;
                return (
                    <div className="flex items-center gap-1 justify-end">
                        {isPositive ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span className={`text-sm font-bold ${isPositive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                            {row.marginPercent.toFixed(1)}%
                        </span>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-3">
            {/* Summary strip */}
            {data && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <MiniStat
                        label="Total Revenue"
                        value={formatCurrency(data.totalRevenue, true)}
                        color="text-sky-600 dark:text-sky-400"
                    />
                    <MiniStat
                        label="Total COGS"
                        value={formatCurrency(data.totalCOGS, true)}
                        color="text-red-600 dark:text-red-400"
                    />
                    <MiniStat
                        label="Gross Profit"
                        value={formatCurrency(data.totalGrossProfit, true)}
                        color={data.totalGrossProfit >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'}
                    />
                    <MiniStat
                        label="Overall Margin"
                        value={`${data.overallMarginPercent.toFixed(1)}%`}
                        color={data.overallMarginPercent >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'}
                    />
                    <MiniStat
                        label="Units Sold"
                        value={data.totalUnitsSold.toLocaleString()}
                        color="text-indigo-600 dark:text-indigo-400"
                    />
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={filteredProducts}
                theme={mode as string}
                progressPending={isLoading}
                progressComponent={<ComponentLoader loading={isLoading} />}
                pagination
                paginationPerPage={15}
                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                customStyles={getTableStyles(mode)}
                highlightOnHover
                responsive
                persistTableHead
                fixedHeader
                defaultSortFieldId={6}
                defaultSortAsc={false}
                noDataComponent={
                    <div className="text-center py-12">
                        {isLoading ? (
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                        ) : (
                            <>
                                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {searchTerm
                                        ? 'No products match your search.'
                                        : 'No profit data for this period.'}
                                </p>
                            </>
                        )}
                    </div>
                }
            />
        </div>
    );
};

// ─── Mini Stat ─────────────────────────────────────────────────────────────

const MiniStat: FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
            {label}
        </p>
        <p className={`text-lg font-bold ${color} mt-0.5`}>{value}</p>
    </div>
);

export default GrossProfitTable;
