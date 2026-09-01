import { FC, ReactNode, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import dayjs from "dayjs";
import { Notify } from "notiflix";
import { Table, Text, Dialog, Button, TextArea, Flex } from "@radix-ui/themes";
import { Wallet2, Wallet, Package, Banknote, CreditCard, Smartphone, Landmark, Sigma, Ban, X, type LucideIcon } from "lucide-react";
import { HiOutlineClock } from "react-icons/hi2";
import AppLayout from "../../layouts/AppLayout";
import PageHeader from "../../components/page/PageHeader";
import MobilePageHeader from "../../components/page/MobilePageHeader";
import { formatCurrency, hasPermission } from "../../utils";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { useAuth } from "../../context/AuthProvider";
import { ROUTES } from "../../utils/constants";
import TableEmptyState from "../../components/TableEmptyState";
import salesService from "../../services/sales.service";
import { useDayCloseReportDetails } from "./hooks/useDayCloseReportDetails";
import type { SaleSummaryCard } from "../../hooks/useSaleSummary";
import SaleSummaryCards from "./partials/SaleSummaryCards";

const STATUS_STYLES: Record<string, string> = {
    COMPLETED: "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
    APPROVED: "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
    VOIDED: "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
    REFUNDED: "text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30",
    PARTIALLY_REFUNDED: "text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30",
    PENDING_APPROVAL: "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
    REJECTED: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
};

const StatusBadge: FC<{ status: string }> = ({ status }) => (
    <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] || "text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-800"}`}
    >
        {status.replace(/_/g, " ")}
    </span>
);

interface PaymentMethodStyle {
    icon: LucideIcon;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
}

const PAYMENT_METHOD_STYLES: { match: RegExp; style: PaymentMethodStyle }[] = [
    {
        match: /cash/i,
        style: {
            icon: Banknote,
            bgColor: "bg-green-50 dark:bg-green-900/20",
            iconBgColor: "bg-green-100 dark:bg-green-900/40",
            textColor: "text-green-700 dark:text-green-400",
        },
    },
    {
        match: /pos/i,
        style: {
            icon: CreditCard,
            bgColor: "bg-sky-50 dark:bg-sky-900/20",
            iconBgColor: "bg-sky-100 dark:bg-sky-900/40",
            textColor: "text-sky-700 dark:text-sky-400",
        },
    },
    {
        match: /mobile/i,
        style: {
            icon: Smartphone,
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            iconBgColor: "bg-purple-100 dark:bg-purple-900/40",
            textColor: "text-purple-700 dark:text-purple-400",
        },
    },
    {
        match: /bank/i,
        style: {
            icon: Landmark,
            bgColor: "bg-orange-50 dark:bg-orange-900/20",
            iconBgColor: "bg-orange-100 dark:bg-orange-900/40",
            textColor: "text-orange-700 dark:text-orange-400",
        },
    },
];

const DEFAULT_PAYMENT_METHOD_STYLE: PaymentMethodStyle = {
    icon: Wallet,
    bgColor: "bg-gray-50 dark:bg-gray-800/40",
    iconBgColor: "bg-gray-100 dark:bg-gray-700/50",
    textColor: "text-gray-700 dark:text-gray-300",
};

const getPaymentMethodStyle = (methodName: string): PaymentMethodStyle =>
    PAYMENT_METHOD_STYLES.find(({ match }) => match.test(methodName))?.style ?? DEFAULT_PAYMENT_METHOD_STYLE;

const PaymentMethodCardsSkeleton: FC = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
            </div>
        ))}
    </div>
);

const TableRowsSkeleton: FC<{ rows?: number; columns: number }> = ({ rows = 3, columns }) => (
    <>
        {Array.from({ length: rows }, (_, rowIndex) => (
            <Table.Row key={rowIndex}>
                <Table.RowHeaderCell>
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </Table.RowHeaderCell>
                {Array.from({ length: columns - 1 }, (_, cellIndex) => (
                    <Table.Cell key={cellIndex} justify="end">
                        <div className="h-4 w-14 rounded bg-gray-200 dark:bg-gray-700 animate-pulse ml-auto" />
                    </Table.Cell>
                ))}
            </Table.Row>
        ))}
    </>
);

interface SectionCardProps {
    icon: ReactNode;
    title: string;
    count?: number;
    children: ReactNode;
}

const SectionCard: FC<SectionCardProps> = ({ icon, title, count, children }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-400 dark:text-gray-500">{icon}</span>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            {typeof count === "number" && (
                <span className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
                    {count}
                </span>
            )}
        </div>
        <div className="p-4">{children}</div>
    </div>
);

const DayCloseDetailsPage: FC = () => {
    const { date } = useParams<{ date: string }>();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { user } = useAuth();
    const { details, isLoading, loadDetails } = useDayCloseReportDetails(date);

    const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);
    const [voidReason, setVoidReason] = useState("");
    const [isVoiding, setIsVoiding] = useState(false);

    const canVoidSale = hasPermission(user, "sales.void");

    const handleBack = () => navigate(ROUTES.SALES);

    const handleConfirmVoid = async () => {
        const saleIds = (details?.sales || []).map((sale) => sale.id);
        if (saleIds.length === 0 || !voidReason.trim()) return;

        try {
            setIsVoiding(true);
            const result = await salesService.voidSalesByIds(saleIds, voidReason.trim());

            Notify.success(`Voided ${result.voidedCount} sale(s) for this date.`);

            setIsVoidDialogOpen(false);
            setVoidReason("");
            loadDetails();
        } catch (error: any) {
            console.error("Failed to void sales:", error);
            Notify.failure(error?.message || "Failed to void sales. Please try again.");
        } finally {
            setIsVoiding(false);
        }
    };

    const summaryCards = useMemo((): SaleSummaryCard[] => [
        {
            title: "Total Revenue",
            value: details?.revenue ?? 0,
            displayValue: formatCurrency(details?.revenue ?? 0),
            bgColor: "bg-green-50 dark:bg-green-900/20",
            textColor: "text-green-700 dark:text-green-400",
            iconBgColor: "bg-green-100 dark:bg-green-900/40",
            isMonetary: true,
        },
        {
            title: "Cost of Sales",
            value: details?.costOfSales ?? 0,
            displayValue: formatCurrency(details?.costOfSales ?? 0),
            bgColor: "bg-orange-50 dark:bg-orange-900/20",
            textColor: "text-orange-700 dark:text-orange-400",
            iconBgColor: "bg-orange-100 dark:bg-orange-900/40",
            isMonetary: true,
        },
        {
            title: "Gross Profit",
            value: details?.grossProfit ?? 0,
            displayValue: formatCurrency(details?.grossProfit ?? 0),
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            textColor: "text-purple-700 dark:text-purple-400",
            iconBgColor: "bg-purple-100 dark:bg-purple-900/40",
            isMonetary: true,
        },
        {
            title: "Expenses",
            value: details?.expenses ?? 0,
            displayValue: formatCurrency(details?.expenses ?? 0),
            bgColor: "bg-red-50 dark:bg-red-900/20",
            textColor: "text-red-700 dark:text-red-400",
            iconBgColor: "bg-red-100 dark:bg-red-900/40",
            isMonetary: true,
        },
        {
            title: "Net Profit",
            value: details?.netProfit ?? 0,
            displayValue: formatCurrency(details?.netProfit ?? 0),
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            textColor: "text-emerald-700 dark:text-emerald-400",
            iconBgColor: "bg-emerald-100 dark:bg-emerald-900/40",
            isMonetary: true,
        },
    ], [details]);

    const formattedDate = date ? dayjs(date).format("dddd, DD MMMM YYYY") : "";

    const voidSaleButton = canVoidSale ? (
        <Button size="2" color="red" variant="soft" onClick={() => setIsVoidDialogOpen(true)}>
            <Ban className="w-4 h-4" />
            Void Sale
        </Button>
    ) : undefined;

    return (
        <AppLayout>
            {isMobile ? (
                <MobilePageHeader title="Day Close Details" rightContent={voidSaleButton} />
            ) : (
                <PageHeader
                    title="Day Close Details"
                    description={formattedDate}
                    showBackButton
                    onBack={handleBack}
                    action={voidSaleButton}
                />
            )}

            <div className="pb-8 space-y-6">
                <SaleSummaryCards cards={summaryCards} isLoading={isLoading} />

                <SectionCard
                    icon={<Wallet className="w-4 h-4" />}
                    title="Payment Method Summary"
                    count={isLoading ? undefined : details?.paymentMethods.length ?? 0}
                >
                    {isLoading ? (
                        <PaymentMethodCardsSkeleton />
                    ) : (details?.paymentMethods.length ?? 0) === 0 ? (
                        <TableEmptyState
                            icon={<Wallet />}
                            title="No payments recorded"
                            description="No completed payments were entered against sales for this trading date."
                        />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {(details?.paymentMethods || []).map((method) => {
                                const style = getPaymentMethodStyle(method.methodName);
                                const Icon = style.icon;
                                return (
                                    <div
                                        key={method.methodId}
                                        className={`${style.bgColor} rounded-xl p-4 flex items-center gap-3`}
                                    >
                                        <div className={`${style.iconBgColor} p-2.5 rounded-xl flex-shrink-0`}>
                                            <Icon className={`w-5 h-5 ${style.textColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                                                {method.methodName}
                                            </p>
                                            <p className={`text-base font-bold truncate ${style.textColor}`}>
                                                {formatCurrency(method.amount)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 flex items-center gap-3">
                                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2.5 rounded-xl flex-shrink-0">
                                    <Sigma className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                                        Grand Total
                                    </p>
                                    <p className="text-base font-bold truncate text-emerald-700 dark:text-emerald-400">
                                        {formatCurrency((details?.paymentMethods || []).reduce((sum, m) => sum + m.amount, 0))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    icon={<Package className="w-4 h-4" />}
                    title="Items"
                    count={isLoading ? undefined : details?.unitsSold ?? 0}
                >
                    {!isLoading && (details?.items.length ?? 0) === 0 ? (
                        <TableEmptyState
                            icon={<Package />}
                            title="No items counted"
                            description="No items were sold on this trading date."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table.Root variant="surface">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Item</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell justify="end">Opening Balance</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell justify="end">Goods Received</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell justify="end">Book Balance</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell justify="end">Physical Count</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell justify="end">Quantity Sold</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell justify="end">Sales Value</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {isLoading && <TableRowsSkeleton columns={7} />}
                                    {(details?.items || []).map((item) => (
                                        <Table.Row key={item.variantId}>
                                            <Table.RowHeaderCell>
                                                <div className="flex flex-col gap-0">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {item.code && <>{item.code} &middot; </>}
                                                        {formatCurrency(item.unitPrice)} / unit
                                                    </span>
                                                </div>
                                            </Table.RowHeaderCell>
                                            <Table.Cell justify="end">{item.openingBalance}</Table.Cell>
                                            <Table.Cell justify="end">{item.goodsReceived}</Table.Cell>
                                            <Table.Cell justify="end">{item.bookBalance}</Table.Cell>
                                            <Table.Cell justify="end">{item.physicalCount}</Table.Cell>
                                            <Table.Cell justify="end">
                                                <Text weight="medium">{item.quantitySold}</Text>
                                            </Table.Cell>
                                            <Table.Cell justify="end">
                                                <Text weight="medium" className="text-green-600 dark:text-green-400">
                                                    {formatCurrency(item.salesValue)}
                                                </Text>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    icon={<Wallet2 className="w-4 h-4" />}
                    title="Expenses"
                    count={isLoading ? undefined : details?.expenseRecords.length ?? 0}
                >
                    {!isLoading && (details?.expenseRecords.length ?? 0) === 0 ? (
                        <TableEmptyState
                            icon={<Wallet2 />}
                            title="No expenses on this day"
                            description="No approved expenses were recorded for this trading date."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table.Root variant="surface">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Expense #</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell justify="end">Amount</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {isLoading && <TableRowsSkeleton columns={5} />}
                                    {(details?.expenseRecords || []).map((expense) => (
                                        <Table.Row key={expense.id}>
                                            <Table.RowHeaderCell>
                                                <span className="font-medium text-gray-900 dark:text-white">{expense.expenseNumber}</span>
                                            </Table.RowHeaderCell>
                                            <Table.Cell>
                                                <div className="flex items-center gap-2">
                                                    <HiOutlineClock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        {dayjs(expense.expenseDate).format("HH:mm")}
                                                    </span>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <span className="text-sm text-gray-600 dark:text-gray-300">{expense.categoryName}</span>
                                            </Table.Cell>
                                            <Table.Cell justify="end">
                                                <span className="font-semibold text-red-600 dark:text-red-400">
                                                    {formatCurrency(expense.amount)}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <StatusBadge status={expense.status} />
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </div>
                    )}
                </SectionCard>
            </div>

            <Dialog.Root open={isVoidDialogOpen} onOpenChange={(open) => !isVoiding && setIsVoidDialogOpen(open)}>
                <Dialog.Content maxWidth="440px">
                    <Dialog.Title>
                        <Flex align="center" gap="3">
                            <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                                <Ban className="w-5 h-5 text-red-500 dark:text-red-400" />
                            </div>
                            Void Day-end Close Sale
                        </Flex>
                    </Dialog.Title>
                    <Dialog.Description size="2" color="gray" mt="2">
                        This voids every sale recorded for {formattedDate || "this date"}, reverses the stock it moved, and cannot be undone.
                    </Dialog.Description>

                    <div className="mt-4">
                        <Text as="label" size="2" weight="medium">
                            Reason for voiding
                        </Text>
                        <TextArea
                            mt="1"
                            placeholder="Explain why this day's sale is being voided"
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            disabled={isVoiding}
                        />
                    </div>

                    <Flex gap="3" mt="4" justify="end">
                        <Button color="gray" variant="soft" onClick={() => setIsVoidDialogOpen(false)} disabled={isVoiding}>
                            <X className="w-4 h-4" />
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            onClick={handleConfirmVoid}
                            disabled={isVoiding || !voidReason.trim() || (details?.sales.length ?? 0) === 0}
                        >
                            <Ban className="w-4 h-4" />
                            {isVoiding ? "Voiding..." : "Void Sale"}
                        </Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </AppLayout>
    );
};

export default DayCloseDetailsPage;
