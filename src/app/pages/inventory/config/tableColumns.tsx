import { type TableColumn } from "react-data-table-component";
import { HiOutlineMenuAlt4, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi';
import { Fragment } from 'react';
import dayjs from 'dayjs';
import { formatCurrency } from '../../../utils';
import IconButton from '../../../components/IconButton';

export const getInventoryColumns = (
    handleEditItem: (item: InventoryItem) => void,
    handleVoidItem: (uuid: string) => void
): TableColumn<InventoryItem>[] => [
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
            selector: (row) => formatCurrency(Number(row.costPrice) || 0),
        },
        {
            name: "Sell Price",
            selector: (row) => {
                const price = Number(row.sellPrice);
                return isNaN(price) ? "0.00" : formatCurrency(price);
            },
        },
        {
            name: "Quantity",
            selector: (row) => row.quantity || '0',
        },
        {
            name: "Min Stock",
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
                                className='w-5 h-5 text-green-500'
                                onClick={() => handleEditItem(row as InventoryItem)}
                            />} />}

                    <IconButton
                        color=''
                        icon={
                            <HiOutlineTrash
                                className='w-5 h-5 text-red-500'
                                onClick={() => handleVoidItem((row.productId.toString()))}
                            />} />
                </Fragment>
            ),
        },
    ];