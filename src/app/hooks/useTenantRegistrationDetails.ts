import { useState, useEffect } from 'react';
import { Notify } from 'notiflix';
import tenantRegistrationDetailService from '../services/tenant-registration-detail.service';

export const useTenantRegistrationDetails = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [processedFilter, setProcessedFilter] = useState<boolean | null>(null);
    const [details, setDetails] = useState<TenantRegistrationDetail[]>([]);
    const [filteredDetails, setFilteredDetails] = useState<TenantRegistrationDetail[]>([]);
    const [selectedDetail, setSelectedDetail] = useState<TenantRegistrationDetail | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        loadDetails();
    }, [processedFilter]);

    useEffect(() => {
        filterDetails();
    }, [searchTerm, details]);

    const filterDetails = () => {
        if (searchTerm.trim() === "") {
            setFilteredDetails(details);
        } else {
            const filtered = details.filter(detail =>
                detail.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                detail.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                detail.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                detail.tenantCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                detail.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                detail.tenantId.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDetails(filtered);
        }
        setTotalRows(filteredDetails.length);
        setPage(1);
    };

    const loadDetails = async () => {
        try {
            setIsLoading(true);
            const query: TenantRegistrationDetailQueryParams = {};
            if (processedFilter !== null) {
                query.processed = processedFilter;
            }
            const data = await tenantRegistrationDetailService.list(query);
            setDetails(data);
            setFilteredDetails(data);
            setTotalRows(data.length);
        } catch (error) {
            console.error('Error loading tenant registration details:', error);
            Notify.failure('Failed to load tenant registration details');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteDetail = async (detailId: string) => {
        try {
            await tenantRegistrationDetailService.delete(detailId);
            const updatedDetails = details.filter(detail => detail.detailId !== detailId);
            setDetails(updatedDetails);
            setFilteredDetails(updatedDetails);
            setTotalRows(updatedDetails.length);
            Notify.success('Registration detail deleted successfully');
        } catch (error) {
            console.error('Error deleting registration detail:', error);
            Notify.failure('Failed to delete registration detail');
        }
    };

    const markAsProcessed = async (detailId: string) => {
        try {
            const response = await tenantRegistrationDetailService.markProcessed(detailId);
            const updatedDetails = details.map(detail =>
                detail.detailId === detailId
                    ? { ...detail, isProcessed: true, processedAt: new Date() }
                    : detail
            );

            setDetails(updatedDetails);

            // If filtering by unprocessed, remove from filtered list
            if (processedFilter === false) {
                const newFiltered = updatedDetails.filter(d => !d.isProcessed);
                setFilteredDetails(newFiltered);
                setTotalRows(newFiltered.length);
            } else {
                setFilteredDetails(updatedDetails);
                setTotalRows(updatedDetails.length);
            }

            Notify.success('Registration detail marked as processed');
            return response;
        } catch (error) {
            console.error('Error marking as processed:', error);
            Notify.failure('Failed to mark as processed');
            throw error;
        }
    };

    const viewDetail = async (detailId: string) => {
        try {
            const detail = await tenantRegistrationDetailService.show(detailId);
            setSelectedDetail(detail);
            setIsViewModalOpen(true);
        } catch (error) {
            console.error('Error fetching detail:', error);
            Notify.failure('Failed to load registration detail');
        }
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedDetail(null);
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredDetails.slice(startIndex, endIndex);
    };

    const refreshData = () => {
        loadDetails();
    };

    return {
        // State
        page,
        perPage,
        totalRows,
        isLoading,
        searchTerm,
        processedFilter,
        details,
        filteredDetails,
        selectedDetail,
        isViewModalOpen,

        // Setters
        setPage,
        setPerPage,
        setSearchTerm,
        setProcessedFilter,

        // Actions
        loadDetails,
        deleteDetail,
        markAsProcessed,
        viewDetail,
        closeViewModal,
        getPaginatedData,
        refreshData,
    };
};
