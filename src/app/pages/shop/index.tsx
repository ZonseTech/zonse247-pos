import AppLayout from '../../layouts/AppLayout';
import { HiOutlineMenuAlt4, HiOutlineSearch } from 'react-icons/hi';
import shopsService from '../../services/shop.service';
import { Button, Input, ZonseThemeContext } from '../../components';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Edit2, Trash2, Store, MapPin, Phone, Mail } from 'lucide-react';
import { useState, useEffect, Fragment, useContext, FunctionComponent, ChangeEvent } from 'react';
import ShopFormModal from './partials/ShopFormModal';
import { Notify, Confirm } from 'notiflix';
import { HiOutlinePlus } from 'react-icons/hi2';

const ShopManagement: FunctionComponent = () => {
    const columns: Array<TableColumn<IShop>> = [
        {
            name: "Shop",
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {row.logoUrl ? (
                                <img src={row.logoUrl} alt={row.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <Store className="w-5 h-5 text-gray-500" />
                            )}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                                {row.name}
                            </div>
                            <div className="text-sm text-gray-500">{row.shopCode}</div>
                        </div>
                    </div>
                </Fragment>
            ),
        },
        {
            name: 'Contact',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm">
                        {row.addressLine1 && (
                            <div className="flex items-center text-gray-600 mb-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {row.addressLine1}
                                {row.city && `, ${row.city}`}
                            </div>
                        )}
                        {row.phone && (
                            <div className="flex items-center text-gray-600 mb-1">
                                <Phone className="w-3 h-3 mr-1" />
                                {row.phone}
                            </div>
                        )}
                        {row.email && (
                            <div className="flex items-center text-gray-600">
                                <Mail className="w-3 h-3 mr-1" />
                                {row.email}
                            </div>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Currency & Tax',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm">
                        <div className="font-medium text-gray-900">
                            {row.currencySymbol} ({row.currencyCode})
                        </div>
                        <div className="text-gray-500">
                            Tax: {row.taxRate}% {row.chargeTax ? '(Active)' : '(Inactive)'}
                        </div>
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Status',
            cell: (row) => (
                <Fragment>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                </Fragment>
            )
        },
        {
            width: "20%",
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500' />,
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleEdit(row)}
                            className={`${row.uuid === '-1'
                                ? 'text-gray-500'
                                : 'text-blue-600 hover:text-blue-800'} p-1 rounded transition-colors`}
                            title="Edit shop"
                            disabled={row.uuid === '-1'}
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => toggleShopStatus(row.uuid, row.status)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${row.uuid === '-1'
                                ? 'text-gray-500'
                                : row.status === 'active'
                                    ? 'text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100'
                                    : 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100'
                                }`}
                            disabled={row.uuid === '-1'}
                            title={row.status === 'active' ? 'Deactivate shop' : 'Activate shop'}
                        >
                            {row.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                            onClick={() => handleDelete(row.uuid, row.name)}
                            className={`${row.uuid === '-1'
                                ? 'text-gray-500'
                                : 'text-red-600 hover:text-red-800'} p-1 rounded transition-colors`}
                            title="Delete shop"
                            disabled={row.uuid === '-1'}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                </Fragment>
            )
        }
    ];

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const { mode } = useContext(ZonseThemeContext);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [shops, setShops] = useState<IShop[]>([]);
    const [editingShop, setEditingShop] = useState<IShop | null>(null);
    const [filteredShops, setFilteredShops] = useState<Array<IShop>>([]);

    useEffect(() => {
        loadShops();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredShops(shops);
        } else {
            const filtered = shops.filter(shop =>
                shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.shopCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredShops(filtered);
        }
        setTotalRows(filteredShops.length);
        setPage(1);
    }, [searchTerm, shops]);

    const loadShops = async () => {
        try {
            setIsLoading(true);
            const result = await shopsService.list();
            setShops(result.data);
            setFilteredShops(result.data);
            setTotalRows(result.data.length);
        } catch (error) {
            console.error('Error loading shops:', error);
            Notify.failure('Failed to load shops');
        } finally {
            setIsLoading(false);
        }
    };

    const saveShops = (updatedShops: IShop[]) => {
        setShops(updatedShops);
        setFilteredShops(updatedShops);
        setTotalRows(updatedShops.length);
    };

    const handleEdit = (shop: IShop) => {
        setEditingShop(shop);
        setShowForm(true);
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredShops.slice(startIndex, endIndex);
    };

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handlePerRowsChange = (newPerPage: number, page: number) => {
        setPage(page);
        setPerPage(newPerPage);
    };

    const handleDelete = async (shopUuid: string, shopName: string) => {
        Confirm.show(
            'Delete Shop',
            `Are you sure you want to delete the shop "${shopName}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                try {
                    await shopsService.delete(shopUuid);
                    const updatedShops = shops.filter(shop => shop.uuid !== shopUuid);
                    saveShops(updatedShops);
                    Notify.success('Shop deleted successfully');
                } catch (error) {
                    console.error('Error deleting shop:', error);
                    Notify.failure('Failed to delete shop');
                }
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

    const toggleShopStatus = async (shopUuid: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const action = currentStatus === 'active' ? 'deactivate' : 'activate';
        const shop = shops.find(s => s.uuid === shopUuid);

        Confirm.show(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Shop`,
            `Are you sure you want to ${action} the shop "${shop?.name}"?`,
            `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            'Cancel',
            async () => {
                try {
                    await shopsService.update(shopUuid, { status: newStatus as 'active' | 'inactive' });
                    const updatedShops = shops.map(shop =>
                        shop.uuid === shopUuid ? { ...shop, status: newStatus as 'active' | 'inactive' | 'suspended' } : shop
                    );
                    saveShops(updatedShops);
                    Notify.success(`Shop ${action}d successfully`);
                } catch (error) {
                    console.error(`Error ${action}ing shop:`, error);
                    Notify.failure(`Failed to ${action} shop`);
                }
            },
            () => {
                // do nothing
            },
            {
                titleColor: currentStatus === 'active' ? '#ef4444' : '#22c55e',
                okButtonBackground: currentStatus === 'active' ? '#ef4444' : '#22c55e',
            }
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-800 bg-green-100';
            case 'inactive': return 'text-gray-800 dark:text-gray-400 bg-gray-100';
            case 'suspended': return 'text-red-800 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleShopSaved = () => {
        loadShops();
        setShowForm(false);
        setEditingShop(null);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingShop(null);
    };

    const handleAddShopClicked = () => {
        setShowForm(!showForm);
    };

    return (
        <AppLayout>
            <div className="min-h-screen max-w-full mx-auto bg-white dark:bg-gray-700">
                <div className="bg-white dark:bg-gray-700 rounded-md border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-400 flex items-center">
                                    <Store className="w-6 h-6 mr-2" />
                                    Shops ({filteredShops.length})

                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Manage your shop locations and settings
                                </p>
                            </div>

                            <div className='flex items-center space-x-4'>
                                <div className="flex relative">
                                    <Input
                                        type="text"
                                        placeholder="Search shops..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="rounded-md px-3 py-2.5 pr-10"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Button
                                        onClick={handleAddShopClicked}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white dark:text-gray-100 rounded-lg hover:bg-green-700"
                                    >
                                        <HiOutlinePlus className="w-4 h-4 mr-2" />
                                        Add Shop
                                    </Button>

                                    <ShopFormModal
                                        shop={editingShop || undefined}
                                        isOpen={showForm}
                                        onClose={handleCloseForm}
                                        onShopSaved={handleShopSaved}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
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
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            fixedHeader
                            fixedHeaderScrollHeight="calc(100vh - 350px)"
                            noDataComponent={
                                <div className="text-center py-8">
                                    <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {searchTerm ? 'No shops found matching your search.' : 'No shops found.'}
                                    </p>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ShopManagement;