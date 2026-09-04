import { Confirm } from 'notiflix';
import { Building2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { Box, Button, Flex, Select, Text } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { useTenants } from '../../hooks/useTenants';
import { FunctionComponent, useContext, useState } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import { ZonseThemeContext } from '../../components';
import { getTenantColumns } from './partials/TenantTableColumns';
import TenantFormModal from './partials/TenantFormModal';
import { statuses as STATUS_OPTIONS } from '../../utils/tenant-status';

const TenantsManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);
    const {
        isLoading,
        searchTerm,
        setSearchTerm,
        totalRows,
        perPage,
        setPage,
        setPerPage,
        statusFilter,
        setStatusFilter,
        tenants,
        deleteTenant,
        updateTenantStatus,
        loadTenants
    } = useTenants();

    const [formTenantId, setFormTenantId] = useState<string | 'new' | null>(null);

    const handleView = (tenantId: string) => navigate(ROUTES.TENANT_DETAILS, { state: { tenantId } });

    const handleEdit = (tenantId: string) => setFormTenantId(tenantId);

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
            <Box className="max-w-full">
                <PageHeader
                    title='Tenants'
                    description='Manage tenants accounts and subscriptions'
                    icon={<HiOutlineBuildingOffice2 className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <Flex align="center" gap="3" wrap="wrap">
                            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search tenant..." />

                            <Select.Root
                                value={statusFilter || 'all'}
                                onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val as TenantStatus)}
                            >
                                <Select.Trigger placeholder="All Status" className="w-40" />
                                <Select.Content position="popper">
                                    <Select.Item value="all">All Status</Select.Item>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <Select.Item key={opt.value} value={opt.value}>{opt.label}</Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>

                            <Button onClick={() => setFormTenantId('new')}>
                                <Plus className="w-4 h-4" />
                                Add Tenant
                            </Button>
                        </Flex>
                    }
                />
                <DataTable
                    columns={columns}
                    data={tenants}
                    theme={mode as string}
                    progressPending={isLoading}
                    progressComponent={<TableSkeleton rows={perPage} columns={5} showCheckbox={false} showActions />}
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
                    customStyles={getTableStyles(mode)}
                    noDataComponent={
                        <Flex direction="column" align="center" py="8">
                            <Building2 className="w-12 h-12 text-gray-400 mb-4" />
                            <Text color="gray">
                                {searchTerm ? 'No tenant(s) found matching your search.' : 'No tenants found.'}
                            </Text>
                        </Flex>
                    }
                />
            </Box>

            {formTenantId && (
                <TenantFormModal
                    tenantId={formTenantId === 'new' ? undefined : formTenantId}
                    onClose={() => setFormTenantId(null)}
                    onSaved={loadTenants}
                />
            )}
        </AppLayout>
    );
};

export default TenantsManagement;