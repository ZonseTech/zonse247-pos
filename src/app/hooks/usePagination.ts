import { useState, useCallback } from 'react';

export interface PaginationState {
    page: number;
    perPage: number;
    totalRows: number;
}

export interface UsePaginationReturn extends PaginationState {
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
    setTotalRows: (total: number) => void;
    totalPages: number;
    /** Handler for react-data-table-component onChangePage */
    handlePageChange: (page: number) => void;
    /** Handler for react-data-table-component onChangeRowsPerPage */
    handlePerRowsChange: (newPerPage: number, page: number) => void;
    /** Go to next page (respects bounds) */
    nextPage: () => void;
    /** Go to previous page (respects bounds) */
    prevPage: () => void;
    /** Reset to page 1 */
    resetPage: () => void;
    /** Whether there is a next page */
    hasNextPage: boolean;
    /** Whether there is a previous page */
    hasPrevPage: boolean;
    /** "Showing X-Y of Z" display string */
    pageLabel: string;
}

interface UsePaginationOptions {
    initialPage?: number;
    initialPerPage?: number;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
    const { initialPage = 1, initialPerPage = 10 } = options;

    const [page, setPage] = useState(initialPage);
    const [perPage, setPerPage] = useState(initialPerPage);
    const [totalRows, setTotalRows] = useState(0);

    const totalPages = Math.max(1, Math.ceil(totalRows / perPage));

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handlePerRowsChange = useCallback((newPerPage: number, newPage: number) => {
        setPerPage(newPerPage);
        setPage(newPage);
    }, []);

    const nextPage = useCallback(() => {
        setPage((prev) => Math.min(totalPages, prev + 1));
    }, [totalPages]);

    const prevPage = useCallback(() => {
        setPage((prev) => Math.max(1, prev - 1));
    }, []);

    const resetPage = useCallback(() => {
        setPage(1);
    }, []);

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const startItem = totalRows === 0 ? 0 : (page - 1) * perPage + 1;
    const endItem = Math.min(page * perPage, totalRows);
    const pageLabel = totalRows === 0
        ? 'No results'
        : `Showing ${startItem}-${endItem} of ${totalRows}`;

    return {
        page,
        perPage,
        totalRows,
        setPage,
        setPerPage,
        setTotalRows,
        totalPages,
        handlePageChange,
        handlePerRowsChange,
        nextPage,
        prevPage,
        resetPage,
        hasNextPage,
        hasPrevPage,
        pageLabel,
    };
}
