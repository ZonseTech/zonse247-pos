import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { Confirm, Notify } from 'notiflix';
import Loader from '../../../components/Loader';
import { formatCurrency } from '../../../utils';
import EditProductModal from '../EditProductModal';
import relativeTime from 'dayjs/plugin/relativeTime'
import CreateProductModal from '../CreateProductModal';
import IconButton from '../../../components/IconButton';
import { useProducts } from '../../../context/ProductsProvider';
import productsService from '../../../services/products.service';
import DataTable, { type TableColumn, type Themes } from "react-data-table-component";
import { Input, Select, ZonseThemeContext } from '../../../components';
import { HiOutlineDownload, HiOutlineMenuAlt4, HiOutlinePencilAlt, HiOutlineRefresh, HiOutlineTrash } from 'react-icons/hi';
import React, { Fragment, useContext, useEffect, useState } from 'react';

dayjs.extend(relativeTime);


interface TransactionTableProps {
    setSummaryData: any;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ setSummaryData }) => {
    const columns: TableColumn<Product>[] = [
        {
            name: "Barcode",
            selector: (row) => row.barcode,
        },
        {
            name: "Name",
            selector: (row) => row.name,
        },
        {
            name: "Category",
            selector: (row) => row?.categoryDetails?.name as string,
        },
        {
            name: "Cost Price",
            selector: (row) => formatCurrency(parseFloat(row.costPrice || '')),
        },
        {
            name: "Selling Price",
            selector: (row) => {
                const price = parseFloat(row.sellPrice || '');

                if (isNaN(price)) {
                    return "0.00";
                }

                return formatCurrency(price);
            },
        },
        {
            name: "Stock",
            selector: (row) => row.quantity || 0,
        },
        {
            name: "Min stock",
            selector: (row) => row.minStock || 0,
        },
        {
            name: "Expiry Date",
            selector: (row) => dayjs(row.expirationDate).fromNow(),
        },
        {
            name: "Added On",
            selector: (row) => dayjs(row.createdAt).toNow(true),
        },
        {
            width: "5%",
            name: <HiOutlineMenuAlt4 className='w-5 h-5' />,
            cell: (row) => (
                <Fragment>
                    {!row.isExpired && <IconButton
                        color=''
                        icon={
                            <HiOutlinePencilAlt
                                className='w-5 h-5 text-green-600'
                                onClick={() => handleEditProduct(row as Product)}
                            />} />}

                    <IconButton
                        color=''
                        icon={
                            <HiOutlineTrash
                                className='w-5 h-5 text-red-600'
                                onClick={() => handleVoidProduct(parseInt(row.uuid.toString()))}
                            />} />
                </Fragment>
            ),
        },
    ];

    const { categories } = useProducts()
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const { mode } = useContext(ZonseThemeContext);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState<Product[]>([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            await productsService.list({
                page,
                perPage,
                search: searchTerm,
            }).then((data) => {
                const currentDate = new Date();

                const newSummaryData = [
                    {
                        title: 'Total Stock',
                        value: data.filter((item: Product) => {
                            return item.status !== 'void';
                        }).length,
                        bgColor: 'bg-green-400',
                        onClick: () => {
                            setActiveFilter('all');
                            const activeProducts = data.filter((item: Product) => item.status !== 'void');
                            setProducts(activeProducts);
                        }
                    },
                    {
                        title: 'New Stock',
                        value: data.filter((item: Product) => {
                            if (!item.createdAt || item.status === 'void') return false;

                            if (item.expirationDate) {
                                const expiryDate = new Date(item.expirationDate);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                if (expiryDate <= today) return false;
                            }

                            const createdDate = new Date(item.createdAt);
                            const oneWeekAgo = new Date();
                            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                            return createdDate >= oneWeekAgo;
                        }).length,
                        bgColor: 'bg-green-400',
                        onClick: () => {
                            setActiveFilter('new');
                            const newStock = data.filter((item: Product) => {
                                if (!item.createdAt || item.status === 'void') return false;

                                if (item.expirationDate) {
                                    const expiryDate = new Date(item.expirationDate);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);

                                    if (expiryDate <= today) return false;
                                }

                                const createdDate = new Date(item.createdAt);
                                const oneWeekAgo = new Date();
                                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                                return createdDate >= oneWeekAgo;
                            });
                            setProducts(newStock);
                        }
                    },
                    {
                        title: 'Expiring Soon',
                        value: data.filter((item: Product) => {
                            if (!item.expirationDate || item.status === 'void') return false;

                            const expiryDate = new Date(item.expirationDate);
                            const thirtyDaysLater = new Date();
                            thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
                            return expiryDate > currentDate && expiryDate <= thirtyDaysLater;
                        }).length,
                        bgColor: 'bg-yellow-400',
                        onClick: () => {
                            setActiveFilter('expiring');
                            const expiringProducts = data.filter((item: Product) => {
                                if (!item.expirationDate || item.status === 'void') return false;

                                const expiryDate = new Date(item.expirationDate);
                                const thirtyDaysLater = new Date();
                                thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
                                return expiryDate > currentDate && expiryDate <= thirtyDaysLater;
                            });
                            setProducts(expiringProducts);
                        }
                    },
                    {
                        title: 'Expired',
                        value: data.filter((item: Product) => {
                            if (!item.expirationDate) return false;

                            const expiryDate = new Date(item.expirationDate);
                            item.isExpired = expiryDate <= currentDate;

                            return item.isExpired;
                        }).length,
                        bgColor: 'bg-red-500',
                        onClick: () => {
                            setActiveFilter('expired');
                            const expired = data.filter((item: Product) => {
                                if (!item.expirationDate) return false;

                                const expiryDate = new Date(item.expirationDate);
                                return expiryDate <= currentDate;
                            });
                            setProducts(expired);
                        }
                    },
                ];

                setSummaryData(newSummaryData);

                if (activeFilter === 'all') {
                    const activeProducts = data.filter((item: Product) => item.status !== 'void');
                    return activeProducts;
                } else if (activeFilter === 'new') {
                    return newSummaryData[1].onClick();
                } else if (activeFilter === 'expiring') {
                    return newSummaryData[2].onClick();
                } else if (activeFilter === 'expired') {
                    return newSummaryData[3].onClick();
                }

                const activeProducts = data.filter((item: Product) => item.status !== 'void');
                return activeProducts;
            }).then((result) => {
                if (result) {
                    setProducts(result);
                    setTotalRows(result.length);
                }
            });
        } catch (error: any) {
            toast.error("Error loading products: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = async (page: number) => setPage(page);

    const handlePerRowsChange = async (newPerPage: number, page: number) => {
        setPage(page);
        setPerPage(newPerPage);
    };

    useEffect(() => {
        setData(products);
    }, [products]);

    useEffect(() => {
        loadProducts();
    }, [page, perPage]);

    const handleOnProductAdded = async () => {
        setIsLoading(true);
        await loadProducts();
        setIsLoading(false);
    }

    const handleOnProductUpdateed = async () => {
        setIsLoading(true);
        await loadProducts();
        setIsLoading(false);
        // setSelectedProduct(null)
    }

    const handleEditProduct = (product: Product) => {
        if (product) {
            setSelectedProduct(product)
        }
    }

    const handleVoidProduct = (uuid: number) => {
        Confirm.show(
            'Void Product',
            'Are you sure you want to void this product?',
            'Yes, void it',
            'Cancel',
            function okCb() {
                setIsLoading(true);

                productsService
                    .updateStatus(uuid, 'void')
                    .then(() => {
                        Notify.success('Product has been voided successfully');
                        loadProducts();
                    })
                    .catch((error) => {
                        Notify.failure(`Failed to void product: ${error.message}`);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            }
        );
    };

    const handleSearch = (value: string) => {
        setPerPage(15);
        setSearchTerm(value);

        if (value !== "") {
            const filteredCategories = products.filter((product: Product) => product.name.toLowerCase().includes(value.toLowerCase()) ||
                product.barcode.toString().includes(value.toLowerCase()) ||
                (product.categoryDetails?.name as string).toLowerCase().includes(value.toLowerCase())
            );
            setData(filteredCategories);
        } else {
            setData(products)
        }
    };

    const handleOnChangeCategory = (cat: number) => {
        setSearchTerm('');
        const filteredProducts = products.filter(product => {
            const productCategory = product.categoryId.toString();
            const searchValue = cat.toString();

            return productCategory.includes(searchValue);
        });

        if (isNaN(cat)) {
            setData(products);
            return;
        }

        setData(filteredProducts);
    }

    return (
        <div className="bg-white dark:bg-gray-700 rounded-md p-4 mt-4">
            <div className="flex justify-between items-center pb-4 border-b">
                <div className="flex gap-2">
                    <CreateProductModal onProductAdded={handleOnProductAdded} />
                    <IconButton
                        color='bg-green-400 hidden'
                        icon={<HiOutlineDownload className='w-5 h-5' />}
                    />
                    {selectedProduct && <EditProductModal
                        product={selectedProduct}
                        onProductUpdate={handleOnProductUpdateed}
                    />}
                </div>
                <div>
                    <h2 className="text-xl font-medium text-gray-700 flex-1">
                        Products
                    </h2>
                </div>
                <div className='flex gap-2'>
                    <Select onChange={(e) => handleOnChangeCategory(parseInt(e.target.value))}>
                        <option value={''}>Filter by Category</option>
                        {categories.map((category: Category) => (
                            <option key={category.uuid} value={category.uuid}>
                                {category.name as string}
                            </option>
                        ))}
                    </Select>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                                const value = e.target.value;
                                const cleanedValue = value.endsWith('$') ? value.slice(0, -1) : value;

                                handleSearch(cleanedValue)
                            }}
                            className="rounded-md px-3 py-2.5 pr-10"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <HiOutlineRefresh
                                className="h-5 w-5 text-gray-600/55 cursor-pointer"
                                onClick={() => handleSearch("")}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={data}
                theme={mode as Themes}
                // progressComponent={<Loader isLoading={isLoading} />}
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
            />
        </div>
    );
};

export default TransactionTable;