import { Confirm } from 'notiflix';
import { Building2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { HiOutlinePlus, HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import AppLayout from '../../layouts/AppLayout';
import { SearchBar } from './partials/SearchBar';
import DataTable from 'react-data-table-component';
import { useTenants } from '../../hooks/useTenants';
import { FunctionComponent, useContext } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext } from '../../components';
import { getTenantColumns } from './partials/TenantTableColumns';

const TenantsManagement: FunctionComponent = () => {
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
        deleteTenant,
        updateTenantStatus
    } = useTenants();

    const handleView = (tenantId: string) => navigate(ROUTES.TENANT_DETAILS, { state: { tenantId } });

    const handleEdit = (tenantId: string) => navigate(ROUTES.TENANT_FORM, { state: { tenantId } });

    const handleDelete = (tenantId: string, name: string) => {
        Confirm.show(
            'Delete tenant',
            `Are you sure you want to delete the tenant "${name}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                await deleteTenant(tenantId);
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

    const handleStatusToggle = (tenantId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active' as TenantStatus;
        const action = newStatus === 'active' ? 'activate' : 'suspend';

        Confirm.show(
            `${action.charAt(0).toUpperCase() + action.slice(1)} tenant`,
            `Are you sure you want to ${action} this tenant?`,
            `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            'Cancel',
            async () => {
                await updateTenantStatus(tenantId, newStatus);
            },
            () => {
                // do nothing
            },
            {
                titleColor: newStatus === 'suspended' ? '#ef4444' : '#22c55e',
                okButtonBackground: newStatus === 'suspended' ? '#ef4444' : '#22c55e',
            }
        );
    };

    const columns = getTenantColumns(handleView, handleEdit, handleStatusToggle, handleDelete);

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title='Tenants'
                    description='Manage tenants accounts and subscriptions'
                    icon={<HiOutlineBuildingOffice2 className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <div className="flex items-center space-x-4">
                            <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                            <div className="flex items-center space-x-3">
                                <Button
                                    onClick={() => navigate(ROUTES.TENANT_DETAILS)}
                                    layout='outline'
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    {'View All'}
                                </Button>
                                <Button
                                    onClick={() => navigate(ROUTES.TENANT_FORM)}
                                    theme='primary'
                                >
                                    <HiOutlinePlus className="w-4 h-4 mr-2" />
                                    {'Add Tenant'}
                                </Button>
                            </div>
                        </div>
                    }
                />
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
                    customStyles={getTableStyles(mode)}
                    noDataComponent={
                        <div className="text-center py-8">
                            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                                {searchTerm ? 'No tenant(s) found matching your search.' : 'No tenants found.'}
                            </p>
                        </div>
                    }
                />
            </div>
        </AppLayout>
    );
};

export default TenantsManagement;