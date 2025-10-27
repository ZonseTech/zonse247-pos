import { useState, useEffect } from 'react';
import { Notify } from 'notiflix';
import tenantService from '../services/tenant.service';

export const useTenants = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [tenants, setTenants] = useState<Array<Tenant>>([]);
    const [filteredTenants, setFilteredTenants] = useState<Array<Tenant>>([]);

    useEffect(() => {
        loadTenants();
    }, []);

    useEffect(() => {
        filterTenants();
    }, [searchTerm, tenants]);

    const filterTenants = () => {
        if (searchTerm.trim() === "") {
            setFilteredTenants(tenants);
        } else {
            const filtered = tenants.filter(tenant =>
                tenant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tenant.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tenant.tenantCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tenant.country?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredTenants(filtered);
        }
        setTotalRows(filteredTenants.length);
        setPage(1);
    };

    const loadTenants = async () => {
        try {
            setIsLoading(true);
            const data: Array<Tenant> = await tenantService.list();
            setTenants(data);
            setFilteredTenants(data);
            setTotalRows(data.length);
        } catch (error) {
            console.error('Error loading tenants:', error);
            Notify.failure('Failed to load tenants');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteTenant = async (tenantId: string) => {
        try {
            await tenantService.delete(tenantId);
            const updatedTenants = tenants.filter(tenant => tenant.tenantId !== tenantId);
            setTenants(updatedTenants);
            setFilteredTenants(updatedTenants);
            setTotalRows(updatedTenants.length);
            Notify.success('Tenant deleted successfully');
        } catch (error) {
            console.error('Error deleting tenant:', error);
            Notify.failure('Failed to delete tenant');
        }
    };

    const updateTenantStatus = async (tenantId: string, newStatus: TenantStatus) => {
        try {
            const tenant = tenants.find(t => t.tenantId === tenantId);
            if (!tenant) return;

            const updatedTenantData: any = {
                ...tenant,
                status: newStatus
            };

            await tenantService.update(tenantId, updatedTenantData);
            const updatedTenants = tenants.map(t =>
                t.tenantId === tenantId ? { ...t, status: newStatus } : t
            );

            setTenants(updatedTenants);
            setFilteredTenants(updatedTenants);
            setTotalRows(updatedTenants.length);

            Notify.success(`Tenant ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
        } catch (error) {
            console.error(`Error updating tenant status:`, error);
            Notify.failure(`Failed to update tenant status`);
        }
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredTenants.slice(startIndex, endIndex);
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
        tenants,
        getPaginatedData,
        deleteTenant,
        updateTenantStatus
    };
};