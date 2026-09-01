import { FC, useMemo, useRef, useState } from "react";
import { Table, TextField, Text, Flex, Button, IconButton, Tooltip } from "@radix-ui/themes";
import { Search, Trash2, X, CalendarCheck2, Wallet } from "lucide-react";
import { Confirm, Notify } from "notiflix";
import dayjs from "dayjs";
import { formatCurrency } from "../../../utils";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { updatePhysicalCount, removeStockCountItem, clearStockCount } from "../../../store/slices/dayEndCloseSlice";
import { useAddStockCountItem } from "../hooks/useAddStockCountItem";
import ItemLookupModal from "../../pos/partials/ItemLookupModal";
import DayEndCloseStatsCards from "./DayEndCloseStatsCards";
import BalanceCashModal from "./BalanceCashModal";

const CellSkeleton: FC<{ align?: "start" | "end" }> = ({ align = "end" }) => (
    <div
        className={`h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${align === "end" ? "ml-auto" : ""}`}
    />
);

const DayEndCloseStockCountTable: FC = () => {
    const dispatch = useAppDispatch();

    const inventory = useAppSelector((state) => state.inventory.inventory);
    const items = useAppSelector((state) => state.dayEndClose.items);

    const [tradingDate, setTradingDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isBalanceCashOpen, setIsBalanceCashOpen] = useState(false);
    const barcodeScannerInputRef = useRef<HTMLInputElement>(null);

    const { addItem } = useAddStockCountItem(tradingDate);

    const handleCountChange = (id: string, value: string) => {
        dispatch(updatePhysicalCount({ id, value }));
    };

    const handleRemoveItem = (id: string) => {
        dispatch(removeStockCountItem(id));
    };

    const handleClearAll = () => {
        if (items.length === 0) return;

        Confirm.show(
            "Clear Stock Count",
            "Remove all items from the stock count table? This can't be undone.",
            "Yes, Clear",
            "Cancel",
            () => {
                dispatch(clearStockCount());
            },
        );
    };

    const handlePostDayEndClose = () => {
        Notify.info("Day-end close posting isn't available yet — the backend for this is still being built.");
    };

    const hasCountedSales = items.some((item) => !item.isLoading && item.physicalCount !== "");

    const totals = useMemo(() => {
        return items.reduce(
            (acc, item) => {
                if (item.isLoading || item.physicalCount === "") return acc;

                const physicalCount = parseFloat(item.physicalCount);
                const quantitySold = item.bookBalance - physicalCount;
                const salesValue = quantitySold * item.unitPrice;
                const costOfSales = quantitySold * item.costPrice;

                acc.quantitySold += quantitySold;
                acc.salesValue += salesValue;
                acc.costOfSales += costOfSales;
                return acc;
            },
            { quantitySold: 0, salesValue: 0, costOfSales: 0 }
        );
    }, [items]);

    const grossProfit = totals.salesValue - totals.costOfSales;
    const operatingExpenses = 0;
    const netProfit = grossProfit - operatingExpenses;

    return (
        <Flex direction="column" gap="3">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 pb-3 border-b border-gray-200 dark:border-gray-700 space-y-3">
                <DayEndCloseStatsCards
                    quantitySold={totals.quantitySold}
                    salesValue={totals.salesValue}
                    costOfSales={totals.costOfSales}
                    grossProfit={grossProfit}
                    operatingExpenses={operatingExpenses}
                    netProfit={netProfit}
                />

                <Flex justify="between" align="end" gap="3" wrap="wrap">
                    <Flex align="end" gap="3" wrap="wrap">
                        <div>
                            <Text as="label" size="2" weight="medium">
                                Trading Date
                            </Text>
                            <TextField.Root
                                type="date"
                                size="2"
                                mt="1"
                                value={tradingDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTradingDate(e.target.value)}
                                className="max-w-[180px]"
                            />
                        </div>

                        <Button size="2" variant="soft" onClick={() => setIsSearchOpen(true)}>
                            <Search className="w-4 h-4" />
                            Search Item
                        </Button>

                        <Button size="2" variant="soft" color="red" onClick={handleClearAll} disabled={items.length === 0}>
                            <X className="w-4 h-4" />
                            Clear
                        </Button>
                    </Flex>

                    <Flex align="end" gap="3">
                        <Button size="2" variant="soft" onClick={() => setIsBalanceCashOpen(true)} disabled={!hasCountedSales}>
                            <Wallet className="w-4 h-4" />
                            Balance Cash
                        </Button>

                        <Button size="2" onClick={handlePostDayEndClose} disabled={!hasCountedSales}>
                            <CalendarCheck2 className="w-4 h-4" />
                            Post Day-end Close
                        </Button>
                    </Flex>
                </Flex>
            </div>

            <div className="overflow-x-auto">
                <Table.Root variant="surface" layout="auto">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Item</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell justify="end">Opening Balance</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell justify="end">Goods Received</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell justify="end">Book Balance</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Physical Count</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell justify="end">Quantity Sold</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell justify="end">Sales Value</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell style={{ width: "60px" }} />
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {items.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan={8}>
                                    <Text size="2" color="gray" className="block text-center py-6">
                                        No items added yet — use Search Item to add one.
                                    </Text>
                                </Table.Cell>
                            </Table.Row>
                        ) : (
                            items.map((item) => {
                                const physicalCount = item.physicalCount === "" ? null : parseFloat(item.physicalCount);
                                const quantitySold = physicalCount === null ? null : item.bookBalance - physicalCount;
                                const salesValue = quantitySold === null ? null : quantitySold * item.unitPrice;
                                const openingBalance = item.bookBalance - item.goodsReceived;

                                return (
                                    <Table.Row key={item.id} align="center" className="transition-opacity duration-300">
                                        <Table.RowHeaderCell>
                                            <Flex direction="column" gap="0">
                                                <Text size="2" weight="medium" className="text-gray-900 dark:text-white">
                                                    {item.name}
                                                </Text>
                                                <Text size="1" color="gray">
                                                    {item.code && <>{item.code} &middot; </>}
                                                    {formatCurrency(item.unitPrice)} / unit
                                                </Text>
                                            </Flex>
                                        </Table.RowHeaderCell>

                                        <Table.Cell justify="end">
                                            {item.isLoading ? (
                                                <CellSkeleton />
                                            ) : (
                                                <Text size="2" className="text-gray-700 dark:text-gray-300">
                                                    {openingBalance}
                                                </Text>
                                            )}
                                        </Table.Cell>

                                        <Table.Cell justify="end">
                                            {item.isLoading ? (
                                                <CellSkeleton />
                                            ) : (
                                                <Text size="2" className="text-gray-700 dark:text-gray-300">
                                                    {item.goodsReceived}
                                                </Text>
                                            )}
                                        </Table.Cell>

                                        <Table.Cell justify="end">
                                            {item.isLoading ? (
                                                <CellSkeleton />
                                            ) : (
                                                <Text size="2" className="text-gray-700 dark:text-gray-300">
                                                    {item.bookBalance}
                                                </Text>
                                            )}
                                        </Table.Cell>

                                        <Table.Cell>
                                            <TextField.Root
                                                type="number"
                                                min={0}
                                                step="any"
                                                size="2"
                                                placeholder={item.isLoading ? "Loading..." : "Count"}
                                                disabled={item.isLoading}
                                                className="max-w-[100px]"
                                                value={item.physicalCount}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCountChange(item.id, e.target.value)}
                                            />
                                        </Table.Cell>

                                        <Table.Cell justify="end">
                                            <Text size="2" weight="medium" className="text-gray-900 dark:text-white">
                                                {quantitySold === null ? "—" : quantitySold}
                                            </Text>
                                        </Table.Cell>

                                        <Table.Cell justify="end">
                                            <Text size="2" weight="medium" className="text-green-600 dark:text-green-400">
                                                {salesValue === null ? "—" : formatCurrency(salesValue)}
                                            </Text>
                                        </Table.Cell>

                                        <Table.Cell justify="end">
                                            <Tooltip content="Remove item">
                                                <IconButton
                                                    variant="ghost"
                                                    color="red"
                                                    size="1"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    aria-label={`Remove ${item.name}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </IconButton>
                                            </Tooltip>
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })
                        )}
                    </Table.Body>
                </Table.Root>
            </div>

            <ItemLookupModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                inventory={inventory}
                onAddToCart={addItem}
                barcodeScannerInputRef={barcodeScannerInputRef}
            />

            <BalanceCashModal
                isOpen={isBalanceCashOpen}
                onClose={() => setIsBalanceCashOpen(false)}
                totalSalesValue={totals.salesValue}
            />
        </Flex>
    );
};

export default DayEndCloseStockCountTable;
