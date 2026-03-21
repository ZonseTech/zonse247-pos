import { FC, useContext, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, ShoppingCart, Percent } from 'lucide-react';
import classNames from 'classnames';
import DataTable, { TableColumn } from 'react-data-table-component';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import { Box, Flex } from '@radix-ui/themes';
import { ZonseThemeContext } from '../../../components';
import { SearchBar } from '../../../components/SearchBar';
import TableSkeleton from '../../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../../components/TableEmptyState';
import { getTableStyles } from '../../../utils/table-styles';
import { formatCurrency } from '../../../utils';
import { useIsMobile, useIsEBN } from '../../../hooks/useMediaQuery';

interface GrossProfitTableProps {
    items: GrossProfitProductItem[];
    summary: GrossProfitSummary | null;
    isLoading: boolean;
    searchTerm: string;
    onSearch: (value: string) => void;
    totalRows: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerRowsChange: (newPerPage: number, page: number) => void;
}

interface SummaryCard {
    title: string;
    value: string;
    icon: FC<{ className?: string }>;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
}

const GrossProfitTable: FC<GrossProfitTableProps> = ({
    items, summary, isLoading,
    searchTerm, onSearch,
    totalRows, perPage, onPageChange, onPerRowsChange,
}) => {
    const { mode } = useContext(ZonseThemeContext);
    const isMobile = useIsMobile();
    const isEBN = useIsEBN();

    const summaryCards: SummaryCard[] = useMemo(() => {
        if (!summary) return [];
        const profitPositive = summary.totalGrossProfit >= 0;
        const marginPositive = summary.overallMarginPercent >= 0;
        return [
            {
                title: 'Total Revenue',
                value: formatCurrency(summary.totalRevenue, true),
                icon: DollarSign,
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-600 dark:text-sky-400',
            },
            {
                title: 'Total COGS',
                value: formatCurrency(summary.totalCOGS, true),
                icon: BarChart3,
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-600 dark:text-red-400',
            },
            {
                title: 'Gross Profit',
                value: formatCurrency(summary.totalGrossProfit, true),
                icon: TrendingUp,
                bgColor: profitPositive ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: profitPositive ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40',
                textColor: profitPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
            },
            {
                title: 'Overall Margin',
                value: `${summary.overallMarginPercent.toFixed(1)}%`,
                icon: Percent,
                bgColor: marginPositive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: marginPositive ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40',
                textColor: marginPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
            },
            {
                title: 'Units Sold',
                value: summary.totalUnitsSold.toLocaleString(),
                icon: ShoppingCart,
                bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
                iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
                textColor: 'text-indigo-600 dark:text-indigo-400',
            },
        ];
    }, [summary]);

    const columns: TableColumn<GrossProfitProductItem>[] = [
        {
            name: 'Product',
            sortable: true,
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

    const gridClass = classNames(
        isEBN
            ? 'grid grid-cols-5 gap-1.5 p-2'
            : 'grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 py-3 sm:py-4',
    );

    return (
        <div>
            {/* Summary Cards */}
            <Tooltip.Provider delayDuration={300}>
                <Box px="4">
                    <div className={gridClass}>
                        {isLoading ? (
                            Array.from({ length: 5 }, (_, i) => (
                                <div
                                    key={i}
                                    className={classNames(
                                        'bg-gray-50 dark:bg-gray-700/50 animate-pulse',
                                        isEBN ? 'rounded-lg p-2' : 'rounded-xl p-3 sm:p-4',
                                    )}
                                >
                                    <div className={classNames('flex items-center', isEBN ? 'gap-2' : 'gap-2 sm:gap-3')}>
                                        <Avatar.Root
                                            className={classNames(
                                                'bg-gray-200 dark:bg-gray-600 flex-shrink-0 inline-flex items-center justify-center',
                                                isEBN ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 sm:w-12 sm:h-12 rounded-xl',
                                            )}
                                        >
                                            <Avatar.Fallback delayMs={0} className="w-full h-full" />
                                        </Avatar.Root>
                                        <div className="flex-1 min-w-0">
                                            <Separator.Root decorative className={classNames('bg-gray-200 dark:bg-gray-600 rounded', isEBN ? 'h-2.5 w-12 mb-1' : 'h-3 w-14 mb-1.5')} />
                                            <Separator.Root decorative className={classNames('bg-gray-200 dark:bg-gray-600 rounded', isEBN ? 'h-4 w-16' : 'h-5 w-20')} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            summaryCards.map((card, idx) => {
                                const Icon = card.icon;
                                const isRightSide = isMobile ? idx % 3 === 2 : idx >= 3;

                                const cardContent = isEBN ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar.Root className={classNames(card.iconBgColor, 'p-1.5 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
                                            <Avatar.Fallback delayMs={0}>
                                                <Icon className={classNames('w-4 h-4', card.textColor)} />
                                            </Avatar.Fallback>
                                        </Avatar.Root>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight">{card.title}</p>
                                            <p className={classNames('text-xs font-bold leading-tight truncate', card.textColor)}>{card.value}</p>
                                        </div>
                                    </div>
                                ) : isMobile ? (
                                    <div className="flex flex-col items-center text-center gap-1">
                                        <Avatar.Root className={classNames(card.iconBgColor, 'p-2 rounded-lg inline-flex items-center justify-center')}>
                                            <Avatar.Fallback delayMs={0}>
                                                <Icon className={classNames('w-5 h-5', card.textColor)} />
                                            </Avatar.Fallback>
                                        </Avatar.Root>
                                        <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight">{card.title}</p>
                                        <p className={classNames('text-xs font-bold leading-tight truncate w-full', card.textColor)}>{card.value}</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Avatar.Root className={classNames(card.iconBgColor, 'p-2.5 rounded-xl flex-shrink-0 inline-flex items-center justify-center')}>
                                            <Avatar.Fallback delayMs={0}>
                                                <Icon className={classNames('w-6 h-6', card.textColor)} />
                                            </Avatar.Fallback>
                                        </Avatar.Root>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight">{card.title}</p>
                                            <p className={classNames('text-base font-bold leading-tight truncate', card.textColor)}>{card.value}</p>
                                        </div>
                                    </div>
                                );

                                const cardClassName = classNames(
                                    card.bgColor,
                                    'transition-all duration-200',
                                    isEBN
                                        ? 'rounded-lg p-2 hover:shadow-sm cursor-pointer select-none'
                                        : ['rounded-xl p-2 sm:p-4 hover:shadow-md', isMobile && 'cursor-pointer select-none'],
                                );

                                if (isMobile || isEBN) {
                                    return (
                                        <Popover.Root key={idx}>
                                            <Popover.Trigger asChild>
                                                <button type="button" className={classNames(cardClassName, 'text-left w-full')}>
                                                    {cardContent}
                                                </button>
                                            </Popover.Trigger>
                                            <Popover.Portal>
                                                <Popover.Content
                                                    side="bottom"
                                                    align={isRightSide ? 'end' : 'start'}
                                                    sideOffset={isEBN ? 4 : 8}
                                                    className={classNames(
                                                        card.bgColor,
                                                        'rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 p-3',
                                                        'z-50 whitespace-nowrap',
                                                        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                                                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                                                    )}
                                                >
                                                    <div className="flex flex-col items-center text-center gap-2">
                                                        <Avatar.Root className={classNames(card.iconBgColor, 'p-2 rounded-lg inline-flex items-center justify-center')}>
                                                            <Avatar.Fallback delayMs={0}>
                                                                <Icon className={classNames('w-5 h-5', card.textColor)} />
                                                            </Avatar.Fallback>
                                                        </Avatar.Root>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                                                            <p className={classNames('text-base font-bold whitespace-nowrap', card.textColor)}>{card.value}</p>
                                                        </div>
                                                    </div>
                                                </Popover.Content>
                                            </Popover.Portal>
                                        </Popover.Root>
                                    );
                                }

                                return (
                                    <Tooltip.Root key={idx}>
                                        <Tooltip.Trigger asChild>
                                            <div className={cardClassName}>
                                                {cardContent}
                                            </div>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content
                                                side="bottom"
                                                sideOffset={6}
                                                className={classNames(
                                                    'z-50 rounded-lg px-3 py-2 shadow-lg',
                                                    'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900',
                                                    'text-xs font-semibold',
                                                    'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0',
                                                    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
                                                )}
                                            >
                                                {card.title}: {card.value}
                                                <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-100" />
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                );
                            })
                        )}
                    </div>
                </Box>
                <Separator.Root decorative className="h-px bg-gray-200 dark:bg-gray-700" />
            </Tooltip.Provider>

            {/* Search */}
            <Flex
                align="center"
                px="4"
                py="3"
                className="border-b border-gray-200 dark:border-gray-700"
            >
                <SearchBar
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={onSearch}
                    className="w-full sm:flex-1 sm:max-w-xs"
                />
            </Flex>

            {/* Table */}
            <DataTable
                columns={columns}
                data={items}
                theme={mode as string}
                progressPending={isLoading}
                progressComponent={<TableSkeleton rows={perPage} columns={6} />}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={perPage}
                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                onChangePage={onPageChange}
                onChangeRowsPerPage={onPerRowsChange}
                customStyles={getTableStyles(mode)}
                highlightOnHover
                responsive
                persistTableHead
                fixedHeader
                defaultSortFieldId={6}
                defaultSortAsc={false}
                noDataComponent={
                    <TableEmptyState
                        icon={<TrendingUp />}
                        title="No profit data"
                        description={
                            searchTerm
                                ? 'No products match your search.'
                                : 'No profit data for this period.'
                        }
                    />
                }
            />
        </div>
    );
};

export default GrossProfitTable;
