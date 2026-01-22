import { Confirm } from 'notiflix';
import { Store } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlinePlus, HiOutlineBuildingStorefront, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { useBranches } from '../../hooks/useBranches';
import { FunctionComponent, useContext, useMemo } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext, ComponentLoader } from '../../components';
import { getBranchColumns } from './partials/BranchTableColumns';
import { BranchMobileList } from './partials/BranchMobileCard';
import BranchSummaryCards, { BranchSummaryCard } from './partials/BranchSummaryCards';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';

const BranchManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const {
        isLoading,
        searchTerm,
        setSearchTerm,
        totalRows,
        page,
        setPage,
        perPage,
        setPerPage,
        getPaginatedData,
        deleteBranch,
        updateBranchStatus,
        filteredBranches
    } = useBranches();

    // Calculate summary stats
    const summaryCards: BranchSummaryCard[] = useMemo(() => {
        const allBranches = filteredBranches || [];
        const activeCount = allBranches.filter(b => b.status === 'active').length;
        const inactiveCount = allBranches.filter(b => b.status === 'inactive').length;
        const pendingCount = allBranches.filter(b => b.mraApprovalStatus === 'PENDING').length;

        return [
            {
                title: 'Total Branches',
                value: totalRows,
                icon: 'total',
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-600 dark:text-sky-400',
            },
            {
                title: 'Active',
                value: activeCount,
                icon: 'active',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-600 dark:text-emerald-400',
            },
            {
                title: 'Inactive',
                value: inactiveCount,
                icon: 'inactive',
                bgColor: 'bg-gray-50 dark:bg-gray-700/50',
                iconBgColor: 'bg-gray-100 dark:bg-gray-600',
                textColor: 'text-gray-600 dark:text-gray-400',
            },
            {
                title: 'Pending Approval',
                value: pendingCount,
                icon: 'pending',
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-600 dark:text-amber-400',
            },
        ];
    }, [filteredBranches, totalRows]);

    const handleEdit = (branch: Branch) => {
        navigate(ROUTES.BRANCH_FORM, { state: { branchId: branch.branchId } });
    };

    const handleDelete = (branchId: string, branchName: string) => {
        Confirm.show(
            'Delete Branch',
            `Are you sure you want to delete the branch "${branchName}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                await deleteBranch(branchId);
            },
            () => {
                // do nothing
            },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const handleStatusToggle = (branchId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active' as BranchStatus;
        const action = newStatus === 'active' ? 'activate' : 'deactivate';

        Confirm.show(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Branch`,
            `Are you sure you want to ${action} this branch?`,
            `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            'Cancel',
            async () => {
                await updateBranchStatus(branchId, newStatus);
            },
            () => {
                // do nothing
            },
            {
                titleColor: newStatus === 'inactive' ? '#ef4444' : '#22c55e',
                okButtonBackground: newStatus === 'inactive' ? '#ef4444' : '#22c55e',
            }
        );
    };

    const columns = getBranchColumns(handleEdit, handleStatusToggle, handleDelete);

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title='Branches'
                    description='Manage your branch locations and settings'
                    icon={<HiOutlineBuildingStorefront className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600 dark:text-sky-400" />}
                    action={
                        <div className='flex items-center justify-between gap-2'>
                            {!isMobile && (
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                />
                            )}

                            <Button
                                onClick={() => navigate(ROUTES.BRANCH_FORM)}
                                icon={HiOutlinePlus}
                                layout={isMobile ? 'outline' : 'primary'}
                                className="!px-3 sm:!px-4 !py-2 sm:!py-2.5"
                                theme='primary'
                            >
                                {!isMobile && <span className='hidden md:block'>
                                    Add Branch
                                </span>}
                            </Button>
                        </div>
                    }
                >
                    {isMobile && (
                        <div className='px-4 pb-4'>
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                            />
                        </div>
                    )}
                </PageHeader>

                {/* Main Content Container */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Summary Cards */}
                    <BranchSummaryCards
                        cards={summaryCards}
                        isLoading={isLoading}
                    />

                    {/* Mobile View - Card List */}
                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <BranchMobileList
                                    branches={[]}
                                    onEdit={handleEdit}
                                    onStatusToggle={handleStatusToggle}
                                    onDelete={handleDelete}
                                    isLoading={true}
                                />
                            ) : getPaginatedData().length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <Store className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {searchTerm ? 'No matching branches' : 'No branches yet'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {searchTerm
                                            ? "Try adjusting your search to find branches."
                                            : "Add your first branch to get started."
                                        }
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <BranchMobileList
                                        branches={getPaginatedData()}
                                        onEdit={handleEdit}
                                        onStatusToggle={handleStatusToggle}
                                        onDelete={handleDelete}
                                        isLoading={false}
                                    />

                                    {/* Mobile Pagination */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            Page {page} of {Math.ceil(totalRows / perPage) || 1} ({totalRows} total)
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage(page - 1)}
                                                disabled={page <= 1}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {page}
                                            </span>
                                            <button
                                                onClick={() => setPage(page + 1)}
                                                disabled={page >= Math.ceil(totalRows / perPage)}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        /* Desktop View - Data Table */
                        <div className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={getPaginatedData()}
                                theme={mode as string}
                                progressPending={isLoading}
                                progressComponent={<ComponentLoader loading={isLoading} />}
                                highlightOnHover
                                striped
                                responsive
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                                onChangeRowsPerPage={(newPerPage, page) => {
                                    setPage(page);
                                    setPerPage(newPerPage);
                                }}
                                onChangePage={setPage}
                                fixedHeader
                                fixedHeaderScrollHeight="calc(100vh - 420px)"
                                customStyles={getTableStyles(mode)}
                                noDataComponent={
                                    <div className="text-center py-12">
                                        <Store className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            {searchTerm ? 'No matching branches' : 'No branches found'}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first branch.'}
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default BranchManagement;