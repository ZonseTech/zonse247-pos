import { Confirm } from 'notiflix';
import { Store } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlinePlus, HiOutlineBuildingStorefront } from 'react-icons/hi2';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { useBranches } from '../../hooks/useBranches';
import { FunctionComponent, useContext } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext } from '../../components';
import { getBranchColumns } from './partials/BranchTableColumns';
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
        setPage,
        setPerPage,
        getPaginatedData,
        deleteBranch,
        updateBranchStatus
    } = useBranches();

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
                    icon={<HiOutlineBuildingStorefront className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
                    action={
                        <div className='flex items-center justify-between gap-2'>
                            {
                                !isMobile && (
                                    <SearchBar
                                        value={searchTerm}
                                        onChange={setSearchTerm}
                                    />
                                )}

                            <Button
                                onClick={() => navigate(ROUTES.BRANCH_FORM)}
                                icon={HiOutlinePlus}
                                layout={isMobile ? 'outline' : 'primary'}
                                theme='primary'
                            >
                                {!isMobile && <span className='hidden md:block'>
                                    Add Branch
                                </span>}
                            </Button>
                        </div>
                    }
                >
                    {
                        isMobile && (
                            <div className='m-4 mt-0'>
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                />
                            </div>
                        )
                    }
                </PageHeader>
                <DataTable
                    columns={columns}
                    data={getPaginatedData()}
                    theme={mode as string}
                    progressPending={isLoading}
                    highlightOnHover
                    striped
                    responsive
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={(newPerPage, page) => {
                        setPage(page);
                        setPerPage(newPerPage);
                    }}
                    onChangePage={setPage}
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 350px)"
                    customStyles={getTableStyles(mode)}
                    noDataComponent={
                        <div className="text-center py-8">
                            <Store className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'No branch(es) found matching your search.' : 'No branches found.'}
                            </p>
                        </div>
                    }
                />
            </div>
        </AppLayout>
    );
};

export default BranchManagement;