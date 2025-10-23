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
import PageHeader from '../../components/page/PageHeader';
import { getTableStyles } from '../../utils/table-styles';

const ShopManagement: FunctionComponent = () => {
    const columns: Array<TableColumn<IShop>> = [
        {
            name: "Shop",
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ring-1 ring-gray-300 dark:ring-gray-600">
                            {row.logoUrl ? (
                                <img
                                    src={row.logoUrl}
                                    alt={row.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <Store className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            )}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {row.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {row.shopCode}
                            </div>
                        </div>
                    </div>
                </Fragment>
            ),
        },
        {
            name: 'Contact',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm space-y-1">
                        {row.addressLine1 && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <MapPin className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="truncate">
                                    {row.addressLine1}
                                    {row.city && `, ${row.city}`}
                                </span>
                            </div>
                        )}
                        {row.phone && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Phone className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span>{row.phone}</span>
                            </div>
                        )}
                        {row.email && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Mail className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <span className="truncate">{row.email}</span>
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
                    <div className="text-sm space-y-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                            {row.currencySymbol} ({row.currencyCode})
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                            Tax: {row.taxRate}%
                            <span className={`ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${row.chargeTax
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}>
                                {row.chargeTax ? 'Active' : 'Inactive'}
                            </span>
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
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.status === 'active'
                            ? 'bg-green-400 dark:bg-green-300'
                            : 'bg-gray-400 dark:bg-gray-500'
                            }`} />
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                </Fragment>
            )
        },
        {
            width: "20%",
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500 dark:text-gray-400' />,
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => handleEdit(row)}
                            className={`group p-2 rounded-lg transition-all duration-200 ${row.uuid === '-1'
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                                }`}
                            title="Edit shop"
                            disabled={row.uuid === '-1'}
                        >
                            <Edit2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                        </button>

                        <button
                            onClick={() => toggleShopStatus(row.uuid, row.status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${row.uuid === '-1'
                                ? 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                                : row.status === 'active'
                                    ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 focus:ring-red-500 dark:focus:ring-red-400'
                                    : 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 focus:ring-green-500 dark:focus:ring-green-400'
                                }`}
                            disabled={row.uuid === '-1'}
                            title={row.status === 'active' ? 'Deactivate shop' : 'Activate shop'}
                        >
                            {row.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                            onClick={() => handleDelete(row.uuid, row.name)}
                            className={`group p-2 rounded-lg transition-all duration-200 ${row.uuid === '-1'
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                                }`}
                            title="Delete shop"
                            disabled={row.uuid === '-1'}
                        >
                            <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                        </button>
                    </div>
                </Fragment>
            )
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700';
            case 'inactive':
                return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
            case 'pending':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700';
            case 'suspended':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
        }
    };

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
            <div className="transition-colors duration-200">
                <div className="flex justify-between items-center">

                    <PageHeader
                        title='Shops'
                        description='Manage your shop locations and settings'
                    />

                    <div className='flex items-center space-x-4'>
                        <div className="flex relative group">
                            <Input
                                type="text"
                                placeholder="Search shops..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="rounded-lg px-4 py-2.5 pr-12 w-64 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <HiOutlineSearch className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={handleAddShopClicked}
                                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white rounded-lg hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transform hover:scale-105 transition-all duration-200 shadow-lg dark:shadow-green-900/25"
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
                    customStyles={getTableStyles(mode)}
                    noDataComponent={
                        <div className="text-center py-12 bg-white dark:bg-gray-800">
                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                                    <Store className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    {searchTerm ? 'No matching shops found' : 'No shops yet'}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                                    {searchTerm
                                        ? 'Try adjusting your search terms or filters.'
                                        : 'Get started by adding your first shop location.'
                                    }
                                </p>
                                {!searchTerm && (
                                    <Button
                                        onClick={handleAddShopClicked}
                                        className="mt-4 flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                                    >
                                        <HiOutlinePlus className="w-4 h-4 mr-2" />
                                        Add Your First Shop
                                    </Button>
                                )}
                            </div>
                        </div>
                    }
                />
            </div>
        </AppLayout>
    );
};

export default ShopManagement;