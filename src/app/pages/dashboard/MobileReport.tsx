import React, { useState, useCallback } from 'react';
import { HiOutlineChatAlt2, HiShare, HiMenu } from 'react-icons/hi';
import { FaCaretDown } from 'react-icons/fa';

import MobilePageHeader from '../../components/page/MobilePageHeader';
import { HelpModal } from '../../components/modals';
import { useBranch } from '../../context/BranchContext';
import { useMobileNav } from '../../context/MobileNavContext';
import BranchSwitchModal from '../../navigation/components/BranchSwitchModal';
import { formatCurrency } from '../../utils';

import { MobileDateFilter, ReportCard, ReportCardProps } from './components';

// Types
interface ReportData extends Omit<ReportCardProps, 'onClick'> {
    id: string;
}

// Helper function to generate report data
const generateReportData = (): ReportData[] => [
    {
        id: 'total-sales',
        name: 'Total Sales',
        value: formatCurrency(1250000, true),
        description: 'Revenue from all transactions',
    },
    {
        id: 'gross-profit',
        name: 'Gross Profit',
        value: formatCurrency(450000, true),
        description: 'Selling price minus cost price',
    },
    {
        id: 'top-stocks',
        name: 'Top Stocks',
        value: '24 items',
        description: 'Best performing inventory items',
    },
    {
        id: 'top-category',
        name: 'Top Category',
        value: 'Electronics',
        description: 'Highest selling category',
    },
    {
        id: 'receipt-count',
        name: 'Total Receipt Count',
        value: '156',
        description: 'Number of completed transactions',
    },
    {
        id: 'payment-modes',
        name: 'Payment Modes',
        value: '4 methods',
        description: 'Cash, E-Pay, Bank, Split payments',
    },
];

const MobileReport: React.FC = () => {
    // State
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isBranchSwitchModalOpen, setIsBranchSwitchModalOpen] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());

    // Hooks
    const { currentBranch } = useBranch();
    const { openDrawer } = useMobileNav();

    // Data
    const reportData = generateReportData();

    // Handlers
    const handleDateChange = useCallback((start: Date | null, end: Date | null): void => {
        setStartDate(start);
        setEndDate(end);
        // TODO: Fetch report data based on date range
    }, []);

    const handleShare = useCallback(async (): Promise<void> => {
        if (!navigator.share) return;

        try {
            await navigator.share({
                title: 'Report',
                text: 'Check out this report',
                url: window.location.href,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }, []);

    const handleCardClick = useCallback((id: string): void => {
        // TODO: Navigate to detailed view for each report item
        console.log(`Clicked on report: ${id}`);
    }, []);

    const openHelpModal = useCallback(() => setIsHelpModalOpen(true), []);
    const closeHelpModal = useCallback(() => setIsHelpModalOpen(false), []);
    const openBranchModal = useCallback(() => setIsBranchSwitchModalOpen(true), []);
    const closeBranchModal = useCallback(() => setIsBranchSwitchModalOpen(false), []);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    className="bg-sky-500 dark:bg-sky-700"
                    noBorder
                    showLeftButton={false}
                    title={
                        <div className="flex items-center gap-3">
                            <HiMenu
                                className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                                onClick={openDrawer}
                            />
                            <button
                                onClick={openBranchModal}
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
                            <HiShare
                                className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                                onClick={handleShare}
                            />
                            <HiOutlineChatAlt2
                                className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                                onClick={openHelpModal}
                            />
                        </div>
                    }
                />
            </div>


            <div className="flex-1 min-h-0 overflow-hidden pt-[52px]">

                <MobileDateFilter
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateChange}
                />

                <div className='h-full overflow-y-auto pb-20 space-y-2 px-2'>
                    {reportData.map((item) => (
                        <ReportCard
                            key={item.id}
                            name={item.name}
                            value={item.value}
                            description={item.description}
                            onClick={() => handleCardClick(item.id)}
                        />
                    ))}
                </div>
            </div>

            <HelpModal isOpen={isHelpModalOpen} onClose={closeHelpModal} />
            <BranchSwitchModal isOpen={isBranchSwitchModalOpen} onClose={closeBranchModal} />
        </div>
    );
};

export default MobileReport;