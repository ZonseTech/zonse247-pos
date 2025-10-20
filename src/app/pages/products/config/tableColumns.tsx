import { type TableColumn } from "react-data-table-component";
import { HiOutlineMenuAlt4, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi';
import { Fragment } from 'react';
import dayjs from 'dayjs';
import { formatCurrency } from '../../../utils';
import IconButton from '../../../components/IconButton';

export const getProductColumns = (
    handleEditProduct: (product: Product) => void,
    handleVoidProduct: (uuid: string) => void
): TableColumn<Product>[] => [
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
                return isNaN(price) ? "0.00" : formatCurrency(price);
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
                                onClick={() => handleVoidProduct((row.uuid.toString()))}
                            />} />
                </Fragment>
            ),
        },
    ];