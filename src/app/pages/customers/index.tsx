import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { Confirm } from 'notiflix';
import { Plus } from 'lucide-react';
import { Box, Button } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { HiOutlineUserGroup } from 'react-icons/hi2';
import { useCustomers } from '../../hooks/useCustomers';
import { getCustomerColumns } from './partials/CustomerTableColumns';
import CustomerModal from './partials/CustomerModal';
import CustomerSummaryCards from './partials/CustomerSummaryCards';
import CustomersMobileView from './partials/CustomersMobileView';
import CustomersDesktopView from './partials/CustomersDesktopView';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { SearchBar } from '../../components/SearchBar';

const CustomerManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const {
        customers,
        isLoading,
        searchTerm,
        setSearchTerm,
        perPage,
        page,
        totalRows,
        handlePageChange,
        handlePerRowsChange,
        deleteCustomer,
        refreshCustomers,
    } = useCustomers();

    const totalPages = Math.ceil(totalRows / perPage);

    const handleAddCustomer = useCallback(() => {
        setEditingCustomer(null);
        setShowModal(true);
    }, []);

    const handleEdit = useCallback((customer: Customer) => {
        setEditingCustomer(customer);
        setShowModal(true);
    }, []);

    const handleDelete = useCallback((customerId: string, customerName: string) => {
        Confirm.show(
            'Delete Customer',
            `Are you sure you want to delete "${customerName}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            () => {
                deleteCustomer(customerId);
            },
            undefined,
            {
                okButtonBackground: '#ef4444',
            }
        );
    }, [deleteCustomer]);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
        setEditingCustomer(null);
    }, []);

    const handleModalSuccess = useCallback(async () => {
        await refreshCustomers();
        handleModalClose();
    }, [refreshCustomers, handleModalClose]);

    const columns = useMemo(
        () => getCustomerColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete]
    );

    const customersWithEmail = useMemo(() => customers.filter(c => c.email).length, [customers]);
    const customersWithPhone = useMemo(() => customers.filter(c => c.phone).length, [customers]);

    return (
        <AppLayout>
            {/* Header: compact on mobile, full on desktop */}
            {isMobile ? (
                <MobilePageHeader
                    title="Customers"
                    showLeftButton={true}
                    rightContent={
                        <button
                            onClick={handleAddCustomer}
                            className="p-2 text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                            aria-label="Add customer"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    }
                />
            ) : (
                <PageHeader
                    title="Customers"
                    description="Manage your customer database"
                    icon={<HiOutlineUserGroup className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <Button size="2" onClick={handleAddCustomer}>
                            <Plus className="w-4 h-4" />
                            Add Customer
                        </Button>
                    }
                />
            )}

            <Box className="sm:rounded-lg shadow-sm border-y sm:border border-gray-200 dark:border-gray-700 sm:overflow-clip -mx-2 sm:mx-0">
                {/* Search bar */}
                <div className="px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search customers..."
                    />
                </div>

                {/* Summary cards */}
                <CustomerSummaryCards
                    totalRows={totalRows}
                    showing={customers.length}
                    withEmail={customersWithEmail}
                    withPhone={customersWithPhone}
                />

                {/* Mobile: infinite scroll cards / Desktop: DataTable */}
                {isMobile ? (
                    <CustomersMobileView
                        customers={customers}
                        isLoading={isLoading}
                        page={page}
                        totalPages={totalPages}
                        totalRows={totalRows}
                        searchTerm={searchTerm}
                        onPageChange={handlePageChange}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddCustomer={handleAddCustomer}
                    />
                ) : (
                    <CustomersDesktopView
                        columns={columns}
                        data={customers}
                        isLoading={isLoading}
                        searchTerm={searchTerm}
                        perPage={perPage}
                        totalRows={totalRows}
                        onPageChange={handlePageChange}
                        onPerRowsChange={handlePerRowsChange}
                        onAddCustomer={handleAddCustomer}
                    />
                )}
            </Box>

            {/* Floating add button on mobile */}
            {isMobile && (
                <button
                    onClick={handleAddCustomer}
                    className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg
                             flex items-center justify-center active:scale-95 transition-transform
                             hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-200 dark:focus:ring-sky-900"
                    aria-label="Add customer"
                >
                    <Plus className="w-5 h-5" />
                </button>
            )}

            <CustomerModal
                isOpen={showModal}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                customer={editingCustomer}
                customersCount={customers.length}
            />
        </AppLayout>
    );
};

export default CustomerManagement;
