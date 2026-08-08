import { FunctionComponent, useCallback, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { Box, Flex, Text } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobileDateFilter from '../../components/reports/MobileDateFilter';
import { SearchBar } from '../../components/SearchBar';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useCOGSReport } from '../../hooks/useCOGSReport';
import GrossProfitTable from './partials/GrossProfitTable';
import MobileCOGSProfitability from './MobileCOGSProfitability';

const COGSProfitability: FunctionComponent = () => {
    const isMobile = useIsMobile();

    const {
        startDate, setStartDate,
        endDate, setEndDate,
        grossProfitItems,
        grossProfitSummary,
        isLoadingProfit,
        searchTerm,
        handleSearch,
        totalRows,
        perPage,
        handlePageChange,
        handlePerRowsChange,
        loadAll,
    } = useCOGSReport();

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleDateChange = useCallback((start: Date | null, end: Date | null) => {
        setStartDate(start ? start.toISOString().split('T')[0] : '');
        setEndDate(end ? end.toISOString().split('T')[0] : '');
    }, [setStartDate, setEndDate]);

    if (isMobile) {
        return <MobileCOGSProfitability />;
    }

    return (
        <>
            <PageHeader
                icon={<DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                title="COGS & Profitability"
                description="Cost of Goods Sold analysis and gross profit by product"
            />

            <Box className="rounded-lg my-4 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Flex
                    direction={{ initial: 'column', sm: 'row' }}
                    align={{ initial: 'start', sm: 'center' }}
                    justify="between"
                    gap={{ initial: '2', sm: '3' }}
                    px="4"
                    py="3"
                    className="border-b border-gray-200 dark:border-gray-700"
                >
                    <Flex align="center" gap="2" wrap="wrap">
                        <MobileDateFilter
                            startDate={startDate ? new Date(startDate) : null}
                            endDate={endDate ? new Date(endDate) : null}
                            onChange={handleDateChange}
                        />
                    </Flex>

                    <SearchBar
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full sm:flex-1 sm:max-w-xs"
                    />
                </Flex>

                <GrossProfitTable
                    items={grossProfitItems}
                    summary={grossProfitSummary}
                    isLoading={isLoadingProfit}
                    searchTerm={searchTerm}
                    totalRows={totalRows}
                    perPage={perPage}
                    onPageChange={handlePageChange}
                    onPerRowsChange={handlePerRowsChange}
                />
            </Box>
        </>
    );
};

export default COGSProfitability;
