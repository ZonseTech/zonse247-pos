import { FC, useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Wrench, Plus } from 'lucide-react';
import DataTable from 'react-data-table-component';
import { Button, Box } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../components/TableEmptyState';
import { ZonseThemeContext, SummaryCards } from '../../components';
import { getTableStyles } from '../../utils/table-styles';
import { useServices } from '../../hooks/useServices';
import { useServiceSummary } from '../../hooks/useServiceSummary';
import { getServiceTableColumns } from './partials/ServiceTableColumns';
import { ServiceMobileList } from './partials/ServiceMobileCard';
import ServiceToolbar from './partials/ServiceToolbar';
import ServiceFilters from './partials/ServiceFilters';
import ServiceFilterChips from './partials/ServiceFilterChips';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { getErrorMessage } from '../../utils/api-error-handler';

const Services: FC = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const {
        services,
        isLoading,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        // Filters
        statusFilter,
        setStatusFilter,
        pricingTypeFilter,
        setPricingTypeFilter,
        categoryFilter,
        setCategoryFilter,
        hasActiveFilters,
        activeFilterCount,
        clearFilters,
        exportCSV,
        deleteService,
    } = useServices({ limit: 50 });

    const { isLoading: isLoadingSummary, getSummaryCards, loadSummary } = useServiceSummary({
        statusFilter,
        pricingTypeFilter,
        categoryFilter,
    });

    // ─── Handlers ─────────────────────────────────────────────────────
    const handleEdit = useCallback(
        (service: Service) => navigate(ROUTES.SERVICE_FORM, { state: { serviceId: service.id } }),
        [navigate],
    );

    const handleDelete = useCallback(
        (service: Service) => {
            Confirm.show(
                'Delete Service',
                `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
                'Yes, Delete',
                'Cancel',
                async () => {
                    try {
                        await deleteService(service.id);
                        Notify.success('Service deleted successfully');
                        loadSummary();
                    } catch (error: any) {
                        Notify.failure(getErrorMessage(error, 'Failed to delete service'));
                    }
                },
                undefined,
                { okButtonBackground: '#ef4444', titleColor: '#ef4444' },
            );
        },
        [deleteService, loadSummary],
    );

    const handleToggleStatus = useCallback(
        (service: Service) => {
            const action = service.isActive ? 'deactivate' : 'activate';
            Confirm.show(
                `${service.isActive ? 'Deactivate' : 'Activate'} Service`,
                `Are you sure you want to ${action} "${service.name}"?`,
                `Yes, ${service.isActive ? 'Deactivate' : 'Activate'}`,
                'Cancel',
                async () => {
                    try {
                        const { useServices: _, ...svc } = service as any;
                        // We use the hook's update indirectly — import at hook level
                        const serviceService = (await import('../../services/service.service')).default;
                        await serviceService.update(service.id, { isActive: !service.isActive });
                        Notify.success(`Service ${action}d`);
                        // Trigger reload
                        clearFilters();
                        loadSummary();
                    } catch (error: any) {
                        Notify.failure(getErrorMessage(error, `Failed to ${action} service`));
                    }
                },
                undefined,
                {
                    okButtonBackground: service.isActive ? '#f59e0b' : '#10b981',
                    titleColor: service.isActive ? '#f59e0b' : '#10b981',
                },
            );
        },
        [clearFilters, loadSummary],
    );

    const columns = useMemo(
        () => getServiceTableColumns({ onEdit: handleEdit, onDelete: handleDelete, onToggleStatus: handleToggleStatus }),
        [handleEdit, handleDelete, handleToggleStatus],
    );

    // Clear individual filters
    const handleClearSearch = useCallback(() => setSearchTerm(''), [setSearchTerm]);
    const handleClearStatus = useCallback(() => setStatusFilter('all'), [setStatusFilter]);
    const handleClearPricingType = useCallback(() => setPricingTypeFilter('all'), [setPricingTypeFilter]);
    const handleClearCategory = useCallback(() => setCategoryFilter('all'), [setCategoryFilter]);

    return (
        <AppLayout>
            {isMobile ? (
                <MobilePageHeader title="Services" showLeftButton={true} />
            ) : (
                <PageHeader
                    title="Services"
                    description="Manage your service catalog — pricing, categories, and availability"
                    icon={<Wrench className="w-8 h-8 text-sky-500" />}
                    action={
                        <Button size="2" onClick={() => navigate(ROUTES.SERVICE_FORM)}>
                            <Plus className="w-4 h-4" /> Add Service
                        </Button>
                    }
                />
            )}

            <Box className="sm:rounded-lg shadow-sm border-y sm:border border-gray-200 dark:border-gray-700 sm:overflow-clip -mx-2 sm:mx-0 mt-4">
                {/* Toolbar: search + export + clear */}
                <ServiceToolbar
                    searchTerm={searchTerm}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onSearch={setSearchTerm}
                    onExport={exportCSV}
                    onClearFilters={clearFilters}
                />

                {/* Mobile: filter chips when filters active */}
                {isMobile && hasActiveFilters && (
                    <ServiceFilterChips
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        pricingTypeFilter={pricingTypeFilter}
                        categoryFilter={categoryFilter}
                        onClearSearch={handleClearSearch}
                        onClearStatus={handleClearStatus}
                        onClearPricingType={handleClearPricingType}
                        onClearCategory={handleClearCategory}
                        onClearAll={clearFilters}
                    />
                )}

                {/* Desktop: inline filter row (always visible) */}
                {!isMobile && (
                    <ServiceFilters
                        statusFilter={statusFilter}
                        pricingTypeFilter={pricingTypeFilter}
                        categoryFilter={categoryFilter}
                        onStatusChange={setStatusFilter}
                        onPricingTypeChange={setPricingTypeFilter}
                        onCategoryChange={setCategoryFilter}
                    />
                )}

                {/* Summary cards */}
                <Box px={{ initial: '2', sm: '4' }} py="3">
                    <SummaryCards cards={getSummaryCards()} isLoading={isLoadingSummary} skeletonCount={4} />
                </Box>

                {/* Content */}
                {isMobile ? (
                    <ServiceMobileList
                        services={services}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        isLoading={isLoading}
                    />
                ) : isLoading ? (
                    <TableSkeleton />
                ) : services.length === 0 ? (
                    <TableEmptyState
                        icon={<Wrench />}
                        title={hasActiveFilters ? 'No services match your filters' : 'No services yet'}
                        description={
                            hasActiveFilters
                                ? 'Try adjusting your filters or search term'
                                : 'Add your first service to start building your catalog'
                        }
                        action={
                            hasActiveFilters ? (
                                <Button size="2" variant="soft" color="gray" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            ) : (
                                <Button size="2" onClick={() => navigate(ROUTES.SERVICE_FORM)}>
                                    <Plus className="w-4 h-4" /> Add Service
                                </Button>
                            )
                        }
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        data={services}
                        customStyles={getTableStyles(mode || 'light')}
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
                        paginationPerPage={perPage}
                        paginationDefaultPage={page}
                        onChangePage={setPage}
                        onChangeRowsPerPage={(newPerPage) => {
                            setPerPage(newPerPage);
                            setPage(1);
                        }}
                        highlightOnHover
                        pointerOnHover
                        onRowClicked={(row) => handleEdit(row)}
                    />
                )}
            </Box>

            {/* Mobile: floating "Add" button */}
            {isMobile && (
                <button
                    onClick={() => navigate(ROUTES.SERVICE_FORM)}
                    className="fixed bottom-20 right-4 z-30 flex items-center justify-center w-14 h-14 rounded-full
                             bg-sky-500 text-white shadow-lg hover:bg-sky-600 active:bg-sky-700
                             transition-colors touch-manipulation"
                    aria-label="Add service"
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}
        </AppLayout>
    );
};

export default Services;
