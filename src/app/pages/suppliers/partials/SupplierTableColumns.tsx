import { TableColumn } from 'react-data-table-component';
import { Eye, Pencil, Trash2, Phone, Mail, User } from 'lucide-react';
import { Box, Flex, Text, Badge, IconButton, Tooltip } from '@radix-ui/themes';
import dayjs from 'dayjs';
import { formatCurrencyShort } from '../../../utils';

interface SupplierTableActionsProps {
    onView: (supplierId: string) => void;
    onEdit: (supplierId: string) => void;
    onDelete: (supplierId: string) => void;
}

const statusColorMap: Record<SupplierStatus, 'green' | 'gray' | 'red'> = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    SUSPENDED: 'red',
};

const statusLabelMap: Record<SupplierStatus, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended',
};

export const getSupplierTableColumns = ({
    onView,
    onEdit,
    onDelete,
}: SupplierTableActionsProps): TableColumn<Supplier>[] => [
        {
            name: 'Supplier',
            cell: (row) => (
                <Box py="2" minWidth="0">
                    <Text as="p" size="2" weight="medium" truncate className="text-gray-900 dark:text-gray-100">
                        {row.name}
                    </Text>
                    {row.code && (
                        <Text as="p" size="1" color="gray" truncate>
                            {row.code}
                        </Text>
                    )}
                    {row.phone && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{row.phone}</span>
                        </div>
                    )}
                </Box>
            ),
            sortable: true,
            grow: 2,
            minWidth: '200px',
        },
        {
            name: 'Contact Details',
            cell: (row) => (
                <div className="flex flex-col gap-0.5 py-2">
                    {row.contactPerson && (
                        <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                                {row.contactPerson}
                            </span>
                        </div>
                    )}
                    {row.email && (
                        <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]" title={row.email}>
                                {row.email}
                            </span>
                        </div>
                    )}
                    {!row.contactPerson && !row.email && (
                        <span className="text-xs text-gray-400">No contact info</span>
                    )}
                </div>
            ),
            minWidth: '200px',
        },
        {
            name: 'Orders',
            cell: (row) => (
                <Flex direction="column">
                    <Text size="2" weight="medium" className="text-gray-900 dark:text-gray-100">
                        {row.totalOrders ?? 0}
                    </Text>
                    {!!row.totalPurchaseValue && (
                        <Text size="1" color="gray">
                            {formatCurrencyShort(row.totalPurchaseValue)}
                        </Text>
                    )}
                </Flex>
            ),
            sortable: true,
            right: true,
            width: '120px',
        },
        {
            name: 'Status',
            cell: (row) => (
                <Badge variant="soft" radius="full" color={statusColorMap[row.status] || 'gray'}>
                    {statusLabelMap[row.status] || row.status}
                </Badge>
            ),
            sortable: true,
            width: '120px',
        },
        {
            name: 'Created',
            cell: (row) => (
                <Text size="2" color="gray">
                    {dayjs(row.createdAt).format('MMM D, YYYY')}
                </Text>
            ),
            sortable: true,
            width: '130px',
        },
        {
            name: 'Actions',
            cell: (row) => (
                <Flex align="center" gap="1">
                    <Tooltip content="View supplier">
                        <IconButton
                            size="1"
                            variant="ghost"
                            onClick={() => onView(row.id)}
                        >
                            <Eye className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip content="Edit supplier">
                        <IconButton
                            size="1"
                            variant="ghost"
                            onClick={() => onEdit(row.id)}
                        >
                            <Pencil className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip content="Delete supplier">
                        <IconButton
                            size="1"
                            variant="ghost"
                            color="red"
                            onClick={() => onDelete(row.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                </Flex>
            ),
            right: true,
            width: '140px',
            ignoreRowClick: true,
        },
    ];
