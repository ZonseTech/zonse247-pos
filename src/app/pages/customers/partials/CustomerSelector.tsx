import { Fragment, FunctionComponent, useState, useEffect, useMemo, ReactNode } from 'react';
import { HiOutlineUser, HiOutlineUserGroup, HiOutlinePlus, HiOutlineSearch, HiOutlineUserCircle } from 'react-icons/hi';
import { useInventory } from '../../../hooks/useInventory';
import { Modal } from '../../../components';
import CustomerModal from './CustomerModal';

interface CustomerSelectorProps {
    compact?: boolean;
    trigger?: ReactNode;
}

const CustomerSelector: FunctionComponent<CustomerSelectorProps> = ({ compact = false, trigger }) => {
    const { customers, selectedCustomer, setSelectedCustomer, fetchCustomers } = useInventory();
    const [isCustomerListModalOpen, setIsCustomerListModalOpen] = useState(false);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const defaultCustomer = useMemo(() => {
        return customers.find((customer) => customer.isDefault) || null;
    }, [customers]);

    useEffect(() => {
        const loadCustomers = async () => {
            setIsLoading(true);
            try {
                await fetchCustomers();
            } finally {
                setIsLoading(false);
            }
        };
        loadCustomers();
    }, []);

    useEffect(() => {
        if (!selectedCustomer && defaultCustomer) {
            setSelectedCustomer(defaultCustomer);
        }
    }, [selectedCustomer, defaultCustomer, setSelectedCustomer]);

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsCustomerListModalOpen(false);
        setSearchTerm('');
    };

    const handleAddCustomerSuccess = async () => {
        await fetchCustomers();
        setIsAddCustomerModalOpen(false);
        setIsCustomerListModalOpen(false);
    };

    const filteredCustomers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Fragment>
            {trigger ? (
                <div onClick={() => setIsCustomerListModalOpen(true)} className="cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <button
                    onClick={() => setIsCustomerListModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 font-medium transition-all underline decoration-2 underline-offset-4 hover:decoration-1 ${compact ? 'text-xs' : 'text-sm gap-2'} ${selectedCustomer?.isDefault
                        ? 'text-sky-700 dark:text-sky-300 decoration-sky-400 hover:text-sky-800 dark:hover:text-sky-200'
                        : 'text-emerald-700 dark:text-emerald-300 decoration-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200'
                        }`}
                >
                    {selectedCustomer?.isDefault ? (
                        <HiOutlineUser className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
                    ) : (
                        <HiOutlineUserGroup className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
                    )}
                    <span className="hidden md:inline">
                        {isLoading ? 'Loading...' : (selectedCustomer?.name || 'Select Customer')}
                    </span>
                    <span className="md:hidden">
                        {isLoading ? '...' : (selectedCustomer?.isDefault ? selectedCustomer?.name?.split(' ')[0] : selectedCustomer?.name?.split(' ')[0] || 'Customer')}
                    </span>
                </button>
            )}

            <Modal
                title="Select Customer"
                isOpen={isCustomerListModalOpen}
                onClose={() => {
                    setIsCustomerListModalOpen(false);
                    setSearchTerm('');
                }}
                className="max-w-2xl"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, phone, or email..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                    </div>

                    {defaultCustomer && (
                        <button
                            onClick={() => handleSelectCustomer(defaultCustomer)}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedCustomer?.customerId === defaultCustomer.customerId
                                ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                                    <HiOutlineUser className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">{defaultCustomer.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Default customer</div>
                                </div>
                            </div>
                        </button>
                    )}

                    <button
                        onClick={() => setIsAddCustomerModalOpen(true)}
                        className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                <HiOutlinePlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-white">Add New Customer</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Create a new loyal customer</div>
                            </div>
                        </div>
                    </button>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p>Loading customers...</p>
                            </div>
                        ) : filteredCustomers.length > 0 ? (
                            filteredCustomers
                                .filter((customer) => !customer.isDefault)
                                .map((customer) => (
                                    <button
                                        key={customer.customerId}
                                        onClick={() => handleSelectCustomer(customer)}
                                        className={`w-full p-3 rounded-lg border transition-all text-left ${selectedCustomer?.customerId === customer.customerId
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                                <HiOutlineUserGroup className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {customer.phone && <span>📱 {customer.phone}</span>}
                                                    {customer.phone && customer.email && <span className="mx-2">•</span>}
                                                    {customer.email && <span>✉️ {customer.email}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <HiOutlineUserCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>{customers.length === 0 ? 'No customers available' : 'No customers found'}</p>
                                {customers.length === 0 && !defaultCustomer && (
                                    <p className="text-sm mt-1">Please add a customer to continue</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            <CustomerModal
                isOpen={isAddCustomerModalOpen}
                onClose={() => setIsAddCustomerModalOpen(false)}
                onSuccess={handleAddCustomerSuccess}
                customer={null}
                customersCount={customers.length}
            />
        </Fragment>
    );
};

export default CustomerSelector;
