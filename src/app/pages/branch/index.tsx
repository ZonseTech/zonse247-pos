import { Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlinePlus, HiOutlineBuildingStorefront } from 'react-icons/hi2';
import { SearchBar } from '../../components/SearchBar';
import { useBranches } from '../../hooks/useBranches';
import { useBranchPermissions } from '../../hooks/useBranchPermissions';
import { FunctionComponent, useMemo } from 'react';
import PageHeader from '../../components/page/PageHeader';
import { Button } from '../../components';
import BranchSummaryCards, { BranchSummaryCard } from './partials/BranchSummaryCards';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useAuth } from '../../context/AuthProvider';
import { hasPermission } from '../../utils';
import MobileBranch from './MobileBranch';
import DesktopBranch from './DesktopBranch';

const BranchManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const permissions = useBranchPermissions();
    const { user: authUser } = useAuth();

    const canViewStats = useMemo(() => {
        return hasPermission(authUser, 'system.admin');
    }, [authUser]);

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
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Active',
                value: activeCount,
                icon: 'active',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
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
                textColor: 'text-amber-500 dark:text-amber-400',
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

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title='Branches'
                    description='Manage your branch locations and settings'
                    icon={<HiOutlineBuildingStorefront className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <div className='flex items-center justify-between gap-2'>
                            {!isMobile && (
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                />
                            )}

                            {permissions.canCreateBranch && (
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
                            )}
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

                    {/* Summary Cards - Admin and Super-Admin only */}
                    {canViewStats && (
                        <BranchSummaryCards
                            cards={summaryCards}
                            isLoading={isLoading}
                        />
                    )}

                    {/* Conditional Rendering for Mobile and Desktop */}
                    {isMobile ? (
                        <MobileBranch
                            isLoading={isLoading}
                            branches={getPaginatedData()}
                            totalRows={totalRows}
                            page={page}
                            perPage={perPage}
                            searchTerm={searchTerm}
                            onEdit={handleEdit}
                            onStatusToggle={handleStatusToggle}
                            onDelete={handleDelete}
                            onPageChange={setPage}
                            permissions={permissions}
                        />
                    ) : (
                        <DesktopBranch
                            isLoading={isLoading}
                            branches={getPaginatedData()}
                            totalRows={totalRows}
                            page={page}
                            perPage={perPage}
                            searchTerm={searchTerm}
                            onEdit={handleEdit}
                            onStatusToggle={handleStatusToggle}
                            onDelete={handleDelete}
                            onPageChange={setPage}
                            onPerPageChange={(newPerPage, newPage) => {
                                setPage(newPage);
                                setPerPage(newPerPage);
                            }}
                            permissions={permissions}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default BranchManagement;