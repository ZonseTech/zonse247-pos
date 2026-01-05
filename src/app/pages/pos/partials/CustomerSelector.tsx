import { Fragment, FunctionComponent, useState, useEffect } from 'react';
import { HiOutlineUser, HiOutlineUserGroup, HiOutlinePlus, HiOutlineSearch, HiOutlineUserCircle } from 'react-icons/hi';
import { useInventory } from '../../../hooks/useInventory';
import { Button, Modal } from '../../../components';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Notify } from 'notiflix';
import customerService from '../../../services/customers.service';

const WALK_IN_CUSTOMER: Customer = {
    customerId: 'walk-in',
    name: 'Walk-in Customer',
    tenantId: '',
    branchId: '',
    userId: '',
    phone: '',
    email: '',
    address: '',
};

const CustomerSelector: FunctionComponent = () => {
    const { customers, selectedCustomer, setSelectedCustomer, fetchCustomers } = useInventory();
    const [isCustomerListModalOpen, setIsCustomerListModalOpen] = useState(false);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        // Set walk-in as default if no customer selected
        if (!selectedCustomer) {
            setSelectedCustomer(WALK_IN_CUSTOMER);
        }
    }, [selectedCustomer, setSelectedCustomer]);

    const handleSelectCustomer = (customer: Customer | 'walk-in') => {
        if (customer === 'walk-in') {
            setSelectedCustomer(WALK_IN_CUSTOMER);
        } else {
            setSelectedCustomer(customer);
        }
        setIsCustomerListModalOpen(false);
        setSearchTerm('');
    };

    const handleAddCustomer = async (values: Customer) => {
        try {
            const newCustomer = await customerService.store(values);
            Notify.success('Customer added successfully');
            await fetchCustomers();
            setSelectedCustomer(newCustomer);
            setIsAddCustomerModalOpen(false);
            setIsCustomerListModalOpen(false);
        } catch (error) {
            Notify.failure('Failed to add customer');
        }
    };

    const filteredCustomers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const initialCustomerValues: Customer = {
        customerId: '',
        tenantId: '',
        branchId: '',
        userId: '',
        name: '',
        phone: '',
        email: '',
        address: '',
    };

    const customerValidationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Customer name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name is too long'),
        phone: Yup.string()
            .nullable()
            .matches(/^[0-9+\-\s]+$/, 'Invalid phone number format')
            .max(20, 'Phone number is too long'),
        email: Yup.string().nullable().email('Invalid email address').max(100, 'Email is too long'),
        address: Yup.string().nullable().max(200, 'Address is too long'),
    });

    return (
        <Fragment>
            <button
                onClick={() => setIsCustomerListModalOpen(true)}
                className={`inline-flex items-center gap-2 text-sm font-medium transition-all underline decoration-2 underline-offset-4 hover:decoration-1 ${selectedCustomer?.customerId === 'walk-in'
                        ? 'text-blue-700 dark:text-blue-300 decoration-blue-400 hover:text-blue-800 dark:hover:text-blue-200'
                        : 'text-emerald-700 dark:text-emerald-300 decoration-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200'
                    }`}
            >
                {selectedCustomer?.customerId === 'walk-in' ? (
                    <HiOutlineUser className="w-4 h-4" />
                ) : (
                    <HiOutlineUserGroup className="w-4 h-4" />
                )}
                <span className="hidden md:inline">{selectedCustomer?.name || 'Select Customer'}</span>
                <span className="md:hidden">
                    {selectedCustomer?.customerId === 'walk-in' ? 'Walk-in' : selectedCustomer?.name?.split(' ')[0] || 'Customer'}
                </span>
            </button>

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
                    {/* Search Bar */}
                    <div className="relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, phone, or email..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Walk-in Customer Option */}
                    <button
                        onClick={() => handleSelectCustomer('walk-in')}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedCustomer?.customerId === 'walk-in'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <HiOutlineUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-white">Walk-in Customer</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Anonymous transaction</div>
                            </div>
                        </div>
                    </button>

                    {/* Add New Customer Button */}
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

                    {/* Customer List */}
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
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
                                <p>No customers found</p>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Add Customer Modal */}
            <Modal
                title="Add New Customer"
                isOpen={isAddCustomerModalOpen}
                onClose={() => setIsAddCustomerModalOpen(false)}
                className="max-w-md"
            >
                <Formik
                    initialValues={initialCustomerValues}
                    validationSchema={customerValidationSchema}
                    onSubmit={handleAddCustomer}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <FormWrapper>
                                <FormInput
                                    type="text"
                                    name="name"
                                    label="Customer Name*"
                                    required
                                    placeholder="Enter full name"
                                />

                                <FormInput
                                    type="text"
                                    name="phone"
                                    label="Phone Number"
                                    placeholder="Enter phone number"
                                />

                                <FormInput
                                    type="email"
                                    name="email"
                                    label="Email Address"
                                    placeholder="Enter email address"
                                />

                                <FormInput
                                    type="text"
                                    name="address"
                                    label="Address"
                                    placeholder="Enter address"
                                />

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        onClick={() => setIsAddCustomerModalOpen(false)}
                                        theme="danger"
                                        layout="outline"
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        theme="primary"
                                        disabled={isSubmitting}
                                        className="flex-1"
                                    >
                                        {isSubmitting ? 'Adding...' : 'Add Customer'}
                                    </Button>
                                </div>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </Fragment>
    );
};

export default CustomerSelector;
