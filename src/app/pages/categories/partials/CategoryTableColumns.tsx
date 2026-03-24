import { TableColumn } from 'react-data-table-component';
import { formatDistanceToNow } from 'date-fns';
import { Edit2, Trash2, Package } from 'lucide-react';
import { Flex, Box, Text, Badge, IconButton, Tooltip } from '@radix-ui/themes';

export const getCategoryColumns = (
    onEdit: (category: Category) => void,
    onDelete: (categoryId: string, categoryName: string) => void
): TableColumn<Category>[] => {
    return [
        {
            name: 'Category',
            selector: (row: Category) => row.name,
            sortable: true,
            grow: 2,
            cell: (row: Category) => (
                <Flex align="center" gap="3" py="3">
                    <Flex
                        align="center"
                        justify="center"
                        flexShrink="0"
                        width="44px"
                        height="44px"
                        className="rounded-md"
                        style={{ backgroundColor: row.color || '#3B82F6', color: '#fff' }}
                    >
                        <Text size="4" weight="bold">
                            {row.name.charAt(0).toUpperCase()}
                        </Text>
                    </Flex>
                    <Box minWidth="0">
                        <Text as="p" size="2" weight="bold" truncate>
                            {row.name}
                        </Text>
                        {row.description && (
                            <Text as="p" size="1" color="gray" truncate className="max-w-[200px] lg:max-w-xs">
                                {row.description}
                            </Text>
                        )}
                    </Box>
                </Flex>
            ),
        },
        {
            name: 'Products',
            selector: (row: Category) => row.itemCount || 0,
            sortable: true,
            center: true,
            cell: (row: Category) => (
                <Flex align="center" justify="center">
                    <Badge
                        size="2"
                        variant="soft"
                        color={(row.itemCount || 0) > 0 ? 'sky' : 'gray'}
                    >
                        <Package className="w-3.5 h-3.5" />
                        {row.itemCount || 0}
                    </Badge>
                </Flex>
            ),
        },
        {
            name: 'Created',
            selector: (row: Category) => row.createdAt ? new Date(row.createdAt).getTime() : 0,
            sortable: true,
            cell: (row: Category) => (
                <Text size="2" color="gray">
                    {row.createdAt
                        ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })
                        : '—'}
                </Text>
            ),
        },
        {
            name: 'Updated',
            selector: (row: Category) => row.updatedAt ? new Date(row.updatedAt).getTime() : 0,
            sortable: true,
            cell: (row: Category) => (
                <Text size="2" color="gray">
                    {row.updatedAt
                        ? formatDistanceToNow(new Date(row.updatedAt), { addSuffix: true })
                        : '—'}
                </Text>
            ),
        },
        {
            name: 'Actions',
            center: true,
            right: true,
            cell: (row: Category) => (
                <Flex align="center" justify="center" gap="1">
                    <Tooltip content="Edit category">
                        <IconButton
                            size="1"
                            variant="ghost"

                            onClick={() => onEdit(row)}
                        >
                            <Edit2 className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip content={row.itemCount > 0 ? "Can't delete category with products" : 'Delete category'}>
                        <IconButton
                            size="1"
                            variant="ghost"
                            color="red"
                            disabled={row.itemCount > 0}
                            onClick={() => onDelete(row.categoryId, row.name)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                </Flex>
            ),
        },
    ];
};

export const getMobileCategoryColumns = (
    onEdit: (category: Category) => void,
    onDelete: (categoryId: string, categoryName: string) => void
): TableColumn<Category>[] => {
    return [
        {
            name: 'Category',
            selector: (row: Category) => row.name,
            sortable: true,
            grow: 2,
            cell: (row: Category) => (
                <Flex align="center" gap="3" py="2">
                    <Flex
                        align="center"
                        justify="center"
                        flexShrink="0"
                        width="36px"
                        height="36px"
                        className="rounded-lg shadow-sm"
                        style={{ backgroundColor: row.color || '#3B82F6', color: '#fff' }}
                    >
                        <Text size="3" weight="bold">
                            {row.name.charAt(0).toUpperCase()}
                        </Text>
                    </Flex>
                    <Box minWidth="0" flexGrow="1">
                        <Text as="p" size="2" weight="medium" truncate>
                            {row.name}
                        </Text>
                        <Flex align="center" gap="2" mt="1">
                            <Text size="1" color="gray">
                                <Flex align="center" gap="1" asChild>
                                    <span>
                                        <Package className="w-3 h-3" />
                                        {row.itemCount || 0}
                                    </span>
                                </Flex>
                            </Text>
                            {row.updatedAt && (
                                <>
                                    <Text size="1" color="gray">•</Text>
                                    <Text size="1" color="gray">
                                        {formatDistanceToNow(new Date(row.updatedAt), { addSuffix: true })}
                                    </Text>
                                </>
                            )}
                        </Flex>
                    </Box>
                </Flex>
            ),
        },
        {
            name: '',
            width: '80px',
            right: true,
            cell: (row: Category) => (
                <Flex align="center" gap="1">
                    <Tooltip content="Edit category">
                        <IconButton
                            size="1"
                            variant="ghost"

                            onClick={() => onEdit(row)}
                        >
                            <Edit2 className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip content={row.itemCount > 0 ? "Can't delete category with products" : 'Delete category'}>
                        <IconButton
                            size="1"
                            variant="ghost"
                            color="red"
                            disabled={row.itemCount > 0}
                            onClick={() => onDelete(row.categoryId, row.name)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                </Flex>
            ),
        },
    ];
};
