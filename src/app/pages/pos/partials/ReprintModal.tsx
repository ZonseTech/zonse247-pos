import { Report } from 'notiflix';
import { FunctionComponent, useState, useEffect } from 'react';
import { Printer, X, Search, RefreshCw, FileText, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Modal } from '../../../components';
import { useApp } from '../../../context/AppProvider';
import { useAuth } from '../../../context/AuthProvider';
import printerService from '../../../services/printer.service';
import salesService from '../../../services/sales.service';
import { formatCurrency, formatDate } from '../../../utils';
import { useIsEBN, useIsMobile } from '../../../hooks/useMediaQuery';
import classNames from 'classnames';

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

interface ReprintModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ReprintModal: FunctionComponent<ReprintModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPrinting, setIsPrinting] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [recentSales, setRecentSales] = useState<Sale[]>([]);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [copies, setCopies] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const ITEMS_PER_PAGE = 10;

    const { settings } = useApp();
    const { user } = useAuth();
    const isEBN = useIsEBN();
    const isMobile = useIsMobile();

    // Fetch recent sales when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
            fetchRecentSales(1);
            setSelectedSale(null);
            setSearchTerm('');
            setCopies(settings?.receiptCopies || 1);
        }
    }, [isOpen]);

    const fetchRecentSales = async (page: number = 1) => {
        try {
            setIsLoading(true);
            const today = new Date();
            const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

            const response = await salesService.list({
                startDate: thirtyDaysAgo.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0],
                status: 'COMPLETED',
                perPage: ITEMS_PER_PAGE,
                page,
            });

            setRecentSales(response?.sales || []);
            setPagination(response?.pagination || null);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching recent sales:', error);
            Report.failure(
                'Error',
                'Failed to fetch recent sales. Please try again.',
                'OK'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (page: number = 1) => {
        if (!searchTerm.trim()) {
            fetchRecentSales(1);
            return;
        }

        try {
            setIsLoading(true);
            const response = await salesService.list({
                search: searchTerm,
                status: 'COMPLETED',
                perPage: ITEMS_PER_PAGE,
                page,
            });

            setRecentSales(response?.sales || []);
            setPagination(response?.pagination || null);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error searching sales:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
        if (searchTerm.trim()) {
            handleSearch(newPage);
        } else {
            fetchRecentSales(newPage);
        }
    };

    const handlePrintReceipt = async () => {
        if (!selectedSale) {
            Report.warning('No Sale Selected', 'Please select a sale to reprint.', 'OK');
            return;
        }

        try {
            setIsPrinting(true);

            await printerService.printReceipt({
                saleId: selectedSale.id,
                transactionId: selectedSale.saleNumber || selectedSale.id,
                copies: copies,
                includeHeader: true,
                includeFooter: true,
                includeLogo: settings?.showStoreLogo || false,
            });

            Report.success(
                'Print Successful',
                `Receipt for ${selectedSale.saleNumber || 'sale'} has been sent to the printer.`,
                'Done',
                () => {
                    onClose();
                }
            );
        } catch (error) {
            console.error('Error reprinting receipt:', error);
            Report.failure(
                'Print Failed',
                'Unable to print receipt. Please check your printer connection.',
                'OK'
            );
        } finally {
            setIsPrinting(false);
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen) return;

        switch (event.key) {
            case 'Escape':
                onClose();
                break;
            case 'Enter':
                if (selectedSale && !isPrinting) {
                    handlePrintReceipt();
                }
                break;
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedSale, isPrinting]);

    const getPaymentDisplay = (sale: Sale) => {
        // Check for split payments
        if (sale.payments && sale.payments.length > 1) {
            return { name: 'Split Payment', icon: '💳' };
        }
        // Use the paymentMethod object from the API response
        if (sale.paymentMethod) {
            return { name: sale.paymentMethod.name, icon: sale.paymentMethod.icon || '💳' };
        }
        // Fallback to first payment's method
        if (sale.payments?.[0]?.paymentMethod) {
            return { name: sale.payments[0].paymentMethod.name, icon: sale.payments[0].paymentMethod.icon || '💳' };
        }
        return { name: 'Unknown', icon: '💳' };
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reprint Receipt"
            size={isMobile ? "full" : "lg"}
        >
            <div className={classNames(
                "flex flex-col",
                isEBN ? "gap-2" : "gap-4"
            )}>
                {/* Search Section */}
                <div className={classNames(
                    "flex flex-col sm:flex-row gap-2",
                    isEBN ? "mb-2" : "mb-4"
                )}>
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by sale number, customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
                            className={classNames(
                                "w-full pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white",
                                isEBN ? "py-2 text-sm" : "py-3"
                            )}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            theme="primary"
                            onClick={() => handleSearch(1)}
                            className={classNames(isEBN ? "px-3 py-2 text-sm" : "px-4 py-2")}
                        >
                            <Search className="w-4 h-4" />
                        </Button>
                        <Button
                            theme="primary"
                            onClick={() => { setSearchTerm(''); fetchRecentSales(1); }}
                            disabled={isLoading}
                            className={classNames(isEBN ? "px-3 py-2 text-sm" : "px-4 py-2")}
                        >
                            <RefreshCw className={classNames("w-4 h-4", isLoading && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Sales List */}
                <div className={classNames(
                    "border rounded-lg overflow-hidden dark:border-gray-700",
                    isEBN ? "max-h-64" : "max-h-80",
                    "overflow-y-auto"
                )}>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-500">Loading sales...</span>
                        </div>
                    ) : recentSales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <FileText className="w-12 h-12 mb-2 opacity-50" />
                            <p>No sales found</p>
                            <p className="text-sm">Try adjusting your search</p>
                        </div>
                    ) : (
                        <div className="divide-y dark:divide-gray-700">
                            {recentSales.map((sale) => (
                                <div
                                    key={sale.id}
                                    onClick={() => setSelectedSale(sale)}
                                    className={classNames(
                                        "cursor-pointer transition-colors",
                                        isEBN ? "p-2" : "p-3",
                                        selectedSale?.id === sale.id
                                            ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500"
                                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={classNames(
                                                    "font-semibold text-gray-900 dark:text-white",
                                                    isEBN ? "text-sm" : "text-base"
                                                )}>
                                                    {sale.saleNumber || sale.id.slice(0, 8)}
                                                </span>
                                                <span className={classNames(
                                                    "px-2 py-0.5 rounded-full text-xs",
                                                    sale.status === 'COMPLETED'
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                )}>
                                                    {sale.status}
                                                </span>
                                            </div>
                                            <div className={classNames(
                                                "flex flex-wrap gap-3 mt-1 text-gray-500 dark:text-gray-400",
                                                isEBN ? "text-xs" : "text-sm"
                                            )}>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(String(sale.saleDate || sale.createdAt))}
                                                </span>
                                                {sale.customer && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {sale.customer.name}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <span>{getPaymentDisplay(sale).icon}</span>
                                                    {getPaymentDisplay(sale).name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={classNames(
                                            "font-bold text-right",
                                            isEBN ? "text-sm" : "text-lg"
                                        )}>
                                            <span className="text-green-600 dark:text-green-400">
                                                {formatCurrency(sale.totalAmount)}
                                            </span>
                                            {sale.items && (
                                                <p className={classNames(
                                                    "text-gray-400 font-normal",
                                                    isEBN ? "text-xs" : "text-sm"
                                                )}>
                                                    {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.totalPages > 1 && (
                    <div className={classNames(
                        "flex items-center justify-between border-t dark:border-gray-700",
                        isEBN ? "pt-2" : "pt-3"
                    )}>
                        <span className={classNames(
                            "text-gray-500 dark:text-gray-400",
                            isEBN ? "text-xs" : "text-sm"
                        )}>
                            Page {currentPage} of {pagination.totalPages} ({pagination.totalItems} sales)
                        </span>
                        <div className="flex gap-2">
                            <Button
                                theme="primary"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1 || isLoading}
                                className={classNames(isEBN ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm")}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline ml-1">Prev</span>
                            </Button>
                            <Button
                                theme="primary"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= pagination.totalPages || isLoading}
                                className={classNames(isEBN ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm")}
                            >
                                <span className="hidden sm:inline mr-1">Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Selected Sale Details */}
                {selectedSale && (
                    <div className={classNames(
                        "bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800",
                        isEBN ? "p-2" : "p-4"
                    )}>
                        <h4 className={classNames(
                            "font-semibold text-blue-900 dark:text-blue-200 mb-2",
                            isEBN ? "text-sm" : "text-base"
                        )}>
                            Selected Sale: {selectedSale.saleNumber || selectedSale.id.slice(0, 8)}
                        </h4>
                        <div className={classNames(
                            "grid grid-cols-2 gap-2",
                            isEBN ? "text-xs" : "text-sm"
                        )}>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Total:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(selectedSale.totalAmount)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Items:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                    {selectedSale.items?.length || 0}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Date:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                    {formatDate(String(selectedSale.saleDate || selectedSale.createdAt))}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Cashier:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                    {selectedSale.user?.fullname || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Print Options */}
                <div className={classNames(
                    "flex flex-col sm:flex-row items-center gap-4",
                    isEBN ? "pt-2" : "pt-4"
                )}>
                    <div className="flex items-center gap-2">
                        <label className={classNames(
                            "text-gray-700 dark:text-gray-300",
                            isEBN ? "text-sm" : "text-base"
                        )}>
                            Copies:
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={copies}
                            onChange={(e) => setCopies(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                            className={classNames(
                                "w-16 text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white",
                                isEBN ? "py-1 text-sm" : "py-2"
                            )}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={classNames(
                    "flex flex-col sm:flex-row justify-end gap-2 border-t pt-4 dark:border-gray-700",
                    isEBN ? "mt-2" : "mt-4"
                )}>
                    <Button
                        theme="neutral"
                        onClick={onClose}
                        disabled={isPrinting}
                        className={classNames(isEBN ? "px-4 py-2 text-sm" : "px-6 py-3")}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        theme="success"
                        onClick={handlePrintReceipt}
                        disabled={!selectedSale || isPrinting}
                        className={classNames(isEBN ? "px-4 py-2 text-sm" : "px-6 py-3")}
                    >
                        {isPrinting ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Printing...
                            </>
                        ) : (
                            <>
                                <Printer className="w-4 h-4 mr-2" />
                                Print Receipt
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ReprintModal;
