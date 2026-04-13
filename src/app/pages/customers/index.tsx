import { FunctionComponent, useCallback, useState } from 'react';
import { Confirm } from 'notiflix';
import { Plus, ArrowLeft } from 'lucide-react';
import { Box, Button, IconButton } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { HiOutlineUserGroup } from 'react-icons/hi2';
import { useCustomers } from '../../hooks/useCustomers';
import CustomerModal from './partials/CustomerModal';
import CustomerListSidebar from './partials/CustomerListSidebar';
import CustomerActivityPanel from './partials/CustomerActivityPanel';
import { useIsMobile } from '../../hooks/useMediaQuery';

const CustomerManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showActivity, setShowActivity] = useState(false);

    const {
        customers, isLoading, searchTerm, setSearchTerm,
        nextPage, prevPage, hasNextPage, hasPrevPage, pageLabel,
        deleteCustomer, refreshCustomers,
    } = useCustomers();

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
                if (selectedCustomer?.customerId === customerId) {
                    setSelectedCustomer(null);
                    setShowActivity(false);
                }
            },
            undefined,
            { okButtonBackground: '#ef4444' },
        );
    }, [deleteCustomer, selectedCustomer]);

    const handleSelectCustomer = useCallback((customer: Customer) => {
        setSelectedCustomer(customer);
        if (isMobile) setShowActivity(true);
    }, [isMobile]);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
        setEditingCustomer(null);
    }, []);

    const handleModalSuccess = useCallback(async () => {
        await refreshCustomers();
        handleModalClose();
    }, [refreshCustomers, handleModalClose]);

    const listProps = {
        customers, isLoading, searchTerm, selectedCustomer, pageLabel, hasNextPage, hasPrevPage,
        onSearchChange: setSearchTerm,
        onSelectCustomer: handleSelectCustomer,
        onNextPage: nextPage,
        onPrevPage: prevPage,
        onAddCustomer: handleAddCustomer,
    };

    const activityProps = { customer: selectedCustomer, onEdit: handleEdit, onDelete: handleDelete };

    return (
        <AppLayout>
            {isMobile ? (
                <MobilePageHeader
                    title={showActivity && selectedCustomer ? selectedCustomer.name : 'Customers'}
                    showLeftButton={true}
                    leftIcon={showActivity ? <ArrowLeft className="w-5 h-5" /> : undefined}
                    onLeftPress={showActivity ? () => setShowActivity(false) : undefined}
                    rightContent={
                        <IconButton variant="ghost" color="sky" size="2" onClick={handleAddCustomer} aria-label="Add customer">
                            <Plus className="w-5 h-5" />
                        </IconButton>
                    }
                />
            ) : (
                <PageHeader
                    title="Customers"
                    description="Manage your customer database"
                    icon={<HiOutlineUserGroup className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                    action={<Button size="2" onClick={handleAddCustomer}><Plus className="w-4 h-4" /> Add Customer</Button>}
                />
            )}

            <Box className="sm:rounded-lg shadow-sm border-y sm:border border-gray-200 dark:border-gray-700 sm:overflow-clip -mx-2 sm:mx-0 flex-1 min-h-0 flex flex-col">
                {isMobile ? (
                    showActivity
                        ? <CustomerActivityPanel {...activityProps} />
                        : <CustomerListSidebar {...listProps} />
                ) : (
                    <div className="flex h-full min-h-[500px]">
                        <div className="w-1/3 min-w-[280px] max-w-[360px] flex-shrink-0">
                            <CustomerListSidebar {...listProps} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <CustomerActivityPanel {...activityProps} />
                        </div>
                    </div>
                )}
            </Box>

            {isMobile && !showActivity && (
                <button
                    onClick={handleAddCustomer}
                    className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-200 dark:focus:ring-sky-900"
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
