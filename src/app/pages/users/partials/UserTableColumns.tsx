import React from 'react';
import { Edit2, Trash2, Key, Lock, LockOpen, Mail, Phone, Shield } from 'lucide-react';
import { TableColumn } from 'react-data-table-component';
import { Flex, Box, Text, Badge, IconButton, Tooltip } from '@radix-ui/themes';
import usersService from '../../../services/users.service';
import { formatRoleName } from '../../auth/profile';

interface UserTableColumnsProps {
    onEdit: (user: User) => void;
    onDelete: (userId: string) => void;
    onResetPassword: (userId: string) => void;
    onToggleStatus: (userId: string, status: UserStatus) => void;
}

const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const getStatusBadgeColor = (status: UserStatus): 'green' | 'red' | 'yellow' | 'gray' => {
    const statusInfo = usersService.getStatusColor(status);
    if (statusInfo === 'green') return 'green';
    if (statusInfo === 'red') return 'red';
    if (statusInfo === 'yellow') return 'yellow';
    return 'gray';
};

export const getUserTableColumns = ({
    onEdit,
    onDelete,
    onResetPassword,
    onToggleStatus,
}: UserTableColumnsProps): TableColumn<User>[] => [
        {
            name: 'User',
            cell: (row: User) => (
                <Flex align="center" gap="3" py="2">
                    <Box minWidth="0">
                        <Text as="p" size="2" weight="medium" truncate>
                            {row.fullname || '-'}
                        </Text>
                        <Text as="p" size="1" color="gray">
                            @{row.username}
                        </Text>
                    </Box>
                </Flex>
            ),
            sortable: true,
            minWidth: '200px',
        },
        {
            name: 'Contact',
            cell: (row: User) => (
                <Flex direction="column" gap="1">
                    {row.email && (
                        <Flex align="center" gap="1">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <Text size="2" color="gray" truncate className="max-w-[180px]">
                                {row.email}
                            </Text>
                        </Flex>
                    )}
                    {row.phone && (
                        <Flex align="center" gap="1">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <Text size="2" color="gray">{row.phone}</Text>
                        </Flex>
                    )}
                    {!row.email && !row.phone && (
                        <Text size="2" color="gray">-</Text>
                    )}
                </Flex>
            ),
            minWidth: '200px',
        },
        {
            name: 'Role',
            cell: (row: User) => (
                <Flex align="center" gap="1">
                    <Shield className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                    <Text size="2" color="gray">
                        {formatRoleName(row?.role?.name || row.roleId, '-')}
                    </Text>
                </Flex>
            ),
            sortable: true,
            minWidth: '140px',
        },
        {
            name: 'Status',
            cell: (row: User) => (
                <Badge
                    size="1"
                    variant="soft"
                    color={getStatusBadgeColor(row.status!)}
                >
                    {row.status || 'unknown'}
                </Badge>
            ),
            sortable: true,
            width: '120px',
        },
        {
            name: 'Actions',
            cell: (row: User) => {
                const userId = String(row.userId);

                return (
                    <Flex align="center" gap="1">
                        <Tooltip content="Edit user">
                            <IconButton
                                size="1"
                                variant="ghost"

                                onClick={() => onEdit(row)}
                            >
                                <Edit2 className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip content="Reset password">
                            <IconButton
                                size="1"
                                variant="ghost"
                                color="yellow"
                                onClick={() => onResetPassword(userId)}
                            >
                                <Key className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip content={row.status === 'active' ? 'Deactivate' : 'Activate'}>
                            <IconButton
                                size="1"
                                variant="ghost"
                                color={row.status === 'active' ? 'orange' : 'green'}
                                onClick={() => onToggleStatus(
                                    userId,
                                    row.status === 'active' ? 'inactive' : 'active'
                                )}
                            >
                                {row.status === 'active' ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip content="Delete user">
                            <IconButton
                                size="1"
                                variant="ghost"
                                color="red"
                                onClick={() => onDelete(userId)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    </Flex>
                );
            },
            width: '180px',
            ignoreRowClick: true,
        },
    ];
