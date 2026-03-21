import { FunctionComponent, useCallback, useEffect } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { Button, Box, Flex, Text } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { DateRangeFilter } from '../../components';
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

    const handleDateChange = useCallback((dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start ? start.toISOString().split('T')[0] : '');
        setEndDate(end ? end.toISOString().split('T')[0] : '');
    }, [setStartDate, setEndDate]);

    if (isMobile) {
        return <MobileCOGSProfitability />;
    }

    return (
        <AppLayout>
            <PageHeader
                icon={<DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-red-500 dark:text-red-400" />}
                title="COGS & Profitability"
                description="Cost of Goods Sold analysis and gross profit by product"
            />

            <Box className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                        <DateRangeFilter
                            startDate={startDate ? new Date(startDate) : null}
                            endDate={endDate ? new Date(endDate) : null}
                            onChange={handleDateChange}
                        />
                    </Flex>

                    <Button
                        variant="solid"
                        size="2"
                        onClick={loadAll}
                        disabled={isLoadingProfit}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProfit ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </Flex>

                <GrossProfitTable
                    items={grossProfitItems}
                    summary={grossProfitSummary}
                    isLoading={isLoadingProfit}
                    searchTerm={searchTerm}
                    onSearch={handleSearch}
                    totalRows={totalRows}
                    perPage={perPage}
                    onPageChange={handlePageChange}
                    onPerRowsChange={handlePerRowsChange}
                />
            </Box>
        </AppLayout>
    );
};

export default COGSProfitability;
