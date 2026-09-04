import { ZonseThemeContext } from '../../../../components';
import { getTableStyles } from '../../../../utils/table-styles';
import DataTable, { TableColumn } from 'react-data-table-component';
import { FunctionComponent, memo, useContext } from 'react';
import TableSkeleton from '../../../../components/skeleton/TableSkeleton';
import { User, Mail, Phone, Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge, Box, Flex, Text } from '@radix-ui/themes';

interface UsersTabProps {
    users: User[];
    loading: boolean;
    tenantId?: string;
    onRefresh?: () => void;
}

const userStatusColorMap: Record<string, 'green' | 'gray' | 'red'> = {
    active: 'green',
    inactive: 'gray',
    suspended: 'red',
};

const getStatusIcon = (status: UserStatus | undefined) => {
    switch (status) {
        case 'active':
            return <CheckCircle className="w-3.5 h-3.5" />;
        case 'suspended':
            return <XCircle className="w-3.5 h-3.5" />;
        default:
            return <Clock className="w-3.5 h-3.5" />;
    }
};

const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getUserColumns = (): TableColumn<User>[] => [
    {
        name: 'User',
        cell: (row) => (
            <Flex align="center" gap="3" py="2">
                <Flex align="center" justify="center" className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex-shrink-0">
                    <User className="w-5 h-5 text-purple-500" />
                </Flex>
                <Box>
                    <Text as="p" size="2" weight="medium" className="truncate">{row.fullname}</Text>
                    <Text as="p" size="1" color="gray">@{row.username}</Text>
                </Box>
            </Flex>
        ),
        minWidth: '200px',
        sortable: true,
        sortField: 'fullname',
    },
    {
        name: 'Contact',
        cell: (row) => (
            <Box py="2">
                {row.email && (
                    <Flex align="center" gap="1" mb="1">
                        <Mail className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <Text size="2" color="gray" className="truncate">{row.email}</Text>
                    </Flex>
                )}
                {row.phone && (
                    <Flex align="center" gap="1">
                        <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <Text size="2" color="gray">{row.phone}</Text>
                    </Flex>
                )}
            </Box>
        ),
        minWidth: '180px',
    },
    {
        name: 'Role',
        cell: (row) => (
            <Flex align="center" gap="1">
                <Shield className="w-4 h-4 text-sky-500" />
                <Text size="2">{row.roleName || 'No role assigned'}</Text>
            </Flex>
        ),
        minWidth: '150px',
    },
    {
        name: 'Branch',
        cell: (row) => (
            <Text size="2" color="gray">{row.branch?.branchName || '-'}</Text>
        ),
        minWidth: '120px',
    },
    {
        name: 'Last Login',
        cell: (row) => (
            <Text size="1" color="gray">{formatDate(row.lastLogin)}</Text>
        ),
        minWidth: '140px',
    },
    {
        name: 'Status',
        cell: (row) => (
            <Badge variant="soft" radius="full" color={userStatusColorMap[row.status || ''] || 'gray'}>
                <Flex align="center" gap="1">
                    {getStatusIcon(row.status)}
                    {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
                </Flex>
            </Badge>
        ),
        width: '110px',
        center: true,
    },
];

const UsersTab: FunctionComponent<UsersTabProps> = memo(({ users, loading, tenantId, onRefresh }) => {
    const { mode } = useContext(ZonseThemeContext);

    if (loading) {
        return <TableSkeleton rows={5} columns={5} showCheckbox={false} showActions={false} />;
    }

    return (
        <DataTable
            columns={getUserColumns()}
            data={users}
            theme={mode as string}
            highlightOnHover
            striped
            responsive
            noDataComponent={
                <Flex direction="column" align="center" py="8">
                    <User className="w-12 h-12 text-gray-400 mb-4" />
                    <Text color="gray">No users found for this tenant</Text>
                </Flex>
            }
            customStyles={getTableStyles(mode)}
        />
    );
});

UsersTab.displayName = 'UsersTab';

export default UsersTab;
