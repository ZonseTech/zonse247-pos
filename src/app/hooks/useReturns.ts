import { useState, useEffect } from 'react';
import { Notify } from 'notiflix';
import returnsService from '../services/returns.service';

type RestockFilter = 'all' | 'pending-restock' | 'restocked' | 'damaged';

export const useReturns = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [returns, setReturns] = useState<Array<ReturnDetails>>([]);
    const [filteredReturns, setFilteredReturns] = useState<Array<ReturnDetails>>([]);
    const [activeFilter, setActiveFilter] = useState<RestockFilter>('all');

    useEffect(() => {
        loadReturns();
    }, []);

    useEffect(() => {
        filterReturns();
    }, [searchTerm, returns, activeFilter]);

    const filterReturns = () => {
        let filtered = returns;

        if (activeFilter !== 'all') {
            filtered = filtered.filter(returnData => {
                const statuses = returnData.returnItems.map(item => item.restockStatus);

                switch (activeFilter) {
                    case 'pending-restock':
                        return statuses.some(status => status === 'pending');
                    case 'restocked':
                        return statuses.every(status => status === 'restocked');
                    case 'damaged':
                        return statuses.some(status => status === 'damaged');
                    default:
                        return true;
                }
            });
        }

        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(returnData =>
                returnData.returnTransaction?.refNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                returnData.originalTransaction?.refNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                returnData.originalTransaction?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredReturns(filtered);
        setTotalRows(filtered.length);
        setPage(1);
    };

    const getSummaryData = () => {
        const totalReturns = returns.length;
        const pendingRestock = returns.filter(r =>
            r.returnItems.some(item => item.restockStatus === 'pending')
        ).length;
        const restocked = returns.filter(r =>
            r.returnItems.every(item => item.restockStatus === 'restocked')
        ).length;
        const damaged = returns.filter(r =>
            r.returnItems.some(item => item.restockStatus === 'damaged')
        ).length;

        return [
            { title: 'Total Returns', value: totalReturns, onClick: () => setActiveFilter('all') },
            { title: 'Pending Restock', value: pendingRestock, onClick: () => setActiveFilter('pending-restock') },
            { title: 'Restocked', value: restocked, onClick: () => setActiveFilter('restocked') },
            { title: 'Damaged', value: damaged, onClick: () => setActiveFilter('damaged') }
        ];
    };

    const loadReturns = async () => {
        try {
            setIsLoading(true);
            const data: Array<ReturnDetails> = await returnsService.list();
            setReturns(data);
            setFilteredReturns(data);
            setTotalRows(data.length);
        } catch (error) {
            console.error('Error loading returns:', error);
            Notify.failure('Failed to load returns');
        } finally {
            setIsLoading(false);
        }
    };

    const cancelReturn = async (returnTransactionId: string, refNumber: string) => {
        try {
            await returnsService.cancelReturn(returnTransactionId);
            const updatedReturns = returns.filter(ret => ret.returnTransaction.transactionId !== returnTransactionId);
            setReturns(updatedReturns);
            setFilteredReturns(updatedReturns);
            setTotalRows(updatedReturns.length);
            Notify.success(`Return ${refNumber} cancelled successfully`);
        } catch (error: any) {
            console.error('Error cancelling return:', error);
            Notify.failure(error?.message || 'Failed to cancel return');
        }
    };

    const restockItems = async (returnTransactionId: string, data: RestockItemsRequest) => {
        try {
            await returnsService.restockItems(returnTransactionId, data);
            // Reload returns to get updated restock status
            await loadReturns();
            Notify.success('Items restocked successfully');
        } catch (error: any) {
            console.error('Error restocking items:', error);
            Notify.failure(error?.message || 'Failed to restock items');
        }
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredReturns.slice(startIndex, endIndex);
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const handleClearFilters = () => {
        setActiveFilter('all');
        setSearchTerm('');
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePerRowsChange = (newPerPage: number, newPage: number) => {
        setPerPage(newPerPage);
        setPage(newPage);
    };

    return {
        isLoading,
        searchTerm,
        setSearchTerm,
        totalRows,
        page,
        setPage,
        perPage,
        setPerPage,
        returns,
        filteredReturns,
        activeFilter,
        setActiveFilter,
        getPaginatedData,
        getSummaryData,
        handleSearch,
        handleClearFilters,
        handlePageChange,
        handlePerRowsChange,
        cancelReturn,
        restockItems,
        loadReturns
    };
};
