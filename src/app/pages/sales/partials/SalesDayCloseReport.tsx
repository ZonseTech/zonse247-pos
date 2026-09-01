import { FC, useContext, useMemo } from "react";
import DataTable, { TableColumn, type Themes } from "react-data-table-component";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import { Box } from "@radix-ui/themes";
import { CalendarX2 } from "lucide-react";
import { HiOutlineClock, HiOutlineEye } from "react-icons/hi2";
import { ZonseThemeContext } from "../../../components";
import { ROUTES } from "../../../utils/constants";
import { getTableStyles } from "../../../utils/table-styles";
import { formatCurrency } from "../../../utils";
import TableSkeleton from "../../../components/skeleton/TableSkeleton";
import TableEmptyState from "../../../components/TableEmptyState";
import { useDayCloseReport } from "../hooks/useDayCloseReport";
import type { DayCloseReportRow } from "../../../services/sales.service";
import type { SaleSummaryCard } from "../../../hooks/useSaleSummary";
import SaleSummaryCards from "./SaleSummaryCards";

const getColumns = (onViewDetails: (date: string) => void): TableColumn<DayCloseReportRow>[] => [
    {
        name: "Date",
        selector: (row) => row.date,
        cell: (row) => (
            <div className="flex items-center gap-2">
                <HiOutlineClock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    {dayjs(row.date).format("DD-MM-YYYY")}
                </span>
            </div>
        ),
        sortable: true,
        grow: 1,
    },
    {
        name: "Units Sold",
        selector: (row) => row.unitsSold,
        cell: (row) => (
            <span className="text-sm text-gray-900 dark:text-white">{row.unitsSold}</span>
        ),
        sortable: true,
        grow: 1,
    },
    {
        name: "Revenue",
        selector: (row) => row.revenue,
        cell: (row) => (
            <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(row.revenue)}
            </span>
        ),
        sortable: true,
        grow: 1,
    },
    {
        name: "Cost of Sales",
        selector: (row) => row.costOfSales,
        cell: (row) => (
            <span className="text-orange-600 dark:text-orange-400">
                {formatCurrency(row.costOfSales)}
            </span>
        ),
        sortable: true,
        grow: 1,
    },
    {
        name: "Gross Profit",
        selector: (row) => row.grossProfit,
        cell: (row) => (
            <span className="text-sky-500 dark:text-sky-400 font-medium">
                {formatCurrency(row.grossProfit)}
            </span>
        ),
        sortable: true,
        grow: 1,
    },
    {
        name: "Expenses",
        selector: (row) => row.expenses,
        cell: (row) => (
            <span className="text-red-500 dark:text-red-400">
                {formatCurrency(row.expenses)}
            </span>
        ),
        sortable: true,
        grow: 1,
    },
    {
        name: "Net Profit",
        selector: (row) => row.netProfit,
        cell: (row) => (
            <span className="text-green-500 dark:text-green-400 font-semibold">
                {formatCurrency(row.netProfit)}
            </span>
        ),
        sortable: true,
        grow: 1,
    },
    {
        name: "Actions",
        width: "80px",
        cell: (row) => (
            <button
                onClick={() => onViewDetails(row.date)}
                className="p-1.5 text-sky-500 hover:text-sky-800 hover:bg-sky-50 dark:hover:bg-sky-900/50 rounded-md transition-colors duration-200"
                title="View Details"
            >
                <HiOutlineEye className="w-4 h-4" />
            </button>
        ),
        ignoreRowClick: true,
    },
];

interface SalesDayCloseReportProps {
    startDate: Date | null;
    endDate: Date | null;
}

const SalesDayCloseReport: FC<SalesDayCloseReportProps> = ({ startDate, endDate }) => {
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);
    const { rows, summary, isLoading } = useDayCloseReport({ startDate, endDate });

    const handleViewDetails = (date: string) => {
        navigate(ROUTES.DAY_CLOSE_REPORT_DETAILS.replace(':date', date));
    };

    const columns = getColumns(handleViewDetails);

    const summaryCards = useMemo((): SaleSummaryCard[] => [
        {
            title: "Total Revenue",
            value: summary.revenue,
            displayValue: formatCurrency(summary.revenue),
            bgColor: "bg-green-50 dark:bg-green-900/20",
            textColor: "text-green-700 dark:text-green-400",
            iconBgColor: "bg-green-100 dark:bg-green-900/40",
            isMonetary: true,
        },
        {
            title: "Cost of Sales",
            value: summary.costOfSales,
            displayValue: formatCurrency(summary.costOfSales),
            bgColor: "bg-orange-50 dark:bg-orange-900/20",
            textColor: "text-orange-700 dark:text-orange-400",
            iconBgColor: "bg-orange-100 dark:bg-orange-900/40",
            isMonetary: true,
        },
        {
            title: "Gross Profit",
            value: summary.grossProfit,
            displayValue: formatCurrency(summary.grossProfit),
            bgColor: "bg-sky-50 dark:bg-sky-900/20",
            textColor: "text-sky-700 dark:text-sky-400",
            iconBgColor: "bg-sky-100 dark:bg-sky-900/40",
            isMonetary: true,
        },
        {
            title: "Expenses",
            value: summary.expenses,
            displayValue: formatCurrency(summary.expenses),
            bgColor: "bg-red-50 dark:bg-red-900/20",
            textColor: "text-red-700 dark:text-red-400",
            iconBgColor: "bg-red-100 dark:bg-red-900/40",
            isMonetary: true,
        },
        {
            title: "Net Profit",
            value: summary.netProfit,
            displayValue: formatCurrency(summary.netProfit),
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            textColor: "text-emerald-700 dark:text-emerald-400",
            iconBgColor: "bg-emerald-100 dark:bg-emerald-900/40",
            isMonetary: true,
        },
    ], [summary]);

    return (
        <>
            <Box px={{ initial: "2", sm: "4" }}>
                <SaleSummaryCards cards={summaryCards} isLoading={isLoading} />
            </Box>

            <DataTable
                columns={columns}
                data={rows}
                theme={mode as Themes}
                customStyles={getTableStyles(mode)}
                progressPending={isLoading}
                progressComponent={
                    <TableSkeleton rows={5} columns={columns.length} showCheckbox={false} showActions />
                }
                highlightOnHover
                striped
                responsive
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 15, 25, 50]}
                noDataComponent={
                    <TableEmptyState
                        icon={<CalendarX2 />}
                        title="No day close data"
                        description="No sales or expenses were recorded for the selected date range."
                    />
                }
            />
        </>
    );
};

export default SalesDayCloseReport;
