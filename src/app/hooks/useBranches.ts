import { useState, useEffect } from 'react';
import { Notify } from 'notiflix';
import branchService from '../services/branch.service';

export const useBranches = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [branches, setBranches] = useState<Array<Branch>>([]);
    const [filteredBranches, setFilteredBranches] = useState<Array<Branch>>([]);

    useEffect(() => {
        loadBranches();
    }, []);

    useEffect(() => {
        filterBranches();
    }, [searchTerm, branches]);

    const filterBranches = () => {
        if (searchTerm.trim() === "") {
            setFilteredBranches(branches);
        } else {
            const filtered = branches.filter(branch =>
                branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.branchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredBranches(filtered);
        }
        setTotalRows(filteredBranches.length);
        setPage(1);
    };

    const loadBranches = async () => {
        try {
            setIsLoading(true);
            const data: Array<Branch> = await branchService.list();
            setBranches(data);
            setFilteredBranches(data);
            setTotalRows(data.length);
        } catch (error) {
            console.error('Error loading branches:', error);
            Notify.failure('Failed to load branches');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteBranch = async (branchId: string) => {
        try {
            await branchService.delete(branchId);
            const updatedBranches = branches.filter(branch => branch.branchId !== branchId);
            setBranches(updatedBranches);
            setFilteredBranches(updatedBranches);
            setTotalRows(updatedBranches.length);
            Notify.success('Branch deleted successfully');
        } catch (error) {
            console.error('Error deleting branch:', error);
            Notify.failure('Failed to delete branch');
        }
    };

    const updateBranchStatus = async (branchId: string, newStatus: BranchStatus) => {
        try {
            const branch = branches.find(b => b.branchId === branchId);
            if (!branch) return;

            await branchService.update(branchId, {
                status: newStatus,
                isActive: newStatus === 'active'
            });

            const updatedBranches = branches.map(b =>
                b.branchId === branchId
                    ? { ...b, status: newStatus, isActive: newStatus === 'active' }
                    : b
            );

            setBranches(updatedBranches);
            setFilteredBranches(updatedBranches);
            setTotalRows(updatedBranches.length);

            const action = newStatus === 'active' ? 'activated' : newStatus === 'inactive' ? 'deactivated' : 'suspended';
            Notify.success(`Branch ${action} successfully`);
        } catch (error) {
            console.error(`Error updating branch status:`, error);
            Notify.failure(`Failed to update branch status`);
        }
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredBranches.slice(startIndex, endIndex);
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
        branches,
        filteredBranches,
        getPaginatedData,
        deleteBranch,
        updateBranchStatus,
        refreshBranches: loadBranches
    };
};
