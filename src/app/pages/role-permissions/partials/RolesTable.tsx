import React, { useContext } from 'react';
import { Users, Edit2, Trash2, Plus } from 'lucide-react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Flex, Text, Badge, Button, IconButton, Tooltip } from '@radix-ui/themes';
import { ZonseThemeContext } from '../../../components';
import { getTableStyles } from '../../../utils/table-styles';
import TableEmptyState from '../../../components/TableEmptyState';

interface RolesTableProps {
    roles: Role[];
    onCreateRole: () => void;
    onEditRole: (role: Role) => void;
    onDeleteRole: (uuid: string) => void;
}

export const RolesTable: React.FC<RolesTableProps> = ({
    roles,
    onCreateRole,
    onEditRole,
    onDeleteRole,
}) => {
    const { mode } = useContext(ZonseThemeContext);

    const columns: Array<TableColumn<Role>> = [
        {
            name: 'Name',
            selector: (row) => row.displayName,
            sortable: true,
            grow: 2,
            cell: (row) => (
                <Text size="2" truncate>{row.displayName}</Text>
            ),
        },
        {
            name: 'Status',
            cell: (row) => (
                <Badge color={row.isActive ? 'green' : 'red'} variant="soft">
                    {row.isActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            name: 'Type',
            cell: (row) => (
                <Badge color={row.isSystemRole ? 'sky' : 'gray'} variant="soft">
                    {row.isSystemRole ? 'System' : 'Custom'}
                </Badge>
            ),
        },
        {
            name: 'Scope',
            cell: (row) => (
                row.isSystemRole ? (
                    <Text size="2" color="gray">—</Text>
                ) : (
                    <Badge color={row.branchId ? 'purple' : 'teal'} variant="soft">
                        {row.branchId ? 'Branch' : 'Tenant-wide'}
                    </Badge>
                )
            ),
        },
        {
            name: '',
            right: true,
            cell: (row) => (
                <Flex align="center" justify="end" gap="1">
                    <Tooltip content={row.isSystemRole ? 'View role & permissions' : 'Edit role & permissions'}>
                        <IconButton
                            size="1"
                            variant="ghost"
                            onClick={() => onEditRole(row)}
                        >
                            <Edit2 className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip content={row.isSystemRole ? "Can't delete a system role" : 'Delete role'}>
                        <IconButton
                            size="1"
                            variant="ghost"
                            color="red"
                            disabled={row.isSystemRole}
                            onClick={() => onDeleteRole(row.roleId)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                </Flex>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={roles}
            theme={mode as string}
            highlightOnHover
            striped
            responsive
            customStyles={getTableStyles(mode)}
            noDataComponent={
                <TableEmptyState
                    icon={<Users />}
                    title="No roles found"
                    description="Get started by creating a new role."
                    action={
                        <Button onClick={onCreateRole}>
                            <Plus className="w-4 h-4" />
                            Create Role
                        </Button>
                    }
                />
            }
        />
    );
};
