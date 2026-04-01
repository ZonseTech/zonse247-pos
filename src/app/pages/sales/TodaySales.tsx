import MobileTabPageHeader from '../../components/page/MobileTabPageHeader';
import CollapsibleSaleCard from './partials/CollapsibleSaleCard';
import SalesEmptyState from './partials/SalesEmptyState';
import SalesLoadingState from '../../components/loader/LoadingState';
import MobilePagination from './partials/MobilePagination';
import PaymentMethodFilterPopup from './partials/PaymentMethodFilterPopup';
import InitiateReturnModal from '../returns/partials/InitiateReturnModal';
import { FunctionComponent, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import salesService from '../../services/sales.service';
import printerService from '../../services/printer.service';
import returnsService from '../../services/returns.service';
import { useAuth } from '../../context/AuthProvider';
import { useApp } from '../../context/AppProvider';
import { useBranch } from '../../context/BranchContext';
import { useReceiptActions } from '../../hooks/useReceiptActions';
import { toast } from 'react-toastify';
import { Flex, Box, Button } from '@radix-ui/themes';
import dayjs from 'dayjs';

const ITEMS_PER_PAGE = 10;

const TodaySales: FunctionComponent = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { settings } = useApp();
    const { currentBranch } = useBranch();

    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [returnModalSale, setReturnModalSale] = useState<Sale | null>(null);

    const { isSharing, copiedSaleId, handleCopyRef, handleShare: handleShareSale, handleDownload: handleDownloadSale } = useReceiptActions({
        storeName: currentBranch?.branchName,
    });

    useEffect(() => {
        loadTodaySales();
    }, [selectedPaymentMethod]);

    const loadTodaySales = async () => {
        try {
            setIsLoading(true);
            const today = dayjs().format('YYYY-MM-DD');

            const response = await salesService.list({
                startDate: today,
                endDate: today,
                includeItems: true,
                ...(selectedPaymentMethod && { paymentMethodId: selectedPaymentMethod }),
            });

            setSales(response.sales || []);
        } catch (error) {
            console.error('Failed to load today\'s sales:', error);
            setSales([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSale = (saleId: string) => {
        setExpandedSaleId(prev => prev === saleId ? null : saleId);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setExpandedSaleId(null);
    };

    const handleViewSale = (sale: Sale) => {
        navigate(`${ROUTES.SALE_DETAILS.replace(':saleId', sale.id)}`);
    };

    const handleReturnSale = (sale: Sale) => {
        setReturnModalSale(sale);
    };

    const handleReturnSuccess = () => {
        setReturnModalSale(null);
        loadTodaySales();
    };

    const handleDeleteSale = (sale: Sale) => {
        // TODO: Show confirmation dialog and delete sale
        console.log('Delete sale:', sale.id);
    };

    const handlePrintSale = useCallback(async (sale: Sale) => {
        setIsPrinting(true);
        try {
            await printerService.quickPrintReceipt(
                sale.id,
                settings?.receiptCopies || 1,
            );
            toast.success('Receipt sent to printer');
        } catch {
            toast.error('Failed to print receipt. Check printer connection.');
        } finally {
            setIsPrinting(false);
        }
    }, [settings]);

    const handlePaymentMethodFilter = (methodId: string | null) => {
        setSelectedPaymentMethod(methodId);
        setCurrentPage(1);
        setIsFilterOpen(false);
    };

    const totalPages = Math.ceil(sales.length / ITEMS_PER_PAGE);

    const paginatedSales = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sales, currentPage]);

    const renderContent = () => {
        if (isLoading) {
            return <SalesLoadingState />;
        }

        if (sales.length === 0) {
            return <SalesEmptyState />;
        }

        return (
            <>
                <div className="space-y-2">
                    {paginatedSales.map((sale) => (
                        <CollapsibleSaleCard
                            key={sale.id}
                            sale={sale}
                            isExpanded={expandedSaleId === sale.id}
                            onToggle={() => handleToggleSale(sale.id)}
                            onView={() => handleViewSale(sale)}
                            onReturn={() => handleReturnSale(sale)}
                            onDelete={() => handleDeleteSale(sale)}
                            onShare={() => handleShareSale(sale)}
                            onPrint={() => handlePrintSale(sale)}
                            onDownload={() => handleDownloadSale(sale)}
                            onCopyRef={() => handleCopyRef(sale)}
                            isPrinting={isPrinting}
                            isSharing={isSharing}
                            copiedSaleId={copiedSaleId}
                            canReturn={returnsService.canReturn(sale as unknown as Transaction)}
                            refundSummary={returnsService.getRefundSummary(sale as unknown as Transaction)}
                        />
                    ))}
                </div>

                <MobilePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sales.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                />
            </>
        );
    };

    return (
        <Flex direction="column" className="h-full overflow-hidden">
            <Box className="fixed top-0 left-0 right-0 z-50">
                <MobileTabPageHeader />
            </Box>

            <Box className="flex-1 min-h-0 overflow-hidden pt-[52px]">
                <div className="h-full overflow-y-auto pb-20 p-4">
                    {renderContent()}

                    <Button
                        variant="soft"
                        size="3"
                        className="!w-full"
                        mt="2"
                        onClick={() => navigate(ROUTES.SALES)}
                    >
                        GET OLD RECEIPTS
                    </Button>
                </div>
            </Box>

            <PaymentMethodFilterPopup
                isOpen={isFilterOpen}
                selectedPaymentMethod={selectedPaymentMethod}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
                onSelect={handlePaymentMethodFilter}
            />

            {returnModalSale && (
                <InitiateReturnModal
                    isOpen={!!returnModalSale}
                    onClose={() => setReturnModalSale(null)}
                    sale={returnModalSale}
                    onSuccess={handleReturnSuccess}
                />
            )}
        </Flex>
    );
};

export default TodaySales;