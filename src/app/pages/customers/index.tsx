import { FunctionComponent, useCallback, useContext, useState } from 'react';
import { Confirm } from 'notiflix';
import { Users } from 'lucide-react';
import DataTable from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus, HiOutlineUserGroup } from 'react-icons/hi2';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext } from '../../components';
import { useCustomers } from '../../hooks/useCustomers';
import { getCustomerColumns } from './partials/CustomerTableColumns';
import CustomerModal from './partials/CustomerModal';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { SearchBar } from '../../components/SearchBar';

const CustomerManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();

    const { mode } = useContext(ZonseThemeContext);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const {
        isLoading,
        searchTerm,
        setSearchTerm,
        setPage,
        setPerPage,
        totalRows,
        deleteCustomer,
        refreshCustomers,
        getPaginatedData,
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
            },
            undefined,
            {
                okButtonBackground: '#ef4444',
            }
        );
    }, [deleteCustomer]);

    const handleModalClose = () => {
        setShowModal(false);
        setEditingCustomer(null);
    };

    const handleModalSuccess = async () => {
        await refreshCustomers();
        handleModalClose();
    };

    const columns = getCustomerColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title='Customers'
                    description='Manage your customer database'
                    icon={<HiOutlineUserGroup className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
                    action={
                        <div className='flex items-center justify-between gap-2'>
                            {
                                !isMobile && (
                                    <SearchBar
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                )}

                            <Button
                                onClick={handleAddCustomer}
                                icon={HiOutlinePlus}
                                layout={isMobile ? 'outline' : 'primary'}
                                theme='primary'
                            >
                                {!isMobile && <span className='hidden md:block'>
                                    Add Customer
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
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'No customer(s) found matching your search.' : 'No customers found.'}
                            </p>
                        </div>
                    }
                />
            </div>

            <CustomerModal
                isOpen={showModal}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                customer={editingCustomer}
            />
        </AppLayout>
    );
};

export default CustomerManagement;
