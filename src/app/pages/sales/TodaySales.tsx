import MobilePageHeader from '../../components/page/MobilePageHeader';
import { HelpModal } from '../../components/modals';
import CollapsibleSaleCard from './partials/CollapsibleSaleCard';
import SalesEmptyState from './partials/SalesEmptyState';
import SalesLoadingState from './partials/SalesLoadingState';
import MobilePagination from './partials/MobilePagination';
import PaymentMethodFilterPopup from './partials/PaymentMethodFilterPopup';
import { FunctionComponent, useState, useEffect, useMemo } from 'react';
import { useBranch } from '../../context/BranchContext';
import { useMobileNav } from '../../context/MobileNavContext';
import BranchSwitchModal from '../../navigation/components/BranchSwitchModal';
import { HiMenu } from 'react-icons/hi';
import { PiChatCenteredDotsFill } from "react-icons/pi";
import { FaCaretDown } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import salesService from '../../services/sales.service';
import dayjs from 'dayjs';

const ITEMS_PER_PAGE = 10;

const TodaySales: FunctionComponent = () => {
    const { currentBranch } = useBranch();
    const { openDrawer } = useMobileNav();
    const navigate = useNavigate();

    const [isBranchSwitchModalOpen, setIsBranchSwitchModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

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
        navigate(`${ROUTES.RECEIPT_DETAILS.replace(':saleId', sale.id)}`);
    };

    const handleReturnSale = (sale: Sale) => {
        // TODO: Navigate to returns page or open return modal
        console.log('Return sale:', sale.id);
    };

    const handleDeleteSale = (sale: Sale) => {
        // TODO: Show confirmation dialog and delete sale
        console.log('Delete sale:', sale.id);
    };

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
        <div className="flex flex-col h-full overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    className='bg-sky-500 dark:bg-sky-700'
                    noBorder
                    showLeftButton={false}
                    title={
                        <div className="flex items-center gap-3">
                            <HiMenu
                                className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                                onClick={openDrawer}
                            />
                            <button
                                onClick={() => setIsBranchSwitchModalOpen(true)}
                                className="flex items-center gap-1 rounded-sm active:scale-95 transition-all"
                            >
                                <span className="text-base font-semibold text-white truncate max-w-[180px]">
                                    {currentBranch?.branchName || 'Select Branch'}
                                </span>
                                <FaCaretDown className="w-4 h-4 text-sky-100 flex-shrink-0" />
                            </button>
                        </div>
                    }
                    rightContent={
                        <div className="flex gap-4 items-center">
                            <PiChatCenteredDotsFill
                                className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                                onClick={() => setIsHelpModalOpen(true)}
                            />
                        </div>
                    }
                />
            </div>

            <div className="flex-1 min-h-0 overflow-hidden pt-[52px]">
                <div className="h-full overflow-y-auto pb-20 p-4">

                    {renderContent()}

                    <button
                        onClick={() => navigate(ROUTES.SALES)}
                        className="w-full flex items-center justify-center gap-2 py-4 text-sky-500 active:text-sky-700 bg-white dark:bg-gray-900 font-semibold rounded-sm transition-colors"
                    >
                        GET OLD RECEIPTS
                    </button>
                </div>
            </div>

            <PaymentMethodFilterPopup
                isOpen={isFilterOpen}
                selectedPaymentMethod={selectedPaymentMethod}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
                onSelect={handlePaymentMethodFilter}
            />

            <BranchSwitchModal
                isOpen={isBranchSwitchModalOpen}
                onClose={() => setIsBranchSwitchModalOpen(false)}
            />

            <HelpModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
            />
        </div>
    );
};

export default TodaySales;